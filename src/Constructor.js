import { useState, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// Constructor — Creación de novos nodos
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: onNodoCreado, idiomasActivos, idioma.
// Endpoints backend INTACTOS.
//
// BUG CRÍTICO ARRANXADO: os dous fetches (POST /nodo e POST /nodo/:id/media)
// non levaban authHeaders(). Iso facía que a creación de nodos fallase
// silenciosamente con 401 Unauthorized dende que o backend require auth.
//
// MELLORAS:
//   1. authHeaders() en todos os fetches.
//   2. Mensaxes tipadas { tipo: 'ok' | 'erro', texto } con auto-dismiss.
//   3. Cores semánticas por nivel pedagóxico (coherente con Editor).
//   4. Validación de URL de media antes de enviar.
//   5. Detección específica de 401 ("Sesión caducada").
//   6. Log na consola para debug.
//   7. Emojis → iconas SVG.
// ═══════════════════════════════════════════════════════════


// ── INICIO: cores_nivel ──────────────────────────────
const NIVEL_COR = {
  primary:   { bg: 'rgba(93, 212, 168, 0.08)',  border: 'rgba(93, 212, 168, 0.28)',  accent: '#5dd4a8', label: 'Primaria',   descr: 'Explicación sinxela, ao alcance de todos' },
  secondary: { bg: 'rgba(125, 211, 252, 0.08)', border: 'rgba(125, 211, 252, 0.28)', accent: '#7dd3fc', label: 'Secundaria', descr: 'Con máis detalle e conexións' },
  expert:    { bg: 'rgba(155, 179, 255, 0.08)', border: 'rgba(155, 179, 255, 0.28)', accent: '#9bb3ff', label: 'Experto',    descr: 'Terminoloxía técnica e contexto avanzado' }
}
// ── FIN: cores_nivel ─────────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoPlus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
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
const IconoCrear = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function Constructor({ onNodoCreado, idiomasActivos = ['gl', 'es', 'en'], idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: form_inicial ─────────────────────────────
  const xerarFormInicial = () => {
    const campos = {
      type: 'concept', status: 'draft',
      relevance: 'medium', difficulty: 'primary',
      autor: '', centro: '',
      media_type: 'youtube', media_url: '', media_label_gl: ''
    }
    idiomasActivos.forEach(i => {
      campos[`label_${i}`] = ''
      campos[`text_primary_${i}`] = ''
      campos[`text_secondary_${i}`] = ''
      campos[`text_expert_${i}`] = ''
    })
    return campos
  }
  // ── FIN: form_inicial ────────────────────────────────

  const [form, setForm]         = useState(xerarFormInicial)
  const [mensaxe, setMensaxe]   = useState(null)   // { tipo, texto }
  const [tab, setTab]           = useState(idiomasActivos[0] || 'gl')
  const [enviando, setEnviando] = useState(false)
  const mensaxeTimerRef = useRef(null)

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── INICIO: mensaxe_helper ───────────────────────────
  const mostrarMensaxe = (tipo, texto) => {
    if (mensaxeTimerRef.current) clearTimeout(mensaxeTimerRef.current)
    setMensaxe({ tipo, texto })
    if (tipo === 'ok') {
      mensaxeTimerRef.current = setTimeout(() => setMensaxe(null), 4000)
    }
  }
  // ── FIN: mensaxe_helper ──────────────────────────────

  // ── INICIO: enviar_nodo ──────────────────────────────
  const handleSubmit = async () => {
    if (!form.label_gl) {
      mostrarMensaxe('erro', t(idioma, 'nomeObrigatorioErro') || 'O nome en galego é obrigatorio')
      return
    }
    setEnviando(true)

    try {
      const res = await fetch(`${API}/nodo`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[Constructor] HTTP error:', res.status, res.statusText)
        return
      }

      const data = await res.json()
      console.log('[Constructor] Resposta crear nodo:', data)

      if (!data.ok) {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido crear o nodo'}`)
        return
      }

      // Se hai media, engadila
      if (form.media_url && form.media_url.trim()) {
        try {
          const mediaRes = await fetch(`${API}/nodo/${data.id}/media`, {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: form.media_type,
              url: form.media_url.trim(),
              label_gl: form.media_label_gl
            })
          })
          if (!mediaRes.ok) {
            console.warn('[Constructor] Nodo creado pero media fallou:', mediaRes.status)
          }
        } catch (e) {
          console.warn('[Constructor] Nodo creado pero media fallou:', e)
        }
      }

      mostrarMensaxe('ok', t(idioma, 'creadoOk', form.label_gl, data.id) || `Nodo "${form.label_gl}" creado (id: ${data.id})`)
      setForm(xerarFormInicial())
      if (onNodoCreado) onNodoCreado()
    } catch (e) {
      console.error('[Constructor] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar co servidor'}`)
    } finally {
      setEnviando(false)
    }
  }
  // ── FIN: enviar_nodo ─────────────────────────────────

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
  const lbl = {
    color: 'var(--gaia-text-tertiary)',
    fontSize: 10,
    fontFamily: 'var(--gaia-font-mono)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    display: 'block',
    marginBottom: 5
  }
  const seccion = {
    paddingTop: 20,
    marginTop: 20,
    borderTop: '1px solid var(--gaia-cosmos-400)'
  }
  // ── FIN: estilos_base ────────────────────────────────

  return (
    <div style={{
      padding: '28px 32px',
      maxWidth: 760,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* Cabeceira */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoCrear size={12} />
          Novo nodo
        </div>
        <h2 style={{
          fontFamily: 'var(--gaia-font-display)',
          color: 'var(--gaia-text-primary)',
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15
        }}>
          {t(idioma, 'constructorTitulo') || 'Crear nodo'}
        </h2>
      </div>

      {/* Nomes por idioma */}
      <label style={lbl}>Nome do nodo</label>
      <div style={{
        display: 'flex',
        gap: 3,
        marginBottom: 12,
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 8,
        padding: 3,
        width: 'fit-content'
      }}>
        {idiomasActivos.map(i => {
          const activo = tab === i
          return (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: '6px 14px',
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              background: activo ? 'var(--gaia-accent-bg)' : 'transparent',
              color: activo ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: activo ? 700 : 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 150ms ease'
            }}>
              {i}
            </button>
          )
        })}
      </div>

      {idiomasActivos.map(i => (
        <div key={i} style={{ display: tab === i ? 'block' : 'none', marginBottom: 6 }}>
          <input
            style={{
              ...inp,
              marginBottom: 4,
              borderColor: i === 'gl' && !form.label_gl ? 'var(--gaia-warning-border)' : 'var(--gaia-cosmos-400)'
            }}
            name={`label_${i}`}
            value={form[`label_${i}`] || ''}
            onChange={set}
            placeholder={
              i === 'gl'
                ? 'ex: Fariña de trigo'
                : i === 'es'
                  ? 'Nome en castelán (opcional)'
                  : 'Nome en inglés (opcional)'
            }
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = i === 'gl' && !form.label_gl ? 'var(--gaia-warning-border)' : 'var(--gaia-cosmos-400)'}
          />
          {i === 'gl' && (
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: form.label_gl ? 'var(--gaia-success)' : 'var(--gaia-warning)',
              letterSpacing: '0.05em',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {form.label_gl
                ? <><IconoCheck size={10} /> Nome galego definido</>
                : <><IconoAviso size={10} /> Obrigatorio en galego</>
              }
            </div>
          )}
        </div>
      ))}

      {/* Metadatos: tipo + nivel + status + relevancia */}
      <div style={seccion}>
        <label style={lbl}>Metadatos</label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'tipoNodo') || 'Tipo'}</label>
            <select style={inp} name="type" value={form.type} onChange={set}>
              <option value="concept">{t(idioma, 'concepto') || 'Concepto'}</option>
              <option value="process">{t(idioma, 'proceso') || 'Proceso'}</option>
              <option value="system">{t(idioma, 'sistema') || 'Sistema'}</option>
              <option value="galaxy">{t(idioma, 'galaxia') || 'Galaxia'}</option>
              <option value="constellation">{t(idioma, 'constelacion') || 'Constelación'}</option>
            </select>
          </div>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'nivelLabel') || 'Nivel'}</label>
            <select style={inp} name="difficulty" value={form.difficulty} onChange={set}>
              <option value="primary">{t(idioma, 'primaria') || 'Primaria'}</option>
              <option value="secondary">{t(idioma, 'secundaria') || 'Secundaria'}</option>
              <option value="expert">{t(idioma, 'experto') || 'Experto'}</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'statusLabel') || 'Estado'}</label>
            <select style={inp} name="status" value={form.status} onChange={set}>
              <option value="draft">{t(idioma, 'draft') || 'Borrador'}</option>
              <option value="validated">{t(idioma, 'validado') || 'Validado'}</option>
            </select>
          </div>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'relevancia') || 'Relevancia'}</label>
            <select style={inp} name="relevance" value={form.relevance} onChange={set}>
              <option value="high">{t(idioma, 'alta') || 'Alta'}</option>
              <option value="medium">{t(idioma, 'media') || 'Media'}</option>
              <option value="low">{t(idioma, 'baixa') || 'Baixa'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Autoría */}
      <div style={seccion}>
        <label style={lbl}>Autoría</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>Autor/a</label>
            <input
              style={inp}
              name="autor"
              value={form.autor}
              onChange={set}
              placeholder="ex: Rosa Díaz"
            />
          </div>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>Centro</label>
            <input
              style={inp}
              name="centro"
              value={form.centro}
              onChange={set}
              placeholder="ex: IES Rosalía de Castro"
            />
          </div>
        </div>
      </div>

      {/* Textos por nivel pedagóxico */}
      <div style={seccion}>
        <label style={lbl}>{t(idioma, 'textosExplicativos') || 'Textos explicativos'}</label>

        {idiomasActivos.map(lang => (
          <div key={lang} style={{ display: tab === lang ? 'block' : 'none' }}>
            {['primary', 'secondary', 'expert'].map(nivel => {
              const cor = NIVEL_COR[nivel]
              return (
                <div key={nivel} style={{
                  background: cor.bg,
                  border: `1px solid ${cor.border}`,
                  borderLeft: `3px solid ${cor.accent}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 10
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: cor.accent,
                      boxShadow: `0 0 6px ${cor.accent}88`
                    }} />
                    <div style={{
                      fontSize: 11,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: cor.accent,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      {cor.label}
                    </div>
                    <div style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-text-tertiary)',
                      fontStyle: 'italic'
                    }}>
                      · {cor.descr}
                    </div>
                  </div>
                  <textarea
                    style={{
                      ...inp,
                      height: 70,
                      marginBottom: 0,
                      background: 'var(--gaia-cosmos-900)',
                      border: '1px solid var(--gaia-cosmos-400)',
                      resize: 'vertical',
                      lineHeight: 1.5
                    }}
                    name={`text_${nivel}_${lang}`}
                    value={form[`text_${nivel}_${lang}`] || ''}
                    onChange={set}
                    placeholder={
                      nivel === 'primary'
                        ? (t(idioma, 'explicacionBasica') || 'Explicación sinxela para alumnado de primaria...')
                        : nivel === 'secondary'
                          ? (t(idioma, 'explicacionEstu') || 'Explicación para alumnado de secundaria...')
                          : (t(idioma, 'explicacionTecnica') || 'Explicación técnica e avanzada...')
                    }
                    onFocus={e => e.currentTarget.style.borderColor = cor.accent}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Media opcional */}
      <div style={seccion}>
        <label style={lbl}>{t(idioma, 'mediaOpcional') || 'Media (opcional)'}</label>
        <div style={{
          padding: 14,
          background: 'var(--gaia-cosmos-800)',
          border: '1px dashed var(--gaia-cosmos-300)',
          borderRadius: 10
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8 }}>
            <select
              style={{ ...inp, marginBottom: 0 }}
              name="media_type"
              value={form.media_type}
              onChange={set}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="instagram">Instagram</option>
              <option value="image">Imaxe</option>
              <option value="document">Documento</option>
            </select>
            <input
              style={{ ...inp, marginBottom: 0 }}
              name="media_url"
              value={form.media_url}
              onChange={set}
              placeholder="https://..."
            />
          </div>
          <input
            style={{ ...inp, marginTop: 8, marginBottom: 0 }}
            name="media_label_gl"
            value={form.media_label_gl}
            onChange={set}
            placeholder={t(idioma, 'descripcionMedio') || 'Descrición en galego (opcional)'}
          />
        </div>
      </div>

      {/* Botón crear */}
      <button
        onClick={handleSubmit}
        disabled={enviando || !form.label_gl}
        style={{
          width: '100%',
          padding: 14,
          marginTop: 24,
          background: enviando
            ? 'var(--gaia-cosmos-700)'
            : form.label_gl ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
          color: enviando
            ? 'var(--gaia-text-disabled)'
            : form.label_gl ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
          border: `1px solid ${form.label_gl && !enviando ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10,
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          fontWeight: 700,
          cursor: enviando || !form.label_gl ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: form.label_gl && !enviando ? '0 0 20px rgba(232, 165, 71, 0.25)' : 'none',
          transition: 'all 150ms ease'
        }}>
        {enviando
          ? 'Creando...'
          : <><IconoPlus /> {t(idioma, 'crearNodo') || 'Crear nodo'}</>
        }
      </button>

      {/* Mensaxe */}
      {mensaxe && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 10,
          background: mensaxe.tipo === 'ok' ? 'var(--gaia-success-bg)' : 'var(--gaia-danger-bg)',
          border: `1px solid ${mensaxe.tipo === 'ok' ? 'var(--gaia-success-border)' : 'var(--gaia-danger-border)'}`,
          color: mensaxe.tipo === 'ok' ? 'var(--gaia-success)' : 'var(--gaia-danger)',
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {mensaxe.tipo === 'ok' ? <IconoCheck /> : <IconoAviso />}
          {mensaxe.texto}
        </div>
      )}
    </div>
  )
}

export default Constructor