import { useState, useEffect } from 'react'
import RutaNeno from './RutaNeno'
import { API } from './config/api';
import { t } from './i18n'

// Por debaixo deste ancho o arquivo pasa a UNHA columna: lista de
// módulos/rutas OU detalle da ruta, con botón de volta. Con dúas columnas
// a 375px o panel esquerdo (300px fixos) non deixaba sitio ao detalle.
const ANCHO_ESTREITO = 760

// ── INICIO: activable (a11y) ─────────────────────────
// Converte un div clicable nun control real: foco co tabulador
// e activación con Enter/Espazo, non só co rato.
function activable(accion) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: accion,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        accion()
      }
    }
  }
}
// ── FIN: activable ───────────────────────────────────

// ═══════════════════════════════════════════════════════════
// ArbolInstitucional — Arquivo institucional de rutas
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Panel modal ceremonial que amosa a estrutura
// institucional do arquivo: módulos → rutas → pasos.
//
// Orbitron fora. Entra Fraunces (display) + JetBrains Mono (técnico)
// + Atkinson Hyperlegible (corpo). O ton ceremonial consérvase.
//
// API pública sen cambios: idioma, onPechar, onSeleccionarRuta
// ═══════════════════════════════════════════════════════════


// ── INICIO: cores_e_constantes ───────────────────────
const ACCENT_FB = '#e8a547'
const ACCENT_GLOW = 'rgba(232, 165, 71, 0.45)'
// ── FIN: cores_e_constantes ──────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoArquivo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)

