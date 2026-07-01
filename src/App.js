import { useState, useRef, useEffect, useCallback } from 'react'
import { t } from './i18n'
import { useUser }  from './contexts/UserContext'
import { useMapa }  from './contexts/MapaContext'
import { useUI }    from './contexts/UIContext'
import Constructor        from './Constructor'
import ConstructorRelacions from './ConstructorRelacions'
import ContextoBreadcrumb from './ContextoBreadcrumb'
import Editor             from './Editor'
import EditorRelacions    from './EditorRelacions'
import ConstructorRutas   from './ConstructorRutas'
import VisorRuta          from './VisorRuta'
import EditorRutas        from './EditorRutas'
import MapaUniverso       from './MapaUniverso'
import PanelConfigMapa    from './PanelConfigMapa'
import BuscadorMapa       from './BuscadorMapa'
import ImportadorBulk     from './ImportadorBulk'
import IntroGaia          from './IntroGaia'
import VisorNodo          from './VisorNodo'
import TabelaNodos        from './TabelaNodos'
import AsistenteLua       from './AsistenteLua'
import PanelXP            from './PanelXP'
import NotificacionXP     from './NotificacionXP'
import PrimeiroContacto   from './PrimeiroContacto'
import RankingCentros     from './RankingCentros'
import PanelEnvio         from './PanelEnvio'
import PanelValidacion    from './PanelValidacion'
import BottomSheet        from './BottomSheet'
import BarraInferiorMovil from './BarraInferiorMovil'
import PantallaUsuario    from './PantallaUsuario'
import PanelHistorial     from './PanelHistorial'
import PanelOberonTest    from './PanelOberonTest'
import DashboardCentro    from './DashboardCentro'
import ArbolInstitucional from './ArbolInstitucional'
import { toggleMute, sonPanel } from './sistemaAudio'
import SeleccionRol from './components/SeleccionRol'
import PanelPerfil from './components/PanelPerfil'
import ModoProfesor from './ModoProfesor'
import ModoArquitecto from './ModoArquitecto'
import GaiaLogo from './components/GaiaLogo'
import OberonProfesionVista from './OberonProfesionVista'
import './App.css'
//import ProbaYggdrasil from './ProbaYggdrasil'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// App.js — Cerebro da aplicación
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API / props externas: ningunha, é o compoñente raíz.
// Lóxica intacta: onboarding, rutas, contextos, seleccion de nodos,
// enrutamento entre modos usuario/arquitecto/profesor.
//
// MELLORAS:
//   1. Paleta v1.1 completa (todas as cores hardcoded a variables).
//   2. Space Grotesk → Atkinson Hyperlegible.
//   3. COR_TIPO aliñado coa paleta v1.1 do mapa.
//   4. Todos os emojis dos menús (🏫, 🏆, 🌳, ✦, 👤, 📋, 🔇, 🔊,
//      🔄, ➕, ⚙) → SVGs.
//   5. Menú móbil lateral refeito cun estilo coherente co resto.
//   6. Separadores verticais + aliñados con var(--gaia-cosmos-400).
//   7. Indicador de nivel no menú usuario con barra de progreso
//      limpa e tipografía coherente.
// ═══════════════════════════════════════════════════════════


const NIVEIS = [
  { id: 'primary',   clave: 'primaria'   },
  { id: 'secondary', clave: 'secundaria' },
  { id: 'expert',    clave: 'experto'    }
]

// ── INICIO: constantes_visuais v1.1 ──────────────────
// Obxecto S mantido para non tocar as ~300 referencias
// espalladas no ficheiro. Todo en tokens.
const S = {
  bgPanel:         'var(--gaia-cosmos-900)',
  bgHeader:        'var(--gaia-cosmos-800)',
  bgCard:          'var(--gaia-cosmos-700)',
  colorGold:       'var(--gaia-accent)',
  colorText:       'var(--gaia-text-primary)',
  colorMuted:      'var(--gaia-text-tertiary)',
  fontBody:        "'Atkinson Hyperlegible', system-ui, sans-serif",
  fontTitulo:      "'Fraunces', Georgia, serif",
  fontMono:        "'JetBrains Mono', monospace",
  titleSize:       20,
  bodySize:        15,
  labelSize:       11,
  borderRadius:    12,
  padding:         24,
  headerHeight:    140,
  borderColor:     'var(--gaia-cosmos-400)',
  accentPrimary:   'var(--gaia-constellation)',
  accentSecondary: 'var(--gaia-system)',
  accentExpert:    'var(--gaia-concept)',
  relCardBg:       'var(--gaia-cosmos-700)',
  relCardBorder:   'var(--gaia-cosmos-400)',
}
// ── FIN: constantes_visuais v1.1 ─────────────────────

// ── INICIO: COR_TIPO v1.1 (aliñado coa paleta do mapa) ──
const COR_TIPO = {
  origin:        '#f5f7ff',
  galaxy:        '#ffd966',
  constellation: '#5dd4a8',
  system:        '#7dd3fc',
  concept:       '#9bb3ff',
  process:       '#ff9fb8'
}
// ── FIN: COR_TIPO v1.1 ──────────────────────────────────

const COR_NIVEL = {
  primary: S.accentPrimary, secondary: S.accentSecondary, expert: S.accentExpert
}

const FONDO_TIPO = {
  origin:        '/assets/gaia-panel.png',
  constellation: '/assets/constelacion.png',
  galaxy:        '/assets/nodo-naranja.png',
  system:        '/assets/sistema-solar.png',
  process:       '/assets/rutas-procesos.png',
  concept:       '/assets/nodo-azul.png'
}
const SECCIONS = [
  { id: 'contido',   label: 'Contido',   cor: S.accentPrimary,   icono: '◈' },
  { id: 'media',     label: 'Media',     cor: S.accentSecondary, icono: '▶' },
  { id: 'retos',     label: 'Retos',     cor: S.accentExpert,    icono: '✦' },
  { id: 'relacions', label: 'Relacións', cor: S.colorGold,       icono: '⬡' }
]

// ═══════════════════════════════════════════════════════════
// ICONOS SVG (substitúen os emojis dos menús)
// ═══════════════════════════════════════════════════════════

