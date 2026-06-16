import { useState } from 'react'
import { useUser } from './contexts/UserContext'
import MapaUniverso from './MapaUniverso'
import Editor from './Editor'
import Constructor from './Constructor'
import TabelaNodos from './TabelaNodos'
import EditorRutas from './EditorRutas'
import EditorRelacions from './EditorRelacions'
import ImportadorBulk from './ImportadorBulk'
import PanelConfigMapa from './PanelConfigMapa'
import ConstructorRutas from './ConstructorRutas'

// ═══════════════════════════════════════════════════════════
// ModoArquitecto — Modo admin técnico do proxecto
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Wrapper para o modo editor con múltiples tabs.
//
// BUGS ARRANXADOS:
//   1. setTab(`rutas_${v.id}`) rompía a navegación porque non existía
//      case correspondente. Agora usa estado separado `vistaRutas`.
//   2. ConstructorRutas estaba importado pero non utilizado. Agora
//      úsase cando vistaRutas === 'crear'.
//   3. Engadido botón "Editar este nodo" flotante no mapa cando hai
//      nodoActivo — facilita o fluxo mapa→editor.
//
// API pública sen cambios: onModoUsuario, onModoProfesor, idioma,
// cargarNodos, nodos, nodoActivo, seleccionarNodo, mapaRef, configMapa,
// setConfigMapa.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cores_tab_semanticas ─────────────────────
// Cada tab ten unha cor semántica da paleta GAIA v1.1
const TAB_COR = {
  mapa:     'var(--gaia-accent)',       // ámbar (principal)
  nodos:    'var(--gaia-constellation)', // verde xade
  relacion: 'var(--gaia-concept)',       // lavanda
  rutas:    'var(--gaia-system)',        // azul xeo
  importar: 'var(--gaia-warning)',       // amarelo aviso
  config:   'var(--gaia-process)'        // coral-rosa
}
const TAB_COR_FB = {
  mapa:     '#e8a547',
  nodos:    '#5dd4a8',
  relacion: '#9bb3ff',
  rutas:    '#7dd3fc',
  importar: '#fbbf24',
  config:   '#ff9fb8'
}
// ── FIN: cores_tab_semanticas ────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
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
const IconoImportar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const IconoConfig = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const IconoPlus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconoEditar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconoFlechaEsquerda = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconoProfesor = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)
const IconoCopiar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: definicion_tabs ──────────────────────────
const TABS = [
  { id: 'mapa',     label: 'Mapa',      Icono: IconoMapa,      corKey: 'mapa' },
  { id: 'nodos',    label: 'Nodos',     Icono: IconoEstrela,   corKey: 'nodos' },
  { id: 'relacion', label: 'Relacións', Icono: IconoRede,      corKey: 'relacion' },
  { id: 'rutas',    label: 'Rutas',     Icono: IconoLibro,     corKey: 'rutas' },
  { id: 'importar', label: 'Importar',  Icono: IconoImportar,  corKey: 'importar' },
  { id: 'config',   label: 'Config',    Icono: IconoConfig,    corKey: 'config' },
]

const VISTAS_NODOS = [
  { id: 'tabela',  Icono: IconoEstrela, label: 'Todos os nodos' },
  { id: 'crear',   Icono: IconoPlus,    label: 'Crear nodo' },
  { id: 'editor',  Icono: IconoEditar,  label: 'Editor' },
]

const VISTAS_RUTAS = [
  { id: 'crear',  Icono: IconoPlus,   label: 'Crear ruta' },
  { id: 'editar', Icono: IconoEditar, label: 'Editar rutas' },
]
// ── FIN: definicion_tabs ─────────────────────────────

function ModoArquitecto({
  onModoUsuario, onModoProfesor, idioma = 'gl',
  cargarNodos, nodos, nodoActivo, seleccionarNodo,
  mapaRef, configMapa, setConfigMapa
}) {

  const { usuario, authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [tab,           setTab]           = useState('mapa')
  const [vistaNodos,    setVistaNodos]    = useState('tabela')
  const [vistaRutas,    setVistaRutas]    = useState('editar')
  const [mostrarConfig, setMostrarConfig] = useState(false)
  // ── FIN: estados ─────────────────────────────────────

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
      {/* ─── Logo + identidade ─── */}
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
            Modo arquitecto
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 600,
            color: 'var(--gaia-text-primary)'
          }}>
            {usuario?.nome || 'Arquitecto'}
          </div>
        </div>
      </div>

      {/* ─── Tabs centrais ─── */}
      <div style={{
        display: 'flex',
        gap: 2,
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 10,
        padding: 3
      }}>
        {TABS.map(t => {
          const activo = tab === t.id
          const cor = TAB_COR[t.corKey]
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                cursor: 'pointer',
                background: activo
                  ? TAB_COR_FB[t.corKey] + '22'
                  : 'transparent',
                border: 'none',
                color: activo ? cor : 'var(--gaia-text-tertiary)',
                borderRadius: 7,
                fontWeight: activo ? 700 : 500,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                if (!activo) e.currentTarget.style.color = 'var(--gaia-text-secondary)'
              }}
              onMouseLeave={e => {
                if (!activo) e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              }}>
              <t.Icono />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ─── Accións dereita ─── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onModoProfesor} style={{
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
          <IconoProfesor size={12} />
          Profesor
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

  // ═══ MAPA ════════════════════════════════════════════
  const renderMapa = () => (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {mostrarConfig && (
        <PanelConfigMapa config={configMapa} onChange={setConfigMapa} />
      )}
      <div style={{ flex: 1, position: 'relative' }}>

        {/* Botón config mapa (esquerda arriba) */}
        <button
          onClick={() => setMostrarConfig(v => !v)}
          style={{
            position: 'absolute', top: 16, left: 16, zIndex: 10,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-body)',
            cursor: 'pointer',
            background: mostrarConfig
              ? TAB_COR_FB.config + '22'
              : 'rgba(15, 23, 41, 0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${mostrarConfig
              ? TAB_COR_FB.config + '66'
              : 'var(--gaia-cosmos-400)'}`,
            color: mostrarConfig ? TAB_COR.config : 'var(--gaia-text-secondary)',
            borderRadius: 8,
            fontWeight: mostrarConfig ? 600 : 500,
            transition: 'all 200ms ease'
          }}>
          <IconoConfig size={12} /> Config mapa
        </button>

        {/* BOTÓN FLOTANTE "EDITAR ESTE NODO" — MELLORA UX */}
        {/* Aparece só cando hai un nodo seleccionado.
            Leva directo a tab=nodos, vistaNodos=editor */}
        {nodoActivo && (
          <button
            onClick={() => { setTab('nodos'); setVistaNodos('editor') }}
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
              transition: 'all 150ms ease',
              animation: 'arquitectoEditarPulse 2.4s ease-in-out infinite'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 28px rgba(232, 165, 71, 0.45), 0 6px 16px rgba(0, 0, 0, 0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(232, 165, 71, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
            <IconoEditar size={13} />
            Editar este nodo
          </button>
        )}

        <style>{`
          @keyframes arquitectoEditarPulse {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-2px); }
          }
        `}</style>

        <MapaUniverso
          ref={mapaRef}
          key="mapa-arquitecto"
          onNodoSeleccionado={nodo => {
            // BUG ARRANXADO: antes movíase automaticamente á tab "nodos"
            // cando clicabas un nodo, pero iso rompía a UX de navegación
            // do mapa. Agora só selecciona o nodo e o botón flotante
            // "Editar este nodo" permite ir ao editor se se quere.
            seleccionarNodo(nodo.id)
          }}
          nivel="expert"
          nodoFoco={nodoActivo?.id}
          config={configMapa}
          onConfigChange={setConfigMapa}
          modoUsuario={false}
          idioma={idioma}
          lupaActiva={false}
        />
      </div>
    </div>
  )

  // ═══ NODOS ═══════════════════════════════════════════
  const renderNodos = () => (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Sub-navegación esquerda */}
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
          Nodos
        </div>
        {VISTAS_NODOS.map(v => {
          const activo = vistaNodos === v.id
          return (
            <button
              key={v.id}
              onClick={() => setVistaNodos(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                cursor: 'pointer',
                background: activo
                  ? TAB_COR_FB.nodos + '1a'
                  : 'transparent',
                border: `1px solid ${activo ? TAB_COR_FB.nodos + '44' : 'transparent'}`,
                color: activo ? TAB_COR.nodos : 'var(--gaia-text-tertiary)',
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

      {/* Contido dereita */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {vistaNodos === 'tabela' && (
          <TabelaNodos
            onEditarNodo={id => { seleccionarNodo(id); setVistaNodos('editor') }}
            onBorrarNodo={(id, label) => {
              if (window.confirm(`Borrar "${label}"?\n\nEsta acción non se pode desfacer.`)) {
                fetch(`${API}/nodo/${id}`, { method: 'DELETE', headers: authHeaders() })
                  .then(r => r.json())
                  .then(d => { if (d.ok) cargarNodos() })
              }
            }}
            idioma={idioma}
          />
        )}
        {vistaNodos === 'crear' && (
          <Constructor
            onNodoCreado={() => { cargarNodos(); setVistaNodos('tabela') }}
            idiomasActivos={['gl', 'es', 'en']}
            idioma={idioma}
          />
        )}
        {vistaNodos === 'editor' && (
          <Editor
            nodoId={nodoActivo?.id}
            onGardado={() => { cargarNodos(); setVistaNodos('tabela') }}
            onBorrado={() => { cargarNodos(); setVistaNodos('tabela') }}
            idiomasActivos={['gl', 'es', 'en']}
            idioma={idioma}
          />
        )}
      </div>
    </div>
  )

  // ═══ RELACIÓNS ═══════════════════════════════════════
  const renderRelacions = () => (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <EditorRelacions idiomasActivos={['gl', 'es', 'en']} idioma={idioma} />
    </div>
  )

  // ═══ RUTAS (BUG ARRANXADO) ═══════════════════════════
  // Antes: setTab(`rutas_${v.id}`) ia a un estado que non existía → pantalla en branco
  // Agora: estado separado `vistaRutas` con 'crear' | 'editar'
  const renderRutas = () => (
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
          Rutas
        </div>
        {VISTAS_RUTAS.map(v => {
          const activo = vistaRutas === v.id
          return (
            <button
              key={v.id}
              onClick={() => setVistaRutas(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                cursor: 'pointer',
                background: activo
                  ? TAB_COR_FB.rutas + '1a'
                  : 'transparent',
                border: `1px solid ${activo ? TAB_COR_FB.rutas + '44' : 'transparent'}`,
                color: activo ? TAB_COR.rutas : 'var(--gaia-text-tertiary)',
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
        {vistaRutas === 'crear' && (
          <ConstructorRutas idiomasActivos={['gl', 'es', 'en']} idioma={idioma} />
        )}
        {vistaRutas === 'editar' && (
          <EditorRutas idiomasActivos={['gl', 'es', 'en']} idioma={idioma} />
        )}
      </div>
    </div>
  )

  // ═══ IMPORTAR ════════════════════════════════════════
  const renderImportar = () => (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <ImportadorBulk onImportado={cargarNodos} idioma={idioma} />
    </div>
  )

  // ═══ CONFIG ══════════════════════════════════════════
  const renderConfig = () => (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <PanelConfigMapa config={configMapa} onChange={setConfigMapa} />
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>

        {/* Cabeceira da sección */}
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: TAB_COR.config,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoConfig size={12} />
          Configuración do sistema
        </div>
        <h2 style={{
          fontFamily: 'var(--gaia-font-display)',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--gaia-text-primary)',
          margin: '0 0 28px 0',
          letterSpacing: '-0.01em'
        }}>
          Parámetros globais
        </h2>

        {/* Estado do grafo */}
        <div style={{
          padding: '22px 26px',
          marginBottom: 16,
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 14
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 14
          }}>
            Estado do grafo
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Nodos totais', valor: nodos.length, cor: TAB_COR.nodos, corFB: TAB_COR_FB.nodos },
              { label: 'Validados',    valor: nodos.filter(n => n.status === 'validated').length, cor: 'var(--gaia-success)', corFB: '#5dd4a8' },
              { label: 'Borradores',   valor: nodos.filter(n => n.status === 'draft').length, cor: 'var(--gaia-warning)', corFB: '#fbbf24' },
            ].map(m => (
              <div key={m.label}>
                <div style={{
                  fontSize: 28,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 900,
                  color: m.cor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {m.valor}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 4
                }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exportar config */}
        <div style={{
          padding: '22px 26px',
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 14
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6
          }}>
            Exportar configuración
          </div>
          <p style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
            maxWidth: '60ch'
          }}>
            Copia a configuración actual do mapa para persistila en <code style={{
              fontFamily: 'var(--gaia-font-mono)',
              background: 'var(--gaia-accent-bg)',
              color: 'var(--gaia-accent)',
              padding: '1px 6px',
              borderRadius: 3,
              fontSize: 12
            }}>mapaConfig.js</code>.
          </p>
          <button
            onClick={() => {
              const texto = `const MAPA_CONFIG = ${JSON.stringify(configMapa, null, 2)}\n\nexport default MAPA_CONFIG`
              navigator.clipboard.writeText(texto)
              alert('Config copiado ao portapapeis — pega en mapaConfig.js')
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--gaia-accent-bg)',
              border: '1px solid var(--gaia-accent-border)',
              color: 'var(--gaia-accent)',
              borderRadius: 8,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gaia-accent)'
              e.currentTarget.style.color = 'var(--gaia-cosmos-900)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--gaia-accent-bg)'
              e.currentTarget.style.color = 'var(--gaia-accent)'
            }}>
            <IconoCopiar />
            Copiar mapaConfig.js
          </button>
        </div>
      </div>
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
        {tab === 'mapa'     && renderMapa()}
        {tab === 'nodos'    && renderNodos()}
        {tab === 'relacion' && renderRelacions()}
        {tab === 'rutas'    && renderRutas()}
        {tab === 'importar' && renderImportar()}
        {tab === 'config'   && renderConfig()}
      </div>
    </div>
  )
}

export default ModoArquitecto