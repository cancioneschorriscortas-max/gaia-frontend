import { useState, useRef, useEffect } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// BottomSheet — Panel inferior deslizante (móbil)
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: nodoId, idioma, nivel, onCambiarNivel,
// onVolver, onExplorar, seleccionarNodo.
// Lóxica INTACTA: carga de nodo + relacións, alturas partial/full,
// drag vertical, permiso por nivel, selector profesor.
//
// MELLORAS:
//   1. Paleta v1.1 completa. Cores semánticas por tipo de nodo e
//      por nivel (primary verde / secondary azul / expert lavanda).
//   2. Emojis (🔒, 🎯, ✍, ✕) → SVGs.
//   3. Drag handle máis grande e accesible (área táctil 36x16 no
//      orixinal, agora 48x24 con padding).
//   4. Tabs con dots indicadores de "ten contido / está baleiro".
//   5. Meta-row Autor + Centro (clave AMTEGA) visible en cabeceira.
//   6. Nivel bloqueado con SVG candado e mensaxe clara.
//   7. Tipografía coherente (Fraunces título, Atkinson corpo,
//      JetBrains Mono etiquetas).
// ═══════════════════════════════════════════════════════════


// ── INICIO: cor_tipo_nodo ────────────────────────────
const COR_TIPO = {
  origin:        'var(--gaia-text-primary)',
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}
const COR_TIPO_FB = {
  origin:        '#f5f7ff',
  galaxy:        '#ffd966',
  constellation: '#5dd4a8',
  system:        '#7dd3fc',
  concept:       '#9bb3ff',
  process:       '#ff9fb8'
}
// ── FIN: cor_tipo_nodo ───────────────────────────────

// ── INICIO: cor_nivel ────────────────────────────────
const COR_NIVEL = {
  primary:   { main: 'var(--gaia-constellation)', fb: '#5dd4a8', bg: 'var(--gaia-constellation-bg)', border: 'var(--gaia-constellation-border)' },
  secondary: { main: 'var(--gaia-system)',        fb: '#7dd3fc', bg: 'var(--gaia-system-bg)',        border: 'var(--gaia-system-border)' },
  expert:    { main: 'var(--gaia-concept)',       fb: '#9bb3ff', bg: 'var(--gaia-concept-bg)',       border: 'var(--gaia-concept-border)' }
}
// ── FIN: cor_nivel ───────────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6"  y1="6" x2="18" y2="18" />
  </svg>
)
const IconoCandado = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconoDiana = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IconoUsuario = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconoCentro = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21V13h6v8" />
  </svg>
)
const IconoFlechaDer = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function BottomSheet({ nodoId, idioma = 'gl', nivel = 'primary', onCambiarNivel, onVolver, onExplorar, seleccionarNodo }) {

  const { esProfesor } = useUser()

  const [nodo,      setNodo]      = useState(null)
  const [relacions, setRelacions] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [altura,    setAltura]    = useState('partial')
  const [seccion,   setSeccion]   = useState('contido')

  const sheetRef        = useRef(null)
  const dragStartY      = useRef(null)
  const dragStartAltura = useRef(null)

  // ── INICIO: carga_datos ──────────────────────────────
  useEffect(() => {
    if (!nodoId) return
    setCargando(true)
    setAltura('partial')
    setSeccion('contido')
    Promise.all([
      fetch(`${API}/nodo/${nodoId}`).then(r => r.json()),
      fetch(`${API}/nodo/${nodoId}/relacions`).then(r => r.json())
    ]).then(([nodoData, relData]) => {
      setNodo(nodoData)
      setRelacions(relData.relacions || [])
      setCargando(false)
    })
  }, [nodoId])
  // ── FIN: carga_datos ─────────────────────────────────

  // ── INICIO: drag_handle ──────────────────────────────
  const handleTouchStart = (e) => {
    dragStartY.current      = e.touches[0].clientY
    dragStartAltura.current = altura
  }

  const handleTouchEnd = (e) => {
    if (dragStartY.current === null) return
    const dy = e.changedTouches[0].clientY - dragStartY.current
    if (dy < -40) setAltura('full')
    else if (dy > 40) {
      if (altura === 'full') setAltura('partial')
      else onVolver()
    }
    dragStartY.current = null
  }
  // ── FIN: drag_handle ─────────────────────────────────

  const alturaCSS = altura === 'full' ? '92vh' : '56vh'
  const titulo    = nodo?.labels?.[idioma] || nodo?.labels?.gl || ''
  const texto     = (n) => nodo?.content?.[n]?.[idioma] || nodo?.content?.[n]?.gl || ''
  const reto      = (n) => nodo?.retos?.[n]?.[idioma]   || nodo?.retos?.[n]?.gl   || ''
  const podeVer   = (n) => {
    if (nivel === 'primary')   return n === 'primary'
    if (nivel === 'secondary') return n === 'primary' || n === 'secondary'
    return true
  }

  // ── INICIO: helpers_hai_contido_por_seccion ──────────
  // Para os dots indicadores nos tabs
  const haiContido   = ['primary', 'secondary', 'expert'].some(n => texto(n))
  const haiRetos     = ['primary', 'secondary', 'expert'].some(n => reto(n))
  const haiRelacions = relacions.length > 0
  // ── FIN: helpers_hai_contido_por_seccion ─────────────

  const corTipo    = nodo ? (COR_TIPO[nodo.type] || 'var(--gaia-text-primary)') : 'var(--gaia-text-primary)'
  const corTipoFB  = nodo ? (COR_TIPO_FB[nodo.type] || '#f5f7ff')               : '#f5f7ff'

  return (
    <>
      <style>{`
        @keyframes bsheetFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bsheetSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

      {/* ═══ BACKDROP ═══ */}
      <div
        onClick={onVolver}
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: 'rgba(3, 6, 15, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'bsheetFadeIn 200ms ease forwards'
        }}
      />

      {/* ═══ SHEET ═══ */}
      <div ref={sheetRef} style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: alturaCSS,
        zIndex: 40,
        background: 'var(--gaia-cosmos-900)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--gaia-cosmos-400)',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.7)',
        fontFamily: 'var(--gaia-font-body)',
        color: 'var(--gaia-text-primary)',
        animation: 'bsheetSlideUp 320ms cubic-bezier(0.32, 0.72, 0, 1)'
      }}>

        {/* ═══ DRAG HANDLE + CABECEIRA ═══ */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            padding: '10px 0 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            cursor: 'grab',
            touchAction: 'none'
          }}>
          {/* Drag handle — área táctil ampliada para accesibilidade */}
          <div style={{
            padding: '4px 0',
            width: 48,
            display: 'grid',
            placeItems: 'center'
          }}>
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: 'var(--gaia-cosmos-400)'
            }} />
          </div>

          {!cargando && nodo && (
            <div style={{
              width: '100%',
              padding: '0 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 10
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Tipo en mono sobre o título */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: corTipo,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 4
                }}>
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: corTipoFB,
                    boxShadow: `0 0 6px ${corTipoFB}`
                  }} />
                  {nodo.type}
                </div>

                {/* Título */}
                <h2 style={{
                  color: 'var(--gaia-text-primary)',
                  margin: 0,
                  fontSize: 20,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {titulo}
                </h2>

                {/* Meta: Autor + Centro (AMTEGA) */}
                {(nodo.autor || nodo.centro) && (
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 6,
                    flexWrap: 'wrap'
                  }}>
                    {nodo.autor && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)'
                      }}>
                        <IconoUsuario />
                        <span>{nodo.autor}</span>
                      </div>
                    )}
                    {nodo.centro && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)'
                      }}>
                        <IconoCentro />
                        <span>{nodo.centro}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={onVolver}
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
                  flexShrink: 0,
                  WebkitTapHighlightColor: 'transparent'
                }}>
                <IconoX />
              </button>
            </div>
          )}
        </div>

        {cargando ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gaia-accent)',
            fontSize: 13,
            fontFamily: 'var(--gaia-font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Cargando...
          </div>
        ) : nodo && (
          <>
            {/* ═══ BOTÓN EXPLORAR ═══ */}
            <div style={{ padding: '8px 20px 10px', flexShrink: 0 }}>
              <button
                onClick={onExplorar}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--gaia-accent-bg)',
                  border: '1px solid var(--gaia-accent-border)',
                  color: 'var(--gaia-accent)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  letterSpacing: '0.02em',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 150ms ease'
                }}
                onTouchStart={e => e.currentTarget.style.background = 'rgba(232, 165, 71, 0.25)'}
                onTouchEnd={e => e.currentTarget.style.background = 'var(--gaia-accent-bg)'}>
                Explorar en detalle
                <IconoFlechaDer size={14} />
              </button>
            </div>

            {/* ═══ TABS con dots de contido ═══ */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--gaia-cosmos-400)',
              flexShrink: 0,
              padding: '0 8px'
            }}>
              {[
                { id: 'contido',   label: 'Contido',   cor: 'var(--gaia-constellation)', fb: '#5dd4a8', ten: haiContido },
                { id: 'retos',     label: 'Retos',     cor: 'var(--gaia-concept)',       fb: '#9bb3ff', ten: haiRetos },
                { id: 'relacions', label: 'Relacións', cor: 'var(--gaia-accent)',        fb: '#e8a547', ten: haiRelacions }
              ].map(s => {
                const activo = seccion === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeccion(s.id)}
                    style={{
                      flex: 1,
                      padding: '12px 4px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activo ? `2px solid ${s.fb}` : '2px solid transparent',
                      color: activo ? s.cor : s.ten ? 'var(--gaia-text-tertiary)' : 'var(--gaia-text-disabled)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: activo ? 700 : 500,
                      marginBottom: '-1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      WebkitTapHighlightColor: 'transparent',
                      letterSpacing: '0.02em',
                      transition: 'all 150ms ease'
                    }}>
                    {s.label}
                    {s.ten && (
                      <span style={{
                        width: 5, height: 5,
                        borderRadius: '50%',
                        background: s.fb,
                        boxShadow: activo ? `0 0 6px ${s.fb}` : 'none'
                      }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ═══ SELECTOR DE NIVEL (só profesores) ═══ */}
            {esProfesor && (
              <div style={{
                display: 'flex',
                gap: 6,
                padding: '10px 20px 0',
                flexShrink: 0
              }}>
                {['primary', 'secondary', 'expert'].map(n => {
                  const activo = nivel === n
                  const c = COR_NIVEL[n]
                  return (
                    <button
                      key={n}
                      onClick={() => onCambiarNivel && onCambiarNivel(n)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: activo ? 700 : 500,
                        background: activo ? c.fb : 'var(--gaia-cosmos-800)',
                        color: activo ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
                        border: `1px solid ${activo ? c.fb : 'var(--gaia-cosmos-400)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        letterSpacing: '0.02em',
                        transition: 'all 150ms ease'
                      }}>
                      {n === 'primary'   ? t(idioma, 'primaria')
                      : n === 'secondary' ? t(idioma, 'secundaria')
                      : t(idioma, 'experto')}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ═══ CONTIDO SCROLL ═══ */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px 100px',
              WebkitOverflowScrolling: 'touch'
            }}>

              {/* ── SECCIÓN: CONTIDO ── */}
              {seccion === 'contido' && (
                <>
                  {['primary', 'secondary', 'expert'].map(n => {
                    const c = COR_NIVEL[n]
                    const labelN = n === 'primary'
                      ? t(idioma, 'nivelPrimaria')
                      : n === 'secondary'
                        ? t(idioma, 'nivelSecundaria')
                        : t(idioma, 'nivelExperto')

                    if (!podeVer(n)) return (
                      <div key={n} style={{
                        padding: '12px 14px',
                        marginBottom: 10,
                        background: 'var(--gaia-cosmos-800)',
                        borderRadius: 10,
                        border: '1px solid var(--gaia-cosmos-400)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        opacity: 0.55
                      }}>
                        <span style={{ color: 'var(--gaia-text-tertiary)', display: 'grid', placeItems: 'center' }}>
                          <IconoCandado />
                        </span>
                        <span style={{
                          fontSize: 12,
                          fontFamily: 'var(--gaia-font-body)',
                          color: 'var(--gaia-text-tertiary)'
                        }}>
                          {labelN} — nivel bloqueado
                        </span>
                      </div>
                    )

                    const tx = texto(n)
                    if (!tx) return null

                    return (
                      <div key={n} style={{
                        marginBottom: 12,
                        padding: '14px 16px',
                        background: c.bg,
                        borderRadius: 12,
                        borderLeft: `3px solid ${c.fb}`,
                        border: `1px solid ${c.border}`
                      }}>
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: c.main,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          marginBottom: 8
                        }}>
                          {labelN}
                        </div>
                        <p style={{
                          color: 'var(--gaia-text-primary)',
                          fontSize: 14,
                          fontFamily: 'var(--gaia-font-body)',
                          lineHeight: 1.7,
                          margin: 0
                        }}>
                          {tx}
                        </p>
                      </div>
                    )
                  })}
                  {!haiContido && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: 'var(--gaia-text-tertiary)',
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      fontStyle: 'italic'
                    }}>
                      Este nodo non ten contido aínda.
                    </div>
                  )}
                </>
              )}

              {/* ── SECCIÓN: RETOS ── */}
              {seccion === 'retos' && (
                <>
                  {['primary', 'secondary', 'expert'].map(n => {
                    if (!podeVer(n)) return null
                    const r = reto(n)
                    if (!r) return null
                    const c = COR_NIVEL[n]
                    return (
                      <div key={n} style={{
                        marginBottom: 12,
                        padding: '14px 16px',
                        background: 'var(--gaia-cosmos-800)',
                        borderRadius: 12,
                        borderLeft: `3px solid ${c.fb}`,
                        border: '1px solid var(--gaia-cosmos-400)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 10,
                          gap: 10
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 10,
                            fontFamily: 'var(--gaia-font-mono)',
                            color: c.main,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 700
                          }}>
                            <IconoDiana />
                            {n}
                          </div>
                          {nodo.reto_puntos && (
                            <span style={{
                              fontSize: 11,
                              fontFamily: 'var(--gaia-font-mono)',
                              color: 'var(--gaia-accent)',
                              background: 'var(--gaia-accent-bg)',
                              padding: '3px 9px',
                              borderRadius: 9999,
                              border: '1px solid var(--gaia-accent-border)',
                              fontWeight: 700,
                              letterSpacing: '0.02em'
                            }}>
                              +{nodo.reto_puntos} pts
                            </span>
                          )}
                        </div>
                        <p style={{
                          color: 'var(--gaia-text-primary)',
                          fontSize: 14,
                          fontFamily: 'var(--gaia-font-body)',
                          lineHeight: 1.65,
                          margin: 0
                        }}>
                          {r}
                        </p>
                      </div>
                    )
                  })}
                  {!haiRetos && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: 'var(--gaia-text-tertiary)',
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      fontStyle: 'italic'
                    }}>
                      Este nodo non ten retos aínda.
                    </div>
                  )}
                </>
              )}

              {/* ── SECCIÓN: RELACIÓNS ── */}
              {seccion === 'relacions' && (
                relacions.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--gaia-text-tertiary)',
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontStyle: 'italic'
                  }}>
                    Sen relacións
                  </div>
                ) : (
                  relacions.slice(0, 12).map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => rel.existe && seleccionarNodo(rel.id)}
                      style={{
                        padding: '12px 14px',
                        marginBottom: 8,
                        background: 'var(--gaia-cosmos-800)',
                        border: '1px solid var(--gaia-cosmos-400)',
                        borderLeft: '3px solid var(--gaia-accent)',
                        borderRadius: 10,
                        cursor: rel.existe ? 'pointer' : 'default',
                        opacity: rel.existe ? 1 : 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'background 150ms ease'
                      }}
                      onTouchStart={e => { if (rel.existe) e.currentTarget.style.background = 'var(--gaia-cosmos-700)' }}
                      onTouchEnd={e => { e.currentTarget.style.background = 'var(--gaia-cosmos-800)' }}>
                      <div style={{
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-mono)',
                        color: 'var(--gaia-text-tertiary)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}>
                        {rel.direccion === 'in' ? '← ' : '→ '}
                        {rel.direccion === 'in'
                          ? (rel.nome?.[`${idioma}_inv`] || rel.nome?.gl_inv || rel.tipo)
                          : (rel.nome?.[idioma] || rel.nome?.gl || rel.tipo)}
                      </div>
                      <div style={{
                        fontSize: 14,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-primary)',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {rel.label}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default BottomSheet