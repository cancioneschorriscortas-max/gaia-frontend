import { useState, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// ImportadorBulk — Importación masiva de nodos e relacións
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: onImportado, idioma.
// Endpoint backend INTACTO.
//
// BUG CRÍTICO ARRANXADO: POST /import non levaba authHeaders().
// A importación masiva fallaba con 401.
//
// MELLORAS:
//   1. authHeaders() no fetch.
//   2. Preview con táboa clara: columnas id, label, tipo, idiomas, autor, centro, retos.
//   3. Resultado post-import con 4 métricas (creados, relacións, erros).
//   4. Log na consola para debug.
//   5. Mensaxes específicas de 401 e erros HTTP.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

const COR_TIPO = {
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}

// ── INICIO: slugify_local ────────────────────────────
const slugifyLocal = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}
// ── FIN: slugify_local ───────────────────────────────

// ── INICIO: exemplo_json ─────────────────────────────
const EXEMPLO = `{
  "nodos": [
    {
      "id": "rosalia-de-castro",
      "label_gl": "Rosalía de Castro",
      "label_es": "Rosalía de Castro",
      "label_en": "Rosalía de Castro",
      "type": "concept",
      "status": "draft",
      "relevance": "high",
      "difficulty": "primary",
      "autor": "Rosa Díaz",
      "centro": "IES Rosalía de Castro",
      "text_primary_gl": "Poetisa e novelista galega do século XIX.",
      "text_primary_es": "Poetisa y novelista gallega del siglo XIX.",
      "text_primary_en": "Galician poet and novelist of the 19th century.",
      "text_secondary_gl": "Texto nivel secundaria en galego.",
      "text_expert_gl": "Texto nivel experto en galego.",
      "reto_primary_gl": "Nomea tres obras de Rosalía de Castro.",
      "reto_primary_es": "Nombra tres obras de Rosalía de Castro.",
      "reto_primary_en": "Name three works by Rosalía de Castro.",
      "reto_secondary_gl": "Explica a importancia do Rexurdimento.",
      "reto_expert_gl": "Analiza o impacto de Cantares Gallegos na literatura galega.",
      "reto_bloqueado": true,
      "reto_puntos": 10
    }
  ],
  "relacions": [
    {
      "source": "rosalia-de-castro",
      "target": "literatura-galega",
      "tipo": "PERTENCE_A",
      "strength": "high",
      "context_gl": "Pertence á literatura galega"
    }
  ]
}`
// ── FIN: exemplo_json ────────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoAviso = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconoImport = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const IconoCode = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)
const IconoLimpar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function ImportadorBulk({ onImportado, idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [json, setJson]           = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [erro, setErro]           = useState('')
  const [preview, setPreview]     = useState(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: validar_json ─────────────────────────────
  const validarJson = (texto) => {
    try {
      const data = JSON.parse(texto)
      if (!data.nodos && !data.relacions) {
        return { ok: false, motivo: 'O JSON debe ter "nodos" e/ou "relacions"' }
      }
      return { ok: true, data }
    } catch (e) {
      return { ok: false, motivo: `JSON inválido: ${e.message}` }
    }
  }
  // ── FIN: validar_json ────────────────────────────────

  // ── INICIO: xerar_preview ────────────────────────────
  const xerarPreview = (data) => {
    const nodos = (data.nodos || []).map(n => ({
      id: n.id || slugifyLocal(n.label_gl || ''),
      label_gl: n.label_gl || '—',
      type: n.type || 'concept',
      status: n.status || 'draft',
      tenRetos: !!(n.reto_primary_gl || n.reto_primary_es || n.reto_primary_en),
      idiomas: ['gl','es','en','pt'].filter(i => n[`label_${i}`]),
      autor: n.autor || '',
      centro: n.centro || ''
    }))
    const relacions = (data.relacions || []).map(r => ({
      source: r.source,
      target: r.target,
      tipo: r.tipo
    }))
    return { nodos, relacions }
  }
  // ── FIN: xerar_preview ───────────────────────────────

  // ── INICIO: onChange_json ────────────────────────────
  const handleJsonChange = (texto) => {
    setJson(texto)
    setErro('')
    setResultado(null)
    if (!texto.trim()) { setPreview(null); return }
    const v = validarJson(texto)
    if (v.ok) setPreview(xerarPreview(v.data))
    else setPreview(null)
  }
  // ── FIN: onChange_json ───────────────────────────────

  // ── INICIO: importar ─────────────────────────────────
  const handleImportar = async () => {
    setErro('')
    setResultado(null)

    const validacion = validarJson(json)
    if (!validacion.ok) {
      setErro(validacion.motivo)
      return
    }

    setCargando(true)

    try {
      const res = await fetch(`${API}/import`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(validacion.data)
      })

      if (!res.ok) {
        if (res.status === 401) {
          setErro('Sesión caducada — volve iniciar sesión')
        } else {
          setErro(`Erro do servidor (${res.status})`)
        }
        console.error('[ImportadorBulk] HTTP error:', res.status)
        return
      }

      const data = await res.json()
      console.log('[ImportadorBulk] Resposta:', data)
      setResultado(data)

      if (data.ok && onImportado) onImportado()
    } catch (e) {
      console.error('[ImportadorBulk] Excepción:', e)
      setErro(`Erro de conexión: ${e.message || 'non se puido contactar co servidor'}`)
    } finally {
      setCargando(false)
    }
  }
  // ── FIN: importar ────────────────────────────────────

  const handleLimpar = () => {
    setJson('')
    setPreview(null)
    setResultado(null)
    setErro('')
  }

  // ── INICIO: estilos_base ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '9px 12px',
    marginBottom: 10,
    background: 'var(--gaia-cosmos-800)',
    border: '1px solid var(--gaia-cosmos-400)',
    color: 'var(--gaia-text-primary)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--gaia-font-body)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 150ms ease'
  }
  // ── FIN: estilos_base ────────────────────────────────

  return (
    <div style={{
      padding: '28px 32px',
      maxWidth: 860,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* Cabeceira */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-warning)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoImport />
          Importación masiva
        </div>
        <h2 style={{
          fontFamily: 'var(--gaia-font-display)',
          color: 'var(--gaia-text-primary)',
          margin: '0 0 8px 0',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15
        }}>
          {t(idioma, 'importadorTitulo') || 'Importar nodos e relacións'}
        </h2>
        <p style={{
          color: 'var(--gaia-text-secondary)',
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          margin: 0,
          lineHeight: 1.5
        }}>
          {t(idioma, 'importadorDesc') || 'Pega un JSON cun array de nodos e/ou relacións para importalos todos á vez.'}
        </p>
      </div>

      {/* Formato esperado */}
      <div style={{
        padding: '16px 18px',
        marginBottom: 18,
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 10
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoCode />
          {t(idioma, 'formatoEsperado') || 'Formato esperado'}
        </div>
        <code style={{
          color: 'var(--gaia-system)',
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 12,
          letterSpacing: '0.025em',
          display: 'block',
          marginBottom: 12
        }}>
          {`{ "nodos": [...], "relacions": [...] }`}
        </code>
        <div style={{
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          color: 'var(--gaia-text-secondary)',
          lineHeight: 1.8
        }}>
          <div>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontFamily: 'var(--gaia-font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Nodo:</span>
            <span style={{ color: 'var(--gaia-constellation)', fontFamily: 'var(--gaia-font-mono)', fontSize: 11 }}>label_gl*</span>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontSize: 12 }}>, id (opcional), label_es/en, type, status, relevance, difficulty</span>
          </div>
          <div>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontFamily: 'var(--gaia-font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Autoría:</span>
            <span style={{ color: 'var(--gaia-accent)', fontFamily: 'var(--gaia-font-mono)', fontSize: 11 }}>autor, centro</span>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontSize: 12, fontStyle: 'italic' }}> (crowdsourcing educativo)</span>
          </div>
          <div>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontFamily: 'var(--gaia-font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Textos:</span>
            <span style={{ color: 'var(--gaia-system)', fontFamily: 'var(--gaia-font-mono)', fontSize: 11 }}>text_primary_gl/es/en</span>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontSize: 12 }}>, text_secondary_..., text_expert_...</span>
          </div>
          <div>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontFamily: 'var(--gaia-font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Retos:</span>
            <span style={{ color: 'var(--gaia-concept)', fontFamily: 'var(--gaia-font-mono)', fontSize: 11 }}>reto_primary_gl/es/en</span>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontSize: 12 }}>, reto_secondary_..., reto_expert_..., reto_bloqueado, reto_puntos</span>
          </div>
          <div>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontFamily: 'var(--gaia-font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Relación:</span>
            <span style={{ color: 'var(--gaia-constellation)', fontFamily: 'var(--gaia-font-mono)', fontSize: 11 }}>source*, target*, tipo*</span>
            <span style={{ color: 'var(--gaia-text-tertiary)', fontSize: 12 }}>, strength, context_gl/es/en</span>
          </div>
        </div>
      </div>

      {/* Área JSON */}
      <div style={{
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap'
      }}>
        <label style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>
          JSON
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {json && (
            <button onClick={handleLimpar} style={{
              padding: '5px 10px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-body)',
              background: 'var(--gaia-danger-bg)',
              border: '1px solid var(--gaia-danger-border)',
              color: 'var(--gaia-danger)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
              <IconoLimpar /> Limpar
            </button>
          )}
          <button onClick={() => { setJson(EXEMPLO); handleJsonChange(EXEMPLO) }} style={{
            padding: '5px 10px',
            fontSize: 10,
            fontFamily: 'var(--gaia-font-body)',
            background: 'var(--gaia-cosmos-700)',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-secondary)',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--gaia-accent)'
            e.currentTarget.style.borderColor = 'var(--gaia-accent-border)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--gaia-text-secondary)'
            e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
          }}>
            {t(idioma, 'cargarExemplo') || 'Cargar exemplo'}
          </button>
        </div>
      </div>

      <textarea
        style={{
          ...inp,
          height: 280,
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 12,
          lineHeight: 1.5,
          resize: 'vertical'
        }}
        value={json}
        onChange={e => handleJsonChange(e.target.value)}
        placeholder='{ "nodos": [], "relacions": [] }'
        onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
      />

      {/* Erro de validación */}
      {erro && (
        <div style={{
          padding: '12px 14px',
          marginBottom: 14,
          background: 'var(--gaia-danger-bg)',
          border: '1px solid var(--gaia-danger-border)',
          borderRadius: 10,
          color: 'var(--gaia-danger)',
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <IconoAviso />
          {erro}
        </div>
      )}

      {/* Preview */}
      {preview && !resultado && (
        <div style={{
          marginBottom: 16,
          padding: 16,
          background: 'var(--gaia-success-bg)',
          border: '1px solid var(--gaia-success-border)',
          borderRadius: 10
        }}>
          <div style={{
            color: 'var(--gaia-success)',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '0.05em',
            fontWeight: 600
          }}>
            <IconoCheck />
            {t(idioma, 'jsonValido') || 'JSON válido'}
            <span style={{ color: 'var(--gaia-text-secondary)', fontWeight: 500 }}>
              · {preview.nodos.length} nodo{preview.nodos.length !== 1 ? 's' : ''}
              · {preview.relacions.length} relación{preview.relacions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {preview.nodos.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginBottom: 8,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Nodos
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)'
                }}>
                  <thead>
                    <tr style={{
                      color: 'var(--gaia-text-tertiary)',
                      textAlign: 'left',
                      fontFamily: 'var(--gaia-font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>ID</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>Label GL</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>Tipo</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>Idiomas</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>Autor</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>Centro</th>
                      <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--gaia-cosmos-400)', textAlign: 'center' }}>Retos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.nodos.map((n, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gaia-cosmos-500)' }}>
                        <td style={{
                          padding: '6px 10px',
                          color: 'var(--gaia-system)',
                          fontFamily: 'var(--gaia-font-mono)',
                          fontSize: 11
                        }}>
                          {n.id}
                        </td>
                        <td style={{
                          padding: '6px 10px',
                          color: 'var(--gaia-text-primary)',
                          fontWeight: 500
                        }}>
                          {n.label_gl}
                        </td>
                        <td style={{
                          padding: '6px 10px',
                          color: COR_TIPO[n.type] || 'var(--gaia-accent)',
                          fontFamily: 'var(--gaia-font-mono)',
                          fontSize: 11
                        }}>
                          {n.type}
                        </td>
                        <td style={{
                          padding: '6px 10px',
                          color: 'var(--gaia-constellation)',
                          fontFamily: 'var(--gaia-font-mono)',
                          fontSize: 11
                        }}>
                          {n.idiomas.join(', ')}
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--gaia-accent)' }}>
                          {n.autor || <span style={{ color: 'var(--gaia-text-disabled)' }}>—</span>}
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--gaia-text-secondary)' }}>
                          {n.centro || <span style={{ color: 'var(--gaia-text-disabled)' }}>—</span>}
                        </td>
                        <td style={{
                          padding: '6px 10px',
                          textAlign: 'center',
                          color: n.tenRetos ? 'var(--gaia-concept)' : 'var(--gaia-text-disabled)'
                        }}>
                          {n.tenRetos ? <IconoCheck size={11} /> : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {preview.relacions.length > 0 && (
            <div>
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginBottom: 8,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Relacións
              </div>
              {preview.relacions.map((r, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  padding: '4px 0',
                  letterSpacing: '0.025em'
                }}>
                  <span style={{ color: 'var(--gaia-system)' }}>{r.source}</span>
                  <span style={{ color: 'var(--gaia-text-tertiary)', margin: '0 8px' }}>—[</span>
                  <span style={{ color: 'var(--gaia-concept)', fontWeight: 600 }}>{r.tipo}</span>
                  <span style={{ color: 'var(--gaia-text-tertiary)', margin: '0 8px' }}>]→</span>
                  <span style={{ color: 'var(--gaia-system)' }}>{r.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón importar */}
      <button
        onClick={handleImportar}
        disabled={!json || cargando}
        style={{
          width: '100%',
          padding: 14,
          background: cargando
            ? 'var(--gaia-cosmos-700)'
            : json ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
          color: cargando
            ? 'var(--gaia-text-disabled)'
            : json ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
          border: `1px solid ${json && !cargando ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10,
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          fontWeight: 700,
          cursor: !json || cargando ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: json && !cargando ? '0 0 20px rgba(232, 165, 71, 0.25)' : 'none',
          transition: 'all 150ms ease'
        }}>
        {cargando
          ? (t(idioma, 'importando') || 'Importando...')
          : <><IconoImport /> {t(idioma, 'importar') || 'Importar'}</>
        }
      </button>

      {/* Resultado */}
      {resultado && (
        <div style={{
          marginTop: 18,
          padding: 20,
          background: resultado.ok ? 'var(--gaia-success-bg)' : 'var(--gaia-danger-bg)',
          border: `1px solid ${resultado.ok ? 'var(--gaia-success-border)' : 'var(--gaia-danger-border)'}`,
          borderRadius: 12
        }}>
          <div style={{
            color: resultado.ok ? 'var(--gaia-success)' : 'var(--gaia-danger)',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-mono)',
            fontWeight: 700,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            {resultado.ok ? <IconoCheck /> : <IconoAviso />}
            {resultado.ok
              ? (t(idioma, 'importacionOk') || 'Importación completada')
              : (t(idioma, 'importacionErro') || 'Importación con erros')
            }
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 14,
            marginBottom: 14
          }}>
            {[
              { valor: resultado.creados,           label: 'Nodos creados',    cor: 'var(--gaia-success)' },
              { valor: resultado.relacionsCreadas,  label: 'Relacións creadas', cor: 'var(--gaia-system)' },
              { valor: resultado.erros,             label: 'Erros en nodos',    cor: 'var(--gaia-danger)' },
              { valor: resultado.relacionsErros,    label: 'Erros relacións',   cor: 'var(--gaia-danger)' }
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '12px 14px',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 10
              }}>
                <div style={{
                  fontSize: 24,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 900,
                  color: stat.cor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {stat.valor ?? 0}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 4
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Detalle de erros */}
          {resultado.detalle?.erros?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                color: 'var(--gaia-danger)',
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginBottom: 8,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                {t(idioma, 'errosNodosLabel') || 'Detalle de erros'}
              </div>
              <div style={{
                maxHeight: 200,
                overflowY: 'auto',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 8,
                padding: '4px 12px'
              }}>
                {resultado.detalle.erros.map((e, i) => (
                  <div key={i} style={{
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-body)',
                    color: 'var(--gaia-text-secondary)',
                    padding: '6px 0',
                    borderBottom: i < resultado.detalle.erros.length - 1 ? '1px solid var(--gaia-cosmos-500)' : 'none',
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>
                      {e.nodo?.label_gl || e.id}
                    </span>
                    <span style={{ color: 'var(--gaia-text-tertiary)' }}>→</span>
                    <span style={{ color: 'var(--gaia-danger)' }}>
                      {e.motivo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLimpar}
            style={{
              marginTop: 14,
              padding: '8px 16px',
              background: 'var(--gaia-cosmos-700)',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-secondary)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-text-primary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-secondary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            }}>
            Limpar e importar máis
          </button>
        </div>
      )}
    </div>
  )
}

export default ImportadorBulk