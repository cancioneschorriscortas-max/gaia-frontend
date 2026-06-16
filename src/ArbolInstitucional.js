import { useState, useEffect } from 'react'
import PercorridoRuta from './PercorridoRuta'
import { API } from './config/api';

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

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    fetch(`${API}/journeys`)
      .then(r => r.json())
      .then(d => {
        setJourneys(d.journeys || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const modulos = journeys.reduce((acc, j) => {
    const mod = j.modulo || 'Xeral'
    if (!acc[mod]) acc[mod] = { rutas: [] }
    acc[mod].rutas.push(j)
    return acc
  }, {})

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
      overflow: 'hidden'
    }}>

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
        padding: '22px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 20,
        borderBottom: '1px solid var(--gaia-accent-border)',
        background: 'rgba(10, 16, 32, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        {/* Metadata esquerda */}
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--gaia-text-tertiary)',
          lineHeight: 1.8,
          textTransform: 'uppercase'
        }}>
          <div>Versión <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>0.7</span></div>
          <div>Ámbito <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>Educativo</span></div>
          <div>Módulos <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>{Object.keys(modulos).length} activos</span></div>
        </div>

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
            Arquivo GAIA
          </div>
          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'var(--gaia-text-tertiary)',
            marginTop: 8,
            textTransform: 'uppercase'
          }}>
            Plataforma para a preservación do coñecemento
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

        {/* Metadata dereita */}
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
            Estado {' '}
            <span style={{
              color: 'var(--gaia-success)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              Operativo
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--gaia-success)',
                boxShadow: '0 0 6px var(--gaia-success)',
                animation: 'arbolBlink 1.8s step-end infinite'
              }} />
            </span>
          </div>
          <div>Xunta de Galicia · 2026</div>
          <div>Acceso institucional</div>
        </div>
      </div>

      {/* ═══ CONTIDO PRINCIPAL ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex',
        height: 'calc(100vh - 120px)',
        overflow: 'hidden'
      }}>

        {/* ───── PANEL ESQUERDO: MÓDULOS ───── */}
        <div style={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid var(--gaia-cosmos-400)',
          padding: '28px 18px',
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
            Módulos de coñecemento
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
              Cargando...
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
              Sen rutas creadas aínda.
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginTop: 10,
                color: 'var(--gaia-text-disabled)',
                letterSpacing: '0.05em'
              }}>
                Crea rutas dende o editor e asígnalles un módulo.
              </div>
            </div>
          )}

          {Object.entries(modulos).map(([mod, data]) => (
            <div key={mod} style={{ marginBottom: 6 }}>
              <div
                onClick={() => seleccionarModulo(mod)}
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
                    {data.rutas.length} {data.rutas.length === 1 ? 'ruta' : 'rutas'}
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
                      onClick={() => seleccionarRuta(j)}
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
                        {j.level === 'primary' ? 'Primaria' : j.level === 'secondary' ? 'Secundaria' : 'Experto'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ───── PANEL DEREITO: DETALLE RUTA ───── */}
        <div style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
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
                Selecciona un módulo e unha ruta
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
      </div>

      {/* ═══ BARRA INFERIOR INSTITUCIONAL ═══ */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3,
        padding: '14px 32px',
        background: 'rgba(10, 16, 32, 0.85)',
        borderTop: '1px solid var(--gaia-accent-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'var(--gaia-text-disabled)',
          textTransform: 'uppercase'
        }}>
          Arquivo GAIA · Preservación e transmisión do coñecemento
        </div>

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
          Volver a GAIA
        </button>

        <div style={{
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'var(--gaia-text-disabled)',
          textTransform: 'uppercase'
        }}>
          Xunta de Galicia · Consellería de educación · 2026
        </div>
      </div>

      {/* ═══ PERCORRIDO GUIADO ═══ */}
      {percorridoActivo && (
        <PercorridoRuta
          journeyId={percorridoActivo}
          idioma={idioma}
          onPechar={() => setPercorridoActivo(null)}
        />
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
    setCargando(true)
    fetch(`${API}/journeys/${journey.id}`)
      .then(r => r.json())
      .then(d => {
        setStops(d.stops || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [journey.id])

  const label = journey.label?.[idioma] || journey.label?.gl || ''
  const desc = journey.description?.[idioma] || journey.description?.gl || ''

  const NIVEL_LABEL = {
    primary: 'Primaria',
    secondary: 'Secundaria',
    expert: 'Experto'
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
          <span>{journey.modulo || 'Xeral'}</span>
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
          Cargando pasos...
        </div>
      ) : stops.length === 0 ? (
        <div style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          padding: '20px 0'
        }}>
          Esta ruta non ten pasos definidos aínda.
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
            Percorrido · {stops.length} {stops.length === 1 ? 'paso' : 'pasos'}
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
          Iniciar ruta
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