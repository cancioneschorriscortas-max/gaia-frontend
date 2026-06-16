import { useState, useEffect } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import ContextoBreadcrumb from './ContextoBreadcrumb'
import VisorRuta from './VisorRuta'
import RetoInteractivo from './RetoInteractivo'
import ModoExame from './ModoExame'

// ═══════════════════════════════════════════════════════════
// VisorNodo — Páxina completa dun nodo
// ═══════════════════════════════════════════════════════════
// Reescrito v1.2.
// API pública INTACTA: nodoId, onVolver, seleccionarNodo,
// idioma, idiomasActivos, nivel, onCambiarNivel.
//
// CAMBIOS v1.2 (arranxos á v1.1):
//
//   1. CABECEIRA STICKY ARRANXADA:
//      Antes tiña `paddingTop: 106` no contedor que interactuaba
//      mal coa cabeceira sticky. Agora eliminado → a cabeceira
//      pégase correctamente ao top e o contido scrolla debaixo
//      sen flash nin solapamento visual.
//      Tamén sumada opacidade (0.85 → 0.95), blur 16px, e
//      box-shadow suave que aparece cando se detecta scroll.
//
//   2. UNHA LIÑA SEMPRE na cabeceira (usando o novo
//      ContextoBreadcrumb v1.2 con popover "+N" para múltiples
//      camiños).
//
//   3. MÓBIL: controis simplificados. O selector de idioma e de
//      nivel só se ensinan se hai espazo suficiente, senón se
//      agochan nun botón de menú que os despregue. Así a
//      cabeceira non se amontoa.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: constantes_visuais ───────────────────────
const NIVEL_COR = {
  primary:   'var(--gaia-constellation)',
  secondary: 'var(--gaia-system)',
  expert:    'var(--gaia-concept)'
}
const NIVEL_COR_GLOW = {
  primary:   'var(--gaia-constellation-glow)',
  secondary: 'var(--gaia-system-glow)',
  expert:    'var(--gaia-concept-glow)'
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
const NIVEL_COR_FALLBACK = {
  primary:   '#5dd4a8',
  secondary: '#7dd3fc',
  expert:    '#9bb3ff'
}

// Cores por tipo (aliñadas coa paleta do mapa v1.1)
const TIPO_COR = {
  origin:        { main: 'var(--gaia-text-primary)', bg: 'var(--gaia-cosmos-700)',       border: 'var(--gaia-cosmos-400)',      fb: '#f5f7ff' },
  galaxy:        { main: 'var(--gaia-galaxy)',        bg: 'var(--gaia-galaxy-bg)',        border: 'var(--gaia-galaxy-border)',    fb: '#ffd966' },
  constellation: { main: 'var(--gaia-constellation)', bg: 'var(--gaia-constellation-bg)', border: 'var(--gaia-constellation-border)', fb: '#5dd4a8' },
  system:        { main: 'var(--gaia-system)',        bg: 'var(--gaia-system-bg)',        border: 'var(--gaia-system-border)',    fb: '#7dd3fc' },
  concept:       { main: 'var(--gaia-concept)',       bg: 'var(--gaia-concept-bg)',       border: 'var(--gaia-concept-border)',   fb: '#9bb3ff' },
  process:       { main: 'var(--gaia-process)',       bg: 'var(--gaia-process-bg)',       border: 'var(--gaia-process-border)',   fb: '#ff9fb8' }
}
// ── FIN: constantes_visuais ──────────────────────────

// ── INICIO: icono_candado ────────────────────────────
function IconoCandado({ size = 12, color = 'currentColor', opacity = 0.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity, flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
// ── FIN: icono_candado ───────────────────────────────

function VisorNodo({
  nodoId,
  onVolver,
  seleccionarNodo,
  idioma = 'gl',
  idiomasActivos = ['gl', 'es', 'en'],
  nivel = 'primary',
  onCambiarNivel
}) {

  const { esProfesor } = useUser()

  const [nodo,               setNodo]               = useState(null)
  const [relacions,          setRelacions]          = useState([])
  const [journeys,           setJourneys]           = useState([])
  const [cargando,           setCargando]           = useState(true)
  const [verTodasRelacions,  setVerTodasRelacions]  = useState(false)
  const [nivelExpandido,     setNivelExpandido]     = useState({ primary: true, secondary: false, expert: false })
  const [journeyActiva,      setJourneyActiva]      = useState(null)
  const [exameAberto,        setExameAberto]        = useState(false)
  const [isMobile,           setIsMobile]           = useState(window.innerWidth < 768)

  // ── INICIO: estado_scroll ────────────────────────────
  // Para aplicar box-shadow á cabeceira cando o contido se moveu
  const [scrolled, setScrolled] = useState(false)
  // ── FIN: estado_scroll ───────────────────────────────

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (!nodoId) return
    setCargando(true)
    setVerTodasRelacions(false)
    setNivelExpandido({ primary: true, secondary: false, expert: false })
    setJourneyActiva(null)

    Promise.all([
      fetch(`${API}/nodo/${nodoId}`).then(r => r.json()),
      fetch(`${API}/nodo/${nodoId}/relacions`).then(r => r.json()),
      fetch(`${API}/nodo/${nodoId}/journeys`).then(r => r.json())
    ]).then(([nodoData, relData, jData]) => {
      setNodo(nodoData)
      setRelacions(relData.relacions || [])
      setJourneys(jData.journeys || [])
      setCargando(false)
    })
  }, [nodoId])

  const podeVer = (n) => {
    if (nivel === 'primary')   return n === 'primary'
    if (nivel === 'secondary') return n === 'primary' || n === 'secondary'
    return true
  }
  const esBloqueado = (n) => !podeVer(n)
  const toggleNivel = (n) => {
    if (esBloqueado(n)) return
    setNivelExpandido(prev => ({ ...prev, [n]: !prev[n] }))
  }

  if (cargando) return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--gaia-font-mono)'
    }}>
      <div style={{
        color: 'var(--gaia-accent)',
        fontSize: 13,
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        Cargando...
      </div>
    </div>
  )

  if (!nodo) return null

  const texto  = (n) => nodo.content?.[n]?.[idioma] || nodo.content?.[n]?.gl || ''
  const reto   = (n) => nodo.retos?.[n]?.[idioma]   || nodo.retos?.[n]?.gl   || ''
  const titulo = nodo.labels?.[idioma] || nodo.labels?.gl || ''
  const resumo = texto('primary').split('.').slice(0, 2).join('.') + '.'

  const relacionsMostrar = verTodasRelacions ? relacions : relacions.slice(0, 4)

  const enIdioma    = (nodo.media || []).filter(m => m.idioma === idioma)
  const mediaRender = enIdioma.length > 0
    ? enIdioma
    : (nodo.media || []).filter(m => !m.idioma || m.idioma === 'gl')

  const tipoCor = TIPO_COR[nodo.type] || TIPO_COR.origin
  const haloColor = `${tipoCor.fb}22`

  return (
    <div
      // ── INICIO: contedor_scrollable ──────────────────
      // CAMBIO v1.2: eliminado `paddingTop: 106` que interactuaba
      // mal coa cabeceira sticky. Agora a cabeceira pégase
      // correctamente e o contido scrolla naturalmente debaixo.
      onScroll={(e) => {
        // Detecta se o usuario se despezou do top → activa
        // box-shadow para separar visualmente a cabeceira.
        setScrolled(e.currentTarget.scrollTop > 4)
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--gaia-cosmos-900)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--gaia-font-body)',
        overflowY: 'auto',
        color: 'var(--gaia-text-primary)'
      }}
      // ── FIN: contedor_scrollable ─────────────────────
    >

      {/* ═══════════════════════════════════════════════
          FONDO AMBIENTAL CÓSMICO
          ═══════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 30% 15%, var(--gaia-cosmos-700) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 85%, ${haloColor} 0%, transparent 55%),
          var(--gaia-cosmos-900)
        `,
        pointerEvents: 'none'
      }} />

      {/* Estrelas sutís */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 5% 20%, rgba(232, 165, 71, 0.3), transparent),
          radial-gradient(1px 1px at 25% 75%, rgba(93, 212, 168, 0.25), transparent),
          radial-gradient(1px 1px at 75% 30%, rgba(125, 211, 252, 0.25), transparent),
          radial-gradient(1px 1px at 90% 80%, rgba(255, 217, 102, 0.2), transparent),
          radial-gradient(1px 1px at 45% 50%, rgba(155, 179, 255, 0.2), transparent)
        `,
        opacity: 0.6,
        pointerEvents: 'none'
      }} />

      {/* ═══════════════════════════════════════════════
          CABECEIRA STICKY — v1.2
          ═══════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: isMobile ? '10px 14px' : '12px 28px',
        background: 'rgba(10, 16, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        // ── INICIO: shadow_scroll ──────────────────────
        // Sombra que aparece ao facer scroll: reforza
        // separación visual cabeceira / corpo.
        boxShadow: scrolled
          ? '0 4px 20px rgba(0, 0, 0, 0.35)'
          : 'none',
        transition: 'box-shadow 200ms ease',
        // ── FIN: shadow_scroll ─────────────────────────
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
        // En móbil permitimos wrap pero minimizamos elementos
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>

        {/* ── Esquerda: botón volver GAIA + breadcrumb ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          <button
            onClick={onVolver}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'transparent',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-secondary)',
              borderRadius: 8,
              padding: isMobile ? '6px 11px' : '7px 13px',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              transition: 'all 150ms ease',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
              e.currentTarget.style.color = 'var(--gaia-text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              e.currentTarget.style.color = 'var(--gaia-text-secondary)'
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={{
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: '0.1em',
              color: 'var(--gaia-accent)'
            }}>
              GAIA
            </span>
          </button>

          {/* Breadcrumb (v1.2: sempre 1 liña co popover "+N") */}
          <div style={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden'
          }}>
            <ContextoBreadcrumb id={nodoId} idioma={idioma} />
          </div>
        </div>

        {/* ── Dereita: controis (exame + idioma + nivel) ── */}
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>

          {/* Botón exame — só constelacións */}
          {nodo?.type === 'constellation' && (
            <button
              onClick={() => setExameAberto(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--gaia-concept-bg)',
                border: '1px solid var(--gaia-concept-border)',
                color: 'var(--gaia-concept)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--gaia-font-body)',
                transition: 'all 150ms ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155, 179, 255, 0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gaia-concept-bg)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Exame
            </button>
          )}

          {/* Selector idioma — agóchase en móbil se hai profesor (falta sitio) */}
          {!(isMobile && esProfesor) && (
            <div style={{
              display: 'flex', gap: 2,
              background: 'var(--gaia-cosmos-700)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 6, padding: 2
            }}>
              {idiomasActivos.map(i => (
                <span key={i} style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  padding: '3px 8px',
                  color: i === idioma ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                  background: i === idioma ? 'var(--gaia-accent-bg)' : 'transparent',
                  borderRadius: 4,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: i === idioma ? 700 : 400
                }}>
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* Selector nivel — só profesores */}
          {esProfesor && (
            <div style={{
              display: 'flex', gap: 2,
              background: 'var(--gaia-cosmos-700)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 6, padding: 2
            }}>
              {['primary', 'secondary', 'expert'].map(n => (
                <button key={n}
                  onClick={() => onCambiarNivel && onCambiarNivel(n)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: nivel === n ? 700 : 500,
                    cursor: 'pointer',
                    background: nivel === n ? NIVEL_COR_BG[n] : 'transparent',
                    color: nivel === n ? NIVEL_COR[n] : 'var(--gaia-text-tertiary)',
                    border: 'none',
                    borderRadius: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 150ms ease',
                    WebkitTapHighlightColor: 'transparent'
                  }}>
                  <span style={{
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: nivel === n ? NIVEL_COR[n] : 'var(--gaia-cosmos-400)',
                    boxShadow: nivel === n ? `0 0 4px ${NIVEL_COR_GLOW[n]}` : 'none'
                  }} />
                  {n === 'primary' ? t(idioma, 'primaria')
                    : n === 'secondary' ? t(idioma, 'secundaria')
                    : t(idioma, 'experto')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CORPO PRINCIPAL
          ═══════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1,
        display: 'flex',
        gap: isMobile ? 0 : 28,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '20px 16px 80px' : '36px 32px',
        maxWidth: 1280, width: '100%', margin: '0 auto',
        boxSizing: 'border-box'
      }}>

        {/* ─── Columna esquerda ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Chip de tipo */}
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: 10,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'lowercase',
              background: tipoCor.bg,
              color: tipoCor.main,
              border: `1px solid ${tipoCor.border}`
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: tipoCor.main
              }} />
              {nodo.type}
            </span>
          </div>

          {/* Título */}
          <h1 style={{
            fontFamily: 'var(--gaia-font-display)',
            color: 'var(--gaia-text-primary)',
            margin: '0 0 16px 0',
            fontSize: isMobile ? 32 : 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em'
          }}>
            {titulo}
          </h1>

          {/* Resumo */}
          <p style={{
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            fontSize: isMobile ? 16 : 18,
            lineHeight: 1.65,
            margin: '0 0 24px 0',
            maxWidth: '65ch'
          }}>
            {resumo}
          </p>

          {/* Meta-row: autor + centro (AMTEGA) */}
          {(nodo.autor || nodo.centro) && (
            <div style={{
              display: 'flex',
              gap: 24,
              marginBottom: 32,
              paddingTop: 16,
              borderTop: '1px solid var(--gaia-cosmos-400)',
              flexWrap: 'wrap'
            }}>
              {nodo.autor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>Autor</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gaia-text-primary)' }}>
                    {nodo.autor}
                  </span>
                </div>
              )}
              {nodo.centro && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>Centro</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gaia-text-primary)' }}>
                    {nodo.centro}
                  </span>
                </div>
              )}
              {nodo.reto_puntos && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 'auto' }}>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>XP dispoñibles</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gaia-accent)' }}>
                    +{nodo.reto_puntos * 3}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── Capas pedagóxicas ─── */}
          {['primary', 'secondary', 'expert'].map(n => {
            const bloqueado  = esBloqueado(n)
            const expandido  = nivelExpandido[n]
            const textoNivel = texto(n)
            const retoNivel  = reto(n)
            const labelNivel = n === 'primary' ? t(idioma, 'primaria')
                             : n === 'secondary' ? t(idioma, 'secundaria')
                             : t(idioma, 'experto')

            return (
              <div key={n} style={{ marginBottom: 16 }}>
                <div
                  onClick={() => toggleNivel(n)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: bloqueado
                      ? 'var(--gaia-cosmos-800)'
                      : expandido ? NIVEL_COR_BG[n] : 'var(--gaia-cosmos-800)',
                    borderRadius: expandido ? '12px 12px 0 0' : 12,
                    border: `1px solid ${bloqueado
                      ? 'var(--gaia-cosmos-400)'
                      : expandido ? NIVEL_COR_BORDER[n] : 'var(--gaia-cosmos-400)'}`,
                    borderLeft: bloqueado
                      ? '1px solid var(--gaia-cosmos-400)'
                      : `3px solid ${NIVEL_COR_FALLBACK[n]}`,
                    cursor: bloqueado ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease',
                    opacity: bloqueado ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {bloqueado
                      ? <IconoCandado color="var(--gaia-text-tertiary)" opacity={0.6} />
                      : <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: NIVEL_COR[n],
                          boxShadow: `0 0 6px ${NIVEL_COR_GLOW[n]}`
                        }} />
                    }
                    <span style={{
                      fontSize: 11,
                      fontFamily: 'var(--gaia-font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: bloqueado ? 'var(--gaia-text-tertiary)' : NIVEL_COR[n],
                      fontWeight: 600
                    }}>
                      Nivel {labelNivel}
                    </span>
                    {bloqueado && (
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-disabled)',
                        marginLeft: 4
                      }}>
                        — nivel superior requirido
                      </span>
                    )}
                  </div>

                  {!bloqueado && retoNivel && nodo.reto_puntos && (
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: 'var(--gaia-accent)',
                      letterSpacing: '0.05em',
                      marginRight: 12
                    }}>
                      +{nodo.reto_puntos} XP
                    </span>
                  )}

                  {!bloqueado && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gaia-text-tertiary)" strokeWidth="2" style={{
                      transition: 'transform 200ms ease',
                      transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>

                {/* Contido expandido */}
                {!bloqueado && expandido && textoNivel && (
                  <div style={{
                    padding: '24px 20px 28px',
                    background: 'var(--gaia-cosmos-800)',
                    border: `1px solid ${NIVEL_COR_BORDER[n]}`,
                    borderTop: 'none',
                    borderLeft: `3px solid ${NIVEL_COR_FALLBACK[n]}`,
                    borderRadius: '0 0 12px 12px'
                  }}>
                    <p style={{
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-text-primary)',
                      fontSize: 15,
                      lineHeight: 1.7,
                      margin: '0 0 20px 0',
                      maxWidth: '68ch'
                    }}>
                      {textoNivel}
                    </p>
                    {retoNivel && (
                      <RetoInteractivo
                        nodoId={nodoId}
                        nodoLabel={titulo}
                        pregunta={retoNivel}
                        nivel={n}
                        idioma={idioma}
                        puntosTotais={nodo.reto_puntos || 20}
                      />
                    )}
                  </div>
                )}

                {/* Bloqueado (preview) */}
                {bloqueado && (
                  <div style={{
                    padding: '20px',
                    background: 'var(--gaia-cosmos-800)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    opacity: 0.5,
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontFamily: 'var(--gaia-font-body)',
                      fontSize: 12,
                      color: 'var(--gaia-text-tertiary)',
                      margin: 0
                    }}>
                      Completa os niveis anteriores para acceder ao contido de <strong style={{ color: 'var(--gaia-text-secondary)' }}>{labelNivel}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ─── Columna dereita (sidebar) ─── */}
        <div style={{
          width: isMobile ? '100%' : 'min(340px, 30vw)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginTop: isMobile ? 32 : 0
        }}>

          {/* ── MEDIA ── */}
          {mediaRender.length > 0 && (
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 14,
              padding: 20
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                {t(idioma, 'mediaTitle')}
              </div>
              {mediaRender.map(m => {
                const ytMatch = m.url.match(/(?:v=|embed\/)([a-zA-Z0-9_-]{11})/)
                const ytId = ytMatch ? ytMatch[1] : null
                return (
                  <div key={m.id} style={{ marginBottom: 12 }}>
                    {m.type === 'youtube' && ytId ? (
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--gaia-cosmos-400)' }}>
                        <iframe
                          width="100%"
                          height="180"
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={m[`label_${idioma}`] || m.label_gl}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ display: 'block' }}
                        />
                      </div>
                    ) : (
                      <a href={m.url} target="_blank" rel="noreferrer"
                        style={{
                          color: 'var(--gaia-accent)',
                          fontSize: 12,
                          fontFamily: 'var(--gaia-font-body)',
                          textDecoration: 'underline',
                          wordBreak: 'break-all'
                        }}>
                        {m[`label_${idioma}`] || m.label_gl || m.url}
                      </a>
                    )}
                    {(m[`label_${idioma}`] || m.label_gl) && m.type === 'youtube' && (
                      <div style={{
                        fontSize: 12,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-primary)',
                        marginTop: 8,
                        fontWeight: 500
                      }}>
                        {m[`label_${idioma}`] || m.label_gl}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── RELACIÓNS ── */}
          {relacions.length > 0 && (
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 14,
              padding: 20
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {t(idioma, 'relacionsTitle')} ({relacions.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {relacionsMostrar.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => rel.existe && seleccionarNodo(rel.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      padding: '10px 12px',
                      background: 'var(--gaia-cosmos-700)',
                      border: '1px solid var(--gaia-cosmos-400)',
                      borderLeft: '3px solid var(--gaia-accent)',
                      borderRadius: 8,
                      cursor: rel.existe ? 'pointer' : 'default',
                      opacity: rel.existe ? 1 : 0.5,
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => {
                      if (rel.existe) {
                        e.currentTarget.style.background = 'var(--gaia-cosmos-600)'
                        e.currentTarget.style.transform = 'translateX(2px)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{
                      fontSize: 9,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: 'var(--gaia-text-tertiary)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      {rel.direccion === 'in' ? '← ' : '→ '}
                      {rel.direccion === 'in'
                        ? (rel.nome?.[`${idioma}_inv`] || rel.nome?.gl_inv || rel.nome?.[idioma] || rel.nome?.gl || rel.tipo)
                        : (rel.nome?.[idioma] || rel.nome?.gl || rel.tipo)
                      }
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 600,
                      color: 'var(--gaia-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {rel.label}
                    </div>
                  </div>
                ))}
              </div>

              {relacions.length > 4 && (
                <button
                  onClick={() => setVerTodasRelacions(!verTodasRelacions)}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    padding: 8,
                    background: 'transparent',
                    border: '1px solid var(--gaia-cosmos-400)',
                    color: 'var(--gaia-text-tertiary)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-body)',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--gaia-accent)'
                    e.currentTarget.style.color = 'var(--gaia-accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
                    e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
                  }}
                >
                  {verTodasRelacions ? '↑ Ver menos' : `Ver todas (${relacions.length}) →`}
                </button>
              )}
            </div>
          )}

          {/* ── RUTAS ── */}
          {journeys.length > 0 && (
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 14,
              padding: 20
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t(idioma, 'rutasTitle')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {journeys.map(j => (
                  <div key={j.id}>
                    <div
                      onClick={() => setJourneyActiva(j.id === journeyActiva ? null : j.id)}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: journeyActiva === j.id
                          ? 'var(--gaia-constellation-bg)'
                          : 'var(--gaia-cosmos-700)',
                        border: `1px solid ${journeyActiva === j.id
                          ? 'var(--gaia-constellation-border)'
                          : 'var(--gaia-cosmos-400)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                      onMouseEnter={e => {
                        if (journeyActiva !== j.id) {
                          e.currentTarget.style.background = 'var(--gaia-cosmos-600)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (journeyActiva !== j.id) {
                          e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                        color: journeyActiva === j.id ? 'var(--gaia-constellation)' : 'var(--gaia-text-tertiary)',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 12,
                          fontFamily: 'var(--gaia-font-body)',
                          color: 'var(--gaia-text-primary)',
                          fontWeight: 600,
                          marginBottom: 3,
                          lineHeight: 1.3
                        }}>
                          {j.label?.[idioma] || j.label?.gl}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: 'var(--gaia-text-tertiary)',
                          letterSpacing: '0.05em'
                        }}>
                          {j.type} · {j.level}
                        </div>
                      </div>
                    </div>
                    {journeyActiva === j.id && (
                      <div style={{ marginTop: 8 }}>
                        <VisorRuta id={j.id} seleccionarNodo={seleccionarNodo} idioma={idioma} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal exame */}
      {exameAberto && (
        <ModoExame
          constelacionId={nodoId}
          constelacionLabel={titulo}
          idioma={idioma}
          nivel={nivel}
          onPechar={() => setExameAberto(false)}
        />
      )}
    </div>
  )
}

export default VisorNodo