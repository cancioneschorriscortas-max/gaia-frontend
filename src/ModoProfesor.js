import { useState, useEffect, useCallback } from 'react'
import { useUser } from './contexts/UserContext'
import MapaUniverso from './MapaUniverso'
import Editor from './Editor'
import Constructor from './Constructor'
import TabelaNodos from './TabelaNodos'
import ConstructorRutas from './ConstructorRutas'
import ConstructorRelacions from './ConstructorRelacions'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// ModoProfesor — Modo de xestión docente e validación
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Wrapper para o fluxo pedagóxico do profesorado:
// dashboard con estatísticas, bandexa de entrada con propostas
// pendentes de validación, listado de alumnado e xestión de nodos.
//
// NOTA SOBRE O BOTÓN "EDITAR PROPOSTA":
//   Na versión anterior o botón "Editar" dentro dunha proposta levaba
//   á vista de editor pero non cargaba o contido da proposta. Isto era
//   un bug de fluxo. Nesta versión sinaliso claramente que é un TODO
//   (botón "Editar proposta" aparece con aviso) ata que se implemente
//   o fluxo completo de edición de propostas.
//
// API pública sen cambios: onModoUsuario, onModoArquitecto, idioma,
// cargarNodos, nodos, nodoActivo, seleccionarNodo, mapaRef, configMapa,
// setConfigMapa.
// ═══════════════════════════════════════════════════════════


// ── INICIO: cores_tab_semanticas ─────────────────────
const TAB_COR = {
  dashboard: 'var(--gaia-constellation)', // verde xade
  entrada:   'var(--gaia-warning)',        // amarelo (propostas pendentes)
  alumnos:   'var(--gaia-concept)',        // lavanda
  xestion:   'var(--gaia-system)',         // azul xeo
  mapa:      'var(--gaia-accent)'          // ámbar
}
const TAB_COR_FB = {
  dashboard: '#5dd4a8',
  entrada:   '#fbbf24',
  alumnos:   '#9bb3ff',
  xestion:   '#7dd3fc',
  mapa:      '#e8a547'
}
// ── FIN: cores_tab_semanticas ────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoBarras = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </svg>
)
const IconoInbox = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)
const IconoPersoas = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconoLayers = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)
const IconoMapa = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)
const IconoEstrela = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoPlus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconoRede = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)
const IconoLibro = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const IconoEditar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconoEdificio = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" />
    <path d="M9 21V11h6v10" />
    <path d="M12 4L3 8h18z" />
  </svg>
)
const IconoCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoX = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoFlechaEsquerda = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconoReloxo = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconoArquitecto = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const IconoTarget = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icono: IconoBarras,  corKey: 'dashboard' },
  { id: 'entrada',   label: 'Entrada',   Icono: IconoInbox,   corKey: 'entrada' },
  { id: 'alumnos',   label: 'Alumnado',  Icono: IconoPersoas, corKey: 'alumnos' },
  { id: 'xestion',   label: 'Xestión',   Icono: IconoLayers,  corKey: 'xestion' },
  { id: 'mapa',      label: 'Mapa',      Icono: IconoMapa,    corKey: 'mapa' },
]

const VISTAS_XESTION = [
  { id: 'nodos',     Icono: IconoEstrela, label: 'Nodos' },
  { id: 'crear',     Icono: IconoPlus,    label: 'Crear nodo' },
  { id: 'relacions', Icono: IconoRede,    label: 'Relacións' },
  { id: 'rutas',     Icono: IconoLibro,   label: 'Rutas' },
  { id: 'editor',    Icono: IconoEditar,  label: 'Editor' },
]

const CURSOS_LABEL = {
  '5prim': '5º Primaria', '6prim': '6º Primaria',
  '1eso': '1º ESO', '2eso': '2º ESO', '3eso': '3º ESO', '4eso': '4º ESO',
  '1bach': '1º Bacharelato', '2bach': '2º Bacharelato',
  'fpbasica': 'FP Básica', 'fpmedio': 'FP Medio', 'fpsup': 'FP Superior',
  'outro': 'Outro'
}

const ROLES_LABEL = {
  'explorador': 'Explorador',
  'sabio':      'Sabio',
  'construtor': 'Construtor',
  '':           'Sen rol'
}

function ModoProfesor({
  onModoUsuario, onModoArquitecto, idioma = 'gl',
  cargarNodos, nodos, nodoActivo, seleccionarNodo,
  mapaRef, configMapa, setConfigMapa
}) {

  const { usuario, authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [tab,             setTab]             = useState('dashboard')
  const [dashboard,       setDashboard]       = useState(null)
  const [propuestas,      setPropuestas]      = useState([])
  const [propCargando,    setPropCargando]    = useState(true)
  const [propActiva,      setPropActiva]      = useState(null)
  const [motivoRexeite,   setMotivoRexeite]   = useState('')
  const [historial,       setHistorial]       = useState([])
  const [vistaXestion,    setVistaXestion]    = useState('nodos')
  const [alumnos,         setAlumnos]         = useState([])
  const [alumnosCargando, setAlumnosCargando] = useState(true)
  const [filtroCurso,     setFiltroCurso]     = useState('')
  const [filtroRol,       setFiltroRol]       = useState('')
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: cargas ───────────────────────────────────
  const cargarDashboard = useCallback(async () => {
    if (!usuario?.centro) return
    try {
      const res = await fetch(
        `${API}/centro/${encodeURIComponent(usuario.centro)}/dashboard`,
        { headers: authHeaders() }
      )
      setDashboard(await res.json())
    } catch (e) { console.error(e) }
  }, [usuario, authHeaders])

  const cargarPropuestas = useCallback(async () => {
    setPropCargando(true)
    try {
      const res  = await fetch(`${API}/envios-pendentes`, { headers: authHeaders() })
      const data = await res.json()
      setPropuestas(data.envios || [])
    } catch (e) { console.error(e) }
    finally { setPropCargando(false) }
  }, [authHeaders])

  const cargarHistorial = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/historial-profesor`, { headers: authHeaders() })
      const data = await res.json()
      setHistorial(data.accions || [])
    } catch (e) { console.error(e) }
  }, [authHeaders])

  const cargarAlumnos = useCallback(async () => {
    if (!usuario?.centro) { setAlumnosCargando(false); return }
    setAlumnosCargando(true)
    try {
      const res  = await fetch(
        `${API}/centro/${encodeURIComponent(usuario.centro)}/alumnos`,
        { headers: authHeaders() }
      )
      const data = await res.json()
      setAlumnos(data.alumnos || [])
    } catch (e) { console.error(e) }
    finally { setAlumnosCargando(false) }
  }, [usuario, authHeaders])
  // ── FIN: cargas ──────────────────────────────────────

  useEffect(() => {
    cargarDashboard()
    cargarPropuestas()
    cargarHistorial()
    cargarAlumnos()
  }, [cargarDashboard, cargarPropuestas, cargarHistorial, cargarAlumnos])

  // ── INICIO: accion_propuesta ─────────────────────────
  const accionPropuesta = async (id, accion, motivo = '') => {
    try {
      await fetch(`${API}/envio/${id}/${accion}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ motivo })
      })
      setPropuestas(prev => prev.filter(p => p.id !== id))
      setPropActiva(null)
      setMotivoRexeite('')
      cargarNodos()
      cargarDashboard()
      cargarHistorial()
    } catch (e) { console.error(e) }
  }
  // ── FIN: accion_propuesta ────────────────────────────

  // ── INICIO: helpers ──────────────────────────────────
  const corPuntos = (p) => p >= 70 ? 'var(--gaia-success)' : p >= 40 ? 'var(--gaia-accent)' : 'var(--gaia-danger)'
  const corPuntosFB = (p) => p >= 70 ? '#5dd4a8' : p >= 40 ? '#e8a547' : '#f87171'
  const formatData = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('gl-ES', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      })
    } catch { return iso }
  }
  // ── FIN: helpers ─────────────────────────────────────

  // ═══ CABECEIRA ═══════════════════════════════════════
  const renderCabeceira = () => (
    <div style={{
      padding: '0 24px',
      height: 64,
      flexShrink: 0,
      background: 'rgba(15, 23, 41, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--gaia-cosmos-400)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }}>
      {/* Logo + identidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--gaia-font-display)',
          fontSize: 20,
          fontWeight: 900,
          color: 'var(--gaia-accent)',
          letterSpacing: '0.08em',
          lineHeight: 1
        }}>
          GAIA
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--gaia-cosmos-400)' }} />
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 2
          }}>
            Modo profesor
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 600,
            color: 'var(--gaia-text-primary)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <IconoEdificio size={11} />
            {usuario?.centro || 'Sen centro'}
          </div>
        </div>

        {/* Badge de propostas pendentes */}
        {propuestas.length > 0 && (
          <div
            onClick={() => setTab('entrada')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: TAB_COR_FB.entrada + '22',
              border: `1px solid ${TAB_COR_FB.entrada}66`,
              borderRadius: 9999,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              color: TAB_COR.entrada,
              fontWeight: 700,
              transition: 'all 150ms ease',
              animation: 'profPulsePendentes 2.4s ease-in-out infinite'
            }}
            onMouseEnter={e => e.currentTarget.style.background = TAB_COR_FB.entrada + '33'}
            onMouseLeave={e => e.currentTarget.style.background = TAB_COR_FB.entrada + '22'}>
            <IconoInbox size={11} />
            {propuestas.length} pendente{propuestas.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <style>{`
        @keyframes profPulsePendentes {
          0%, 100% { box-shadow: 0 0 0 rgba(251, 191, 36, 0); }
          50%       { box-shadow: 0 0 20px rgba(251, 191, 36, 0.25); }
        }
      `}</style>

      {/* Tabs centrais */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 10,
        padding: 3
      }}>
        {TABS.map(t => {
          const activo = tab === t.id
          const cor = TAB_COR[t.corKey]
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              cursor: 'pointer',
              background: activo ? TAB_COR_FB[t.corKey] + '22' : 'transparent',
              border: 'none',
              color: activo ? cor : 'var(--gaia-text-tertiary)',
              borderRadius: 7,
              fontWeight: activo ? 700 : 500,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => { if (!activo) e.currentTarget.style.color = 'var(--gaia-text-secondary)' }}
            onMouseLeave={e => { if (!activo) e.currentTarget.style.color = 'var(--gaia-text-tertiary)' }}>
              <t.Icono />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Accións dereita */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onModoArquitecto} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          fontSize: 11,
          fontFamily: 'var(--gaia-font-body)',
          cursor: 'pointer',
          background: 'transparent',
          border: '1px solid var(--gaia-cosmos-400)',
          color: 'var(--gaia-text-tertiary)',
          borderRadius: 8,
          transition: 'all 150ms ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
          e.currentTarget.style.color = 'var(--gaia-text-secondary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
          e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
        }}>
          <IconoArquitecto size={11} />
          Arquitecto
        </button>
        <button onClick={onModoUsuario} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px',
          fontSize: 11,
          fontFamily: 'var(--gaia-font-body)',
          fontWeight: 600,
          cursor: 'pointer',
          background: 'var(--gaia-accent-bg)',
          border: '1px solid var(--gaia-accent-border)',
          color: 'var(--gaia-accent)',
          borderRadius: 8,
          transition: 'all 150ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 165, 71, 0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-accent-bg)'}>
          <IconoFlechaEsquerda />
          Modo Usuario
        </button>
      </div>
    </div>
  )

  // ═══ DASHBOARD ═══════════════════════════════════════
  const renderDashboard = () => {
    const porCurso = {}
    alumnos.forEach(a => {
      const c = a.curso || 'outro'
      if (!porCurso[c]) porCurso[c] = []
      porCurso[c].push(a)
    })

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>

        {/* Saudación */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            {new Date().toLocaleDateString('gl-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h2 style={{
            fontFamily: 'var(--gaia-font-display)',
            color: 'var(--gaia-text-primary)',
            margin: '0 0 6px 0',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Benvido{usuario?.nome ? `, ${usuario.nome.split(' ')[0]}` : ''}
          </h2>
          {usuario?.centro && (
            <p style={{
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-secondary)',
              margin: 0,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <IconoEdificio size={12} />
              {usuario.centro}
            </p>
          )}
        </div>

        {/* Cards de estado globais */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 32
        }}>
          {[
            { Icono: IconoInbox,   label: 'Propostas pendentes', valor: propuestas.length,           cor: TAB_COR.entrada,   corFB: TAB_COR_FB.entrada, accion: () => setTab('entrada'), activo: propuestas.length > 0 },
            { Icono: IconoPersoas, label: 'Alumnado do centro',  valor: alumnos.length,              cor: TAB_COR.alumnos,   corFB: TAB_COR_FB.alumnos, accion: () => setTab('alumnos'), activo: false },
            { Icono: IconoTarget,  label: 'Retos feitos',         valor: dashboard?.totalRetos || 0, cor: 'var(--gaia-accent)', corFB: '#e8a547', accion: null, activo: false },
            { Icono: IconoEstrela, label: 'Nodos creados',        valor: dashboard?.totalNodos || 0, cor: TAB_COR.dashboard, corFB: TAB_COR_FB.dashboard, accion: null, activo: false },
          ].map(card => (
            <div key={card.label}
              onClick={card.accion || undefined}
              style={{
                padding: '20px 22px',
                background: card.activo ? card.corFB + '12' : 'var(--gaia-cosmos-800)',
                border: `1px solid ${card.activo ? card.corFB + '44' : 'var(--gaia-cosmos-400)'}`,
                borderRadius: 14,
                cursor: card.accion ? 'pointer' : 'default',
                transition: 'all 200ms ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                if (card.accion) {
                  e.currentTarget.style.background = card.corFB + '1a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (card.accion) {
                  e.currentTarget.style.background = card.activo ? card.corFB + '12' : 'var(--gaia-cosmos-800)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}>

              {/* Liña superior sutil coa cor */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${card.corFB}, transparent)`,
                opacity: card.activo ? 0.7 : 0.3
              }} />

              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 10
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {card.label}
                </div>
                <div style={{ color: card.cor }}>
                  <card.Icono />
                </div>
              </div>

              <div style={{
                fontSize: 30,
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 900,
                color: card.cor,
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                {card.valor}
              </div>

              {card.activo && (
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: card.cor,
                  marginTop: 8,
                  letterSpacing: '0.05em'
                }}>
                  Ver agora →
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 960 ? '1fr' : '1fr 1fr',
          gap: 20,
          marginBottom: 20
        }}>

          {/* Alumnado por curso */}
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14,
            padding: 24
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: TAB_COR.alumnos,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <IconoPersoas size={12} />
              Alumnado por curso
            </div>

            {alumnosCargando && (
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-mono)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Cargando...
              </div>
            )}

            {!alumnosCargando && alumnos.length === 0 && (
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 13,
                textAlign: 'center',
                padding: '20px 0'
              }}>
                Sen alumnado rexistrado.
              </div>
            )}

            {Object.entries(porCurso).map(([curso, lista]) => (
              <div key={curso} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  marginBottom: 6,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--gaia-text-primary)' }}>
                    {CURSOS_LABEL[curso] || curso}
                  </span>
                  <span style={{
                    color: 'var(--gaia-text-tertiary)',
                    fontFamily: 'var(--gaia-font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.025em'
                  }}>
                    {lista.length} alumn{lista.length === 1 ? 'o/a' : 'os/as'}
                  </span>
                </div>
                <div style={{
                  height: 4,
                  background: 'var(--gaia-cosmos-500)',
                  borderRadius: 2,
                  marginBottom: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (lista.length / alumnos.length) * 100)}%`,
                    background: TAB_COR_FB.alumnos,
                    borderRadius: 2,
                    boxShadow: `0 0 6px ${TAB_COR_FB.alumnos}66`,
                    transition: 'width 800ms ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actividade recente */}
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14,
            padding: 24
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <IconoReloxo size={12} />
              Actividade recente
            </div>

            {(!dashboard?.retos || dashboard.retos.length === 0) && (
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 13,
                padding: '20px 0',
                textAlign: 'center'
              }}>
                Sen actividade aínda.
              </div>
            )}

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {dashboard?.retos?.map((r, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  marginBottom: 6,
                  background: 'var(--gaia-cosmos-700)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: `3px solid ${corPuntosFB(r.puntos)}`,
                  borderRadius: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: 600,
                        color: 'var(--gaia-text-primary)'
                      }}>
                        {r.nome}
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {r.nodo}
                      </div>
                      <div style={{
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-mono)',
                        color: 'var(--gaia-text-disabled)',
                        marginTop: 3,
                        letterSpacing: '0.025em'
                      }}>
                        {formatData(r.data)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 18,
                      fontFamily: 'var(--gaia-font-display)',
                      fontWeight: 900,
                      color: corPuntos(r.puntos),
                      flexShrink: 0,
                      marginLeft: 8,
                      lineHeight: 1
                    }}>
                      {String(r.puntos || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historial do profesor */}
        {historial.length > 0 && (
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14,
            padding: 24
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <IconoReloxo size={12} />
              Historial de accións
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {historial.slice(0, 8).map((a, i) => {
                const cor = a.tipo === 'validar'
                  ? 'var(--gaia-success)'
                  : a.tipo === 'rexeitar'
                    ? 'var(--gaia-danger)'
                    : 'var(--gaia-accent)'
                const corFB = a.tipo === 'validar' ? '#5dd4a8' : a.tipo === 'rexeitar' ? '#f87171' : '#e8a547'
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 12px',
                    background: 'var(--gaia-cosmos-700)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderLeft: `3px solid ${corFB}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)'
                  }}>
                    <div style={{ color: cor, flexShrink: 0 }}>
                      {a.tipo === 'validar'
                        ? <IconoCheck />
                        : a.tipo === 'rexeitar'
                          ? <IconoX />
                          : <IconoEditar size={12} />
                      }
                    </div>
                    <span style={{ color: 'var(--gaia-text-primary)', flex: 1 }}>
                      {a.descriccion}
                    </span>
                    <span style={{
                      color: 'var(--gaia-text-disabled)',
                      flexShrink: 0,
                      fontFamily: 'var(--gaia-font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.025em'
                    }}>
                      {formatData(a.data)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═══ ENTRADA ═════════════════════════════════════════
  const renderEntrada = () => (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* Lista de propuestas */}
      <div style={{
        width: propActiva ? 380 : '100%',
        maxWidth: propActiva ? 380 : 'none',
        borderRight: propActiva ? '1px solid var(--gaia-cosmos-400)' : 'none',
        overflowY: 'auto',
        padding: '28px 24px',
        flexShrink: 0,
        transition: 'all 300ms ease',
        background: propActiva ? 'rgba(10, 16, 32, 0.4)' : 'transparent'
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: TAB_COR.entrada,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <IconoInbox size={12} />
          Bandexa de entrada
          {propuestas.length > 0 && (
            <span style={{
              padding: '2px 10px',
              background: TAB_COR_FB.entrada + '22',
              border: `1px solid ${TAB_COR_FB.entrada}44`,
              borderRadius: 9999,
              fontSize: 10,
              color: TAB_COR.entrada,
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              {propuestas.length}
            </span>
          )}
        </div>

        {propCargando && (
          <div style={{
            color: 'var(--gaia-text-tertiary)',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Cargando...
          </div>
        )}

        {!propCargando && propuestas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              display: 'inline-flex',
              width: 52, height: 52,
              borderRadius: '50%',
              background: 'var(--gaia-success-bg)',
              border: '1px solid var(--gaia-success-border)',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--gaia-success)',
              marginBottom: 14
            }}>
              <IconoCheck size={20} />
            </div>
            <div style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              marginBottom: 6
            }}>
              Non hai propuestas pendentes
            </div>
            <div style={{
              color: 'var(--gaia-text-tertiary)',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)'
            }}>
              Todo está ao día.
            </div>
          </div>
        )}

        {propuestas.map(p => {
          const activo = propActiva?.id === p.id
          return (
            <div key={p.id}
              onClick={() => { setPropActiva(activo ? null : p); setMotivoRexeite('') }}
              style={{
                padding: '14px 16px',
                marginBottom: 8,
                background: activo ? TAB_COR_FB.entrada + '12' : 'var(--gaia-cosmos-800)',
                border: `1px solid ${activo ? TAB_COR_FB.entrada + '66' : 'var(--gaia-cosmos-400)'}`,
                borderLeft: `3px solid ${TAB_COR_FB.entrada}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={e => {
                if (!activo) e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
              }}
              onMouseLeave={e => {
                if (!activo) e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
              }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 6
              }}>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  color: 'var(--gaia-text-primary)',
                  flex: 1,
                  minWidth: 0
                }}>
                  {p.label_gl || p.nodo_existente || 'Nodo novo'}
                </div>
                <span style={{
                  fontSize: 9,
                  fontFamily: 'var(--gaia-font-mono)',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: p.nodo_existente
                    ? 'var(--gaia-system-bg)'
                    : 'var(--gaia-concept-bg)',
                  color: p.nodo_existente
                    ? 'var(--gaia-system)'
                    : 'var(--gaia-concept)',
                  border: `1px solid ${p.nodo_existente ? 'var(--gaia-system-border)' : 'var(--gaia-concept-border)'}`,
                  flexShrink: 0,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {p.nodo_existente ? 'Existente' : 'Novo'}
                </span>
              </div>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                marginBottom: 5,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <span>✍ {p.autor_nome || p.autor}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <IconoEdificio size={10} />
                  {p.autor_centro || p.centro}
                </span>
              </div>
              <div style={{
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-tertiary)',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {p.explicacion_gl}
              </div>
              <div style={{
                fontSize: 9,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-disabled)',
                marginTop: 8,
                letterSpacing: '0.025em'
              }}>
                {formatData(p.data)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detalle da propuesta seleccionada */}
      {propActiva && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Cabeceira */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 24
          }}>
            <div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: TAB_COR.entrada,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8
              }}>
                Proposta de alumno/a
              </div>
              <h2 style={{
                fontFamily: 'var(--gaia-font-display)',
                color: 'var(--gaia-text-primary)',
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {propActiva.label_gl || propActiva.nodo_existente || 'Nodo sen título'}
              </h2>
            </div>
            <button
              onClick={() => { setPropActiva(null); setMotivoRexeite('') }}
              style={{
                background: 'transparent',
                border: '1px solid var(--gaia-cosmos-400)',
                color: 'var(--gaia-text-tertiary)',
                borderRadius: '50%',
                width: 32, height: 32,
                cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                flexShrink: 0,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                e.currentTarget.style.color = 'var(--gaia-text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              }}>
              <IconoX size={12} />
            </button>
          </div>

          {/* Info metadata */}
          <div style={{
            padding: '16px 18px',
            marginBottom: 18,
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 18
          }}>
            {[
              { label: 'Alumno/a', valor: propActiva.autor_nome || propActiva.autor },
              { label: 'Centro',   valor: propActiva.autor_centro || propActiva.centro },
              { label: 'Data',     valor: formatData(propActiva.data) },
              { label: 'Tipo',     valor: propActiva.nodo_existente ? 'Mellora de existente' : `Novo: ${propActiva.tipo_nodo || 'concept'}` },
            ].map(item => (
              <div key={item.label}>
                <div style={{
                  fontSize: 9,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  fontWeight: item.label === 'Alumno/a' ? 600 : 500
                }}>
                  {item.valor}
                </div>
              </div>
            ))}
          </div>

          {/* Explicación do alumno/a */}
          <div style={{
            padding: '18px 20px',
            marginBottom: 18,
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderLeft: `3px solid ${TAB_COR_FB.entrada}`,
            borderRadius: 12
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: TAB_COR.entrada,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 10
            }}>
              Explicación da proposta
            </div>
            <p style={{
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-primary)',
              lineHeight: 1.65,
              margin: 0
            }}>
              {propActiva.explicacion_gl}
            </p>
          </div>

          {/* Relacións propostas */}
          {propActiva.relacions?.length > 0 && (
            <div style={{
              padding: '16px 18px',
              marginBottom: 18,
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
                marginBottom: 10
              }}>
                Relacións propostas
              </div>
              {propActiva.relacions.map((r, i) => (
                <div key={i} style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-mono)',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  letterSpacing: '0.025em'
                }}>
                  <span style={{ color: 'var(--gaia-concept)' }}>{r.tipo}</span>
                  <span style={{ color: 'var(--gaia-text-tertiary)' }}>→</span>
                  <span style={{ color: 'var(--gaia-system)' }}>{r.nodo_target}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recurso */}
          {propActiva.recurso_url && (
            <div style={{
              padding: '14px 18px',
              marginBottom: 18,
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
                marginBottom: 6
              }}>
                Recurso adxunto
              </div>
              <a href={propActiva.recurso_url} target="_blank" rel="noreferrer" style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-accent)',
                wordBreak: 'break-all'
              }}>
                {propActiva.recurso_tipo}: {propActiva.recurso_url}
              </a>
            </div>
          )}

          {/* Decisión */}
          <div style={{
            padding: 22,
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 14
          }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 16
            }}>
              Decisión
            </div>

            {/* Motivo rexeite */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                Motivo (se vas rexeitar — chegará ao alumno/a)
              </div>
              <textarea
                value={motivoRexeite}
                onChange={e => setMotivoRexeite(e.target.value)}
                placeholder="Explica por que non se acepta o contido..."
                style={{
                  width: '100%',
                  minHeight: 74,
                  padding: '10px 12px',
                  background: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  color: 'var(--gaia-text-primary)',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  borderRadius: 8,
                  boxSizing: 'border-box',
                  transition: 'border 150ms ease'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Validar */}
              <button
                onClick={() => accionPropuesta(propActiva.id, 'validar')}
                style={{
                  flex: '1 1 120px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  background: 'var(--gaia-success-bg)',
                  border: '1px solid var(--gaia-success-border)',
                  color: 'var(--gaia-success)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(93, 212, 168, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-success-bg)'}>
                <IconoCheck />
                Validar
              </button>

              {/* Editar (marcado como TODO) */}
              <button
                onClick={() => {
                  // TODO: Este botón debería cargar a proposta no editor.
                  // Polo momento só cambia á vista de editor sen pasar o contido.
                  // Pendente de implementación completa do fluxo.
                  alert('Edición de propuestas en desenvolvemento.\n\nPolo momento, podes validar ou rexeitar.\nPara modificar contido, vai a Xestión → Editor logo de validar.')
                }}
                style={{
                  flex: '1 1 120px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  background: 'var(--gaia-cosmos-700)',
                  border: '1px dashed var(--gaia-cosmos-300)',
                  color: 'var(--gaia-text-tertiary)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-600)'
                  e.currentTarget.style.color = 'var(--gaia-text-secondary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
                }}
                title="Funcionalidade en desenvolvemento">
                <IconoEditar size={12} />
                Editar (beta)
              </button>

              {/* Rexeitar */}
              <button
                onClick={() => {
                  if (!motivoRexeite.trim()) {
                    alert('Escribe un motivo antes de rexeitar')
                    return
                  }
                  accionPropuesta(propActiva.id, 'rexeitar', motivoRexeite)
                }}
                style={{
                  flex: '1 1 120px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  background: 'var(--gaia-danger-bg)',
                  border: '1px solid var(--gaia-danger-border)',
                  color: 'var(--gaia-danger)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                <IconoX />
                Rexeitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ═══ ALUMNOS ═════════════════════════════════════════
  const renderAlumnos = () => {
    const alumnosFiltrados = alumnos.filter(a => {
      if (filtroCurso && a.curso !== filtroCurso) return false
      if (filtroRol && a.rol_personaxe !== filtroRol) return false
      return true
    })

    const porCurso = {}
    alumnosFiltrados.forEach(a => {
      const c = a.curso || 'outro'
      if (!porCurso[c]) porCurso[c] = []
      porCurso[c].push(a)
    })

    const cursosOrdenados = Object.keys(CURSOS_LABEL).filter(c => porCurso[c])

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: TAB_COR.alumnos,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <IconoPersoas size={12} />
            Alumnado do centro · <span style={{ color: 'var(--gaia-text-primary)' }}>{alumnosFiltrados.length} resultados</span>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={filtroCurso}
              onChange={e => setFiltroCurso(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: 'var(--gaia-font-body)',
                background: filtroCurso ? TAB_COR_FB.alumnos + '18' : 'var(--gaia-cosmos-800)',
                border: `1px solid ${filtroCurso ? TAB_COR_FB.alumnos : 'var(--gaia-cosmos-400)'}`,
                color: filtroCurso ? TAB_COR.alumnos : 'var(--gaia-text-tertiary)',
                borderRadius: 8,
                cursor: 'pointer',
                outline: 'none'
              }}>
              <option value="">Todos os cursos</option>
              {Object.entries(CURSOS_LABEL).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <select
              value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: 'var(--gaia-font-body)',
                background: filtroRol ? TAB_COR_FB.alumnos + '18' : 'var(--gaia-cosmos-800)',
                border: `1px solid ${filtroRol ? TAB_COR_FB.alumnos : 'var(--gaia-cosmos-400)'}`,
                color: filtroRol ? TAB_COR.alumnos : 'var(--gaia-text-tertiary)',
                borderRadius: 8,
                cursor: 'pointer',
                outline: 'none'
              }}>
              <option value="">Todos os roles</option>
              {Object.entries(ROLES_LABEL).filter(([id]) => id !== '').map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            {(filtroCurso || filtroRol) && (
              <button
                onClick={() => { setFiltroCurso(''); setFiltroRol('') }}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)',
                  background: 'transparent',
                  border: '1px solid var(--gaia-cosmos-400)',
                  color: 'var(--gaia-text-tertiary)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                <IconoX size={10} />
                Limpar
              </button>
            )}
          </div>
        </div>

        {alumnosCargando && (
          <div style={{
            color: 'var(--gaia-text-tertiary)',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Cargando alumnado...
          </div>
        )}

        {!alumnosCargando && alumnosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              display: 'inline-flex',
              color: 'var(--gaia-cosmos-300)',
              marginBottom: 14
            }}>
              <IconoPersoas size={44} />
            </div>
            <div style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)'
            }}>
              Non hai alumnado con eses filtros.
            </div>
          </div>
        )}

        {cursosOrdenados.map(curso => (
          <div key={curso} style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid var(--gaia-cosmos-400)'
            }}>
              <div style={{
                fontSize: 14,
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 700,
                color: TAB_COR.alumnos,
                letterSpacing: '-0.01em'
              }}>
                {CURSOS_LABEL[curso] || curso}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.05em'
              }}>
                {porCurso[curso].length} alumn{porCurso[curso].length === 1 ? 'o/a' : 'os/as'}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 10
            }}>
              {porCurso[curso].map(a => (
                <div key={a.id} style={{
                  padding: '14px 16px',
                  background: 'var(--gaia-cosmos-800)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: `3px solid ${corPuntosFB(a.media)}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-cosmos-800)'}>

                  {/* Cabeceira */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: 13,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: 600,
                        color: 'var(--gaia-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {a.nome}
                      </div>
                      <div style={{
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-mono)',
                        color: 'var(--gaia-text-tertiary)',
                        marginTop: 2,
                        letterSpacing: '0.025em'
                      }}>
                        {CURSOS_LABEL[a.curso] || a.curso}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 18,
                      fontFamily: 'var(--gaia-font-display)',
                      fontWeight: 900,
                      color: corPuntos(a.media),
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      flexShrink: 0,
                      marginLeft: 10
                    }}>
                      {String(a.media || 0)}
                    </div>
                  </div>

                  {/* Tags */}
                  {(a.rol_personaxe || a.profesion_personaxe) && (
                    <div style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginBottom: 10
                    }}>
                      {a.rol_personaxe && (
                        <span style={{
                          fontSize: 9,
                          fontFamily: 'var(--gaia-font-body)',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: 'var(--gaia-concept-bg)',
                          color: 'var(--gaia-concept)',
                          border: '1px solid var(--gaia-concept-border)',
                          letterSpacing: '0.025em'
                        }}>
                          {ROLES_LABEL[a.rol_personaxe] || a.rol_personaxe}
                        </span>
                      )}
                      {a.profesion_personaxe && (
                        <span style={{
                          fontSize: 9,
                          fontFamily: 'var(--gaia-font-body)',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: 'var(--gaia-cosmos-700)',
                          color: 'var(--gaia-text-tertiary)',
                          border: '1px solid var(--gaia-cosmos-400)',
                          letterSpacing: '0.025em'
                        }}>
                          {a.profesion_personaxe}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-mono)',
                    letterSpacing: '0.025em',
                    marginBottom: 8
                  }}>
                    <span style={{ color: 'var(--gaia-text-tertiary)' }}>
                      {String(a.totalRetos || 0)} retos
                    </span>
                    <span style={{ color: 'var(--gaia-accent)', fontWeight: 600 }}>
                      {String(a.xp_total || 0)} XP
                    </span>
                  </div>

                  {/* Barra de progreso (media) */}
                  <div style={{
                    height: 3,
                    background: 'var(--gaia-cosmos-500)',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (a.media || 0))}%`,
                      background: corPuntosFB(a.media),
                      borderRadius: 2,
                      transition: 'width 600ms ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ═══ XESTIÓN ═════════════════════════════════════════
  const renderXestion = () => (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{
        width: 200,
        borderRight: '1px solid var(--gaia-cosmos-400)',
        padding: '20px 12px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'rgba(10, 16, 32, 0.3)'
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 10,
          padding: '0 8px',
          fontWeight: 600
        }}>
          Xestión
        </div>
        {VISTAS_XESTION.map(v => {
          const activo = vistaXestion === v.id
          return (
            <button
              key={v.id}
              onClick={() => setVistaXestion(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                cursor: 'pointer',
                background: activo ? TAB_COR_FB.xestion + '1a' : 'transparent',
                border: `1px solid ${activo ? TAB_COR_FB.xestion + '44' : 'transparent'}`,
                color: activo ? TAB_COR.xestion : 'var(--gaia-text-tertiary)',
                borderRadius: 8,
                textAlign: 'left',
                fontWeight: activo ? 600 : 500,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                if (!activo) {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  e.currentTarget.style.color = 'var(--gaia-text-secondary)'
                }
              }}
              onMouseLeave={e => {
                if (!activo) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
                }
              }}>
              <v.Icono />
              {v.label}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {vistaXestion === 'nodos' && (
          <TabelaNodos
            onEditarNodo={id => { seleccionarNodo(id); setVistaXestion('editor') }}
            onBorrarNodo={(id, label) => {
              if (window.confirm(`Borrar "${label}"?`)) {
                fetch(`${API}/nodo/${id}`, { method: 'DELETE', headers: authHeaders() })
                  .then(r => r.json()).then(d => { if (d.ok) cargarNodos() })
              }
            }}
            idioma={idioma}
          />
        )}
        {vistaXestion === 'crear' && (
          <Constructor
            onNodoCreado={() => { cargarNodos(); setVistaXestion('nodos') }}
            idiomasActivos={['gl', 'es', 'en']}
            idioma={idioma}
          />
        )}
        {vistaXestion === 'relacions' && (
          <ConstructorRelacions idiomasActivos={['gl', 'es', 'en']} idioma={idioma} />
        )}
        {vistaXestion === 'rutas' && (
          <ConstructorRutas idiomasActivos={['gl', 'es', 'en']} idioma={idioma} />
        )}
        {vistaXestion === 'editor' && (
          <Editor
            nodoId={nodoActivo?.id}
            onGardado={() => { cargarNodos(); setVistaXestion('nodos') }}
            onBorrado={() => { cargarNodos(); setVistaXestion('nodos') }}
            idiomasActivos={['gl', 'es', 'en']}
            idioma={idioma}
          />
        )}
      </div>
    </div>
  )

  // ═══ MAPA ════════════════════════════════════════════
  const renderMapa = () => (
    <div style={{ flex: 1, position: 'relative' }}>

      {/* Botón flotante "Ver este nodo" cando hai nodoActivo */}
      {nodoActivo && (
        <button
          onClick={() => { setVistaXestion('editor'); setTab('xestion') }}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 16px',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'var(--gaia-accent)',
            color: 'var(--gaia-cosmos-900)',
            border: '1px solid var(--gaia-accent)',
            borderRadius: 8,
            boxShadow: '0 0 20px rgba(232, 165, 71, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
          <IconoEditar size={13} />
          Editar este nodo
        </button>
      )}

      <MapaUniverso
        ref={mapaRef}
        key="mapa-profesor"
        onNodoSeleccionado={nodo => seleccionarNodo(nodo.id)}
        nivel="expert"
        nodoFoco={nodoActivo?.id}
        config={configMapa}
        onConfigChange={setConfigMapa}
        modoUsuario={false}
        idioma={idioma}
        lupaActiva={false}
      />
    </div>
  )

  // ═══ RENDERIZADO PRINCIPAL ═══════════════════════════
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--gaia-cosmos-900)',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      overflow: 'hidden'
    }}>
      {renderCabeceira()}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'entrada'   && renderEntrada()}
        {tab === 'alumnos'   && renderAlumnos()}
        {tab === 'xestion'   && renderXestion()}
        {tab === 'mapa'      && renderMapa()}
      </div>
    </div>
  )
}

export default ModoProfesor