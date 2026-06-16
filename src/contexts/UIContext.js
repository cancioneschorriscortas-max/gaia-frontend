import { createContext, useContext, useState, useCallback, useReducer } from 'react'

// ── INICIO: contexto ─────────────────────────────────
const UIContext = createContext(null)

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI debe usarse dentro de UIProvider')
  return ctx
}
// ── FIN: contexto ────────────────────────────────────

// ── INICIO: estado_paneis ────────────────────────────
// Un só reducer para todos os paneis — evita 12 useState separados
const PANEIS_INICIAL = {
  historial:   false,
  arbol:       false,
  envio:       false,
  xp:          false,
  menuConfig:  false,
  menuUsuario: false,
  menuMovil:   false,
  lua:         false,
  visor:       false,
  perfil:      false,
  oberonTest:  false,  // ← Oberón
}

function paneisReducer(state, action) {
  switch (action.type) {
    case 'ABRIR':
      // Menús superiores (engrenaxe, usuario, móbil) — excluíntes entre si
      if (['menuConfig', 'menuUsuario', 'menuMovil'].includes(action.panel)) {
        return {
          ...state,
          menuConfig:  false,
          menuUsuario: false,
          menuMovil:   false,
          [action.panel]: true
        }
      }
      // Modais grandes — excluíntes entre si (non queremos dous modais abertos)
      if (['historial', 'perfil', 'oberonTest', 'arbol'].includes(action.panel)) {
        return {
          ...state,
          historial:   false,
          perfil:      false,
          oberonTest:  false,
          arbol:       false,
          [action.panel]: true
        }
      }
      return { ...state, [action.panel]: true }

    case 'PECHAR':
      return { ...state, [action.panel]: false }

    case 'TOGGLE':
      return { ...state, [action.panel]: !state[action.panel] }

    case 'PECHAR_TODOS_MENUS':
      return {
        ...state,
        menuConfig:  false,
        menuUsuario: false,
        menuMovil:   false,
      }

    case 'PECHAR_TODOS':
      return { ...PANEIS_INICIAL }

    default:
      return state
  }
}
// ── FIN: estado_paneis ───────────────────────────────

export function UIProvider({ children }) {

  // ── INICIO: estado ───────────────────────────────────
  const [paneis, dispatch] = useReducer(paneisReducer, PANEIS_INICIAL)

  const [idioma,        setIdioma]        = useState('gl')
  const [nivel,         setNivel]         = useState('primary')
  const [panelAmpliado, setPanelAmpliado] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('contido')
  const [lupaActiva,    setLupaActiva]    = useState(false)
  const [mutado,        setMutado]        = useState(false)
  const [idiomasActivos, setIdiomasActivos] = useState(['gl', 'es', 'en'])
  const [eventosXP,     setEventosXP]     = useState(null)
  const [tooltipVisible, setTooltipVisible] = useState(null)
  const [modoUsuario,   setModoUsuario]   = useState(true)
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768)
  // ── FIN: estado ──────────────────────────────────────

  // ── INICIO: accions_paneis ───────────────────────────
  const abrirPanel  = useCallback((panel) => dispatch({ type: 'ABRIR',  panel }), [])
  const pecharPanel = useCallback((panel) => dispatch({ type: 'PECHAR', panel }), [])
  const togglePanel = useCallback((panel) => dispatch({ type: 'TOGGLE', panel }), [])
  const pecharMenus = useCallback(() => dispatch({ type: 'PECHAR_TODOS_MENUS' }), [])
  // ── FIN: accions_paneis ──────────────────────────────

  // ── INICIO: accions_xp_notificacion ──────────────────
  const mostrarEventosXP = useCallback((eventos) => {
    setEventosXP(eventos)
  }, [])

  const pecharEventosXP = useCallback(() => {
    setEventosXP(null)
  }, [])
  // ── FIN: accions_xp_notificacion ─────────────────────

  // ── INICIO: valor_contexto ───────────────────────────
  const valor = {
    // Paneis
    paneis,
    abrirPanel,
    pecharPanel,
    togglePanel,
    pecharMenus,

    // UI xeral
    idioma,        setIdioma,
    nivel,         setNivel,
    panelAmpliado, setPanelAmpliado,
    seccionActiva, setSeccionActiva,
    lupaActiva,    setLupaActiva,
    mutado,        setMutado,
    idiomasActivos, setIdiomasActivos,
    modoUsuario,   setModoUsuario,
    isMobile,      setIsMobile,
    tooltipVisible, setTooltipVisible,

    // Notificacións XP
    eventosXP,
    mostrarEventosXP,
    pecharEventosXP,
  }
  // ── FIN: valor_contexto ──────────────────────────────

  return (
    <UIContext.Provider value={valor}>
      {children}
    </UIContext.Provider>
  )
}

export default UIContext