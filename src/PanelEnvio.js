import { useState, useEffect } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// PanelEnvio — Wizard 3 pasos para envío de contido
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: nodos, idioma, onPechar.
// Lóxica INTACTA: fetch POST /envio con authHeaders, validación
// de paso 1, busca de nodos existentes, relacións propostas.
//
// TEXTO LITERAL PRESERVADO:
//   Aviso sobre permisos/protección de datos mantido exacto
//   (importante para AMTEGA e RGPD).
//
// MELLORAS:
//   1. Paleta v1.1 completa.
//   2. Emojis (➕, ✦, 🏫, ✓, ✕) → SVGs.
//   3. Tipografía coherente (Atkinson corpo, mono labels).
//   4. Escape pecha.
//   5. Animación slide-in do panel.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

const TIPOS_RELACION = [
  'PERTENCE_A', 'PARTE_DE', 'E_UN', 'RELACIONADO_CON',
  'SIMILAR_A', 'PRODUCE', 'USA', 'ANTES_DE', 'DESPOIS_DE'
]

// ── INICIO: iconos_svg ───────────────────────────────
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoMais = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconoEnviar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const IconoFlechaEsq = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)
const IconoFlechaDer = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoAlerta = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconoUsuario = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconoCentro = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21V13h6v8" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function PanelEnvio({ nodos = [], idioma = 'gl', onPechar }) {

  const { usuario, authHeaders } = useUser()

  const [paso,        setPaso]        = useState(1)
  const [form,        setForm]        = useState({
    nodo_existente: '', label_gl: '',
    tipo_nodo:      'concept',
    explicacion_gl: '',
    recurso_url:    '', recurso_tipo: 'youtube',
    confirmado:     false
  })
  const [relacions,      setRelacions]      = useState([])
  const [novaRelacion,   setNovaRelacion]   = useState({ tipo: 'PERTENCE_A', nodo_target: '' })
  const [enviando,       setEnviando]       = useState(false)
  const [erro,           setErro]           = useState('')
  const [buscaNodo,      setBuscaNodo]      = useState('')

  // ── INICIO: escape_pecha ─────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onPechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPechar])
  // ── FIN: escape_pecha ────────────────────────────────

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const nodosFiltrados = buscaNodo.length < 2 ? [] : nodos
    .filter(n => (n.label || n.id || '').toLowerCase().includes(buscaNodo.toLowerCase()))
    .slice(0, 6)

  const engadirRelacion = () => {
    if (!novaRelacion.nodo_target) return
    setRelacions([...relacions, { ...novaRelacion }])
    setNovaRelacion({ tipo: 'PERTENCE_A', nodo_target: '' })
  }

  const validarPaso1 = () => {
    if (!form.nodo_existente && !form.label_gl.trim()) return 'Selecciona un nodo existente ou escribe un nome novo'
    if (!form.explicacion_gl.trim()) return 'Escribe unha explicación'
    if (form.explicacion_gl.trim().length < 20) return 'A explicación debe ter polo menos 20 caracteres'
    return ''
  }

  const handleEnviar = async () => {
    if (!form.confirmado) { setErro('Confirma que tes os permisos necesarios'); return }
    setEnviando(true)
    setErro('')
    try {
      const res = await fetch(`${API}/envio`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ ...form, relacions })
      })
      const data = await res.json()
      if (data.ok) setPaso(3)
      else setErro(data.error || 'Erro ao enviar')
    } catch {
      setErro('Non se puido conectar co servidor')
    } finally {
      setEnviando(false)
    }
  }

  // ── INICIO: estilos_form ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '9px 12px',
    marginBottom: 8,
    background: 'var(--gaia-cosmos-800)',
    border: '1px solid var(--gaia-cosmos-400)',
    color: 'var(--gaia-text-primary)',
    borderRadius: 8,
    fontSize: 13,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'var(--gaia-font-body)',
    transition: 'border 150ms ease'
  }
  const lbl = {
    fontSize: 11,
    fontFamily: 'var(--gaia-font-body)',
    color: 'var(--gaia-text-secondary)',
    display: 'block',
    marginBottom: 5,
    fontWeight: 500
  }
  const seccionTit = {
    fontSize: 10,
    fontFamily: 'var(--gaia-font-mono)',
    color: 'var(--gaia-accent)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 10
  }
  // ── FIN: estilos_form ────────────────────────────────

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0,
      width: 'min(440px, 95vw)',
      zIndex: 150,
      background: 'var(--gaia-cosmos-900)',
      borderLeft: '1px solid var(--gaia-cosmos-400)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.7)',
      animation: 'penvSlideIn 280ms cubic-bezier(0.32, 0.72, 0, 1)'
    }}>
      <style>{`
        @keyframes penvSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes penvFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        flexShrink: 0
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--gaia-accent-bg)',
              border: '1px solid var(--gaia-accent-border)',
              color: 'var(--gaia-accent)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
              <IconoMais size={14} />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 15,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 700,
              color: 'var(--gaia-text-primary)',
              letterSpacing: '-0.01em'
            }}>
              Enviar contido
            </h2>
          </div>
          <p style={{
            margin: '0 0 0 38px',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-tertiary)',
            lineHeight: 1.5
          }}>
            O contido será revisado antes de publicarse
          </p>
        </div>

        <button
          onClick={onPechar}
          aria-label="Pechar"
          style={{
            background: 'transparent',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-tertiary)',
            borderRadius: '50%',
            width: 32, height: 32,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            transition: 'all 150ms ease',
            flexShrink: 0
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--gaia-text-primary)'
            e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
            e.currentTarget.style.background = 'transparent'
          }}>
          <IconoX />
        </button>
      </div>

      {/* ═══ INFO USUARIO ═══ */}
      {usuario && (
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--gaia-cosmos-400)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-constellation)'
          }}>
            <IconoUsuario />
            <span style={{ fontWeight: 600 }}>{usuario.nome}</span>
          </div>
          {usuario.centro && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-tertiary)'
            }}>
              <IconoCentro />
              {usuario.centro}
            </div>
          )}
        </div>
      )}

      {/* ═══ INDICADOR PASOS ═══ */}
      {paso < 3 && (
        <div style={{
          display: 'flex',
          padding: '14px 24px',
          gap: 8,
          flexShrink: 0
        }}>
          {[1, 2].map(p => (
            <div key={p} style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: p <= paso ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-500)',
              boxShadow: p <= paso ? '0 0 8px rgba(232, 165, 71, 0.4)' : 'none',
              transition: 'all 300ms ease'
            }} />
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 24px' }}>

        {/* ═══ PASO 1 ═══ */}
        {paso === 1 && (
          <div style={{ animation: 'penvFadeIn 250ms ease' }}>

            {/* Nodo */}
            <div style={{ marginBottom: 22 }}>
              <div style={seccionTit}>Nodo</div>

              <label style={lbl}>Buscar nodo existente</label>
              <input
                style={inp}
                value={buscaNodo}
                onChange={e => setBuscaNodo(e.target.value)}
                placeholder="Escribe para buscar..."
                onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent-border)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
              />

              {nodosFiltrados.length > 0 && (
                <div style={{
                  background: 'var(--gaia-cosmos-800)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderRadius: 8,
                  marginBottom: 8,
                  overflow: 'hidden'
                }}>
                  {nodosFiltrados.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setForm({ ...form, nodo_existente: n.id, label_gl: '' })
                        setBuscaNodo(n.label || n.id)
                      }}
                      style={{
                        padding: '9px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--gaia-cosmos-500)',
                        fontSize: 12,
                        fontFamily: 'var(--gaia-font-body)',
                        transition: 'background 150ms ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: 'var(--gaia-text-primary)' }}>{n.label || n.id}</span>
                      <span style={{
                        color: 'var(--gaia-text-tertiary)',
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-mono)',
                        marginLeft: 8,
                        letterSpacing: '0.03em'
                      }}>
                        {n.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {form.nodo_existente && (
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--gaia-constellation-bg)',
                  border: '1px solid var(--gaia-constellation-border)',
                  borderLeft: '3px solid var(--gaia-constellation)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--gaia-constellation)',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <IconoCheck size={12} />
                    {buscaNodo}
                  </span>
                  <button
                    onClick={() => { setForm({ ...form, nodo_existente: '' }); setBuscaNodo('') }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gaia-constellation)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}>
                    <IconoX size={12} />
                  </button>
                </div>
              )}

              {!form.nodo_existente && (
                <>
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--gaia-text-disabled)',
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    margin: '10px 0'
                  }}>
                    — ou crea un novo —
                  </div>
                  <label style={lbl}>Nome do novo nodo (en galego) *</label>
                  <input
                    style={inp}
                    name="label_gl"
                    value={form.label_gl}
                    onChange={set}
                    placeholder="ex: O Magosto"
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent-border)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                  <label style={lbl}>Tipo de nodo</label>
                  <select
                    style={{ ...inp, cursor: 'pointer' }}
                    name="tipo_nodo"
                    value={form.tipo_nodo}
                    onChange={set}>
                    <option value="concept">Concepto</option>
                    <option value="process">Proceso</option>
                    <option value="system">Sistema</option>
                  </select>
                </>
              )}
            </div>

            {/* Explicación */}
            <div style={{ marginBottom: 22 }}>
              <div style={seccionTit}>Explicación</div>
              <label style={lbl}>Describe o nodo en 3-5 liñas *</label>
              <textarea
                style={{ ...inp, height: 110, resize: 'vertical' }}
                name="explicacion_gl"
                value={form.explicacion_gl}
                onChange={set}
                placeholder="Describe o que sabes sobre este tema..."
                onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent-border)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
              />
              <div style={{
                textAlign: 'right',
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: form.explicacion_gl.length > 400 ? 'var(--gaia-danger)' : 'var(--gaia-text-disabled)',
                letterSpacing: '0.02em'
              }}>
                {form.explicacion_gl.length} / 500
              </div>
            </div>

            {/* Relacións */}
            <div style={{ marginBottom: 22 }}>
              <div style={seccionTit}>Relacións (opcional)</div>

              {relacions.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  background: 'var(--gaia-cosmos-800)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderRadius: 8,
                  marginBottom: 6,
                  fontSize: 12
                }}>
                  <span style={{
                    color: 'var(--gaia-concept)',
                    fontFamily: 'var(--gaia-font-mono)',
                    fontWeight: 600,
                    letterSpacing: '0.03em'
                  }}>
                    {r.tipo}
                  </span>
                  <span style={{ color: 'var(--gaia-text-disabled)' }}>→</span>
                  <span style={{ color: 'var(--gaia-system)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.nodo_target}
                  </span>
                  <button
                    onClick={() => setRelacions(relacions.filter((_, j) => j !== i))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gaia-text-tertiary)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                    <IconoX size={12} />
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  style={{ ...inp, flex: '0 0 140px', marginBottom: 0, cursor: 'pointer' }}
                  value={novaRelacion.tipo}
                  onChange={e => setNovaRelacion({ ...novaRelacion, tipo: e.target.value })}>
                  {TIPOS_RELACION.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  style={{ ...inp, flex: 1, marginBottom: 0 }}
                  value={novaRelacion.nodo_target}
                  onChange={e => setNovaRelacion({ ...novaRelacion, nodo_target: e.target.value })}
                  placeholder="ID do nodo"
                />
                <button
                  onClick={engadirRelacion}
                  title="Engadir relación"
                  style={{
                    padding: '0 12px',
                    background: 'var(--gaia-concept-bg)',
                    border: '1px solid var(--gaia-concept-border)',
                    color: 'var(--gaia-concept)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(155, 179, 255, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-concept-bg)'}>
                  <IconoMais size={14} />
                </button>
              </div>
            </div>

            {/* Recurso */}
            <div style={{ marginBottom: 24 }}>
              <div style={seccionTit}>Recurso (opcional)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  style={{ ...inp, flex: '0 0 110px', marginBottom: 0, cursor: 'pointer' }}
                  name="recurso_tipo"
                  value={form.recurso_tipo}
                  onChange={set}>
                  <option value="youtube">YouTube</option>
                  <option value="image">Imaxe</option>
                  <option value="link">Enlace</option>
                </select>
                <input
                  style={{ ...inp, flex: 1, marginBottom: 0 }}
                  name="recurso_url"
                  value={form.recurso_url}
                  onChange={set}
                  placeholder="https://..."
                />
              </div>
            </div>

            {erro && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'var(--gaia-danger-bg)',
                border: '1px solid var(--gaia-danger-border)',
                borderRadius: 8,
                color: 'var(--gaia-danger)',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                marginBottom: 12
              }}>
                <IconoAlerta />
                {erro}
              </div>
            )}

            <button
              onClick={() => {
                const e = validarPaso1()
                if (e) { setErro(e); return }
                setErro('')
                setPaso(2)
              }}
              style={{
                width: '100%',
                padding: '13px',
                background: 'var(--gaia-accent)',
                color: 'var(--gaia-cosmos-900)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(232, 165, 71, 0.3)',
                letterSpacing: '0.02em',
                transition: 'all 150ms ease'
              }}>
              Continuar
              <IconoFlechaDer />
            </button>
          </div>
        )}

        {/* ═══ PASO 2 ═══ */}
        {paso === 2 && (
          <div style={{ animation: 'penvFadeIn 250ms ease' }}>
            <div style={{ ...seccionTit, marginBottom: 16 }}>Resumo do envío</div>

            {[
              { label: 'Autor',  valor: usuario?.nome   || '' },
              { label: 'Centro', valor: usuario?.centro || '' },
              { label: 'Nodo',   valor: form.nodo_existente || form.label_gl },
              { label: 'Tipo',   valor: form.nodo_existente ? 'Nodo existente' : `Novo: ${form.tipo_nodo}` }
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--gaia-cosmos-500)'
              }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  minWidth: 80,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  flex: 1,
                  minWidth: 0
                }}>
                  {item.valor}
                </span>
              </div>
            ))}

            <div style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--gaia-cosmos-500)'
            }}>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 6,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Explicación
              </div>
              <p style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-primary)',
                margin: 0,
                lineHeight: 1.65
              }}>
                {form.explicacion_gl}
              </p>
            </div>

            {relacions.length > 0 && (
              <div style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--gaia-cosmos-500)'
              }}>
                <div style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  marginBottom: 6,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Relacións
                </div>
                {relacions.map((r, i) => (
                  <div key={i} style={{
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    color: 'var(--gaia-concept)',
                    marginBottom: 4
                  }}>
                    <span style={{ fontFamily: 'var(--gaia-font-mono)', fontWeight: 600 }}>{r.tipo}</span>
                    <span style={{ color: 'var(--gaia-text-disabled)' }}> → </span>
                    <span style={{ color: 'var(--gaia-system)' }}>{r.nodo_target}</span>
                  </div>
                ))}
              </div>
            )}

            {form.recurso_url && (
              <div style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--gaia-cosmos-500)'
              }}>
                <div style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  marginBottom: 4,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Recurso
                </div>
                <div style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-system)',
                  wordBreak: 'break-all'
                }}>
                  <span style={{ color: 'var(--gaia-text-tertiary)' }}>{form.recurso_tipo}: </span>
                  {form.recurso_url}
                </div>
              </div>
            )}

            <label style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '18px 0',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={form.confirmado}
                onChange={e => setForm({ ...form, confirmado: e.target.checked })}
                style={{
                  marginTop: 2,
                  width: 16,
                  height: 16,
                  accentColor: 'var(--gaia-accent)',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                lineHeight: 1.65
              }}>
                Confirmo que este contido é de elaboración propia ou conta cos permisos necesarios de imaxe e protección de datos.
              </span>
            </label>

            <div style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-tertiary)',
              textAlign: 'center',
              marginBottom: 16,
              fontStyle: 'italic'
            }}>
              Enviarase o contido a revisión antes da súa publicación.
            </div>

            {erro && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'var(--gaia-danger-bg)',
                border: '1px solid var(--gaia-danger-border)',
                borderRadius: 8,
                color: 'var(--gaia-danger)',
                fontSize: 12,
                marginBottom: 12
              }}>
                <IconoAlerta />
                {erro}
              </div>
            )}

            <button
              onClick={handleEnviar}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '14px',
                background: enviando ? 'var(--gaia-cosmos-700)' : 'var(--gaia-accent)',
                color: enviando ? 'var(--gaia-text-tertiary)' : 'var(--gaia-cosmos-900)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                cursor: enviando ? 'not-allowed' : 'pointer',
                marginBottom: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: enviando ? 'none' : '0 0 20px rgba(232, 165, 71, 0.35)',
                letterSpacing: '0.02em',
                transition: 'all 150ms ease'
              }}>
              {enviando ? 'Enviando...' : <><IconoEnviar /> Enviar para avaliación</>}
            </button>

            <button
              onClick={() => { setPaso(1); setErro('') }}
              style={{
                width: '100%',
                padding: '11px',
                background: 'transparent',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--gaia-text-primary)'
                e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
                e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              }}>
              <IconoFlechaEsq />
              Volver
            </button>
          </div>
        )}

        {/* ═══ PASO 3 - ÉXITO ═══ */}
        {paso === 3 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 16px',
            animation: 'penvFadeIn 300ms ease'
          }}>
            <div style={{
              display: 'inline-flex',
              width: 76, height: 76,
              borderRadius: '50%',
              background: 'var(--gaia-constellation-bg)',
              border: '1px solid var(--gaia-constellation-border)',
              color: 'var(--gaia-constellation)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 0 32px rgba(93, 212, 168, 0.4)'
            }}>
              <IconoCheck size={34} />
            </div>

            <h3 style={{
              color: 'var(--gaia-text-primary)',
              fontFamily: 'var(--gaia-font-display)',
              margin: '0 0 12px',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em'
            }}>
              Contido enviado
            </h3>

            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontFamily: 'var(--gaia-font-body)',
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: 32
            }}>
              O teu contido foi enviado para revisión.<br />
              Un profesor validará a información antes<br />
              de que apareza en GAIA.
            </p>

            <button
              onClick={() => {
                setPaso(1)
                setForm({ nodo_existente: '', label_gl: '', tipo_nodo: 'concept', explicacion_gl: '', recurso_url: '', recurso_tipo: 'youtube', confirmado: false })
                setRelacions([])
              }}
              style={{
                padding: '11px 26px',
                background: 'var(--gaia-constellation-bg)',
                border: '1px solid var(--gaia-constellation-border)',
                color: 'var(--gaia-constellation)',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 600,
                marginBottom: 10,
                transition: 'background 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(93, 212, 168, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-constellation-bg)'}>
              Enviar outro
            </button>
            <br />
            <button
              onClick={onPechar}
              style={{
                padding: '9px 24px',
                background: 'transparent',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--gaia-text-primary)'
                e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
                e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              }}>
              Pechar
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default PanelEnvio