const IconoLibro = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const IconoVolver = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconoChevronRight = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const IconoChevronDown = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function ArbolInstitucional({ idioma = 'gl', onPechar, onSeleccionarRuta }) {

  const [journeys, setJourneys] = useState([])
  const [cargando, setCargando] = useState(true)
  const [moduloActivo, setModuloActivo] = useState(null)
  const [rutaActiva, setRutaActiva] = useState(null)
  const [visible, setVisible] = useState(false)
  const [percorridoActivo, setPercorridoActivo] = useState(null)
  const [estreito, setEstreito] = useState(() => typeof window !== 'undefined' && window.innerWidth < ANCHO_ESTREITO)

  useEffect(() => {
    let vivo = true
    setTimeout(() => setVisible(true), 100)
    fetch(`${API}/journeys`)
      .then(r => r.ok ? r.json() : { journeys: [] })
      .then(d => {
        if (!vivo) return
        setJourneys(d.journeys || [])
        setCargando(false)
      })
      .catch(() => vivo && setCargando(false))
    // matchMedia ademais de resize: a emulación de móbil das DevTools cambia
    // o viewport sen disparar sempre 'resize', pero a media query si avisa.
    const mq = window.matchMedia(`(max-width: ${ANCHO_ESTREITO - 1}px)`)
    const medir = () => setEstreito(mq.matches || window.innerWidth < ANCHO_ESTREITO)
    medir()
    mq.addEventListener('change', medir)
    window.addEventListener('resize', medir)
    return () => { vivo = false; mq.removeEventListener('change', medir); window.removeEventListener('resize', medir) }
  }, [])

  // Pechar co teclado (Escape), como calquera modal.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !percorridoActivo) pechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percorridoActivo])

  const NIVEL_LABEL = { primary: t(idioma, 'primaria'), secondary: t(idioma, 'percorridoSecundaria'), expert: t(idioma, 'experto') }

  // Módulos nunha orde fixa (o tutorial do pan está en Galicia; logo o mundo, a ciencia e os oficios)
  // e, dentro de cada módulo, primeiro primaria, logo secundaria e experto, en orde alfabética.
  // Con 34 rutas a orde de chegada (alfabética global) mesturaba niveis e poñía "Ciencia" primeiro.
  const ORDE_MODULOS = ['Galicia', 'Natureza', 'Ciencia', 'Oficios']
  const ORDE_NIVEL = { primary: 0, secondary: 1, expert: 2 }
  const modulosSenOrde = journeys.reduce((acc, j) => {
    const mod = j.modulo || t(idioma, 'arquivoXeral')
    if (!acc[mod]) acc[mod] = { rutas: [] }
    acc[mod].rutas.push(j)
    return acc
  }, {})
  const modulos = Object.fromEntries(
    Object.entries(modulosSenOrde)
      .sort(([a], [b]) => {
        const ia = ORDE_MODULOS.indexOf(a), ib = ORDE_MODULOS.indexOf(b)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
      })
      .map(([mod, data]) => [mod, { rutas: [...data.rutas].sort((x, y) =>
        (ORDE_NIVEL[x.level] ?? 0) - (ORDE_NIVEL[y.level] ?? 0)
        || String(x.label?.[idioma] || x.label?.gl || x.id).localeCompare(String(y.label?.[idioma] || y.label?.gl || y.id))) }])
  )

  const pechar = () => {
    setVisible(false)
    setTimeout(() => onPechar(), 400)
  }

  const seleccionarModulo = (mod) => {
    setModuloActivo(moduloActivo === mod ? null : mod)
    setRutaActiva(null)
  }

  const seleccionarRuta = (j) => {
    setRutaActiva(j)
  }

  const abrirRuta = () => {
    if (rutaActiva) setPercorridoActivo(rutaActiva.id)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      isolation: 'isolate',
      backgroundImage: "url('/assets/archivo-gaia-fondo.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 400ms ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}
    role="dialog" aria-modal="true" aria-label={t(idioma, 'arquivoTitulo')}>

      {/* ═══ VIGNETTE ═══ */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(10, 16, 32, 0.35) 0%, rgba(10, 16, 32, 0.88) 100%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* ═══ SCANLINES SUTIS ═══ */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(232, 165, 71, 0.012) 3px, rgba(232, 165, 71, 0.012) 4px)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* ═══ CABECEIRA CEREMONIAL ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 'none',
        padding: estreito ? '14px 18px' : '22px 40px',
        display: 'grid',
        gridTemplateColumns: estreito ? '1fr' : '1fr auto 1fr',
        alignItems: 'center',
        gap: 20,
        borderBottom: '1px solid var(--gaia-accent-border)',
        background: 'rgba(10, 16, 32, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        {/* Metadata esquerda (só con sitio) */}
        {!estreito && (
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--gaia-text-tertiary)',
          lineHeight: 1.8,
          textTransform: 'uppercase'
        }}>
          <div>{t(idioma, 'arquivoVersion')} <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>0.7</span></div>
          <div>{t(idioma, 'arquivoAmbito')} <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>{t(idioma, 'arquivoAmbitoEducativo')}</span></div>
          <div>{t(idioma, 'arquivoModulos')} <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>{Object.keys(modulos).length} {t(idioma, 'arquivoActivos')}</span></div>
        </div>
        )}

        {/* Título central */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--gaia-font-display)',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: 'var(--gaia-accent)',
            textShadow: `0 0 40px ${ACCENT_GLOW}, 0 0 80px rgba(232, 165, 71, 0.15)`,
            lineHeight: 1
          }}>
            {t(idioma, 'arquivoTitulo')}
          </div>
          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'var(--gaia-text-tertiary)',
            marginTop: 8,
            textTransform: 'uppercase'
          }}>
            {t(idioma, 'arquivoSubtitulo')}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 10
          }}>
            <div style={{
              flex: 1,
              maxWidth: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--gaia-accent-border))'
            }} />
            <div style={{
              width: 6, height: 6,
              background: 'var(--gaia-accent)',
              transform: 'rotate(45deg)',
              boxShadow: `0 0 8px ${ACCENT_FB}`
            }} />
            <div style={{
              flex: 1,
              maxWidth: 60,
              height: 1,
              background: 'linear-gradient(90deg, var(--gaia-accent-border), transparent)'
            }} />
          </div>
        </div>

        {/* Metadata dereita (só con sitio) */}
        {!estreito && (
        <div style={{
          textAlign: 'right',
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--gaia-text-tertiary)',
          lineHeight: 1.8,
          textTransform: 'uppercase'
        }}>
          <div>
            {t(idioma, 'arquivoEstado')} {' '}
            <span style={{
              color: 'var(--gaia-success)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              {t(idioma, 'arquivoOperativo')}
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--gaia-success)',
                boxShadow: '0 0 6px var(--gaia-success)',
                animation: 'arbolBlink 1.8s step-end infinite'
              }} />
            </span>
          </div>
          <div>{t(idioma, 'arquivoInstitucion')}</div>
          <div>{t(idioma, 'arquivoAcceso')}</div>
        </div>
        )}
      </div>

      {/* ═══ CONTIDO PRINCIPAL ═══ */}
      {/* flex:1 + minHeight:0 en vez de calc(100vh - 120px): a cabeceira
          non mide sempre 120px e o contido quedaba cortado tras o pé. */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>

        {/* ───── PANEL ESQUERDO: MÓDULOS (en estreito, só sen ruta escollida) ───── */}
        {(!estreito || !rutaActiva) && (
        <div style={{
          width: estreito ? '100%' : 300,
          flexShrink: 0,
          borderRight: estreito ? 'none' : '1px solid var(--gaia-cosmos-400)',
          padding: estreito ? '18px 16px 90px' : '28px 18px 100px 18px',
          overflowY: 'auto',
          background: 'rgba(10, 16, 32, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--gaia-text-tertiary)',
            marginBottom: 18,
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            {t(idioma, 'arquivoModulosCon')}
          </div>

          {cargando && (
            <div style={{
              color: 'var(--gaia-text-tertiary)',
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              textAlign: 'center',
              marginTop: 40,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              {t(idioma, 'cargando')}
            </div>
          )}

          {!cargando && Object.keys(modulos).length === 0 && (
            <div style={{
              color: 'var(--gaia-text-tertiary)',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              textAlign: 'center',
              marginTop: 40,
              lineHeight: 1.5,
              padding: '20px 10px'
            }}>
              {t(idioma, 'arquivoSenRutas')}
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginTop: 10,
                color: 'var(--gaia-text-disabled)',
                letterSpacing: '0.05em'
              }}>
                {t(idioma, 'arquivoCreaRutas')}
              </div>
            </div>
          )}

          {Object.entries(modulos).map(([mod, data]) => (
            <div key={mod} style={{ marginBottom: 6 }}>
              <div
                {...activable(() => seleccionarModulo(mod))}
                aria-expanded={moduloActivo === mod}
                aria-label={t(idioma, 'arquivoModuloAria', mod)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  background: moduloActivo === mod
                    ? 'var(--gaia-accent-bg)'
                    : 'var(--gaia-cosmos-800)',
                  border: `1px solid ${moduloActivo === mod
                    ? 'var(--gaia-accent-border)'
                    : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  if (moduloActivo !== mod) {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  }
                }}
                onMouseLeave={e => {
                  if (moduloActivo !== mod) {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
                  }
                }}
              >
                <div style={{
                  color: moduloActivo === mod ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)'
                }}>
                  <IconoArquivo size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    color: moduloActivo === mod ? 'var(--gaia-accent)' : 'var(--gaia-text-primary)',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {mod}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    marginTop: 3,
                    letterSpacing: '0.05em'
                  }}>
                    {data.rutas.length === 1 ? t(idioma, 'arquivoUnhaRuta') : t(idioma, 'arquivoNRutas', data.rutas.length)}
                  </div>
                </div>
                <div style={{
                  color: moduloActivo === mod ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                  transition: 'transform 200ms ease',
                  transform: moduloActivo === mod ? 'rotate(0)' : 'rotate(0)'
                }}>
                  {moduloActivo === mod ? <IconoChevronDown /> : <IconoChevronRight />}
                </div>
              </div>

              {moduloActivo === mod && (
                <div style={{ marginLeft: 14, marginTop: 6 }}>
                  {data.rutas.map(j => (
                    <div
                      key={j.id}
                      {...activable(() => seleccionarRuta(j))}
                      aria-pressed={rutaActiva?.id === j.id}
                      aria-label={t(idioma, 'arquivoRutaAria', j.label?.[idioma] || j.label?.gl || j.id, NIVEL_LABEL[j.level] || j.level)}
                      style={{
                        padding: '9px 12px',
                        marginBottom: 3,
                        background: rutaActiva?.id === j.id
                          ? 'var(--gaia-accent-bg)'
                          : 'transparent',
                        border: `1px solid ${rutaActiva?.id === j.id
                          ? 'var(--gaia-accent-border)'
                          : 'transparent'}`,
                        borderLeft: `2px solid ${rutaActiva?.id === j.id
                          ? ACCENT_FB
                          : 'var(--gaia-cosmos-400)'}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                      onMouseEnter={e => {
                        if (rutaActiva?.id !== j.id) {
                          e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (rutaActiva?.id !== j.id) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <div style={{
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: rutaActiva?.id === j.id ? 600 : 500,
                        color: rutaActiva?.id === j.id
                          ? 'var(--gaia-accent)'
                          : 'var(--gaia-text-secondary)'
                      }}>
                        {j.label?.[idioma] || j.label?.gl}
                      </div>
                      <div style={{
                        fontSize: 9,
                        fontFamily: 'var(--gaia-font-mono)',
                        color: 'var(--gaia-text-disabled)',
                        marginTop: 3,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}>
                        {NIVEL_LABEL[j.level] || j.level}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {/* ───── PANEL DEREITO: DETALLE RUTA (en estreito, só con ruta escollida) ───── */}
        {(!estreito || rutaActiva) && (
       <div style={{ flex: 1, minWidth: 0, padding: estreito ? '18px 16px 90px' : '36px 44px 100px 44px', overflowY: 'auto' }}>
          {estreito && rutaActiva && (
            <button onClick={() => setRutaActiva(null)}
              style={{
                background: 'none', border: 'none', color: 'var(--gaia-accent)', cursor: 'pointer',
                fontFamily: 'var(--gaia-font-body)', fontSize: 13, fontWeight: 600, padding: '0 0 16px'
              }}>
              {t(idioma, 'arquivoVolverLista')}
            </button>
          )}
          {!rutaActiva ? (
            <div style={{ textAlign: 'center', marginTop: '15vh' }}>
              <div style={{
                display: 'inline-flex',
                marginBottom: 20,
                color: 'var(--gaia-cosmos-400)',
                opacity: 0.6
              }}>
                <IconoLibro size={48} />
              </div>
              <div style={{
                fontFamily: 'var(--gaia-font-mono)',
                fontSize: 12,
                letterSpacing: '0.18em',
                color: 'var(--gaia-text-tertiary)',
                textTransform: 'uppercase',
                fontWeight: 500
              }}>
                {t(idioma, 'arquivoSelecciona')}
              </div>
            </div>
          ) : (
            <RutaDetalle
              journey={rutaActiva}
              idioma={idioma}
              onAbrir={abrirRuta}
            />
          )}
        </div>
        )}
      </div>

      {/* ═══ BARRA INFERIOR INSTITUCIONAL ═══ */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3,
        padding: estreito ? '10px 16px' : '14px 32px',
        justifyContent: estreito ? 'center' : 'space-between',
        background: 'rgba(10, 16, 32, 0.85)',
        borderTop: '1px solid var(--gaia-accent-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        {!estreito && (
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'var(--gaia-text-disabled)',
          textTransform: 'uppercase'
        }}>
          {t(idioma, 'arquivoPe')}
        </div>
        )}

        <button
          onClick={pechar}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 18px',
            background: 'transparent',
            border: '1px solid var(--gaia-accent-border)',
            color: 'var(--gaia-accent)',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gaia-accent-bg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <IconoVolver size={10} />
          {t(idioma, 'arquivoVolverGaia')}
        </button>

        {!estreito && (
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'var(--gaia-text-disabled)',
          textTransform: 'uppercase'
        }}>
          {t(idioma, 'arquivoPeDereita')}
        </div>
        )}
      </div>

      {/* ═══ PERCORRIDO GUIADO ═══ */}
      {/* Unha soa experiencia de ruta: entra pola SENDA (RutaNeno), non
          directo ao paso. O profesor ve exactamente o que verán os alumnos.
          RutaNeno non é overlay por si mesmo → envólvese nun fixo, igual
          que facía PercorridoRuta (position:fixed · inset:0 · zIndex:150). */}
      {percorridoActivo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'var(--gaia-cosmos-900)', overflowY: 'auto'
        }}>
          <RutaNeno
            journeyId={percorridoActivo}
            idioma={idioma}
            onSair={() => setPercorridoActivo(null)}
          />
        </div>
      )}

      <style>{`
        @keyframes arbolBlink {
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

// ═══ SUBCOMPOÑENTE: DETALLE DUNHA RUTA ═══
function RutaDetalle({ journey, idioma, onAbrir }) {
  const [stops, setStops] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Cancelación: ao cambiar rápido de ruta, os pasos da anterior
    // aterraban baixo a cabeceira da nova.
    let vivo = true
    setCargando(true)
    fetch(`${API}/journeys/${journey.id}`)
      .then(r => r.ok ? r.json() : { stops: [] })
      .then(d => {
        if (!vivo) return
        setStops(d.stops || [])
        setCargando(false)
      })
      .catch(() => vivo && setCargando(false))
    return () => { vivo = false }
  }, [journey.id])

  const label = journey.label?.[idioma] || journey.label?.gl || ''
  const desc = journey.description?.[idioma] || journey.description?.gl || ''

  const NIVEL_LABEL = {
    primary: t(idioma, 'primaria'),
    secondary: t(idioma, 'percorridoSecundaria'),
    expert: t(idioma, 'experto')
  }
  const NIVEL_COR_FB = {
    primary: '#5dd4a8',
    secondary: '#7dd3fc',
    expert: '#9bb3ff'
  }

  return (
    <div>
      {/* Cabeceira da ruta */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--gaia-accent)',
          marginBottom: 12,
          textTransform: 'uppercase',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>{journey.modulo || t(idioma, 'arquivoXeral')}</span>
          <span style={{ color: 'var(--gaia-cosmos-400)' }}>·</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: NIVEL_COR_FB[journey.level] || '#e8a547',
              boxShadow: `0 0 4px ${NIVEL_COR_FB[journey.level] || '#e8a547'}66`
            }} />
            {NIVEL_LABEL[journey.level] || journey.level}
          </span>
        </div>

        <h2 style={{
          fontFamily: 'var(--gaia-font-display)',
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 700,
          color: 'var(--gaia-text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          margin: '0 0 14px 0'
        }}>
          {label}
        </h2>

        {desc && (
          <p style={{
            fontSize: 15,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            lineHeight: 1.65,
            maxWidth: '65ch',
            margin: 0
          }}>
            {desc}
          </p>
        )}

        <div style={{
          width: 60,
          height: 1,
          background: 'linear-gradient(90deg, var(--gaia-accent), transparent)',
          marginTop: 20
        }} />
      </div>

      {cargando ? (
        <div style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          {t(idioma, 'arquivoCargandoPasos')}
        </div>
      ) : stops.length === 0 ? (
        <div style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          padding: '20px 0'
        }}>
          {t(idioma, 'arquivoSenPasos')}
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--gaia-text-tertiary)',
            marginBottom: 16,
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            {stops.length === 1 ? t(idioma, 'arquivoPercorrido1') : t(idioma, 'arquivoPercorridoN', stops.length)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stops.map((stop, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 30, height: 30,
                  flexShrink: 0,
                  border: '1px solid var(--gaia-accent-border)',
                  background: 'var(--gaia-accent-bg)',
                  borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-accent)',
                  fontWeight: 700
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: 'var(--gaia-cosmos-800)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: '2px solid var(--gaia-accent)',
                  borderRadius: 6
                }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 500,
                    color: 'var(--gaia-text-primary)',
                    letterSpacing: '0.01em'
                  }}>
                    {stop.nodo?.[`label_${idioma}`] || stop.nodo?.label_gl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stops.length > 0 && (
        <button
          onClick={onAbrir}
          style={{
            marginTop: 36,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            background: 'var(--gaia-accent-bg)',
            border: '1px solid var(--gaia-accent-border)',
            color: 'var(--gaia-accent)',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gaia-accent)'
            e.currentTarget.style.color = 'var(--gaia-cosmos-900)'
            e.currentTarget.style.boxShadow = `0 0 20px ${ACCENT_GLOW}`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--gaia-accent-bg)'
            e.currentTarget.style.color = 'var(--gaia-accent)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t(idioma, 'arquivoIniciarRuta')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ArbolInstitucional