const Svg = (d, size = 14, extra = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...extra}>{d}</svg>
)
const IconoTrofeo   = ({ size = 14 }) => Svg(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55.47.98.97 1.21C12.15 18.75 13 20.24 13 22" /><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.85 18.75 11 20.24 11 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>, size)
const IconoArbol    = ({ size = 14 }) => Svg(<><path d="M12 2v20" /><path d="M12 6l4-4" /><path d="M12 6L8 2" /><path d="M12 12l5-5" /><path d="M12 12l-5-5" /><path d="M12 18l6-6" /><path d="M12 18l-6-6" /></>, size)
const IconoEstrela  = ({ size = 14 }) => Svg(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />, size)
const IconoUsuario  = ({ size = 14 }) => Svg(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, size)
const IconoHistorial = ({ size = 14 }) => Svg(<><polyline points="14 2 14 8 20 8" /><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></>, size)
const IconoSonOn    = ({ size = 14 }) => Svg(<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>, size)
const IconoSonOff   = ({ size = 14 }) => Svg(<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>, size)
const IconoLogout   = ({ size = 14 }) => Svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>, size)
const IconoMais     = ({ size = 14 }) => Svg(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, size)
const IconoAxustes  = ({ size = 14 }) => Svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>, size)
const IconoCentro   = ({ size = 14 }) => Svg(<><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21V13h6v8" /></>, size)
const IconoX        = ({ size = 14 }) => Svg(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, size)
const IconoEnvio    = ({ size = 14 }) => Svg(<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" /></>, size)

function App() {

  // ── INICIO: contextos ────────────────────────────────
  const { usuario, xp, nivel: nivelUsuario, logout, esProfesor, esArquitecto, nivelContido } = useUser()
  console.log('esArquitecto:', esArquitecto, 'usuario:', usuario?.arquitecto)
  const {
    nodos, nodoActivo, relacions, journeys,
    mapaRef, cargarNodos, seleccionarNodo,
    volverAoMapa, centroFiltro, setCentroFiltro,
    centrarGaia, verTodo
  } = useMapa()
  const {
    paneis, abrirPanel, pecharPanel, togglePanel, pecharMenus,
    idioma, setIdioma,
    nivel, setNivel,
    panelAmpliado, setPanelAmpliado,
    seccionActiva, setSeccionActiva,
    lupaActiva, setLupaActiva,
    mutado, setMutado,
    idiomasActivos, setIdiomasActivos,
    modoUsuario, setModoUsuario,
    isMobile, setIsMobile,
    tooltipVisible, setTooltipVisible,
    eventosXP, pecharEventosXP,
  } = useUI()
  // ── FIN: contextos ───────────────────────────────────

  // ── INICIO: estado_local ─────────────────────────────
  const [introConAudio, setIntroConAudio] = useState(false)
  const [vista,             setVista]             = useState('explorar')
  const [journeyActiva,     setJourneyActiva]     = useState(null)
  const [transicionando,    setTransicionando]    = useState(false)
  const [configMapa,        setConfigMapa]        = useState(null)
  const [mostrarConfigMapa, setMostrarConfigMapa] = useState(false)
  const [voltandoAoMapa,    setVoltandoAoMapa]    = useState(false)
  const [introVista, setIntroVista] = useState(
    !!localStorage.getItem('gaia_intro_vista')
  )
  const [primeiroContactoVisto, setPrimeiroContactoVisto] = useState(
    !!localStorage.getItem('gaia_token')
  )
  const [usuarioVisto, setUsuarioVisto] = useState(
    !!localStorage.getItem('gaia_token')
  )
  const [rolVisto, setRolVisto] = useState(
    !!localStorage.getItem('gaia_rol_visto')
  )
  // ── FIN: estado_local ────────────────────────────────

  // ── INICIO: refs ─────────────────────────────────────
  const panelScrollRef = useRef(null)
  const menuConfigRef  = useRef(null)
  const seccionRefs = {
    contido:   useRef(null),
    media:     useRef(null),
    retos:     useRef(null),
    relacions: useRef(null)
  }
  // ── FIN: refs ────────────────────────────────────────

  const panelWidth = panelAmpliado ? '75vw' : 'min(520px, 25vw)'

  // ── INICIO: logout_completo ──────────────────────────
  const logoutCompleto = useCallback(() => {
    setModoUsuario(true)
    setUsuarioVisto(false)
    logout()
  }, [logout, setModoUsuario])
  // ── FIN: logout_completo ─────────────────────────────

  // ── INICIO: efectos ──────────────────────────────────
  useEffect(() => {
    cargarNodos()
    fetch(`${API}/config/idiomas`)
      .then(r => r.json())
      .then(d => setIdiomasActivos(d.value || ['gl', 'es', 'en']))
  }, [cargarNodos, setIdiomasActivos])

  useEffect(() => {
    if (usuario && !esProfesor && !usuario.explorador) {
      setNivel(nivelContido())
    }
  }, [usuario, esProfesor, nivelContido, setNivel])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [setIsMobile])

  useEffect(() => {
    if (!paneis.menuConfig) return
    const handler = (e) => {
      if (menuConfigRef.current && !menuConfigRef.current.contains(e.target)) {
        pecharPanel('menuConfig')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [paneis.menuConfig, pecharPanel])
  // ── FIN: efectos ─────────────────────────────────────

  // ── INICIO: seleccionar_nodo_local ───────────────────
  const seleccionarNodoConTransicion = useCallback((id) => {
    setTransicionando(true)
    setSeccionActiva('contido')
    setTimeout(() => {
      setVista('explorar')
      setTransicionando(false)
    }, 300)
    seleccionarNodo(id)
    if (lupaActiva) abrirPanel('visor')
  }, [seleccionarNodo, lupaActiva, abrirPanel, setSeccionActiva])
  // ── FIN: seleccionar_nodo_local ──────────────────────

  // ── INICIO: volver_ao_mapa_local ─────────────────────
  const volverAoMapaLocal = useCallback(() => {
    setVoltandoAoMapa(true)
    setTimeout(() => {
      pecharPanel('visor')
      setVoltandoAoMapa(false)
      volverAoMapa()
    }, 350)
  }, [pecharPanel, volverAoMapa])
  // ── FIN: volver_ao_mapa_local ────────────────────────

  // ── INICIO: helpers_contido ──────────────────────────
  const tenContido = (nodo) => nodo && ['primary','secondary','expert'].some(
    n => nodo.content?.[n]?.[idioma] || nodo.content?.[n]?.gl
  )
  const tenMedia    = (nodo) => nodo?.media?.length > 0
  const tenRetos    = (nodo) => nodo?.retos && Object.values(nodo.retos).some(
    r => Object.values(r).some(v => v)
  )
  const tenRelacions = () => relacions?.length > 0

  const scrollASeccion = (id) => {
    setSeccionActiva(id)
    setTimeout(() => {
      const ref   = seccionRefs[id]?.current
      const panel = panelScrollRef.current
      if (ref && panel) panel.scrollTo({ top: ref.offsetTop - 20, behavior: 'smooth' })
    }, 50)
  }

  const mostrarNivel = (n) => {
    if (nivel === 'primary')   return n === 'primary'
    if (nivel === 'secondary') return n === 'primary' || n === 'secondary'
    return true
  }

  const btnStyle = (activo) => ({
    flex: 1, padding: '6px',
    background: activo ? S.colorGold : 'var(--gaia-cosmos-800)',
    color:      activo ? 'var(--gaia-cosmos-900)' : S.colorText,
    border: `1px solid ${S.borderColor}`, borderRadius: 6,
    cursor: 'pointer', fontSize: 11,
    fontFamily: S.fontBody
  })
  // ── FIN: helpers_contido ─────────────────────────────

  // ── INICIO: render_seccions_contido ──────────────────
  const renderSeccionContido = () => (
    <div ref={seccionRefs.contido}>
      {['primary','secondary','expert'].map(n => {
        if (!mostrarNivel(n)) return null
        const texto = nodoActivo.content?.[n]?.[idioma] || nodoActivo.content?.[n]?.gl
        if (!texto) return null
        return (
          <div key={n} style={{
            margin: '10px 0', padding: '14px',
            background: S.bgCard, borderRadius: S.borderRadius,
            borderLeft: `3px solid ${COR_NIVEL[n]}`,
            transition: 'background 200ms ease'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-600)'}
            onMouseLeave={e => e.currentTarget.style.background = S.bgCard}
          >
            <div style={{ color: COR_NIVEL[n], fontSize: S.labelSize, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: S.fontMono, fontWeight: 700 }}>
              {t(idioma, n === 'primary' ? 'nivelPrimaria' : n === 'secondary' ? 'nivelSecundaria' : 'nivelExperto')}
            </div>
            <p style={{ lineHeight: 1.75, fontSize: S.bodySize, margin: 0, color: S.colorText }}>
              {texto}
            </p>
          </div>
        )
      })}
      {!tenContido(nodoActivo) && (
        <div style={{ color: S.colorMuted, fontSize: S.bodySize, padding: '12px 0' }}>
          Sen contido neste nivel.
        </div>
      )}
    </div>
  )

  const renderSeccionMedia = () => {
    if (!tenMedia(nodoActivo)) return (
      <div ref={seccionRefs.media} style={{ color: S.colorMuted, fontSize: S.bodySize, padding: '12px 0' }}>
        Sen media dispoñible.
      </div>
    )
    const enIdioma    = nodoActivo.media.filter(m => m.idioma === idioma)
    const mediaRender = enIdioma.length > 0
      ? enIdioma
      : nodoActivo.media.filter(m => !m.idioma || m.idioma === 'gl')
    return (
      <div ref={seccionRefs.media}>
        {mediaRender.map(m => {
          const ytId = m.url.match(/(?:v=|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]
          return (
            <div key={m.id} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: S.labelSize, color: S.colorMuted, marginBottom: 6, fontFamily: S.fontMono, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {m.type} — {m[`label_${idioma}`] || m.label_gl}
              </div>
              {m.type === 'youtube' && ytId ? (
                <div style={{ maxWidth: '100%', borderRadius: S.borderRadius, overflow: 'hidden', border: `1px solid ${S.borderColor}` }}>
                  <iframe width="100%" height="240"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={m[`label_${idioma}`] || m.label_gl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ display: 'block' }}
                  />
                </div>
              ) : (
                <a href={m.url} target="_blank" rel="noreferrer"
                  style={{ color: S.colorGold, fontSize: S.bodySize }}>
                  {m.url}
                </a>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderSeccionRetos = () => {
    if (!tenRetos(nodoActivo)) return (
      <div ref={seccionRefs.retos} style={{ color: S.colorMuted, fontSize: S.bodySize, padding: '12px 0' }}>
        Sen retos dispoñibles.
      </div>
    )
    return (
      <div ref={seccionRefs.retos}>
        {['primary','secondary','expert'].map(n => {
          if (!mostrarNivel(n)) return null
          const reto = nodoActivo.retos?.[n]?.[idioma] || nodoActivo.retos?.[n]?.gl
          if (!reto) return null
          return (
            <div key={n} style={{
              margin: '10px 0', padding: '14px',
              background: 'var(--gaia-cosmos-800)', borderRadius: S.borderRadius,
              borderLeft: `3px solid ${COR_NIVEL[n]}`,
              border: `1px solid ${S.borderColor}`,
              transition: 'background 200ms ease'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-cosmos-800)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: COR_NIVEL[n], fontSize: S.labelSize, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: S.fontMono, fontWeight: 700 }}>
                  {n === 'primary' ? 'PRIMARIA' : n === 'secondary' ? 'SECUNDARIA' : 'EXPERTO'}
                </div>
                {nodoActivo.reto_puntos && (
                  <div style={{
                    color: S.colorGold, fontSize: S.labelSize, fontWeight: 700,
                    background: 'var(--gaia-accent-bg)', padding: '2px 10px',
                    borderRadius: 9999, border: '1px solid var(--gaia-accent-border)',
                    fontFamily: S.fontMono
                  }}>
                    +{nodoActivo.reto_puntos} pts
                  </div>
                )}
              </div>
              <p style={{ lineHeight: 1.65, fontSize: S.bodySize, margin: 0, color: S.colorText }}>
                {reto}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  const renderSeccionRelacions = () => (
    <div ref={seccionRefs.relacions}>
      {relacions.length === 0 && (
        <div style={{ color: S.colorMuted, fontSize: S.bodySize, padding: '12px 0' }}>
          Sen relacións.
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {relacions.filter((rel, i, self) => i === self.findIndex(r => r.id === rel.id)).map(rel => (
          <div key={rel.id}
            onClick={() => rel.existe && seleccionarNodoConTransicion(rel.id)}
            style={{
              padding: '10px 12px', background: S.relCardBg,
              border: `1px solid ${rel.strength === 'high' ? S.colorGold : S.relCardBorder}`,
              borderRadius: S.borderRadius,
              cursor: rel.existe ? 'pointer' : 'default',
              opacity: rel.existe ? 1 : 0.4,
              transition: 'all 200ms ease', minWidth: 130
            }}
            onMouseEnter={e => {
              if (rel.existe) {
                e.currentTarget.style.background  = 'var(--gaia-accent-bg)'
                e.currentTarget.style.borderColor = S.colorGold
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = S.relCardBg
              e.currentTarget.style.borderColor = rel.strength === 'high' ? S.colorGold : S.relCardBorder
            }}
          >
            <div style={{ fontSize: S.labelSize, color: S.colorGold, marginBottom: 3, fontFamily: S.fontMono, letterSpacing: '0.02em' }}>
              {rel.direccion === 'in' ? '← ' : '→ '}
              {rel.direccion === 'in'
                ? (rel.nome?.[`${idioma}_inv`] || rel.nome?.gl_inv || rel.nome?.[idioma] || rel.nome?.gl || rel.tipo)
                : (rel.nome?.[idioma] || rel.nome?.gl || rel.tipo)
              }
            </div>
            <div style={{ fontWeight: 600, color: S.colorText, fontSize: S.bodySize - 1 }}>
              {rel.label}
            </div>
          </div>
        ))}
      </div>
      {journeys.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: S.colorGold, fontSize: S.labelSize, letterSpacing: '0.1em', marginBottom: 8, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>
            {t(idioma, 'rutasTitle')}
          </div>
          {journeys.map(j => (
            <div key={j.id}
              onClick={() => setJourneyActiva(j.id === journeyActiva ? null : j.id)}
              style={{
                padding: '10px 12px', marginBottom: 6,
                background: journeyActiva === j.id ? 'var(--gaia-constellation-bg)' : S.bgCard,
                border: `1px solid ${journeyActiva === j.id ? 'var(--gaia-constellation-border)' : S.borderColor}`,
                borderRadius: S.borderRadius, cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ fontSize: S.labelSize, color: S.accentPrimary, marginBottom: 2, fontFamily: S.fontMono, letterSpacing: '0.03em' }}>
                {j.type} · {j.level}
              </div>
              <div style={{ fontWeight: 600, fontSize: S.bodySize - 1, color: S.colorText }}>
                {j.label?.[idioma] || j.label?.gl}
              </div>
            </div>
          ))}
          {journeyActiva && (
            <VisorRuta
              id={journeyActiva}
              seleccionarNodo={seleccionarNodoConTransicion}
              idioma={idioma}
            />
          )}
        </div>
      )}
    </div>
  )
  // ── FIN: render_seccions_contido ─────────────────────

  // ── INICIO: render_barra_navegacion ──────────────────
  const renderBarraBolinhas = () => {
    const sc = [
      { ...SECCIONS[0], ten: tenContido(nodoActivo)  },
      { ...SECCIONS[1], ten: tenMedia(nodoActivo)    },
      { ...SECCIONS[2], ten: tenRetos(nodoActivo)    },
      { ...SECCIONS[3], ten: tenRelacions()          }
    ]
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: '10px 20px',
        background: S.bgHeader, borderBottom: `1px solid ${S.borderColor}`,
        flexShrink: 0
      }}>
        {sc.map(s => (
          <div key={s.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              onClick={() => scrollASeccion(s.id)}
              onMouseEnter={() => setTooltipVisible(s.id)}
              onMouseLeave={() => setTooltipVisible(null)}
              style={{
                width: 13, height: 13, borderRadius: '50%',
                background: s.ten ? s.cor : 'var(--gaia-cosmos-500)',
                border: `2px solid ${seccionActiva === s.id ? s.cor : s.ten ? s.cor + '44' : 'var(--gaia-cosmos-400)'}`,
                cursor: 'pointer',
                boxShadow: s.ten && seccionActiva === s.id ? `0 0 8px ${s.cor}88` : 'none',
                transition: 'all 200ms ease',
                animation: s.ten && s.id === 'retos' ? 'pulseReto 2s infinite' : 'none',
                transform: seccionActiva === s.id ? 'scale(1.3)' : 'scale(1)',
                opacity: s.ten ? 1 : 0.25
              }}
            />
            <span style={{
              fontSize: 9, letterSpacing: '0.08em',
              color: seccionActiva === s.id ? s.cor : s.ten ? 'var(--gaia-text-tertiary)' : 'var(--gaia-text-disabled)',
              transition: 'color 200ms ease',
              fontFamily: S.fontMono, fontWeight: 600, textTransform: 'uppercase'
            }}>
              {s.label}
            </span>
            {tooltipVisible === s.id && (
              <div style={{
                position: 'absolute', bottom: 32, left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 16, 32, 0.95)',
                border: `1px solid ${S.borderColor}`,
                borderRadius: 6, padding: '5px 10px',
                fontSize: 10, color: s.ten ? s.cor : S.colorMuted,
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
                fontFamily: S.fontMono, letterSpacing: '0.03em',
                backdropFilter: 'blur(8px)'
              }}>
                {s.ten ? s.label : 'Sen contido'}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderTabsAmpliado = () => {
    const sc = [
      { ...SECCIONS[0], ten: tenContido(nodoActivo)  },
      { ...SECCIONS[1], ten: tenMedia(nodoActivo)    },
      { ...SECCIONS[2], ten: tenRetos(nodoActivo)    },
      { ...SECCIONS[3], ten: tenRelacions()          }
    ]
    return (
      <div style={{ display: 'flex', borderBottom: `1px solid ${S.borderColor}`, background: S.bgHeader, flexShrink: 0 }}>
        {sc.map(s => (
          <button key={s.id}
            onClick={() => setSeccionActiva(s.id)}
            style={{
              flex: 1, padding: '12px 8px',
              background: 'transparent', border: 'none',
              borderBottom: seccionActiva === s.id ? `2px solid ${s.cor}` : '2px solid transparent',
              color: seccionActiva === s.id ? S.colorText : s.ten ? S.colorMuted : 'var(--gaia-text-disabled)',
              cursor: 'pointer', fontSize: S.labelSize,
              letterSpacing: '0.03em', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginBottom: '-1px',
              fontFamily: S.fontBody, fontWeight: seccionActiva === s.id ? 700 : 500
            }}
          >
            <span style={{
              color: s.ten ? s.cor : 'var(--gaia-text-disabled)', fontSize: 11,
              animation: s.id === 'retos' && s.ten ? 'pulseReto 2s infinite' : 'none'
            }}>
              {s.icono}
            </span>
            {s.label}
            {s.id === 'retos' && s.ten && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: s.cor, boxShadow: `0 0 5px ${s.cor}`,
                animation: 'pulseReto 2s infinite', flexShrink: 0
              }} />
            )}
          </button>
        ))}
      </div>
    )
  }

  const renderContidoSeccionActiva = () => {
    switch (seccionActiva) {
      case 'contido':   return renderSeccionContido()
      case 'media':     return renderSeccionMedia()
      case 'retos':     return renderSeccionRetos()
      case 'relacions': return renderSeccionRelacions()
      default:          return renderSeccionContido()
    }
  }
  // ── FIN: render_barra_navegacion ─────────────────────

  // ── INICIO: render_panel_lateral ─────────────────────
  const renderPanelLateral = () => (
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: panelWidth, height: '100%',
      background: S.bgPanel, borderLeft: `1px solid ${S.borderColor}`,
      transform: nodoActivo && !lupaActiva ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 300ms ease, width 300ms ease',
      zIndex: 5, display: 'flex', flexDirection: 'column',
      fontFamily: S.fontBody
    }}>
      <style>{`@keyframes pulseReto{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
      {nodoActivo && !lupaActiva && (
        <>
          <div style={{
            position: 'relative', height: S.headerHeight, flexShrink: 0,
            backgroundImage: `url(${FONDO_TIPO[nodoActivo?.type] || '/assets/nodo-azul.png'})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            borderBottom: `1px solid ${S.borderColor}`, overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(3,6,15,0.3) 0%, ${S.bgHeader} 100%)` }} />
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 2 }}>
              <button
                onClick={() => { setPanelAmpliado(!panelAmpliado); setSeccionActiva('contido'); sonPanel(!panelAmpliado) }}
                style={{ background: 'rgba(10, 16, 32, 0.6)', border: `1px solid ${S.borderColor}`, color: S.colorMuted, borderRadius: S.borderRadius, padding: '4px 10px', cursor: 'pointer', fontSize: 13, fontFamily: S.fontMono }}
                title={panelAmpliado ? 'Reducir panel' : 'Ampliar panel'}
              >
                {panelAmpliado ? '⊟' : '⊞'}
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: S.padding, zIndex: 2, right: 80 }}>
              <h2 style={{ color: S.colorGold, margin: 0, fontSize: S.titleSize, fontFamily: S.fontTitulo, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nodoActivo.labels?.[idioma] || nodoActivo.labels?.gl}
              </h2>
              <ContextoBreadcrumb id={nodoActivo.id} idioma={idioma} />
              <p style={{ color: S.colorMuted, fontSize: S.labelSize, margin: '3px 0 0 0', fontFamily: S.fontMono, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {nodoActivo.type} · {nodoActivo.difficulty}
              </p>
            </div>
            {(esProfesor || !usuario || usuario.explorador) && (
              <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', gap: 4, zIndex: 2 }}>
                {NIVEIS.map(n => (
                  <button key={n.id} onClick={() => setNivel(n.id)}
                    style={{
                      padding: '3px 9px',
                      background: nivel === n.id ? S.colorGold : 'rgba(10, 16, 32, 0.6)',
                      color:      nivel === n.id ? 'var(--gaia-cosmos-900)' : S.colorMuted,
                      border:     `1px solid ${nivel === n.id ? S.colorGold : S.borderColor}`,
                      borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 10,
                      fontFamily: S.fontBody, fontWeight: nivel === n.id ? 700 : 500,
                      letterSpacing: '0.02em'
                    }}>
                    {t(idioma, n.clave)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', background: S.bgHeader, borderBottom: `1px solid ${S.borderColor}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => abrirPanel('visor')}
              style={{ flex: 1, padding: '10px 16px', background: 'var(--gaia-accent-bg)', border: '1px solid var(--gaia-accent-border)', color: S.colorGold, borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 13, fontFamily: S.fontBody, fontWeight: 600, transition: 'all 200ms ease', letterSpacing: '0.02em' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 165, 71, 0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-accent-bg)'}
            >
              Explorar en detalle →
            </button>
          </div>

          {panelAmpliado ? renderTabsAmpliado() : renderBarraBolinhas()}

          <div ref={panelScrollRef} style={{ flex: 1, overflowY: 'auto', padding: S.padding }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={() => { volverAoMapa(); setPanelAmpliado(false) }}
                style={{ background: 'transparent', border: `1px solid ${S.borderColor}`, color: S.colorMuted, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 200ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gaia-cosmos-700)'; e.currentTarget.style.color = S.colorText }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.colorMuted }}
              >
                <IconoX />
              </button>
            </div>
            {panelAmpliado ? (
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                {renderContidoSeccionActiva()}
              </div>
            ) : (
              <>
                {renderSeccionContido()}
                {tenMedia(nodoActivo) && (
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${S.borderColor}` }}>
                    <div style={{ color: S.accentSecondary, fontSize: S.labelSize, letterSpacing: '0.1em', marginBottom: 10, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>{t(idioma, 'mediaTitle')}</div>
                    {renderSeccionMedia()}
                  </div>
                )}
                {tenRetos(nodoActivo) && (
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${S.borderColor}` }}>
                    <div style={{ color: S.accentExpert, fontSize: S.labelSize, letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>
                      <span style={{ animation: 'pulseReto 2s infinite' }}>✦</span>RETOS
                    </div>
                    {renderSeccionRetos()}
                  </div>
                )}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${S.borderColor}` }}>
                  <div style={{ color: S.colorGold, fontSize: S.labelSize, letterSpacing: '0.1em', marginBottom: 10, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>{t(idioma, 'relacionsTitle')}</div>
                  {renderSeccionRelacions()}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
  // ── FIN: render_panel_lateral ────────────────────────

  // ── INICIO: render_menu_config ───────────────────────
  const renderMenuConfig = () => {
    const centrosUnicos = [...new Set(nodos.map(n => n.centro).filter(Boolean))].sort()
    return (
      <div ref={menuConfigRef} style={{ position: 'relative' }}>
        <button
          onClick={() => togglePanel('menuConfig')}
          style={{ padding: '6px 10px', background: paneis.menuConfig ? 'var(--gaia-accent-bg)' : 'rgba(10, 16, 32, 0.6)', border: `1px solid ${paneis.menuConfig ? 'var(--gaia-accent-border)' : S.borderColor}`, color: paneis.menuConfig ? S.colorGold : S.colorMuted, borderRadius: S.borderRadius, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 200ms ease' }}
          title="Configuración"
        >
          <IconoAxustes />
        </button>

        {paneis.menuConfig && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'rgba(10, 16, 32, 0.97)', border: `1px solid ${S.borderColor}`, borderRadius: 12, padding: '8px 0', minWidth: 240, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>

            {/* Idioma */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${S.borderColor}` }}>
              <div style={{ fontSize: 10, color: S.colorMuted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>Idioma</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {idiomasActivos.map(i => (
                  <button key={i} onClick={() => setIdioma(i)}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, background: idioma === i ? S.colorGold : 'var(--gaia-cosmos-800)', color: idioma === i ? 'var(--gaia-cosmos-900)' : S.colorMuted, border: `1px solid ${idioma === i ? S.colorGold : S.borderColor}`, borderRadius: 6, cursor: 'pointer', fontWeight: idioma === i ? 700 : 500, textTransform: 'uppercase', fontFamily: S.fontBody, letterSpacing: '0.05em' }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* 2D / 3D */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${S.borderColor}` }}>
              <div style={{ fontSize: 10, color: S.colorMuted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>Modo mapa</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['2D', '3D'].map(m => (
                  <button key={m}
                    onClick={() => mapaRef.current?.setModo3D(m === '3D')}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, background: 'var(--gaia-cosmos-800)', color: S.colorMuted, border: `1px solid ${S.borderColor}`, borderRadius: 6, cursor: 'pointer', fontFamily: S.fontBody }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Centro */}
            {centrosUnicos.length > 0 && (
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${S.borderColor}` }}>
                <div style={{ fontSize: 10, color: S.colorMuted, letterSpacing: '0.12em', marginBottom: 8, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>Centro</div>
                <select value={centroFiltro} onChange={e => setCentroFiltro(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: centroFiltro ? 'var(--gaia-constellation-bg)' : 'var(--gaia-cosmos-800)', border: `1px solid ${centroFiltro ? 'var(--gaia-constellation-border)' : S.borderColor}`, color: centroFiltro ? S.accentPrimary : S.colorMuted, borderRadius: 6, cursor: 'pointer', fontFamily: S.fontBody }}>
                  <option value="">Todos os centros</option>
                  {centrosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {centroFiltro && (
                  <button onClick={() => setCentroFiltro('')}
                    style={{ marginTop: 6, width: '100%', padding: '5px', fontSize: 10, background: 'transparent', border: '1px solid var(--gaia-constellation-border)', color: S.accentPrimary, borderRadius: 6, cursor: 'pointer', fontFamily: S.fontMono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, letterSpacing: '0.03em' }}>
                    <IconoX size={10} /> Limpar filtro
                  </button>
                )}
              </div>
            )}

            {/* Opcións do menú */}
            <MenuItem href="/ranking" Icono={IconoTrofeo} label={t(idioma, 'rankingCentros')} color={S.colorGold} />
            {usuario && !esProfesor && !usuario.explorador && (
  <MenuItem onClick={() => { abrirPanel('oberonTest'); pecharPanel('menuConfig') }} Icono={IconoEstrela} label="Test vocacional" />
)}
            <MenuItem onClick={() => { abrirPanel('arbol'); pecharMenus() }} Icono={IconoArbol} label={t(idioma, 'arquivoRutas')} />
            <MenuItem onClick={() => { setIntroConAudio(true); setPrimeiroContactoVisto(false); pecharPanel('menuConfig') }} Icono={IconoEstrela} label={t(idioma, 'verIntroduccion')} />
            <MenuItem onClick={() => { abrirPanel('historial'); pecharPanel('menuConfig') }} Icono={IconoHistorial} label={t(idioma, 'meuHistorial')} />
            <MenuItem onClick={() => { const m = toggleMute(); setMutado(m) }} Icono={mutado ? IconoSonOff : IconoSonOn} label={mutado ? t(idioma, 'activarSon') : t(idioma, 'silenciar')} color={mutado ? 'var(--gaia-danger)' : undefined} ultimo />
          </div>
        )}
      </div>
    )
  }
  // ── FIN: render_menu_config ──────────────────────────

  // ── INICIO: render_menu_usuario ──────────────────────
  const renderMenuUsuario = () => (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => togglePanel('menuUsuario')}
        style={{ padding: '6px 12px', background: 'rgba(10, 16, 32, 0.6)', border: `1px solid ${usuario ? 'var(--gaia-constellation-border)' : S.borderColor}`, color: S.accentPrimary, borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 11, fontFamily: S.fontBody, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <span style={{ fontSize: 10, color: S.colorGold }}>✦</span>
        <span>{usuario?.nome || 'Explorador'}</span>
        <span style={{ color: S.colorGold, fontFamily: S.fontMono }}>· {xp.total} XP</span>
        {nivelUsuario && (
          <span style={{ color: nivelUsuario.cor, fontSize: 10, fontFamily: S.fontMono }}>
            · Nv.{nivelUsuario.nivel}
          </span>
        )}
      </button>

      {paneis.menuUsuario && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: 'rgba(10, 16, 32, 0.97)', border: `1px solid ${S.borderColor}`, borderRadius: 12, padding: '8px 0', minWidth: 240, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>

          {/* Info usuario */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.borderColor}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: S.colorText, fontFamily: S.fontBody }}>{usuario?.nome}</div>
            {usuario?.centro && (
              <div style={{ fontSize: 11, color: S.colorMuted, marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <IconoCentro size={11} /> {usuario.centro}
              </div>
            )}
            <div style={{ fontSize: 11, color: S.colorGold, marginTop: 5, fontFamily: S.fontMono }}>✦ {xp.total} XP</div>
            {nivelUsuario && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4, fontFamily: S.fontMono, letterSpacing: '0.03em' }}>
                  <span style={{ color: nivelUsuario.cor, fontWeight: 600 }}>{nivelUsuario.titulo}</span>
                  {nivelUsuario.xpSeguinte && (
                    <span style={{ color: S.colorMuted }}>{nivelUsuario.xpSeguinte - xp.total} → {nivelUsuario.tituloSeguinte}</span>
                  )}
                </div>
                <div style={{ height: 3, background: 'var(--gaia-cosmos-700)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${nivelUsuario.progreso}%`, background: nivelUsuario.cor, borderRadius: 2, transition: 'width 400ms ease', boxShadow: `0 0 6px ${nivelUsuario.cor}` }} />
                </div>
              </div>
            )}
          </div>

          <MenuItem onClick={() => { abrirPanel('perfil'); pecharPanel('menuUsuario') }} Icono={IconoUsuario} label="O meu perfil" />
          <MenuItem onClick={() => { logoutCompleto(); pecharPanel('menuUsuario') }} Icono={IconoLogout} label={t(idioma, 'cerrarSesion')} color="var(--gaia-danger)" ultimo />

        </div>
      )}
    </div>
  )
  // ── FIN: render_menu_usuario ─────────────────────────

  // ── INICIO: render_modo_usuario ──────────────────────
  
  const renderModoUsuario = () => {
    if (isMobile) return renderModoMovil()
    return (
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Visor de nodo en pantalla completa */}
        {paneis.visor && nodoActivo && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            opacity:    voltandoAoMapa ? 0 : 1,
            transform:  voltandoAoMapa ? 'scale(0.96)' : 'scale(1)',
            filter:     voltandoAoMapa ? 'blur(8px)' : 'blur(0px)',
            transition: 'opacity 320ms ease, transform 320ms ease, filter 320ms ease',
            pointerEvents: voltandoAoMapa ? 'none' : 'all'
          }}>
         
            <VisorNodo
              nodoId={nodoActivo.id}
              onVolver={volverAoMapaLocal}
              seleccionarNodo={seleccionarNodoConTransicion}
              idioma={idioma}
              idiomasActivos={idiomasActivos}
              nivel={nivel}
              onCambiarNivel={setNivel}
            />
          </div>
        )}

        {/* Botón modo editor — só para profesores */}
        {esProfesor && (
          <div onClick={() => setModoUsuario(false)}
            style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, padding: '6px 12px', background: 'rgba(10, 16, 32, 0.6)', border: `1px solid ${S.borderColor}`, borderRadius: S.borderRadius, cursor: 'pointer', fontFamily: S.fontBody, letterSpacing: '0.02em' }}>
            <span style={{ fontSize: 11, color: S.colorMuted }}>{t(idioma, 'modoEditor')}</span>
          </div>
        )}

        {/* Barra superior dereita */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          {renderMenuUsuario()}
          <div style={{ width: 1, height: 20, background: S.borderColor }} />
          <button onClick={centrarGaia}
            style={{ padding: '6px 12px', background: 'rgba(10, 16, 32, 0.6)', border: `1px solid ${S.borderColor}`, color: S.colorGold, borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 12, fontFamily: S.fontBody, letterSpacing: '0.02em' }}>
            {t(idioma, 'volverGaia')}
          </button>
          <button onClick={verTodo}
            style={{ padding: '6px 12px', background: 'rgba(10, 16, 32, 0.6)', border: `1px solid ${S.borderColor}`, color: S.colorMuted, borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 12, fontFamily: S.fontBody, letterSpacing: '0.02em' }}>
            {t(idioma, 'verTodo')}
          </button>
          <div style={{ width: 1, height: 20, background: S.borderColor }} />
          {usuario && !usuario.explorador && (
            <button onClick={() => abrirPanel('envio')}
              style={{ padding: '6px 12px', background: 'var(--gaia-constellation-bg)', border: '1px solid var(--gaia-constellation-border)', color: S.accentPrimary, borderRadius: S.borderRadius, cursor: 'pointer', fontSize: 12, fontFamily: S.fontBody, fontWeight: 600, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <IconoMais size={12} /> Enviar
            </button>
          )}
          <div style={{ width: 1, height: 20, background: S.borderColor }} />
          {renderMenuConfig()}
        </div>

        <BuscadorMapa
          nodos={nodos}
          onSeleccionar={id => seleccionarNodoConTransicion(id)}
          nodoActivo={nodoActivo}
          idioma={idioma}
          lupaActiva={lupaActiva}
          onCambiarModo={setLupaActiva}
        />

        <div style={{ display: paneis.arbol ? 'none' : 'contents' }}>
          <MapaUniverso
            ref={mapaRef}
            key="mapa-usuario"
            onNodoSeleccionado={nodo => seleccionarNodoConTransicion(nodo.id)}
            nivel={nivel}
            nodoFoco={nodoActivo?.id}
            config={configMapa}
            onConfigChange={setConfigMapa}
            modoUsuario={true}
            idioma={idioma}
            lupaActiva={lupaActiva}
            centroFiltro={centroFiltro}
            pauseAnimation={paneis.arbol}
            
          />
           
        </div>

        {!lupaActiva && renderPanelLateral()}
        <AsistenteLua nodoActivo={nodoActivo} idioma={idioma} />

        {paneis.envio && (
          <PanelEnvio nodos={nodos} idioma={idioma} onPechar={() => pecharPanel('envio')} />
        )}
      </div>
    )
  }
  // ── FIN: render_modo_usuario ─────────────────────────

  // ── INICIO: render_modo_movil ────────────────────────
  const renderModoMovil = () => (
    <div style={{ display: paneis.arbol ? 'none' : 'contents' }}>
      <MapaUniverso
        ref={mapaRef}
        key="mapa-movil"
        onNodoSeleccionado={nodo => seleccionarNodoConTransicion(nodo.id)}
        nivel={nivel} nodoFoco={nodoActivo?.id}
        config={configMapa} onConfigChange={setConfigMapa}
        modoUsuario={true} idioma={idioma}
        lupaActiva={false} centroFiltro={centroFiltro}
        isMobile={true} pauseAnimation={paneis.arbol}
      />
      {nodoActivo && !paneis.visor && (
        <BottomSheet
          nodoId={nodoActivo.id}
          idioma={idioma} nivel={nivel}
          onCambiarNivel={setNivel}
          onVolver={() => volverAoMapa()}
          onExplorar={() => abrirPanel('visor')}
          seleccionarNodo={seleccionarNodoConTransicion}
        />
      )}
      <BarraInferiorMovil
        nodos={nodos} idioma={idioma}
        onSeleccionar={id => seleccionarNodoConTransicion(id)}
        onEnviar={usuario && !usuario.explorador ? () => abrirPanel('envio') : null}
        onLua={() => togglePanel('lua')}
        luaActiva={paneis.lua}
        onMenu={() => abrirPanel('menuMovil')}
        onGaia={centrarGaia}
      />
      {paneis.envio && (
        <PanelEnvio nodos={nodos} idioma={idioma} onPechar={() => pecharPanel('envio')} />
      )}
      {paneis.lua && <AsistenteLua nodoActivo={nodoActivo} idioma={idioma} />}
      <NotificacionXP eventos={eventosXP} onFin={pecharEventosXP} />

      {/* ═══ MENÚ MÓBIL LATERAL v1.1 ═══ */}
      {paneis.menuMovil && (
        <>
          <div onClick={() => pecharPanel('menuMovil')}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(3, 6, 15, 0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', left: 0, top: 0, bottom: 0,
            width: 'min(300px, 85vw)', zIndex: 61,
            background: 'var(--gaia-cosmos-900)',
            borderRight: `1px solid ${S.borderColor}`,
            display: 'flex', flexDirection: 'column',
            fontFamily: S.fontBody,
            padding: '24px 0',
            boxShadow: '8px 0 48px rgba(0,0,0,0.7)',
            overflowY: 'auto',
            animation: 'menuMovilSlide 280ms cubic-bezier(0.32, 0.72, 0, 1)'
          }}>
            <style>{`
              @keyframes menuMovilSlide {
                from { transform: translateX(-100%); }
                to   { transform: translateX(0); }
              }
            `}</style>

            {/* Cabeceira */}
            <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${S.borderColor}`, marginBottom: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: S.colorGold, letterSpacing: '0.18em', fontFamily: S.fontTitulo }}>GAIA</div>
              <div style={{ fontSize: 11, color: S.colorMuted, marginTop: 4, fontFamily: S.fontMono, letterSpacing: '0.03em' }}>Universo do Coñecemento</div>
              {usuario && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--gaia-cosmos-800)', borderRadius: 10, border: `1px solid ${S.borderColor}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: S.colorText, fontFamily: S.fontBody }}>{usuario.nome}</div>
                  {usuario.centro && (
                    <div style={{ fontSize: 11, color: S.colorMuted, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconoCentro size={11} /> {usuario.centro}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: S.colorGold, marginTop: 4, fontFamily: S.fontMono }}>✦ {xp.total} XP</div>
                  {nivelUsuario && (
                    <div style={{ fontSize: 11, color: nivelUsuario.cor, marginTop: 3, fontFamily: S.fontMono }}>
                      Nv.{nivelUsuario.nivel} — <span style={{ color: S.colorText }}>{nivelUsuario.titulo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Idioma */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.borderColor}` }}>
              <div style={{ fontSize: 10, color: S.colorMuted, letterSpacing: '0.12em', marginBottom: 10, fontFamily: S.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>Idioma</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {idiomasActivos.map(i => (
                  <button key={i} onClick={() => setIdioma(i)}
                    style={{ flex: 1, padding: '8px 0', fontSize: 12, background: idioma === i ? S.colorGold : 'var(--gaia-cosmos-800)', color: idioma === i ? 'var(--gaia-cosmos-900)' : S.colorMuted, border: `1px solid ${idioma === i ? S.colorGold : S.borderColor}`, borderRadius: 8, cursor: 'pointer', fontWeight: idioma === i ? 700 : 500, textTransform: 'uppercase', fontFamily: S.fontBody, letterSpacing: '0.05em', WebkitTapHighlightColor: 'transparent' }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Enlace externo: Ranking */}
            <MenuItemMovil href="/ranking" Icono={IconoTrofeo} label={t(idioma, 'rankingCentros')} color={S.colorGold} />

            {/* Accións */}
            <MenuItemMovil onClick={() => { abrirPanel('arbol');    pecharPanel('menuMovil') }} Icono={IconoArbol}      label={t(idioma, 'arquivoRutas')} />
            <MenuItemMovil onClick={() => { setIntroConAudio(true); setPrimeiroContactoVisto(false); pecharPanel('menuMovil') }} Icono={IconoEstrela} label={t(idioma, 'verIntroduccion')} />
            <MenuItemMovil onClick={() => { abrirPanel('perfil');   pecharPanel('menuMovil') }} Icono={IconoUsuario}    label="O meu perfil" />
            <MenuItemMovil onClick={() => { abrirPanel('historial'); pecharPanel('menuMovil') }} Icono={IconoHistorial}  label={t(idioma, 'meuHistorial')} />
            <MenuItemMovil onClick={() => { const m = toggleMute(); setMutado(m) }} Icono={mutado ? IconoSonOff : IconoSonOn} label={mutado ? t(idioma, 'activarSon') : t(idioma, 'silenciar')} color={mutado ? 'var(--gaia-danger)' : undefined} />
            <MenuItemMovil onClick={() => { logoutCompleto(); pecharPanel('menuMovil') }} Icono={IconoLogout} label={t(idioma, 'cerrarSesion')} color="var(--gaia-danger)" />

            <div style={{ marginTop: 'auto', padding: '20px' }}>
              <button onClick={() => pecharPanel('menuMovil')}
                style={{ width: '100%', padding: '13px', background: 'var(--gaia-cosmos-800)', border: `1px solid ${S.borderColor}`, color: S.colorMuted, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: S.fontBody, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, WebkitTapHighlightColor: 'transparent' }}>
                {t(idioma, 'pechar')} <IconoX size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
  // ── FIN: render_modo_movil ───────────────────────────

  // ── INICIO: render_modo_editor ───────────────────────
  const renderModoEditor = () => (
    <>
      <div style={{ width: 250, borderRight: `1px solid ${S.borderColor}`, padding: 20, overflowY: 'auto', flexShrink: 0, background: S.bgPanel }}>
        <h2 style={{ color: S.colorGold, margin: '0 0 4px 0', fontFamily: S.fontTitulo, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>GAIA</h2>
        <p style={{ color: S.colorMuted, fontSize: 11, margin: '0 0 14px 0', fontFamily: S.fontMono, letterSpacing: '0.05em' }}>Universo do Coñecemento</p>

        <div onClick={() => setModoUsuario(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 14, background: 'var(--gaia-accent-bg)', border: '1px solid var(--gaia-accent-border)', borderRadius: 6, cursor: 'pointer' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: S.colorGold, boxShadow: `0 0 6px ${S.colorGold}` }} />
          <span style={{ fontSize: 11, color: S.colorGold, fontFamily: S.fontBody, letterSpacing: '0.02em' }}>{t(idioma, 'modoEditorUsuario')}</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: S.colorMuted, fontSize: 10, marginBottom: 6, fontFamily: S.fontMono, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{t(idioma, 'nivel')}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {NIVEIS.map(n => (
              <button key={n.id} onClick={() => setNivel(n.id)}
                style={{ flex: 1, padding: 5, background: nivel === n.id ? S.colorGold : 'var(--gaia-cosmos-800)', color: nivel === n.id ? 'var(--gaia-cosmos-900)' : S.colorMuted, border: `1px solid ${S.borderColor}`, borderRadius: 5, cursor: 'pointer', fontSize: 10, fontFamily: S.fontBody, fontWeight: nivel === n.id ? 700 : 500 }}>
                {t(idioma, n.clave)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: S.colorMuted, fontSize: 10, marginBottom: 6, fontFamily: S.fontMono, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{t(idioma, 'idioma')}</div>
          <select value={idioma} onChange={e => setIdioma(e.target.value)}
            style={{ width: '100%', padding: 6, background: 'var(--gaia-cosmos-800)', border: `1px solid ${S.borderColor}`, color: S.colorText, borderRadius: 5, fontSize: 12, cursor: 'pointer', fontFamily: S.fontBody }}>
            {idiomasActivos.map(i => <option key={i} value={i}>{i.toUpperCase()}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            ['explorar','explorar'],['constructor','constructor'],['relacions','relacions'],
            ['editor','editor'],['editorrel','editorRel'],['rutas','rutas'],
            ['editorrutas','editorRutas'],['mapa','mapa'],['import','importar'],
            ['tabela','tabela'],['validacion','validacion']
          ].map(([v, clave]) => (
            <button key={v} onClick={() => setVista(v)}
              style={{ ...btnStyle(vista === v), flex: 'none', padding: '6px 9px' }}>
              {t(idioma, clave)}
            </button>
          ))}
          <button onClick={() => { setVista('mapa'); setMostrarConfigMapa(!mostrarConfigMapa) }}
            style={{ ...btnStyle(mostrarConfigMapa), flex: 'none', padding: '6px 9px' }}>
            {t(idioma, 'configMapa')}
          </button>
        </div>
        {nodos.map(nodo => (
          <div key={nodo.id}
            onClick={() => seleccionarNodoConTransicion(nodo.id)}
            style={{ padding: 10, margin: '5px 0', background: nodoActivo?.id === nodo.id ? 'var(--gaia-cosmos-700)' : 'var(--gaia-cosmos-800)', border: `1px solid ${S.borderColor}`, borderRadius: 6, cursor: 'pointer', borderLeft: `3px solid ${COR_TIPO[nodo.type] || S.colorGold}` }}>
            <div style={{ fontWeight: 600, color: S.colorText, fontSize: 13 }}>{nodo.label}</div>
            <div style={{ color: S.colorMuted, fontSize: 10, fontFamily: S.fontMono, letterSpacing: '0.03em', marginTop: 2 }}>{nodo.type} · {nodo.status}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {mostrarConfigMapa && vista === 'mapa' && (
          <PanelConfigMapa config={configMapa} onChange={setConfigMapa} />
        )}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', filter: transicionando ? 'blur(8px)' : 'blur(0px)', transition: 'filter 300ms ease' }}>
          {vista === 'constructor'  ? <div style={{ flex: 1, overflowY: 'auto' }}><Constructor onNodoCreado={cargarNodos} idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'relacions'   ? <div style={{ flex: 1, overflowY: 'auto' }}><ConstructorRelacions idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'editor'      ? <div style={{ flex: 1, overflowY: 'auto' }}><Editor nodoId={nodoActivo?.id} onGardado={cargarNodos} onBorrado={() => { cargarNodos(); volverAoMapa() }} idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'editorrel'   ? <div style={{ flex: 1, overflowY: 'auto' }}><EditorRelacions idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'rutas'       ? <div style={{ flex: 1, overflowY: 'auto' }}><ConstructorRutas idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'editorrutas' ? <div style={{ flex: 1, overflowY: 'auto' }}><EditorRutas idiomasActivos={idiomasActivos} idioma={idioma} /></div>
          : vista === 'mapa'        ? <div style={{ flex: 1, minHeight: 0 }}><MapaUniverso key="mapa" onNodoSeleccionado={nodo => seleccionarNodoConTransicion(nodo.id)} nivel={nivel} nodoFoco={nodoActivo?.id} config={configMapa} onConfigChange={setConfigMapa} modoUsuario={false} idioma={idioma} lupaActiva={false} /></div>
          : vista === 'tabela'      ? <div style={{ flex: 1, overflowY: 'auto' }}><TabelaNodos onEditarNodo={id => { seleccionarNodoConTransicion(id); setVista('editor') }} onBorrarNodo={(id, label) => {
              fetch(`${API}/nodo/${id}/relacions`).then(r => r.json()).then(data => {
                const numRel = data.relacions?.length || 0
                const aviso  = numRel > 0 ? `\n⚠ Ten ${numRel} relación${numRel !== 1 ? 's' : ''} que tamén serán eliminadas.` : ''
                if (window.confirm(`Borrar o nodo "${label}"?${aviso}\n\nEsta acción non se pode desfacer.`)) {
                  fetch(`${API}/nodo/${id}`, { method: 'DELETE' }).then(r => r.json()).then(d => { if (d.ok) cargarNodos() })
                }
              })
            }} idioma={idioma} /></div>
          : vista === 'import'      ? <div style={{ flex: 1, overflowY: 'auto' }}><ImportadorBulk onImportado={cargarNodos} idioma={idioma} /></div>
          : vista === 'validacion'  ? <div style={{ flex: 1, overflowY: 'auto' }}><PanelValidacion idioma={idioma} onValidado={cargarNodos} /></div>
          : !nodoActivo             ? <div style={{ flex: 1, overflowY: 'auto', color: S.colorMuted, marginTop: 100, textAlign: 'center', fontFamily: S.fontBody }}>{t(idioma, 'seleccionaNodo')}</div>
          : <div style={{ flex: 1, overflowY: 'auto', padding: 30, fontFamily: S.fontBody }}>
              <h1 style={{ color: S.colorGold, fontFamily: S.fontTitulo, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>{nodoActivo.labels?.[idioma] || nodoActivo.labels?.gl}</h1>
              <ContextoBreadcrumb id={nodoActivo.id} idioma={idioma} />
            </div>
          }
        </div>
      </div>
    </>
  )
  // ── FIN: render_modo_editor ──────────────────────────

  // ── INICIO: rutas_especiais ──────────────────────────
  if (window.location.pathname.startsWith('/centro/')) return <DashboardCentro />
  if (window.location.pathname === '/ranking') return <RankingCentros />
  if (window.location.pathname.startsWith('/oberon/profesions/')) {
  const profesionId = window.location.pathname.split('/').pop()
  return <OberonProfesionVista profesionId={profesionId} />
}
  // ── FIN: rutas_especiais ─────────────────────────────
//return <ProbaYggdrasil />
  // ── INICIO: render_principal ─────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--gaia-cosmos-900)', color: S.colorText, fontFamily: S.fontBody }}>

      {!introVista && (
        <IntroGaia onFin={() => setIntroVista(true)} />
      )}

      {introVista && !usuarioVisto && (
        <PantallaUsuario onFin={() => setUsuarioVisto(true)} />
      )}

      {introVista && usuarioVisto && primeiroContactoVisto &&
       !rolVisto && usuario && !esProfesor && !usuario.explorador && (
        <SeleccionRol
          onFin={() => {
            localStorage.setItem('gaia_rol_visto', '1')
            setRolVisto(true)
          }}
          idioma={idioma}
        />
      )}

      {introVista && usuarioVisto && !primeiroContactoVisto && (
        <PrimeiroContacto
          onFin={() => {
            setPrimeiroContactoVisto(true)
            setIntroConAudio(false)
          }}
          idioma={idioma}
          conAudio={introConAudio}
        />
      )}

      {introVista && usuarioVisto && primeiroContactoVisto &&
       (rolVisto || esProfesor || usuario?.explorador) && (
        modoUsuario
          ? renderModoUsuario()
          : esArquitecto
            ? <ModoArquitecto
                onModoUsuario={() => setModoUsuario(true)}
                onModoProfesor={() => {/* pendente */}}
                idioma={idioma}
                cargarNodos={cargarNodos}
                nodos={nodos}
                nodoActivo={nodoActivo}
                seleccionarNodo={seleccionarNodoConTransicion}
                mapaRef={mapaRef}
                configMapa={configMapa}
                setConfigMapa={setConfigMapa}
              />
            : esProfesor
              ? <ModoProfesor
                  onModoUsuario={() => setModoUsuario(true)}
                  onModoArquitecto={() => {/* só arquitectos teñen acceso */}}
                  idioma={idioma}
                  cargarNodos={cargarNodos}
                  nodos={nodos}
                  nodoActivo={nodoActivo}
                  seleccionarNodo={seleccionarNodoConTransicion}
                  mapaRef={mapaRef}
                  configMapa={configMapa}
                  setConfigMapa={setConfigMapa}
                />
              : renderModoEditor()
      )}

      {introVista && usuarioVisto && primeiroContactoVisto && (
        <>
          <PanelXP idioma={idioma} visible={paneis.xp} onCerrar={() => pecharPanel('xp')} />
          <NotificacionXP eventos={eventosXP} onFin={pecharEventosXP} />
          {paneis.historial && (
            <PanelHistorial
              idioma={idioma}
              onPechar={() => pecharPanel('historial')}
              onSeleccionarNodo={id => { seleccionarNodoConTransicion(id); pecharPanel('historial') }}
            />
          )}
          {paneis.perfil && (
            <PanelPerfil
              idioma={idioma}
              onPechar={() => pecharPanel('perfil')}
            />
          )}
          {paneis.oberonTest && (
  <PanelOberonTest
    idioma={idioma}
    onPechar={() => pecharPanel('oberonTest')}
  />
)}
          {paneis.arbol && (
            <ArbolInstitucional
              idioma={idioma}
              onPechar={() => pecharPanel('arbol')}
              onSeleccionarRuta={() => pecharPanel('arbol')}
            />
          )}
        </>
      )}
    </div>
  )
  // ── FIN: render_principal ────────────────────────────
}

// ═══════════════════════════════════════════════════════════
// COMPOÑENTES AUXILIARES (evitan repetición nos menús)
// ═══════════════════════════════════════════════════════════

function MenuItem({ href, onClick, Icono, label, color, ultimo }) {
  const cor = color || 'var(--gaia-text-tertiary)'
  const contido = (
    <>
      <span style={{ color: cor, display: 'grid', placeItems: 'center' }}><Icono /></span>
      <span>{label}</span>
    </>
  )
  const base = {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: 9, borderRadius: 6,
    background: 'transparent', border: 'none',
    color: cor,
    cursor: 'pointer', fontSize: 13, textAlign: 'left',
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
    textDecoration: 'none',
    letterSpacing: '0.01em',
    transition: 'background 150ms ease'
  }
  const wrapperStyle = { padding: '4px 8px', borderBottom: ultimo ? 'none' : '1px solid var(--gaia-cosmos-400)' }
  return (
    <div style={wrapperStyle}>
      {href
        ? <a href={href} style={base}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-800)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {contido}
          </a>
        : <button onClick={onClick} style={base}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-800)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {contido}
          </button>
      }
    </div>
  )
}

function MenuItemMovil({ href, onClick, Icono, label, color }) {
  const cor = color || 'var(--gaia-text-secondary)'
  const contido = (
    <>
      <span style={{ color: cor, display: 'grid', placeItems: 'center' }}><Icono size={16} /></span>
      <span>{label}</span>
    </>
  )
  const base = {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '13px 10px', borderRadius: 8,
    background: 'transparent', border: 'none',
    color: cor,
    cursor: 'pointer', fontSize: 14, textAlign: 'left',
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
    textDecoration: 'none',
    letterSpacing: '0.01em',
    WebkitTapHighlightColor: 'transparent'
  }
  return (
    <div style={{ padding: '4px 12px', borderBottom: '1px solid var(--gaia-cosmos-400)' }}>
      {href
        ? <a href={href} style={base}>{contido}</a>
        : <button onClick={onClick} style={base}>{contido}</button>
      }
    </div>
    
  )
}

export default App