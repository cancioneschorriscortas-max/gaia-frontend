import { useState, useEffect } from 'react'
import RetoInteractivo from './RetoInteractivo'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// PercorridoRuta — Pantalla completa para percorrer unha ruta
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// Tres fases:
//   1. cargando     → spinner mentres descarga ruta e primeiro nodo
//   2. percorrido   → un nodo por paso, con reto opcional
//   3. fin          → ruta completada, resumo + opción de repetir
//
// API pública INTACTA: journeyId, idioma, onPechar.
//
// BUGS ARRANXADOS:
//   1. mostrarReto (nome enganoso) → mostrarMais (o estado é para
//      texto secundario despregable, NON para o reto).
//   2. Ao cambiar de paso, mostrarMais reseta a false para cada
//      paso novo (antes persistía aberto cando cambiabas).
//   3. Barra de progreso tiña lóxica redundante (i<indice ? GOLD
//      : i===indice ? GOLD : ...) — simplificada.
//
// MELLORAS:
//   1. authHeaders() nos 2 fetches (defensivo).
//   2. Cores semánticas por nivel (primary/secondary/expert)
//      coherentes co VisorNodo.
//   3. Número do paso en círculo ámbar estilo GAIA.
//   4. Indicador de progreso máis claro: "Paso 3 / 8".
//   5. Emojis (🏆🏁🔄◌) → SVGs.
//   6. Fin con tarxeta resumo máis polida.
// ═══════════════════════════════════════════════════════════


// ── INICIO: iconos_svg ───────────────────────────────
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoTrofeo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.15 18.75 13 20.24 13 22" />
    <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.85 18.75 11 20.24 11 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)
const IconoBandeira = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)
const IconoFlechaEsq = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)
const IconoFlechaDer = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoRepetir = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
)
const IconoChevronAbaixo = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconoSpinner = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'percorridoSpin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function PercorridoRuta({ journeyId, idioma = 'gl', onPechar, pasoInicial = null }) {

  const { authHeaders, rexistrarXP } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [ruta, setRuta]               = useState(null)
  const [stops, setStops]             = useState([])
  const [nodos, setNodos]             = useState({}) // cache
  const [indice, setIndice]           = useState(0)
  const [fase, setFase]               = useState('cargando')
  const [visible, setVisible]         = useState(false)
  const [mostrarMais, setMostrarMais] = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: cargar_nodo ──────────────────────────────
  const cargarNodo = async (id) => {
    if (nodos[id]) return
    try {
      const res = await fetch(`${API}/nodo/${id}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setNodos(prev => ({ ...prev, [id]: data }))
    } catch (e) {
      console.error('[PercorridoRuta] Erro cargando nodo:', e)
    }
  }
  // ── FIN: cargar_nodo ─────────────────────────────────

  // ── INICIO: carga_inicial ────────────────────────────
  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    fetch(`${API}/journeys/${journeyId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(async data => {
        setRuta(data)
        const stopsValidos = (data.stops || []).filter(s => s && s.nodo)
        setStops(stopsValidos)
        if (stopsValidos.length > 0) {
          await cargarNodo(stopsValidos[0].nodo.id)
        }
        setFase('percorrido')
      })
      .catch(e => {
        console.error('[PercorridoRuta] Erro cargando ruta:', e)
        setFase('percorrido')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])
  // ── FIN: carga_inicial ───────────────────────────────


// ── INICIO: progreso_persistente ─────────────────────
  // Restaura o punto onde quedou o usuario e garda cada avance.
  // Se chega pasoInicial (desde a Senda), mándase ese e non se restaura.
  const [xaCompletada, setXaCompletada] = useState(false)

  const gardarProgreso = (novoIndice, completada = false) => {
    fetch(`${API}/journeys/${journeyId}/progreso`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ indice: novoIndice, completada })
    }).catch(e => console.warn('[PercorridoRuta] Non se gardou o progreso:', e.message))
  }

  useEffect(() => {
    if (stops.length === 0) return
    fetch(`${API}/journeys/${journeyId}/progreso`, { headers: authHeaders() })
      .then(r => r.json())
      .then(async p => {
        setXaCompletada(p.completada === true)
        const destino = pasoInicial != null
          ? Math.min(Math.max(0, pasoInicial), stops.length - 1)
          : Math.min(p.indice || 0, stops.length - 1)
        if (destino > 0 || pasoInicial != null) {
          await cargarNodo(stops[destino].nodo.id)
          setIndice(destino)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops])
  // ── FIN: progreso_persistente ────────────────────────

  // ── INICIO: pechar ───────────────────────────────────
  const pechar = () => {
    setVisible(false)
    setTimeout(() => onPechar(), 300)
  }
  // ── FIN: pechar ──────────────────────────────────────

// ── INICIO: ir_a ─────────────────────────────────────
 // ── INICIO: ir_a ─────────────────────────────────────
  const irA = async (novoIndice) => {
    setMostrarMais(false) // BUG ARRANXADO: reseta ao cambiar de paso
    if (novoIndice >= stops.length) {
      gardarProgreso(stops.length - 1, true)   // ruta completada
      if (!xaCompletada) {                      // premio só a primeira vez
        rexistrarXP('RUTA_COMPLETADA')
        setXaCompletada(true)
      }
      setFase('fin')
      return
    }
    const stop = stops[novoIndice]
    await cargarNodo(stop.nodo.id)
    setIndice(novoIndice)
    gardarProgreso(novoIndice)                  // garda o avance (o backend só sobe)
  }
  // ── FIN: ir_a ────────────────────────────────────────
  // ── FIN: ir_a ────────────────────────────────────────

  // ── INICIO: repetir ──────────────────────────────────
  const repetir = async () => {
    setMostrarMais(false)
    setIndice(0)
    if (stops.length > 0) {
      await cargarNodo(stops[0].nodo.id)
    }
    setFase('percorrido')
  }
  // ── FIN: repetir ─────────────────────────────────────

  // ── INICIO: derivados ────────────────────────────────
  const stopActual       = stops[indice]
  const nodoActual       = stopActual ? nodos[stopActual.nodo.id] : null
  const titulo           = nodoActual?.labels?.[idioma] || nodoActual?.labels?.gl || stopActual?.nodo?.label_gl || ''
  const texto            = nodoActual?.content?.primary?.[idioma]   || nodoActual?.content?.primary?.gl   || ''
  const textoSecundario  = nodoActual?.content?.secondary?.[idioma] || nodoActual?.content?.secondary?.gl || ''
  const reto             = nodoActual?.retos?.primary?.[idioma]     || nodoActual?.retos?.primary?.gl     || ''
  const rutaLabel        = ruta?.label?.[idioma] || ruta?.label?.gl || ''
  const eUltimoPaso      = indice + 1 >= stops.length
  // ── FIN: derivados ───────────────────────────────────

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 300ms ease'
    }}>

      <style>{`
        @keyframes percorridoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ═══ FONDO CÓSMICO ═══ */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(ellipse at 25% 15%, rgba(232, 165, 71, 0.05) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 85%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 12% 20%, rgba(232, 165, 71, 0.2), transparent),
          radial-gradient(1px 1px at 80% 75%, rgba(93, 212, 168, 0.2), transparent),
          radial-gradient(1px 1px at 45% 40%, rgba(155, 179, 255, 0.2), transparent),
          radial-gradient(1px 1px at 88% 25%, rgba(125, 211, 252, 0.2), transparent)
        `,
        opacity: 0.4,
        pointerEvents: 'none'
      }} />

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '14px 24px',
        background: 'rgba(10, 16, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: fase === 'percorrido' ? 12 : 0,
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 4
            }}>
              Percorrido
            </div>
            <div style={{
              fontSize: 15,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 700,
              color: 'var(--gaia-accent)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {rutaLabel}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {fase === 'percorrido' && stops.length > 0 && (
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.05em'
              }}>
                Paso <span style={{ color: 'var(--gaia-accent)', fontWeight: 700 }}>{indice + 1}</span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}> / {stops.length}</span>
              </div>
            )}
            <button
              onClick={pechar}
              aria-label="Pechar percorrido"
              style={{
                background: 'transparent',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                borderRadius: '50%',
                width: 32, height: 32,
                cursor: 'pointer',
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
          </div>
        </div>

        {/* Barra de progreso */}
        {fase === 'percorrido' && stops.length > 0 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {stops.map((_, i) => {
              const completado = i < indice
              const actual     = i === indice
              const cor        = completado || actual ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-500)'
              const opacity    = actual ? 1 : completado ? 0.7 : 0.4
              return (
                <div key={i} style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: cor,
                  opacity,
                  boxShadow: actual ? '0 0 8px rgba(232, 165, 71, 0.5)' : 'none',
                  transition: 'all 300ms ease'
                }} />
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ CONTIDO ═══ */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        overflowY: 'auto',
        padding: '36px 24px',
        maxWidth: 780,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>

        {/* ─── FASE: CARGANDO ─── */}
        {fase === 'cargando' && (
          <div style={{
            textAlign: 'center',
            marginTop: '18vh',
            color: 'var(--gaia-text-tertiary)'
          }}>
            <div style={{
              display: 'inline-block',
              color: 'var(--gaia-accent)',
              marginBottom: 16
            }}>
              <IconoSpinner size={28} />
            </div>
            <div style={{
              fontSize: 13,
              fontFamily: 'var(--gaia-font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500
            }}>
              Cargando ruta...
            </div>
          </div>
        )}

        {/* ─── FASE: PERCORRIDO ─── */}
        {fase === 'percorrido' && stopActual && (
          <div>

            {/* Número e título */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 28
            }}>
              <div style={{
                width: 50, height: 50,
                flexShrink: 0,
                background: 'var(--gaia-accent-bg)',
                border: '1px solid var(--gaia-accent-border)',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 14,
                fontFamily: 'var(--gaia-font-mono)',
                fontWeight: 700,
                color: 'var(--gaia-accent)',
                letterSpacing: '0.025em',
                boxShadow: '0 0 16px rgba(232, 165, 71, 0.25)'
              }}>
                {String(indice + 1).padStart(2, '0')}
              </div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 700,
                color: 'var(--gaia-accent)',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                minWidth: 0,
                flex: 1
              }}>
                {titulo}
              </h1>
            </div>

            {/* Texto primary — capa base */}
            {texto ? (
              <div style={{
                padding: '18px 22px',
                marginBottom: 16,
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderLeft: '3px solid var(--gaia-constellation)',
                borderRadius: 12
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-constellation)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: 'var(--gaia-constellation)',
                    boxShadow: '0 0 6px var(--gaia-constellation)'
                  }} />
                  Primaria
                </div>
                <p style={{
                  fontSize: 16,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {texto}
                </p>
              </div>
            ) : (
              <div style={{
                padding: '16px 20px',
                marginBottom: 16,
                background: 'var(--gaia-cosmos-800)',
                border: '1px dashed var(--gaia-cosmos-400)',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontStyle: 'italic',
                color: 'var(--gaia-text-tertiary)'
              }}>
                Sen contido primario dispoñible para este nodo.
              </div>
            )}

            {/* Texto secondary — despregable */}
            {textoSecundario && (
              <div style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setMostrarMais(prev => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: mostrarMais ? 'var(--gaia-system-bg)' : 'var(--gaia-cosmos-800)',
                    border: `1px solid ${mostrarMais ? 'var(--gaia-system-border)' : 'var(--gaia-cosmos-400)'}`,
                    color: mostrarMais ? 'var(--gaia-system)' : 'var(--gaia-text-secondary)',
                    borderRadius: 8,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    transition: 'all 150ms ease'
                  }}>
                  <span style={{
                    display: 'inline-block',
                    transform: mostrarMais ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                    marginTop: 1
                  }}>
                    <IconoChevronAbaixo />
                  </span>
                  {mostrarMais ? 'Ocultar máis información' : 'Ver máis información'}
                </button>
                {mostrarMais && (
                  <div style={{
                    marginTop: 10,
                    padding: '16px 20px',
                    background: 'var(--gaia-cosmos-800)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderLeft: '3px solid var(--gaia-system)',
                    borderRadius: 12,
                    animation: 'percorridoFadeIn 200ms ease'
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: 'var(--gaia-system)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: 'var(--gaia-system)',
                        boxShadow: '0 0 6px var(--gaia-system)'
                      }} />
                      Secundaria
                    </div>
                    <p style={{
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-text-primary)',
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                      {textoSecundario}
                    </p>
                  </div>
                )}
                <style>{`
                  @keyframes percorridoFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>
            )}

            {/* Separador antes do reto */}
            {reto && (
              <div style={{
                height: 1,
                background: 'var(--gaia-cosmos-400)',
                marginBottom: 20,
                marginTop: 8
              }} />
            )}

            {/* Reto */}
            {reto && (
              <RetoInteractivo
                nodoId={stopActual.nodo.id}
                nodoLabel={titulo}
                pregunta={reto}
                nivel="primary"
                idioma={idioma}
                puntosTotais={20}
              />
            )}

            {/* Navegación */}
            <div style={{
              display: 'flex',
              gap: 10,
              marginTop: 36,
              flexWrap: 'wrap'
            }}>
              {indice > 0 && (
                <button
                  onClick={() => irA(indice - 1)}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '13px 18px',
                    background: 'var(--gaia-cosmos-800)',
                    color: 'var(--gaia-text-secondary)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                    e.currentTarget.style.color = 'var(--gaia-text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
                    e.currentTarget.style.color = 'var(--gaia-text-secondary)'
                  }}>
                  <IconoFlechaEsq />
                  Anterior
                </button>
              )}
              <button
                onClick={() => irA(indice + 1)}
                style={{
                  flex: 2,
                  minWidth: 180,
                  padding: '13px 20px',
                  background: eUltimoPaso ? 'var(--gaia-accent)' : 'var(--gaia-accent-bg)',
                  color: eUltimoPaso ? 'var(--gaia-cosmos-900)' : 'var(--gaia-accent)',
                  border: `1px solid ${eUltimoPaso ? 'var(--gaia-accent)' : 'var(--gaia-accent-border)'}`,
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: eUltimoPaso ? '0 0 24px rgba(232, 165, 71, 0.4)' : 'none',
                  transition: 'all 150ms ease'
                }}>
                {eUltimoPaso
                  ? <><IconoBandeira /> Rematar ruta</>
                  : <>Seguinte <IconoFlechaDer /></>
                }
              </button>
            </div>
          </div>
        )}

        {/* ─── FASE: FIN ─── */}
        {fase === 'fin' && (
          <div style={{ textAlign: 'center', marginTop: '8vh' }}>

            {/* Trofeo */}
            <div style={{
              display: 'inline-flex',
              width: 88, height: 88,
              borderRadius: '50%',
              background: 'var(--gaia-accent-bg)',
              border: '1px solid var(--gaia-accent-border)',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gaia-accent)',
              marginBottom: 20,
              boxShadow: '0 0 40px rgba(232, 165, 71, 0.3)'
            }}>
              <IconoTrofeo size={44} />
            </div>

            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 10
            }}>
              Ruta completada
            </div>

            <h2 style={{
              fontFamily: 'var(--gaia-font-display)',
              fontSize: 'clamp(26px, 3vw, 32px)',
              color: 'var(--gaia-accent)',
              margin: '0 0 10px 0',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              Parabéns!
            </h2>
            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              margin: '0 0 36px 0',
              lineHeight: 1.5
            }}>
              Completaches os <strong style={{ color: 'var(--gaia-text-primary)' }}>{stops.length} pasos</strong> de{' '}
              <em style={{ color: 'var(--gaia-accent)', fontStyle: 'normal', fontWeight: 600 }}>
                "{rutaLabel}"
              </em>
            </p>

            {/* Resumo pasos */}
            <div style={{
              textAlign: 'left',
              maxWidth: 460,
              margin: '0 auto 36px',
              padding: 20,
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 12
              }}>
                Percorrido
              </div>
              {stops.map((s, i) => {
                const labelNodo = nodos[s.nodo.id]?.labels?.[idioma] || nodos[s.nodo.id]?.labels?.gl || s.nodo.label_gl
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 0',
                    borderBottom: i < stops.length - 1 ? '1px solid var(--gaia-cosmos-400)' : 'none'
                  }}>
                    <div style={{
                      width: 22, height: 22,
                      borderRadius: '50%',
                      background: 'var(--gaia-success-bg)',
                      border: '1px solid var(--gaia-success-border)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--gaia-success)',
                      flexShrink: 0
                    }}>
                      <IconoCheck size={10} />
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-text-primary)',
                      flex: 1
                    }}>
                      {labelNodo}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      color: 'var(--gaia-text-tertiary)',
                      letterSpacing: '0.025em'
                    }}>
                      {String(s.order).padStart(2, '0')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Botóns */}
            <div style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={repetir}
                style={{
                  padding: '12px 22px',
                  background: 'var(--gaia-cosmos-800)',
                  color: 'var(--gaia-text-secondary)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  e.currentTarget.style.color = 'var(--gaia-text-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
                  e.currentTarget.style.color = 'var(--gaia-text-secondary)'
                }}>
                <IconoRepetir /> Repetir
              </button>
              <button
                onClick={pechar}
                style={{
                  padding: '12px 24px',
                  background: 'var(--gaia-accent)',
                  color: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-accent)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 24px rgba(232, 165, 71, 0.4)',
                  transition: 'all 150ms ease'
                }}>
                Volver a GAIA <IconoFlechaDer />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PercorridoRuta