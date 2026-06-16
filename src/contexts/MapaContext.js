import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useUser } from './UserContext'
//import { XP_ACCIONS } from '../niveis'
import { calcularNivel } from '../niveis'

// ── INICIO: config ───────────────────────────────────
const API = process.env.REACT_APP_API || 'http://localhost:4000'
// ── FIN: config ──────────────────────────────────────

// ── INICIO: contexto ─────────────────────────────────
const MapaContext = createContext(null)

export function useMapa() {
  const ctx = useContext(MapaContext)
  if (!ctx) throw new Error('useMapa debe usarse dentro de MapaProvider')
  return ctx
}
// ── FIN: contexto ────────────────────────────────────

export function MapaProvider({ children }) {

  // ── INICIO: estado_datos ─────────────────────────────
  const [nodos,     setNodos]     = useState([])
  const [nodoActivo, setNodoActivo] = useState(null)
  const [relacions,  setRelacions]  = useState([])
  const [journeys,   setJourneys]   = useState([])
  const [centroFiltro, setCentroFiltro] = useState('')
  const [cargandoNodo, setCargandoNodo] = useState(false)
  // ── FIN: estado_datos ────────────────────────────────

  // ── INICIO: estado_sesion_navegacion ─────────────────
  // Historial de navegación para o sistema XP
  const camiñoRef      = useRef([])
  const nodosVistosRef = useRef(new Set())
  const ultimoClickRef = useRef(0)
  // ── FIN: estado_sesion_navegacion ────────────────────

  // ── INICIO: ref_mapa ─────────────────────────────────
  // Referencia ao compoñente MapaUniverso para control de cámara
  const mapaRef = useRef(null)
  // ── FIN: ref_mapa ────────────────────────────────────

  const { rexistrarXP, estaAutenticado } = useUser()

  // ── INICIO: cargar_nodos ─────────────────────────────
  const cargarNodos = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/nodos`)
      const data = await res.json()
      setNodos(data.nodos || [])
    } catch (err) {
      console.error('Erro cargando nodos:', err)
    }
  }, [])
  // ── FIN: cargar_nodos ────────────────────────────────

  // ── INICIO: anti_spam ────────────────────────────────
  const factorAntiSpam = useCallback(() => {
    const agora = Date.now()
    const diff  = agora - ultimoClickRef.current
    ultimoClickRef.current = agora
    if (diff < 1500) return 0
    if (diff < 3000) return 0.3
    if (diff < 8000) return 0.7
    return 1
  }, [])
  // ── FIN: anti_spam ───────────────────────────────────

  // ── INICIO: calcular_eventos_xp ──────────────────────
  const calcularEventosXP = useCallback(async (nodoId) => {
    if (!estaAutenticado) return []

    const factor      = factorAntiSpam()
    const eventos     = []
    const camiño      = camiñoRef.current
    const nodosVistos = nodosVistosRef.current

    if (factor === 0) return []

    const eNovo      = !nodosVistos.has(nodoId)
    const profundidade = camiño.length

    // Nodo novo
    if (eNovo && profundidade >= 1) {
      const xpBase = profundidade <= 3 ? 8
                   : profundidade <= 5 ? 20
                   : profundidade <= 8 ? 35 : 50
      const xp = Math.round(xpBase * factor)
      if (xp > 0) {
        await rexistrarXP('NODO_NOVO', nodoId)
        eventos.push({ tipo: 'exploracion', xp, texto: `+${xp} XP — Descubrimento` })
      }
    }

    // Redescubrimento con contexto
    if (!eNovo && profundidade >= 4 && factor === 1) {
      await rexistrarXP('REDESCUBRIMENTO', nodoId)
      eventos.push({ tipo: 'conexion', xp: 15, texto: '+15 XP — Redescubrimento' })
    }

    // Bonus por cadeas de navegación
    const saltos = profundidade + 1
    if (saltos === 3) {
      await rexistrarXP('CADEA_3', nodoId)
      eventos.push({ tipo: 'conexion', xp: 20, texto: '🔗 +20 XP — Primeira cadea' })
    } else if (saltos === 6) {
      await rexistrarXP('CADEA_6', nodoId)
      eventos.push({ tipo: 'conexion', xp: 35, texto: '🔗 +35 XP — Exploración profunda' })
    } else if (saltos === 10) {
      await rexistrarXP('CADEA_10', nodoId)
      eventos.push({ tipo: 'conexion', xp: 50, texto: '🌌 +50 XP — Explorador do coñecemento' })
    }

    return eventos
  }, [estaAutenticado, factorAntiSpam, rexistrarXP])
  // ── FIN: calcular_eventos_xp ─────────────────────────

  // ── INICIO: seleccionar_nodo ─────────────────────────
  const seleccionarNodo = useCallback(async (id) => {
    setCargandoNodo(true)
    try {
      const [nodoData, relData, jData] = await Promise.all([
        fetch(`${API}/nodo/${id}`).then(r => r.json()),
        fetch(`${API}/nodo/${id}/relacions`).then(r => r.json()),
        fetch(`${API}/nodo/${id}/journeys`).then(r => r.json())
      ])

      setNodoActivo(nodoData)
      setRelacions(relData.relacions  || [])
      setJourneys(jData.journeys      || [])

      // Calcular XP en segundo plano — non bloquea a UI
      calcularEventosXP(id).then(eventos => {
        // Os eventos van ao NotificacionXP a través do UIContext
        // Aquí só actualizamos o historial de navegación
      })

      // Actualizar historial de navegación
      camiñoRef.current.push({ id, ts: Date.now() })
      nodosVistosRef.current.add(id)

    } catch (err) {
      console.error('Erro seleccionando nodo:', err)
    } finally {
      setCargandoNodo(false)
    }
  }, [calcularEventosXP])
  // ── FIN: seleccionar_nodo ────────────────────────────

  // ── INICIO: volver_ao_mapa ───────────────────────────
  const volverAoMapa = useCallback(() => {
    setNodoActivo(null)
    setRelacions([])
    setJourneys([])
    setTimeout(() => {
      try { mapaRef.current?.zoomToFit(600, 60) } catch (e) {}
    }, 100)
  }, [])
  // ── FIN: volver_ao_mapa ──────────────────────────────

  // ── INICIO: controis_camara ──────────────────────────
  const centrarEnNodo = useCallback((nodo) => {
    if (!nodo?.x || !mapaRef.current) return
    try {
      mapaRef.current.centerAt(nodo.x, nodo.y, 800)
      mapaRef.current.zoom(4, 800)
    } catch (e) {}
  }, [])

  const verTodo = useCallback(() => {
    try { mapaRef.current?.zoomToFit(400, 50) } catch (e) {}
  }, [])

  const centrarGaia = useCallback(() => {
    try {
      mapaRef.current?.centerAt(0, 0, 800)
      mapaRef.current?.zoom(2, 800)
    } catch (e) {}
  }, [])
  // ── FIN: controis_camara ─────────────────────────────

  // ── INICIO: valor_contexto ───────────────────────────
  const valor = {
    // Datos
    nodos,
    nodoActivo,
    relacions,
    journeys,
    centroFiltro,
    cargandoNodo,

    // Ref do mapa para control de cámara
    mapaRef,

    // Accións datos
    cargarNodos,
    seleccionarNodo,
    volverAoMapa,
    setCentroFiltro,

    // Accións cámara
    centrarEnNodo,
    verTodo,
    centrarGaia,
  }
  // ── FIN: valor_contexto ──────────────────────────────

  return (
    <MapaContext.Provider value={valor}>
      {children}
    </MapaContext.Provider>
  )
}

export default MapaContext