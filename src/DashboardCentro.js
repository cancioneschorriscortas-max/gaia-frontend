import { useState, useEffect } from 'react'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// DashboardCentro — Páxina específica dun centro educativo
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Dashboard para profesorado dun centro:
// estatísticas globais, ranking de alumnos e actividade recente.
//
// URL: /centro/<nome-centro>
// API: GET /centro/<nome>/dashboard → { alumnos, retos, totalNodos, totalRetos, mediaGlobal }
// ═══════════════════════════════════════════════════════════


// ── INICIO: cores_nivel_semanticas ───────────────────
// Aliñado coa paleta semántica GAIA v1.1
const NIVEL_COR = {
  primary:   'var(--gaia-constellation)',
  secondary: 'var(--gaia-system)',
  expert:    'var(--gaia-concept)'
}
const NIVEL_COR_FB = {
  primary:   '#5dd4a8',
  secondary: '#7dd3fc',
  expert:    '#9bb3ff'
}
const NIVEL_COR_BG = {
  primary:   'var(--gaia-constellation-bg)',
  secondary: 'var(--gaia-system-bg)',
  expert:    'var(--gaia-concept-bg)'
}
const NIVEL_COR_BORDER = {
  primary:   'var(--gaia-constellation-border)',
  secondary: 'var(--gaia-system-border)',
  expert:    'var(--gaia-concept-border)'
}
const NIVEL_LABEL = {
  primary:   'Primaria',
  secondary: 'Secundaria',
  expert:    'Experto'
}
// ── FIN: cores_nivel_semanticas ──────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoPersoa = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconoTarget = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IconoBarras = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </svg>
)
const IconoEstrela = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoEdificio = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" />
    <path d="M9 21V11h6v10" />
    <path d="M12 4L3 8h18z" />
  </svg>
)
const IconoListaActividade = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
const IconoTrofeo = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: badge_posicion ───────────────────────────
// Substitúe emojis 🥇🥈🥉 por círculos graduados coa numeración.
function BadgePosicion({ posicion }) {
  const top = posicion < 3
  const mapa = [
    { bg: '#ffd966', cor: '#0a1020', glow: 'rgba(255, 217, 102, 0.5)' },
    { bg: '#c5cbd8', cor: '#0a1020', glow: 'rgba(197, 203, 216, 0.4)' },
    { bg: '#cd7f32', cor: '#0a1020', glow: 'rgba(205, 127, 50, 0.4)' },
  ]
  const s = top ? mapa[posicion] : null

  return (
    <div style={{
      width: 26, height: 26,
      borderRadius: '50%',
      background: top ? s.bg : 'var(--gaia-cosmos-700)',
      border: top ? 'none' : '1px solid var(--gaia-cosmos-400)',
      display: 'grid', placeItems: 'center',
      color: top ? s.cor : 'var(--gaia-text-tertiary)',
      fontFamily: top ? 'var(--gaia-font-display)' : 'var(--gaia-font-mono)',
      fontSize: top ? 12 : 11,
      fontWeight: top ? 900 : 700,
      boxShadow: top ? `0 0 10px ${s.glow}` : 'none',
      flexShrink: 0
    }}>
      {posicion + 1}
    </div>
  )
}
// ── FIN: badge_posicion ──────────────────────────────

function DashboardCentro() {

  const [datos, setDatos] = useState({ alumnos: [], retos: [], totalNodos: 0, totalRetos: 0, mediaGlobal: 0 })
  const [cargando, setCargando] = useState(true)
  const [erro, setErro] = useState(false)

  const centro = decodeURIComponent(window.location.pathname.split('/centro/')[1] || '')

  useEffect(() => {
    if (!centro) { setErro(true); setCargando(false); return }
    fetch(`${API}/centro/${encodeURIComponent(centro)}/dashboard`)
      .then(r => r.json())
      .then(d => { setDatos(d); setCargando(false) })
      .catch(() => { setErro(true); setCargando(false) })
  }, [centro])

  // ── INICIO: helpers ──────────────────────────────────
  const corPuntos = (p) => p >= 70 ? 'var(--gaia-success)' : p >= 40 ? 'var(--gaia-accent)' : 'var(--gaia-danger)'
  const corPuntosFB = (p) => p >= 70 ? '#5dd4a8' : p >= 40 ? '#e8a547' : '#f87171'

  const formatarData = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('gl-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch { return iso }
  }
  // ── FIN: helpers ─────────────────────────────────────

  if (cargando) return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--gaia-font-mono)',
      color: 'var(--gaia-accent)',
      fontSize: 12,
      letterSpacing: '0.15em',
      textTransform: 'uppercase'
    }}>
      Cargando dashboard...
    </div>
  )

  if (erro || !datos) return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-tertiary)'
    }}>
      Centro non atopado.
    </div>
  )

  if (!datos.alumnos) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gaia-cosmos-900)',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ═══ FONDO CÓSMICO ═══ */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(232, 165, 71, 0.05) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 90%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '20px 32px',
        background: 'rgba(15, 23, 41, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Logo GAIA */}
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--gaia-font-display)',
            fontSize: 22,
            fontWeight: 900,
            color: 'var(--gaia-accent)',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            lineHeight: 1
          }}>
            GAIA
          </a>
          <div style={{
            width: 1, height: 28,
            background: 'var(--gaia-cosmos-400)'
          }} />
          <div>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 3
            }}>
              Dashboard do profesorado
            </div>
            <div style={{
              fontSize: 15,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 700,
              color: 'var(--gaia-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '-0.01em'
            }}>
              <IconoEdificio size={16} />
              {centro}
            </div>
          </div>
        </div>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px',
          background: 'transparent',
          border: '1px solid var(--gaia-cosmos-400)',
          color: 'var(--gaia-text-secondary)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          textDecoration: 'none',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
          e.currentTarget.style.color = 'var(--gaia-text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
          e.currentTarget.style.color = 'var(--gaia-text-secondary)'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a GAIA
        </a>
      </div>

      {/* ═══ CONTIDO ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 24px 80px'
      }}>

        {/* ───── STATS GLOBAIS ───── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28
        }}>
          {[
            { label: 'Alumnado', valor: datos.alumnos.length, icono: <IconoPersoa />, cor: 'var(--gaia-constellation)', corFB: '#5dd4a8' },
            { label: 'Retos feitos', valor: datos.totalRetos, icono: <IconoTarget />, cor: 'var(--gaia-accent)', corFB: '#e8a547' },
            { label: 'Media global', valor: datos.mediaGlobal, icono: <IconoBarras />, cor: corPuntos(datos.mediaGlobal), corFB: corPuntosFB(datos.mediaGlobal) },
            { label: 'Nodos creados', valor: datos.totalNodos, icono: <IconoEstrela />, cor: 'var(--gaia-concept)', corFB: '#9bb3ff' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '18px 20px',
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Glow sutil na parte superior */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${s.corFB}, transparent)`,
                opacity: 0.5
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 10
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {s.label}
                </div>
                <div style={{ color: s.cor }}>
                  {s.icono}
                </div>
              </div>
              <div style={{
                fontSize: 30,
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 900,
                color: s.cor,
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                {s.valor}
              </div>
            </div>
          ))}
        </div>

        {/* ───── GRID DOS DOUS PANEIS ───── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
          gap: 20
        }}>

          {/* ═══ PANEL: RANKING DE ALUMNOS ═══ */}
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14,
            padding: 24
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <IconoTrofeo size={14} />
              Ranking de alumnado
            </div>

            {datos.alumnos.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: 'var(--gaia-text-tertiary)',
                padding: '30px 0',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-mono)'
              }}>
                Sen alumnado rexistrado aínda.
              </div>
            )}

            {datos.alumnos.map((a, i) => (
              <div key={a.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                marginBottom: 8,
                background: i === 0
                  ? 'var(--gaia-accent-bg)'
                  : 'var(--gaia-cosmos-700)',
                border: `1px solid ${i === 0
                  ? 'var(--gaia-accent-border)'
                  : 'var(--gaia-cosmos-400)'}`,
                borderRadius: 10,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(0)'
              }}>
                <BadgePosicion posicion={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    color: 'var(--gaia-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {a.nome}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    marginTop: 3,
                    letterSpacing: '0.025em'
                  }}>
                    {a.totalRetos} retos · {a.superados} superados
                  </div>
                </div>
                <div style={{
                  fontSize: 22,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 900,
                  color: corPuntos(a.media),
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {a.media}
                </div>
              </div>
            ))}
          </div>

          {/* ═══ PANEL: ACTIVIDADE RECENTE ═══ */}
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14,
            padding: 24
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <IconoListaActividade size={14} />
              Actividade recente
            </div>

            {datos.retos.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: 'var(--gaia-text-tertiary)',
                padding: '30px 0',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-mono)'
              }}>
                Sen actividade aínda.
              </div>
            )}

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {datos.retos.map((r, i) => {
                const nivelCor = NIVEL_COR[r.nivel] || 'var(--gaia-accent)'
                const nivelCorBg = NIVEL_COR_BG[r.nivel] || 'var(--gaia-accent-bg)'
                const nivelCorBorder = NIVEL_COR_BORDER[r.nivel] || 'var(--gaia-accent-border)'

                return (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    marginBottom: 6,
                    background: 'var(--gaia-cosmos-700)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderLeft: `3px solid ${corPuntosFB(r.puntos)}`,
                    borderRadius: 8
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: 600,
                        color: 'var(--gaia-text-primary)'
                      }}>
                        {r.nome}
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)',
                        marginTop: 3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {r.nodo}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 6,
                        alignItems: 'center'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9,
                          fontFamily: 'var(--gaia-font-body)',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: nivelCorBg,
                          color: nivelCor,
                          border: `1px solid ${nivelCorBorder}`,
                          letterSpacing: '0.025em',
                          textTransform: 'lowercase'
                        }}>
                          <span style={{
                            width: 4, height: 4,
                            borderRadius: '50%',
                            background: NIVEL_COR_FB[r.nivel] || '#e8a547'
                          }} />
                          {NIVEL_LABEL[r.nivel] || r.nivel}
                        </span>
                        <span style={{
                          fontSize: 9,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: 'var(--gaia-text-disabled)',
                          letterSpacing: '0.025em'
                        }}>
                          {formatarData(r.data)}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 20,
                      fontFamily: 'var(--gaia-font-display)',
                      fontWeight: 900,
                      color: corPuntos(r.puntos),
                      letterSpacing: '-0.02em',
                      flexShrink: 0,
                      lineHeight: 1,
                      marginTop: 4
                    }}>
                      {r.puntos}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCentro