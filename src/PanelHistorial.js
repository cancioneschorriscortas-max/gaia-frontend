import { useState, useEffect } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// PanelHistorial — Historial de retos do usuario
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idioma, onPechar, onSeleccionarNodo.
// Lóxica INTACTA: fetch /historial/:userId con authHeaders,
// filtrado por nivel, cálculo de media global, formatado data.
//
// MELLORAS:
//   1. Paleta v1.1 completa.
//   2. Cores semánticas por nivel (primary verde, secondary azul,
//      expert lavanda).
//   3. Stats en Fraunces 900 gigante.
//   4. Emojis → SVGs.
//   5. Backdrop con blur para que sexa unha capa elegante.
//   6. Escape pecha.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cores_nivel ──────────────────────────────
const COR_NIVEL = {
  primary:   { main: 'var(--gaia-constellation)', fb: '#5dd4a8', label: 'Primaria'   },
  secondary: { main: 'var(--gaia-system)',        fb: '#7dd3fc', label: 'Secundaria' },
  expert:    { main: 'var(--gaia-concept)',       fb: '#9bb3ff', label: 'Experto'    }
}
// ── FIN: cores_nivel ─────────────────────────────────

// ── INICIO: helpers_cor_puntos ───────────────────────
const corPuntos = (p) => {
  if (p >= 70) return { main: 'var(--gaia-constellation)', fb: '#5dd4a8' }
  if (p >= 40) return { main: 'var(--gaia-accent)',        fb: '#e8a547' }
  return            { main: 'var(--gaia-danger)',          fb: '#f87171' }
}
// ── FIN: helpers_cor_puntos ──────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoHistorial = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14 2 14 8 20 8" />
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)
const IconoUsuario = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconoDiana = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function PanelHistorial({ idioma = 'gl', onPechar, onSeleccionarNodo }) {

  const { usuario, authHeaders, esExplorador } = useUser()

  const [retos,       setRetos]       = useState([])
  const [cargando,    setCargando]    = useState(true)
  const [filtroNivel, setFiltroNivel] = useState('todos')

  // ── INICIO: carga_historial ──────────────────────────
  useEffect(() => {
    if (!usuario || esExplorador) { setCargando(false); return }
    fetch(`${API}/historial/${usuario.id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setRetos(d.retos || []); setCargando(false) })
      .catch(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, esExplorador])
  // ── FIN: carga_historial ─────────────────────────────

  // ── INICIO: escape_pecha ─────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onPechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPechar])
  // ── FIN: escape_pecha ────────────────────────────────

  const retosFiltrados = filtroNivel === 'todos'
    ? retos
    : retos.filter(r => r.nivel === filtroNivel)

  const mediaGlobal = retos.length > 0
    ? Math.round(retos.reduce((a, r) => a + (r.puntos || 0), 0) / retos.length)
    : 0

  const formatarData = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('gl-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onPechar}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'rgba(3, 6, 15, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'phistFadeIn 200ms ease'
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: 0, top: 0, bottom: 0,
        width: 'min(480px, 95vw)',
        zIndex: 151,
        background: 'var(--gaia-cosmos-900)',
        borderLeft: '1px solid var(--gaia-cosmos-400)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--gaia-font-body)',
        color: 'var(--gaia-text-primary)',
        boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.7)',
        animation: 'phistSlideIn 280ms cubic-bezier(0.32, 0.72, 0, 1)'
      }}>
        <style>{`
          @keyframes phistFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes phistSlideIn {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* ═══ CABECEIRA ═══ */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gaia-cosmos-400)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexShrink: 0
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 4
            }}>
              <div style={{
                color: 'var(--gaia-accent)',
                display: 'grid',
                placeItems: 'center'
              }}>
                <IconoHistorial />
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-accent)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700
              }}>
                O meu historial
              </div>
            </div>
            {usuario && (
              <div style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                marginLeft: 26,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--gaia-text-primary)' }}>{usuario.nome}</span>
                {usuario.centro && (
                  <span style={{ color: 'var(--gaia-text-tertiary)' }}> · {usuario.centro}</span>
                )}
              </div>
            )}
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

        {/* ═══ STATS ═══ */}
        {retos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 10,
            padding: '16px 24px',
            borderBottom: '1px solid var(--gaia-cosmos-400)'
          }}>
            {[
              { valor: retos.length, cor: { main: 'var(--gaia-accent)', fb: '#e8a547' }, label: 'Retos' },
              { valor: mediaGlobal, cor: corPuntos(mediaGlobal), label: 'Media' },
              { valor: retos.filter(r => r.puntos >= 70).length, cor: { main: 'var(--gaia-constellation)', fb: '#5dd4a8' }, label: 'Superados' }
            ].map(item => (
              <div key={item.label} style={{
                flex: 1,
                padding: '12px 8px',
                background: 'var(--gaia-cosmos-800)',
                borderRadius: 10,
                textAlign: 'center',
                border: '1px solid var(--gaia-cosmos-400)'
              }}>
                <div style={{
                  fontFamily: 'var(--gaia-font-display)',
                  fontSize: 26,
                  fontWeight: 900,
                  color: item.cor.main,
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {item.valor}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  marginTop: 6,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ FILTRO NIVEL ═══ */}
        {retos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '12px 24px',
            borderBottom: '1px solid var(--gaia-cosmos-400)',
            flexWrap: 'wrap'
          }}>
            {['todos', 'primary', 'secondary', 'expert'].map(n => {
              const activo = filtroNivel === n
              const corRef = n === 'todos' ? { main: 'var(--gaia-accent)', fb: '#e8a547' } : COR_NIVEL[n]
              const labelN = n === 'todos' ? 'Todos' : COR_NIVEL[n].label
              return (
                <button key={n} onClick={() => setFiltroNivel(n)} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: activo ? 700 : 500,
                  borderRadius: 9999,
                  cursor: 'pointer',
                  background: activo ? corRef.main : 'var(--gaia-cosmos-800)',
                  color: activo ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
                  border: `1px solid ${activo ? corRef.fb : 'var(--gaia-cosmos-400)'}`,
                  transition: 'all 150ms ease',
                  letterSpacing: '0.02em'
                }}>
                  {n !== 'todos' && (
                    <span style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: activo ? 'var(--gaia-cosmos-900)' : corRef.fb
                    }} />
                  )}
                  {labelN}
                </button>
              )
            })}
          </div>
        )}

        {/* ═══ LISTA ═══ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px'
        }}>
          {cargando && (
            <div style={{
              textAlign: 'center',
              color: 'var(--gaia-text-tertiary)',
              padding: '40px 0',
              fontSize: 13,
              fontFamily: 'var(--gaia-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Cargando...
            </div>
          )}

          {!cargando && esExplorador && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                display: 'inline-flex',
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <IconoUsuario size={28} />
              </div>
              <div style={{
                color: 'var(--gaia-text-secondary)',
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                marginBottom: 6
              }}>
                Estás en modo Explorador.
              </div>
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                lineHeight: 1.5
              }}>
                Rexístrate con nome para gardar o teu historial.
              </div>
            </div>
          )}

          {!cargando && !esExplorador && retos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                display: 'inline-flex',
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <IconoDiana size={26} />
              </div>
              <div style={{
                color: 'var(--gaia-text-secondary)',
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                marginBottom: 6
              }}>
                Aínda non respondiche ningún reto.
              </div>
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                lineHeight: 1.5
              }}>
                Explora o universo e proba os retos dos nodos!
              </div>
            </div>
          )}

          {retosFiltrados.map((r, i) => {
            const cNivel = COR_NIVEL[r.nivel] || COR_NIVEL.primary
            const cPunt  = corPuntos(r.puntos)
            return (
              <div key={i} style={{
                marginBottom: 10,
                padding: '14px 16px',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderLeft: `3px solid ${cPunt.fb}`,
                borderRadius: 10,
                transition: 'all 150ms ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 8
                }}>
                  <div
                    onClick={() => onSeleccionarNodo && r.nodoId && onSeleccionarNodo(r.nodoId)}
                    style={{
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 600,
                      color: 'var(--gaia-text-primary)',
                      cursor: onSeleccionarNodo && r.nodoId ? 'pointer' : 'default',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 150ms ease'
                    }}
                    onMouseEnter={e => { if (onSeleccionarNodo && r.nodoId) e.currentTarget.style.color = 'var(--gaia-accent)' }}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--gaia-text-primary)'}>
                    {r.nodoLabel}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                    flexShrink: 0
                  }}>
                    <span style={{
                      fontFamily: 'var(--gaia-font-display)',
                      fontSize: 20,
                      fontWeight: 900,
                      color: cPunt.main,
                      letterSpacing: '-0.02em',
                      lineHeight: 1
                    }}>
                      {r.puntos}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: 'var(--gaia-text-disabled)'
                    }}>
                      /100
                    </span>
                  </div>
                </div>

                <p style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-tertiary)',
                  margin: '0 0 10px 0',
                  lineHeight: 1.5
                }}>
                  {r.pregunta?.slice(0, 100)}{r.pregunta?.length > 100 ? '…' : ''}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    padding: '3px 8px',
                    borderRadius: 9999,
                    background: 'var(--gaia-cosmos-900)',
                    color: cNivel.main,
                    border: `1px solid ${cNivel.fb}44`,
                    letterSpacing: '0.05em'
                  }}>
                    <span style={{
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: cNivel.fb
                    }} />
                    {cNivel.label}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-disabled)',
                    letterSpacing: '0.02em'
                  }}>
                    {formatarData(r.data)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PanelHistorial