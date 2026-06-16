import { useState, useEffect, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// EditorRutas — Edición de rutas pedagóxicas (journeys)
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idiomasActivos, idioma.
// Endpoints backend INTACTOS.
//
// BUG CRÍTICO ARRANXADO: os 6 fetches non levaban authHeaders().
// Carga de rutas, carga de nodos, carga dunha ruta específica, gardar
// metadatos, gardar stops e borrar ruta — todos fallaban con 401.
//
// MELLORAS:
//   1. authHeaders() en todos os 6 fetches.
//   2. Split view: lista de rutas á esquerda + editor á dereita.
//   3. Modal de confirmación para borrar ruta (non window.confirm).
//   4. Mensaxes tipadas con auto-dismiss.
//   5. Campo MÓDULO con datalist.
//   6. Reorder de stops con ↑↓ SVG en vez de texto.
// ═══════════════════════════════════════════════════════════


const COR_TIPO = {
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}

// ── INICIO: iconos_svg ───────────────────────────────
const IconoCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoAviso = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconoPapeleira = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)
const IconoX = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoArriba = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)
const IconoAbaixo = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconoLibro = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const IconoLupa = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconoGardar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function EditorRutas({ idiomasActivos = ['gl', 'es', 'en'], idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [journeys, setJourneys]   = useState([])
  const [nodos, setNodos]         = useState([])
  const [rutaActiva, setRutaActiva] = useState(null)
  const [form, setForm]           = useState(null)
  const [stops, setStops]         = useState([])
  const [busca, setBusca]         = useState('')
  const [buscaNodo, setBuscaNodo] = useState('')
  const [mensaxe, setMensaxe]     = useState(null)
  const [tabIdioma, setTabIdioma] = useState(idiomasActivos[0] || 'gl')
  const [modalBorrar, setModalBorrar] = useState(false)
  const mensaxeTimerRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_inicial ────────────────────────────
  useEffect(() => {
    fetch(`${API}/journeys`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setJourneys(d.journeys || []))
      .catch(e => console.error('[EditorRutas] Erro journeys:', e))

    fetch(`${API}/nodos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setNodos(d.nodos || []))
      .catch(e => console.error('[EditorRutas] Erro nodos:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── FIN: carga_inicial ───────────────────────────────

  // ── INICIO: mensaxe_helper ───────────────────────────
  const mostrarMensaxe = (tipo, texto) => {
    if (mensaxeTimerRef.current) clearTimeout(mensaxeTimerRef.current)
    setMensaxe({ tipo, texto })
    if (tipo === 'ok') {
      mensaxeTimerRef.current = setTimeout(() => setMensaxe(null), 4000)
    }
  }
  // ── FIN: mensaxe_helper ──────────────────────────────

  // ── INICIO: seleccionar_ruta ─────────────────────────
  const seleccionarRuta = (j) => {
    setRutaActiva(j)
    setBusca('')
    setMensaxe(null)

    fetch(`${API}/journeys/${j.id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        const campos = {
          level:      data.level      || 'primary',
          type:       data.type       || 'educational',
          status:     data.status     || 'draft',
          visibility: data.visibility || 'private',
          modulo:     data.modulo     || '',
          icono:      data.icono      || '📚'
        }
        idiomasActivos.forEach(i => {
          campos[`label_${i}`]       = data.label?.[i]       || data.label?.gl       || ''
          campos[`description_${i}`] = data.description?.[i] || data.description?.gl || ''
        })
        setForm(campos)
        setStops((data.stops || []).filter(s => s.nodo !== null))
      })
      .catch(e => {
        console.error('[EditorRutas] Erro cargando ruta:', e)
        mostrarMensaxe('erro', 'Non se puido cargar a ruta')
      })
  }
  // ── FIN: seleccionar_ruta ────────────────────────────

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── INICIO: xestión_stops ────────────────────────────
  const borrarStop = (index) => {
    const novos = stops.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }))
    setStops(novos)
  }

  const moverStop = (index, dir) => {
    if (dir === 'up' && index === 0) return
    if (dir === 'down' && index === stops.length - 1) return
    const novos = [...stops]
    const swap = dir === 'up' ? index - 1 : index + 1
    ;[novos[index], novos[swap]] = [novos[swap], novos[index]]
    setStops(novos.map((s, i) => ({ ...s, order: i + 1 })))
  }

  const engadirStop = (nodo) => {
    if (stops.find(s => s.nodo?.id === nodo.id)) return
    setStops([...stops, {
      order: stops.length + 1,
      nodo: { id: nodo.id, label_gl: nodo.label, type: nodo.type }
    }])
    setBuscaNodo('')
  }
  // ── FIN: xestión_stops ───────────────────────────────

  // ── INICIO: gardar_ruta ──────────────────────────────
  const gardarRuta = async () => {
    try {
      const res = await fetch(`${API}/journeys/${rutaActiva.id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[EditorRutas] PUT metadatos error:', res.status)
        return
      }

      const data = await res.json()
      console.log('[EditorRutas] Resposta gardar metadatos:', data)

      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'metadatosGardados') || 'Metadatos gardados')
        // recargar lista
        fetch(`${API}/journeys`, { headers: authHeaders() })
          .then(r => r.json())
          .then(d => setJourneys(d.journeys || []))
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido gardar'}`)
      }
    } catch (e) {
      console.error('[EditorRutas] Excepción gardar:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || ''}`)
    }
  }
  // ── FIN: gardar_ruta ─────────────────────────────────

  // ── INICIO: gardar_stops ─────────────────────────────
  const gardarStops = async () => {
    try {
      const res = await fetch(`${API}/journeys/${rutaActiva.id}/stops`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: stops.map(s => ({ nodo: s.nodo.id, order: s.order }))
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[EditorRutas] PUT stops error:', res.status)
        return
      }

      const data = await res.json().catch(() => ({}))
      console.log('[EditorRutas] Resposta gardar stops:', data)
      mostrarMensaxe('ok', t(idioma, 'pasosGardados') || 'Pasos gardados')
    } catch (e) {
      console.error('[EditorRutas] Excepción gardar stops:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || ''}`)
    }
  }
  // ── FIN: gardar_stops ────────────────────────────────

  // ── INICIO: borrar_ruta ──────────────────────────────
  const executarBorrarRuta = async () => {
    try {
      const res = await fetch(`${API}/journeys/${rutaActiva.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        setModalBorrar(false)
        return
      }

      setJourneys(journeys.filter(j => j.id !== rutaActiva.id))
      setRutaActiva(null)
      setForm(null)
      setStops([])
      setModalBorrar(false)
      mostrarMensaxe('ok', 'Ruta eliminada')
    } catch (e) {
      console.error('[EditorRutas] Excepción borrar:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || ''}`)
      setModalBorrar(false)
    }
  }
  // ── FIN: borrar_ruta ─────────────────────────────────

  // ── INICIO: filtros ──────────────────────────────────
  const journeysFiltradas = journeys.filter(j =>
    j.label?.gl?.toLowerCase().includes(busca.toLowerCase()) ||
    j.label?.[idioma]?.toLowerCase().includes(busca.toLowerCase()) ||
    j.id?.toLowerCase().includes(busca.toLowerCase())
  )

  const nodosFiltrados = nodos.filter(n =>
    !stops.find(s => s.nodo?.id === n.id) &&
    (n.label?.toLowerCase().includes(buscaNodo.toLowerCase()) ||
     n.id?.toLowerCase().includes(buscaNodo.toLowerCase()))
  ).slice(0, 8)
  // ── FIN: filtros ─────────────────────────────────────

  // ── INICIO: estilos_base ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '9px 12px',
    marginBottom: 8,
    background: 'var(--gaia-cosmos-900)',
    border: '1px solid var(--gaia-cosmos-400)',
    color: 'var(--gaia-text-primary)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--gaia-font-body)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 150ms ease'
  }
  const lbl = {
    color: 'var(--gaia-text-tertiary)',
    fontSize: 10,
    fontFamily: 'var(--gaia-font-mono)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    display: 'block',
    marginBottom: 4
  }
  // ── FIN: estilos_base ────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ═══ PANEL LISTA ═══ */}
      <div style={{
        width: 300,
        borderRight: '1px solid var(--gaia-cosmos-400)',
        padding: '24px 20px',
        overflowY: 'auto',
        flexShrink: 0,
        background: 'rgba(10, 16, 32, 0.3)'
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-system)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoLibro />
          Rutas
        </div>
        <h3 style={{
          fontFamily: 'var(--gaia-font-display)',
          color: 'var(--gaia-text-primary)',
          margin: '0 0 16px 0',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.01em'
        }}>
          {t(idioma, 'editorRutasTitulo') || 'Editor de rutas'}
        </h3>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{
            position: 'absolute',
            left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gaia-text-tertiary)',
            pointerEvents: 'none'
          }}>
            <IconoLupa size={12} />
          </div>
          <input
            style={{
              ...inp,
              background: 'var(--gaia-cosmos-800)',
              paddingLeft: 34,
              marginBottom: 0,
              fontSize: 12
            }}
            placeholder={t(idioma, 'buscarRuta') || 'Buscar ruta...'}
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
          />
        </div>

        {journeysFiltradas.map(j => {
          const activo = rutaActiva?.id === j.id
          return (
            <div key={j.id}
              onClick={() => seleccionarRuta(j)}
              style={{
                padding: '11px 13px',
                marginBottom: 6,
                background: activo ? 'var(--gaia-accent-bg)' : 'var(--gaia-cosmos-800)',
                border: `1px solid ${activo ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
                borderLeft: `3px solid ${activo ? 'var(--gaia-accent)' : 'transparent'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => { if (!activo) e.currentTarget.style.background = 'var(--gaia-cosmos-700)' }}
              onMouseLeave={e => { if (!activo) e.currentTarget.style.background = 'var(--gaia-cosmos-800)' }}>
              <div style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 600,
                color: 'var(--gaia-text-primary)',
                marginBottom: 3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {j.icono && <span style={{ marginRight: 6 }}>{j.icono}</span>}
                {j.label?.[idioma] || j.label?.gl}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.025em',
                display: 'flex',
                gap: 8
              }}>
                <span>{j.visibility}</span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}>·</span>
                <span>{j.level}</span>
              </div>
            </div>
          )
        })}

        {journeysFiltradas.length === 0 && (
          <div style={{
            padding: '20px 12px',
            color: 'var(--gaia-text-tertiary)',
            fontSize: 12,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {busca ? 'Sen resultados' : 'Sen rutas'}
          </div>
        )}
      </div>

      {/* ═══ PANEL EDITOR ═══ */}
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {!rutaActiva || !form ? (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center',
            color: 'var(--gaia-text-tertiary)',
            fontSize: 14,
            fontFamily: 'var(--gaia-font-body)'
          }}>
            <div style={{
              display: 'inline-flex',
              width: 56, height: 56,
              borderRadius: '50%',
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--gaia-text-disabled)',
              marginBottom: 16
            }}>
              <IconoLibro size={22} />
            </div>
            <div>{t(idioma, 'seleccionaRuta') || 'Selecciona unha ruta para editar'}</div>
          </div>
        ) : (
          <>
            {/* Cabeceira */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 20,
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-accent)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 6
                }}>
                  Editando ruta
                </div>
                <h2 style={{
                  fontFamily: 'var(--gaia-font-display)',
                  color: 'var(--gaia-text-primary)',
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15
                }}>
                  {rutaActiva.label?.[idioma] || rutaActiva.label?.gl}
                </h2>
              </div>
              <button
                onClick={() => setModalBorrar(true)}
                style={{
                  padding: '8px 14px',
                  background: 'var(--gaia-danger-bg)',
                  border: '1px solid var(--gaia-danger-border)',
                  color: 'var(--gaia-danger)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                <IconoPapeleira />
                {t(idioma, 'borrarRuta') || 'Borrar ruta'}
              </button>
            </div>

            {/* Mensaxe */}
            {mensaxe && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                marginBottom: 14,
                background: mensaxe.tipo === 'ok' ? 'var(--gaia-success-bg)' : 'var(--gaia-danger-bg)',
                border: `1px solid ${mensaxe.tipo === 'ok' ? 'var(--gaia-success-border)' : 'var(--gaia-danger-border)'}`,
                color: mensaxe.tipo === 'ok' ? 'var(--gaia-success)' : 'var(--gaia-danger)',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                {mensaxe.tipo === 'ok' ? <IconoCheck /> : <IconoAviso />}
                {mensaxe.texto}
              </div>
            )}

            {/* ═══ METADATOS ═══ */}
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-accent)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 14
              }}>
                {t(idioma, 'metadatos') || 'Metadatos'}
              </div>

              {/* Selector idioma */}
              <div style={{
                display: 'flex',
                gap: 3,
                marginBottom: 12,
                background: 'var(--gaia-cosmos-900)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 8,
                padding: 3,
                width: 'fit-content'
              }}>
                {idiomasActivos.map(i => {
                  const activo = tabIdioma === i
                  return (
                    <button key={i} onClick={() => setTabIdioma(i)} style={{
                      padding: '5px 12px',
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      background: activo ? 'var(--gaia-accent-bg)' : 'transparent',
                      color: activo ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer',
                      fontWeight: activo ? 700 : 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      transition: 'all 150ms ease'
                    }}>
                      {i}
                    </button>
                  )
                })}
              </div>

              {idiomasActivos.map(i => (
                <div key={i} style={{ display: tabIdioma === i ? 'block' : 'none' }}>
                  <label style={lbl}>Nome ({i.toUpperCase()})</label>
                  <input
                    style={inp}
                    name={`label_${i}`}
                    value={form[`label_${i}`] || ''}
                    onChange={set}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                  <label style={lbl}>Descrición ({i.toUpperCase()})</label>
                  <textarea
                    style={{ ...inp, height: 60, resize: 'vertical', lineHeight: 1.5 }}
                    name={`description_${i}`}
                    value={form[`description_${i}`] || ''}
                    onChange={set}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={lbl}>{t(idioma, 'tipoRuta') || 'Tipo'}</label>
                  <select style={inp} name="type" value={form.type} onChange={set}>
                    <option value="educational">{t(idioma, 'educational') || 'Educativa'}</option>
                    <option value="exploration">{t(idioma, 'exploration') || 'Exploración'}</option>
                    <option value="galicia">{t(idioma, 'galicia') || 'Galicia'}</option>
                    <option value="professional">{t(idioma, 'professional') || 'Profesional'}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t(idioma, 'nivelLabel') || 'Nivel'}</label>
                  <select style={inp} name="level" value={form.level} onChange={set}>
                    <option value="primary">{t(idioma, 'primaria') || 'Primaria'}</option>
                    <option value="secondary">{t(idioma, 'secundaria') || 'Secundaria'}</option>
                    <option value="expert">{t(idioma, 'experto') || 'Experto'}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t(idioma, 'visibilidade') || 'Visibilidade'}</label>
                  <select style={inp} name="visibility" value={form.visibility} onChange={set}>
                    <option value="private">{t(idioma, 'privada') || 'Privada'}</option>
                    <option value="draft">{t(idioma, 'borrador') || 'Borrador'}</option>
                    <option value="validated">{t(idioma, 'publica') || 'Pública'}</option>
                    <option value="featured">{t(idioma, 'destacada') || 'Destacada'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 8, marginTop: 4 }}>
                <div>
                  <label style={lbl}>Módulo</label>
                  <input
                    style={inp}
                    name="modulo"
                    value={form.modulo || ''}
                    onChange={set}
                    list="modulos-editor"
                    placeholder="ex: Galicia, Ciencias..."
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                  <datalist id="modulos-editor">
                    <option value="Galicia" />
                    <option value="Ciencias" />
                    <option value="Ciencias Materiais" />
                    <option value="Oficios" />
                    <option value="Historia" />
                    <option value="Lingua e Literatura" />
                    <option value="Natureza" />
                  </datalist>
                </div>
                <div>
                  <label style={lbl}>Icono</label>
                  <input
                    style={{ ...inp, textAlign: 'center', fontSize: 18 }}
                    name="icono"
                    value={form.icono || '📚'}
                    onChange={set}
                    maxLength={2}
                  />
                </div>
              </div>

              <button onClick={gardarRuta} style={{
                width: '100%',
                padding: 11,
                marginTop: 8,
                background: 'var(--gaia-accent)',
                color: 'var(--gaia-cosmos-900)',
                border: '1px solid var(--gaia-accent)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 16px rgba(232, 165, 71, 0.2)',
                transition: 'all 150ms ease'
              }}>
                <IconoGardar />
                {t(idioma, 'gardarMetadatos') || 'Gardar metadatos'}
              </button>
            </div>

            {/* ═══ PASOS ═══ */}
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 12,
              padding: 20
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
                Pasos da ruta
                {stops.length > 0 && (
                  <span style={{ color: 'var(--gaia-text-primary)', fontWeight: 700 }}>
                    · {stops.length}
                  </span>
                )}
              </div>

              {stops.filter(s => s && s.nodo).map((stop, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  marginBottom: 6,
                  background: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: `3px solid ${COR_TIPO[stop.nodo?.type] || 'var(--gaia-accent)'}`,
                  borderRadius: 8
                }}>
                  <div style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: 'var(--gaia-accent-bg)',
                    border: '1px solid var(--gaia-accent-border)',
                    color: 'var(--gaia-accent)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-mono)',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {stop.order}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 600,
                      color: 'var(--gaia-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stop.nodo?.label_gl}
                    </div>
                    <div style={{
                      fontSize: 10,
                      fontFamily: 'var(--gaia-font-mono)',
                      marginTop: 2,
                      letterSpacing: '0.025em'
                    }}>
                      <span style={{ color: COR_TIPO[stop.nodo?.type] || 'var(--gaia-text-secondary)' }}>
                        {stop.nodo?.type}
                      </span>
                      <span style={{ color: 'var(--gaia-text-disabled)' }}> · {stop.nodo?.id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => moverStop(i, 'up')} disabled={i === 0}
                      title="Subir"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--gaia-cosmos-400)',
                        color: i === 0 ? 'var(--gaia-text-disabled)' : 'var(--gaia-text-secondary)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        cursor: i === 0 ? 'not-allowed' : 'pointer',
                        display: 'grid', placeItems: 'center'
                      }}>
                      <IconoArriba />
                    </button>
                    <button onClick={() => moverStop(i, 'down')} disabled={i === stops.length - 1}
                      title="Baixar"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--gaia-cosmos-400)',
                        color: i === stops.length - 1 ? 'var(--gaia-text-disabled)' : 'var(--gaia-text-secondary)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        cursor: i === stops.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'grid', placeItems: 'center'
                      }}>
                      <IconoAbaixo />
                    </button>
                    <button onClick={() => borrarStop(i)}
                      title="Eliminar"
                      style={{
                        background: 'var(--gaia-danger-bg)',
                        border: '1px solid var(--gaia-danger-border)',
                        color: 'var(--gaia-danger)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'grid', placeItems: 'center',
                        transition: 'all 150ms ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                      <IconoX />
                    </button>
                  </div>
                </div>
              ))}

              {stops.length === 0 && (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--gaia-text-tertiary)',
                  fontSize: 12,
                  fontStyle: 'italic'
                }}>
                  Sen pasos aínda
                </div>
              )}

              {/* Buscador engadir paso */}
              <div style={{ marginTop: 12 }}>
                <label style={lbl}>{t(idioma, 'engadirPaso') || 'Engadir paso'}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gaia-text-tertiary)',
                    pointerEvents: 'none'
                  }}>
                    <IconoLupa size={12} />
                  </div>
                  <input
                    style={{ ...inp, paddingLeft: 34 }}
                    placeholder={t(idioma, 'buscarNodoLabel') || 'Buscar nodo...'}
                    value={buscaNodo}
                    onChange={e => setBuscaNodo(e.target.value)}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                  />
                </div>

                {buscaNodo && (
                  <div style={{
                    background: 'var(--gaia-cosmos-900)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderRadius: 8,
                    marginBottom: 8,
                    maxHeight: 240,
                    overflowY: 'auto',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                  }}>
                    {nodosFiltrados.length === 0 && (
                      <div style={{
                        padding: '10px 14px',
                        color: 'var(--gaia-text-tertiary)',
                        fontSize: 12
                      }}>
                        {t(idioma, 'senResultados') || 'Sen resultados'}
                      </div>
                    )}
                    {nodosFiltrados.map((n, i, arr) => (
                      <div key={n.id}
                        onClick={() => engadirStop(n)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: i < arr.length - 1 ? '1px solid var(--gaia-cosmos-400)' : 'none',
                          borderLeft: `2px solid ${COR_TIPO[n.type] || 'transparent'}`,
                          transition: 'background 120ms ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{
                          fontSize: 13,
                          fontFamily: 'var(--gaia-font-body)',
                          fontWeight: 600,
                          color: 'var(--gaia-text-primary)'
                        }}>
                          {n.label}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-mono)',
                          marginTop: 2,
                          letterSpacing: '0.025em'
                        }}>
                          <span style={{ color: COR_TIPO[n.type] || 'var(--gaia-text-secondary)' }}>
                            {n.type}
                          </span>
                          <span style={{ color: 'var(--gaia-text-disabled)' }}> · {n.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={gardarStops}
                disabled={stops.length === 0}
                style={{
                  width: '100%',
                  padding: 11,
                  marginTop: 8,
                  background: stops.length > 0 ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
                  color: stops.length > 0 ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-disabled)',
                  border: `1px solid ${stops.length > 0 ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  cursor: stops.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: stops.length > 0 ? '0 0 16px rgba(232, 165, 71, 0.2)' : 'none',
                  transition: 'all 150ms ease'
                }}>
                <IconoGardar />
                {t(idioma, 'gardarPasos') || 'Gardar pasos'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal borrar ruta */}
      {modalBorrar && rutaActiva && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'grid', placeItems: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-danger-border)',
            borderRadius: 14,
            padding: 28,
            maxWidth: 460,
            width: '100%',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'var(--gaia-danger-bg)',
                border: '1px solid var(--gaia-danger-border)',
                display: 'grid', placeItems: 'center',
                color: 'var(--gaia-danger)',
                flexShrink: 0
              }}>
                <IconoPapeleira size={14} />
              </div>
              <h3 style={{
                fontFamily: 'var(--gaia-font-display)',
                color: 'var(--gaia-danger)',
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}>
                Borrar ruta
              </h3>
            </div>
            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              lineHeight: 1.6,
              margin: '0 0 20px 0'
            }}>
              Vas borrar a ruta <strong style={{ color: 'var(--gaia-text-primary)' }}>
                "{rutaActiva.label?.[idioma] || rutaActiva.label?.gl}"
              </strong>. Esta acción non se pode desfacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setModalBorrar(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'var(--gaia-cosmos-700)',
                  color: 'var(--gaia-text-primary)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600
                }}>
                Cancelar
              </button>
              <button
                onClick={executarBorrarRuta}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'var(--gaia-danger)',
                  color: 'var(--gaia-cosmos-900)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                <IconoPapeleira /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorRutas