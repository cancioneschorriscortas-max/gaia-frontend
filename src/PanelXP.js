import { useEffect } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// PanelXP — Popup flotante co estado de XP e nivel
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: visible, onCerrar, idioma.
//
// MELLORAS:
//   1. Eliminada a duplicación do desglose XP (antes aparecía
//      dúas veces: dentro da cabeceira e nun bloque inferior).
//   2. Cores semánticas: exploración → constellation (verde xade),
//      conexión → system (azul xeo), comprensión → concept (lavanda).
//      Coherentes co VisorNodo e Editor.
//   3. Tecla Escape pecha o panel.
//   4. Cores tipográficas GAIA v1.1.
//   5. Emojis (✦ ✕ 🌌) → iconas SVG.
// ═══════════════════════════════════════════════════════════

// ── INICIO: iconos_svg ───────────────────────────────
const IconoEstrela = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoX = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoGalaxia = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2c2 2 3 5 3 10s-1 8-3 10" />
    <path d="M12 2c-2 2-3 5-3 10s1 8 3 10" />
    <path d="M2 12h20" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: numero_seguro ────────────────────────────
// Devolve 0 se o valor non é un número finito.
// Protexe contra undefined, null, strings, NaN, Infinity...
const numeroSeguro = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
// ── FIN: numero_seguro ───────────────────────────────

function PanelXP({ idioma = 'gl', visible, onCerrar }) {
  const { xp, nivel: nivelUsuario } = useUser()

  // ── INICIO: tecla_escape ─────────────────────────────
  useEffect(() => {
    if (!visible) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [visible, onCerrar])
  // ── FIN: tecla_escape ────────────────────────────────

  if (!visible) return null

  const corNivel = nivelUsuario?.cor || 'var(--gaia-accent)'
  const corNivelFB = nivelUsuario?.cor || '#e8a547'

  // ── INICIO: categorias_xp ────────────────────────────
  // Cores semánticas coherentes coa paleta GAIA v1.1:
  //   exploración  → constellation (verde xade) — descubrir novos nodos
  //   conexión     → system        (azul xeo)   — relacionar cousas
  //   comprensión  → concept       (lavanda)    — entender profundamente
  const CATEGORIAS_XP = [
    { clave: 'exploracion', label: 'Exploración', cor: 'var(--gaia-constellation)', corFB: '#5dd4a8' },
    { clave: 'conexion',    label: 'Conexión',    cor: 'var(--gaia-system)',        corFB: '#7dd3fc' },
    { clave: 'comprension', label: 'Comprensión', cor: 'var(--gaia-concept)',       corFB: '#9bb3ff' }
  ]
  // ── FIN: categorias_xp ───────────────────────────────

  // ── INICIO: mensaxe_motivacional ─────────────────────
  const mensaxeMotivacional = (() => {
    const total = numeroSeguro(xp.total)
    if (total === 0)   return 'Comeza a explorar para gañar XP'
    if (total < 100)   return 'Bo comezo. Segue explorando.'
    if (total < 500)   return 'Vas polo bo camiño.'
    return 'Explorador/a experimentado/a.'
  })()
  // ── FIN: mensaxe_motivacional ────────────────────────

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      right: 16,
      zIndex: 50,
      width: 320,
      background: 'rgba(15, 23, 41, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--gaia-accent-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 24px rgba(232, 165, 71, 0.15)',
      animation: 'panelXPFadeIn 250ms ease',
      fontFamily: 'var(--gaia-font-body)'
    }}>

      <style>{`
        @keyframes panelXPFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        padding: '18px 20px 16px',
        background: 'var(--gaia-accent-bg)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        position: 'relative'
      }}>
        {/* Botón pechar */}
        <button
          onClick={onCerrar}
          aria-label="Pechar"
          style={{
            position: 'absolute',
            top: 14, right: 14,
            background: 'transparent',
            border: 'none',
            color: 'var(--gaia-text-tertiary)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            display: 'grid',
            placeItems: 'center',
            transition: 'all 150ms ease'
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

        {/* Etiqueta nivel */}
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: corNivel,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoEstrela />
          {nivelUsuario?.titulo || 'Explorador/a'}
        </div>

        {/* XP total en grande */}
        <div style={{
          fontFamily: 'var(--gaia-font-display)',
          fontSize: 44,
          fontWeight: 900,
          color: 'var(--gaia-accent)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          marginBottom: 4
        }}>
          {numeroSeguro(xp.total)}
          <span style={{
            fontSize: 14,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            marginLeft: 6,
            fontWeight: 600
          }}>
            XP
          </span>
        </div>

        {/* Barra de progreso */}
        {nivelUsuario?.xpSeguinte && (
          <div style={{ marginTop: 14 }}>
            <div style={{
              height: 4,
              background: 'var(--gaia-cosmos-500)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${nivelUsuario.progreso || 0}%`,
                background: corNivelFB,
                boxShadow: `0 0 8px ${corNivelFB}88`,
                borderRadius: 2,
                transition: 'width 600ms ease'
              }} />
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              marginTop: 6,
              letterSpacing: '0.025em'
            }}>
              {numeroSeguro(nivelUsuario.xpSeguinte) - numeroSeguro(xp.total)} XP para <span style={{ color: 'var(--gaia-text-secondary)' }}>{nivelUsuario.tituloSeguinte}</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ DESGLOSE XP POR CATEGORÍA ═══ */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--gaia-cosmos-400)'
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 10
        }}>
          Desglose
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIAS_XP.map(cat => {
            const valor = numeroSeguro(xp[cat.clave])
            return (
              <div key={cat.clave} style={{
                flex: 1,
                padding: '12px 8px',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderLeft: `3px solid ${cat.corFB}`,
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 22,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 900,
                  color: cat.cor,
                  lineHeight: 1,
                  letterSpacing: '-0.02em'
                }}>
                  {valor}
                </div>
                <div style={{
                  fontSize: 9,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 5,
                  fontWeight: 600
                }}>
                  {cat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ NIVEL SEGUINTE ═══ */}
      {nivelUsuario && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--gaia-cosmos-400)'
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 8
          }}>
            Nivel actual
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 700,
              color: corNivel,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                padding: '2px 8px',
                background: 'var(--gaia-cosmos-800)',
                border: `1px solid ${corNivelFB}44`,
                borderRadius: 9999,
                letterSpacing: '0.025em'
              }}>
                Nv.{nivelUsuario.nivel}
              </span>
              {nivelUsuario.titulo}
            </div>
            {nivelUsuario.xpSeguinte && (
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.025em'
              }}>
                Seguinte: <span style={{ color: 'var(--gaia-text-secondary)' }}>{nivelUsuario.tituloSeguinte}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MENSAXE MOTIVACIONAL ═══ */}
      <div style={{
        padding: '14px 20px 16px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--gaia-text-tertiary)'
      }}>
        <IconoGalaxia />
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--gaia-font-body)',
          fontStyle: 'italic',
          lineHeight: 1.5
        }}>
          {mensaxeMotivacional}
        </div>
      </div>
    </div>
  )
}

export default PanelXP