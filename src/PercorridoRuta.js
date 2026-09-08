import { useState, useEffect } from 'react'
import RetoInteractivo from './RetoInteractivo'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';
import { t } from './i18n'
import { TextoConPortais } from './portais'
import { fraseLua } from './lua'
import CARTAS from './data/cartas.json'
import { sonXP } from './sistemaAudio'

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

  const { authHeaders, rexistrarXP, usuario } = useUser()

  // ── INICIO: portais_e_cartas (estado) ────────────────
  // desvio: o nodo aberto desde un portal (unha "excursión" fóra da ruta).
  // portaisVistos: por usuario e persistente, para que o XP de NODO_NOVO
  // se dea unha soa vez por nodo e Lúa saiba se é a primeira vez.
  const chaveVistos = `gaia_portais_${usuario?.id || 'anon'}`
  const [desvio, setDesvio] = useState(null)          // { id, nodo, cargando, frase }
  const [portaisVistos, setPortaisVistos] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(chaveVistos) || '[]')) } catch { return new Set() }
  })
  const [cartaNova, setCartaNova] = useState(null)     // carta gañada nesta pantalla (fin ou portal)
  const [cartaPortal, setCartaPortal] = useState(null) // carta gañada ao cruzar o primeiro portal
  // ── FIN: portais_e_cartas (estado) ───────────────────

  // ── INICIO: estados ──────────────────────────────────
  const [ruta, setRuta]               = useState(null)
  const [stops, setStops]             = useState([])
  const [nodos, setNodos]             = useState({}) // cache
  const [indice, setIndice]           = useState(0)
  const [fase, setFase]               = useState('cargando')   // cargando | percorrido | fin | erro
  const [visible, setVisible]         = useState(false)
  const [mostrarMais, setMostrarMais] = useState(false)
  // Nunha ruta de secundaria a capa "e por que?" vai aberta por defecto en cada paso.
  const expandirPorDefecto = (r = ruta) => r?.level === 'secondary' || r?.level === 'expert'
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: cargar_nodo ──────────────────────────────
  // Un nodo que non se puido cargar queda marcado ({ erro: true }) en
  // vez de quedar baleiro: así o paso di "non se puido cargar" e non
  // "sen contido", e non se volve pedir en bucle.
  const cargarNodo = async (id) => {
    let xa = false
    setNodos(prev => { xa = !!prev[id] && !prev[id].erro; return prev })
    if (xa) return
    try {
      const res = await fetch(`${API}/nodo/${id}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setNodos(prev => ({ ...prev, [id]: data }))
    } catch (e) {
      console.error('[PercorridoRuta] Erro cargando nodo:', e)
      setNodos(prev => ({ ...prev, [id]: { erro: true } }))
    }
  }
  // ── FIN: cargar_nodo ─────────────────────────────────

  // ── INICIO: carga_inicial ────────────────────────────
  useEffect(() => {
    let vivo = true
    setTimeout(() => setVisible(true), 100)

    fetch(`${API}/journeys/${journeyId}`, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(async data => {
        if (!vivo) return
        setRuta(data)
        setMostrarMais(expandirPorDefecto(data))
        const stopsValidos = (data.stops || []).filter(s => s && s.nodo)
        setStops(stopsValidos)
        if (stopsValidos.length === 0) {   // ruta sen pasos: non hai nada que percorrer
          setFase('erro')
          return
        }
        await cargarNodo(stopsValidos[0].nodo.id)
        if (vivo) setFase('percorrido')
      })
      .catch(e => {
        console.error('[PercorridoRuta] Erro cargando ruta:', e)
        if (vivo) setFase('erro')
      })
    return () => { vivo = false }
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
    let vivo = true
    fetch(`${API}/journeys/${journeyId}/progreso`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : { indice: 0, completada: false })
      .catch(() => ({ indice: 0, completada: false }))
      .then(async p => {
        if (!vivo) return
        setXaCompletada(p.completada === true)
        const destino = pasoInicial != null
          ? Math.min(Math.max(0, pasoInicial), stops.length - 1)
          : Math.min(p.indice || 0, stops.length - 1)
        if (destino > 0 || pasoInicial != null) {
          await cargarNodo(stops[destino].nodo.id)
          if (vivo) setIndice(destino)
        }
      })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops])
  // ── FIN: progreso_persistente ────────────────────────

  // ── INICIO: pechar ───────────────────────────────────
  const pechar = () => {
    setVisible(false)
    setTimeout(() => onPechar(), 300)
  }
  // ── FIN: pechar ──────────────────────────────────────

  // ── INICIO: teclado ──────────────────────────────────
  // Escape pecha; ← → cambian de paso (só cando non se está escribindo
  // no reto e non hai un desvío aberto, que xa ten o seu Escape).
  useEffect(() => {
    const onKey = (e) => {
      const escribindo = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (e.key === 'Escape' && !desvio) { pechar(); return }
      if (escribindo || desvio || fase !== 'percorrido') return
      if (e.key === 'ArrowRight') irA(indice + 1)
      if (e.key === 'ArrowLeft' && indice > 0) irA(indice - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, fase, desvio, stops])
  // ── FIN: teclado ─────────────────────────────────────

  // ── INICIO: cartas ───────────────────────────────────
  // Garda a carta no backend; se é nova, devólvea para celebrala.
  const gañarCarta = async (cartaId) => {
    const carta = CARTAS.cartas.find(c => c.id === cartaId)
    if (!carta || !usuario || usuario.explorador) return null
    try {
      const r = await fetch(`${API}/cartas/${cartaId}`, { method: 'POST', headers: authHeaders() })
      if (!r.ok) return null
      const d = await r.json()
      if (d.nova) { try { sonXP(25) } catch (e) {} }   // a carta soa: recompensa = celebración
      return d.nova ? carta : null
    } catch { return null }
  }
  // ── FIN: cartas ──────────────────────────────────────

  // ── INICIO: abrir_portal ─────────────────────────────
  // Un portal abre o nodo destino nun panel por riba do paso, sen perder
  // o sitio na ruta. A primeira vez que se visita un nodo por portal dá
  // XP de NODO_NOVO; a primeira vez que se cruza UN portal, a carta 🔭.
  const abrirPortal = async (nodoId) => {
    const novo = !portaisVistos.has(nodoId)
    const primeiroPortal = portaisVistos.size === 0
    setDesvio({ id: nodoId, nodo: null, cargando: true,
                frase: fraseLua({ idioma, hora: -1, evento: novo ? 'portal_novo' : 'portal_visto', nome: usuario?.nome?.split(' ')[0] }) })
    try {
      const res = await fetch(`${API}/nodo/${nodoId}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setNodos(prev => ({ ...prev, [nodoId]: data }))
      setDesvio(d => d && d.id === nodoId ? { ...d, nodo: data, cargando: false } : d)
    } catch (e) {
      setDesvio(d => d && d.id === nodoId ? { ...d, nodo: { erro: true }, cargando: false } : d)
      return
    }
    if (novo) {
      const seguintes = new Set(portaisVistos); seguintes.add(nodoId)
      setPortaisVistos(seguintes)
      try { localStorage.setItem(chaveVistos, JSON.stringify([...seguintes])) } catch {}
      rexistrarXP('NODO_NOVO', nodoId)
      if (primeiroPortal) {
        const c = await gañarCarta('carta_portal')
        if (c) setCartaPortal(c)
      }
    }
  }
  // ── FIN: abrir_portal ────────────────────────────────

// ── INICIO: ir_a ─────────────────────────────────────
 // ── INICIO: ir_a ─────────────────────────────────────
  const irA = async (novoIndice) => {
    setMostrarMais(expandirPorDefecto()) // BUG ARRANXADO: reseta ao cambiar de paso
    if (novoIndice >= stops.length) {
      gardarProgreso(stops.length - 1, true)   // ruta completada
      if (!xaCompletada) {                      // premio só a primeira vez
        rexistrarXP('RUTA_COMPLETADA')
        setXaCompletada(true)
      }
      setFase('fin')
      // A carta da ruta (se a ten): o backend di se é nova; só entón se celebra.
      const carta = CARTAS.cartas.find(c => c.ruta === journeyId)
      if (carta) gañarCarta(carta.id).then(c => c && setCartaNova(c))
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
    setMostrarMais(expandirPorDefecto())
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
  const nodoConErro      = !!nodoActual?.erro
  const titulo           = nodoActual?.labels?.[idioma] || nodoActual?.labels?.gl
                        || stopActual?.nodo?.[`label_${idioma}`] || stopActual?.nodo?.label_gl || ''
  const texto            = nodoActual?.content?.primary?.[idioma]   || nodoActual?.content?.primary?.gl   || ''
  const textoSecundario  = nodoActual?.content?.secondary?.[idioma] || nodoActual?.content?.secondary?.gl || ''
  // Nivel da RUTA (non do nodo): unha ruta 'secondary' reutiliza os mesmos nodos
  // pero le tamén a capa "e por que?" e fai o reto de secundaria (30 XP).
  const nivelRuta        = ruta?.level === 'secondary' || ruta?.level === 'expert' ? ruta.level : 'primary'
  const retoDoNivel      = nodoActual?.retos?.[nivelRuta]?.[idioma] || nodoActual?.retos?.[nivelRuta]?.gl || ''
  const reto             = retoDoNivel || nodoActual?.retos?.primary?.[idioma] || nodoActual?.retos?.primary?.gl || ''
  const nivelReto        = retoDoNivel ? nivelRuta : 'primary'
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
              {t(idioma, 'percorrido')}
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
                {t(idioma, 'percorridoPaso')} <span style={{ color: 'var(--gaia-accent)', fontWeight: 700 }}>{indice + 1}</span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}> / {stops.length}</span>
              </div>
            )}
            <button
              onClick={pechar}
              aria-label={t(idioma, 'percorridoPecharAria')}
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
          <div style={{ display: 'flex', gap: 4 }}
               role="progressbar" aria-valuemin={1} aria-valuemax={stops.length} aria-valuenow={indice + 1}
               aria-valuetext={t(idioma, 'percorridoProgresoAria', indice + 1, stops.length)}>
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
              {t(idioma, 'cargando')}
            </div>
          </div>
        )}

        {/* ─── FASE: ERRO (ruta que non carga ou sen pasos) ─── */}
        {fase === 'erro' && (
          <div role="alert" style={{ textAlign: 'center', marginTop: '14vh' }}>
            <p style={{
              fontSize: 15,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 24px 0'
            }}>
              {t(idioma, 'percorridoErro')}
            </p>
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
                gap: 8
              }}>
              <IconoFlechaEsq /> {t(idioma, 'percorridoVolver')}
            </button>
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

            {/* Imaxe da parada (a primeira media de tipo imaxe do nodo). A etiqueta
                leva a atribución (autor · licenza · fonte): o material libre cítase. */}
            {(() => {
              const img = (nodoActual?.media || []).find(m => m.type === 'image' && m.url)
              if (!img) return null
              const pe = img[`label_${idioma}`] || img.label_gl || ''
              return (
                <figure style={{ margin: '0 0 22px' }}>
                  <img src={img.url} alt={titulo}
                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 14, display: 'block',
                             border: '1px solid var(--gaia-cosmos-400)', animation: 'percorridoFadeIn 300ms ease' }} />
                  {pe && (
                    <figcaption style={{ fontSize: 10.5, color: 'var(--gaia-text-tertiary)', marginTop: 6, textAlign: 'right' }}>
                      {pe}
                    </figcaption>
                  )}
                </figure>
              )
            })()}

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
                  {t(idioma, 'primaria')}
                </div>
                <p style={{
                  fontSize: 16,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  <TextoConPortais texto={texto} idioma={idioma} visitados={portaisVistos} onPortal={abrirPortal} />
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
                {t(idioma, nodoConErro ? 'percorridoErroNodo' : 'percorridoSenContido')}
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
                  {t(idioma, mostrarMais ? 'percorridoOcultarMais' : 'percorridoVerMais')}
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
                      {t(idioma, 'percorridoSecundaria')}
                    </div>
                    <p style={{
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-text-primary)',
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                      <TextoConPortais texto={textoSecundario} idioma={idioma} visitados={portaisVistos} onPortal={abrirPortal} />
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
                nivel={nivelReto}
                idioma={idioma}
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
                  {t(idioma, 'percorridoAnterior')}
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
                  ? <><IconoBandeira /> {t(idioma, 'percorridoRematar')}</>
                  : <>{t(idioma, 'percorridoSeguinte')} <IconoFlechaDer /></>
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
              {t(idioma, 'percorridoCompletada')}
            </div>

            <h2 style={{
              fontFamily: 'var(--gaia-font-display)',
              fontSize: 'clamp(26px, 3vw, 32px)',
              color: 'var(--gaia-accent)',
              margin: '0 0 10px 0',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              {t(idioma, 'percorridoParabens')}
            </h2>
            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              margin: '0 0 36px 0',
              lineHeight: 1.5
            }}>
              {t(idioma, 'percorridoCompletaches', stops.length, rutaLabel)}
            </p>

            {/* Lúa pecha a sesión (metrónomo: unha misión, e a durmir) */}
            <p style={{ color: 'var(--gaia-concept)', fontSize: 14, fontStyle: 'italic', margin: '-20px 0 30px' }}>
              {fraseLua({ idioma, hora: -1, evento: 'ruta_completa', nome: usuario?.nome?.split(' ')[0] })}
            </p>

            {/* Carta nova: a celebración, non o soborno */}
            {cartaNova && <CartaRevelada carta={cartaNova} idioma={idioma} />}

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
                {t(idioma, 'percorrido')}
              </div>
              {stops.map((s, i) => {
                const labelNodo = nodos[s.nodo.id]?.labels?.[idioma] || nodos[s.nodo.id]?.labels?.gl
                               || s.nodo[`label_${idioma}`] || s.nodo.label_gl
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
                <IconoRepetir /> {t(idioma, 'percorridoRepetir')}
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
                {t(idioma, 'percorridoVolver')} <IconoFlechaDer />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ═══ DESVÍO POR PORTAL ═══ */}
      {desvio && (
        <PanelDesvio
          desvio={desvio}
          idioma={idioma}
          visitados={portaisVistos}
          onPortal={abrirPortal}
          onPechar={() => setDesvio(null)}
          carta={cartaPortal}
          onCartaVista={() => setCartaPortal(null)}
        />
      )}
    </div>
  )
}

// ── INICIO: PanelDesvio ──────────────────────────────
// Folla que sobe desde abaixo co nodo destino do portal. Non cambia o
// paso da ruta: é unha excursión. Os portais de dentro seguen abrindo
// nodos no mesmo panel (fío de descubrimento).
function PanelDesvio({ desvio, idioma, visitados, onPortal, onPechar, carta, onCartaVista }) {
  const n = desvio.nodo
  const titulo = n?.labels?.[idioma] || n?.labels?.gl || desvio.id
  const texto  = n?.content?.primary?.[idioma] || n?.content?.primary?.gl || ''
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onPechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPechar])
  return (
    <div role="dialog" aria-modal="true" aria-label={t(idioma, 'percorridoDesvio')}
      style={{ position: 'fixed', inset: 0, zIndex: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onPechar} style={{ position: 'absolute', inset: 0, background: 'rgba(5, 10, 20, 0.6)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 720, maxHeight: '80vh', overflowY: 'auto',
        background: 'var(--gaia-cosmos-800)', border: '1px solid var(--gaia-concept-border)',
        borderBottom: 'none', borderRadius: '18px 18px 0 0', padding: '18px 22px 26px',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.5)', animation: 'percorridoSube 260ms ease',
        fontFamily: 'var(--gaia-font-body)', color: 'var(--gaia-text-primary)'
      }}>
        <style>{`@keyframes percorridoSube { from { transform: translateY(40px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--gaia-font-mono)', letterSpacing: '0.18em',
                         textTransform: 'uppercase', color: 'var(--gaia-concept)', fontWeight: 700, flex: 1 }}>
            ↗ {t(idioma, 'percorridoDesvio')}
          </span>
          <button onClick={onPechar} aria-label={t(idioma, 'pechar')}
            style={{ background: 'none', border: 'none', color: 'var(--gaia-text-tertiary)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Lúa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <svg width="30" height="30" viewBox="0 0 34 34" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M 17 4 a 13 13 0 1 0 0 26 a 10 13 0 1 1 0 -26 Z" fill="#e8f0ff" />
            <circle cx="14.5" cy="15" r="1.3" fill="#0a1020" />
            <path d="M 11.5 20 q 3.5 3 7 0" stroke="#0a1020" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 13, color: 'var(--gaia-text-secondary)', fontStyle: 'italic' }}>{desvio.frase}</div>
        </div>

        <h3 style={{ fontFamily: 'var(--gaia-font-display)', fontSize: 24, margin: '0 0 10px', color: 'var(--gaia-accent)' }}>
          {titulo}
        </h3>
        {desvio.cargando ? (
          <div style={{ color: 'var(--gaia-text-tertiary)', fontSize: 13 }}>{t(idioma, 'cargando')}</div>
        ) : n?.erro ? (
          <div style={{ color: 'var(--gaia-text-tertiary)', fontSize: 13 }}>{t(idioma, 'percorridoErroNodo')}</div>
        ) : (
          <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            {texto
              ? <TextoConPortais texto={texto} idioma={idioma} visitados={visitados} onPortal={onPortal} />
              : t(idioma, 'percorridoSenContido')}
          </p>
        )}

        {carta && (
          <div style={{ marginTop: 18 }}>
            <CartaRevelada carta={carta} idioma={idioma} compacta />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button onClick={onPechar}
            style={{ background: 'var(--gaia-accent)', color: 'var(--gaia-cosmos-900)', border: 'none',
                     borderRadius: 22, padding: '11px 30px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t(idioma, 'percorridoVolverCamino')}
          </button>
        </div>
      </div>
    </div>
  )
}
// ── FIN: PanelDesvio ─────────────────────────────────

// ── INICIO: CartaRevelada ────────────────────────────
// A carta gañada, cunha volta (flip) ao aparecer. Definición en data/cartas.json.
export function CartaRevelada({ carta, idioma = 'gl', compacta = false }) {
  const col = CARTAS.coleccions[carta.coleccion] || {}
  const cor = col.cor || '#e8a547'
  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: compacta ? 0 : '0 auto 30px' }}>
      <style>{`@keyframes cartaVolta { 0% { transform: rotateY(90deg) scale(0.8); opacity: 0 } 60% { transform: rotateY(-12deg) scale(1.04); opacity: 1 } 100% { transform: none } }`}</style>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: cor, fontWeight: 700 }}>
        ✦ {t(idioma, 'cartaNova')}
      </div>
      <div style={{
        width: compacta ? 220 : 240, borderRadius: 16, padding: '18px 16px 16px', textAlign: 'center',
        background: `linear-gradient(160deg, ${cor}22, var(--gaia-cosmos-900))`, border: `1.5px solid ${cor}`,
        boxShadow: `0 0 30px ${cor}55`, animation: 'cartaVolta 700ms ease'
      }}>
        <div style={{ fontSize: 46, lineHeight: 1 }}>{carta.emoji}</div>
        <div style={{ fontFamily: 'var(--gaia-font-display)', fontSize: 17, fontWeight: 700, color: cor, margin: '10px 0 6px' }}>
          {carta.titulo?.[idioma] || carta.titulo?.gl}
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--gaia-text-secondary)' }}>
          {carta.texto?.[idioma] || carta.texto?.gl}
        </div>
        <div style={{ fontSize: 10, marginTop: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gaia-text-tertiary)' }}>
          {col[idioma] || col.gl || carta.coleccion}
        </div>
      </div>
    </div>
  )
}
// ── FIN: CartaRevelada ───────────────────────────────

export default PercorridoRuta