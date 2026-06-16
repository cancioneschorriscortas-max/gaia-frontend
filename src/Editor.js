import { useState, useEffect, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// Editor — Edición completa de nodos do grafo
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: nodoId, onGardado, onBorrado, idiomasActivos,
// idioma. Endpoints de backend INTACTOS.
//
// MELLORAS INCLUÍDAS:
//   1. Aviso de cambios sen gardar ao cambiar de nodo ou borrar.
//   2. Indicador de cambios pendentes (dot ámbar no botón Gardar).
//   3. Cores semánticas por nivel pedagóxico (Primaria=verde,
//      Secundaria=azul, Experto=lavanda) — coherente co VisorNodo.
//   4. Mensaxes con tipo explícito (success / error) — non depende
//      de prefixos de texto no i18n.
//   5. Modal de borrado mostra label no tabIdioma activo (antes usaba
//      o idioma da app — podía mostrar só o id).
//   6. Cabeceira con info destacada do nodo sendo editado (tipo, id,
//      status) — xa non se confunde "editando" con "vendo".
//   7. Emoji 🗑 → SVG. Emoji ✓/✗ → iconas SVG.
// ═══════════════════════════════════════════════════════════


// ── INICIO: config_cores_niveis ──────────────────────
// Cores semánticas por nivel pedagóxico. Coherente coa paleta
// GAIA v1.1 e co VisorNodo (constellation / system / concept).
const NIVEL_COR = {
  primary:   { bg: 'rgba(93, 212, 168, 0.08)',  border: 'rgba(93, 212, 168, 0.28)',  accent: '#5dd4a8', label: 'Primaria',   descr: 'Explicación sinxela, ao alcance de todos' },
  secondary: { bg: 'rgba(125, 211, 252, 0.08)', border: 'rgba(125, 211, 252, 0.28)', accent: '#7dd3fc', label: 'Secundaria', descr: 'Con máis detalle e conexións' },
  expert:    { bg: 'rgba(155, 179, 255, 0.08)', border: 'rgba(155, 179, 255, 0.28)', accent: '#9bb3ff', label: 'Experto',    descr: 'Terminoloxía técnica e contexto avanzado' }
}
// ── FIN: config_cores_niveis ─────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoLupa = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconoCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoX = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoAviso = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconoPapeleira = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const IconoGardar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)
const IconoPlus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconoEditarPin = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function Editor({
  nodoId: nodoIdProp,
  onGardado,
  onBorrado,
  idiomasActivos = ['gl', 'es', 'en'],
  idioma = 'gl'
}) {

  // Hook de autenticación — imprescindible para as operacións de escritura
  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [todosNodos,     setTodosNodos]     = useState([])
  const [nodoId,         setNodoId]         = useState(nodoIdProp || null)
  const [busca,          setBusca]          = useState('')
  const [form,           setForm]           = useState(null)
  const [formInicial,    setFormInicial]    = useState(null)  // snapshot para detectar cambios
  const [tabIdioma,      setTabIdioma]      = useState(idiomasActivos[0] || 'gl')
  const [mensaxe,        setMensaxe]        = useState(null)   // { tipo: 'ok'|'erro', texto: '...' }
  const [media,          setMedia]          = useState([])
  const [novaMedia,      setNovaMedia]      = useState({ type: 'youtube', url: '', idioma: tabIdioma })
  const [modalBorrar,    setModalBorrar]    = useState(false)
  const [infoRelacions,  setInfoRelacions]  = useState(0)
  const [borrando,       setBorrando]       = useState(false)
  const [gardando,       setGardando]       = useState(false)
  const [cambioPendente, setCambioPendente] = useState(null)   // nodoId que se quería cambiar cando había cambios
  const mensaxeTimerRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: detectar_cambios ─────────────────────────
  // Detecta se hai cambios sen gardar comparando form con formInicial.
  // Rápido: JSON.stringify é suficiente para obxectos planos con strings,
  // numbers e booleans (que é o que ten o formulario).
  const tenCambios = Boolean(
    form && formInicial &&
    JSON.stringify(form) !== JSON.stringify(formInicial)
  )
  // ── FIN: detectar_cambios ────────────────────────────

  // ── INICIO: carga_lista_nodos ────────────────────────
  useEffect(() => {
    fetch(`${API}/nodos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setTodosNodos(d.nodos || []))
      .catch(() => setTodosNodos([]))
  }, [])
  // ── FIN: carga_lista_nodos ───────────────────────────

  // ── INICIO: sincronizar_prop ─────────────────────────
  // Cando chega un nodoIdProp novo (p.ex. desde o mapa), cargamos ese nodo.
  // Se hai cambios pendentes, pregúntase antes (nun useEffect non se pode
  // interromper elegantemente; tratámolo dentro de trocarNodo).
  useEffect(() => {
    if (nodoIdProp && nodoIdProp !== nodoId) {
      trocarNodo(nodoIdProp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodoIdProp])
  // ── FIN: sincronizar_prop ────────────────────────────

  // ── INICIO: cargar_nodo ──────────────────────────────
  useEffect(() => {
    if (!nodoId) return
    setForm(null)
    setFormInicial(null)
    setMedia([])
    fetch(`${API}/nodo/${nodoId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setMedia(data.media || [])
        const campos = {
          type:       data.type       || 'concept',
          status:     data.status     || 'draft',
          relevance:  data.relevance  || 'medium',
          difficulty: data.difficulty || 'primary',
          autor:      data.autor      || '',
          centro:     data.centro     || '',
        }
        idiomasActivos.forEach(i => {
          campos[`label_${i}`]          = data.labels?.[i] || ''
          campos[`text_primary_${i}`]   = data.content?.primary?.[i]   || ''
          campos[`text_secondary_${i}`] = data.content?.secondary?.[i] || ''
          campos[`text_expert_${i}`]    = data.content?.expert?.[i]    || ''
          campos[`reto_primary_${i}`]   = data.retos?.primary?.[i]     || ''
          campos[`reto_secondary_${i}`] = data.retos?.secondary?.[i]   || ''
          campos[`reto_expert_${i}`]    = data.retos?.expert?.[i]      || ''
        })
        campos.reto_bloqueado = data.reto_bloqueado !== undefined ? data.reto_bloqueado : true
        campos.reto_puntos    = data.reto_puntos || 10
        setForm(campos)
        setFormInicial(campos)  // snapshot para detectar cambios
      })
      .catch(() => {
        mostrarMensaxe('erro', 'Non se puido cargar o nodo')
      })
  }, [nodoId, idiomasActivos])
  // ── FIN: cargar_nodo ─────────────────────────────────

  // ── INICIO: troca_nodo_segura ────────────────────────
  // Intenta cambiar de nodo. Se hai cambios sen gardar, almacena o nodoId
  // desexado en cambioPendente e mostra o modal. O usuario confirma e entón
  // executamos o cambio.
  const trocarNodo = (novoId) => {
    if (nodoId === novoId) return
    if (tenCambios) {
      setCambioPendente(novoId)
      return
    }
    setNodoId(novoId)
    setBusca('')
  }

  const confirmarTrocaNodo = () => {
    if (cambioPendente === 'deseleccionar') {
      setNodoId(null)
      setForm(null)
      setFormInicial(null)
    } else {
      setNodoId(cambioPendente)
    }
    setCambioPendente(null)
    setBusca('')
  }

  const cancelarTrocaNodo = () => setCambioPendente(null)
  // ── FIN: troca_nodo_segura ───────────────────────────

  // ── INICIO: mensaxe_helper ───────────────────────────
  const mostrarMensaxe = (tipo, texto) => {
    if (mensaxeTimerRef.current) clearTimeout(mensaxeTimerRef.current)
    setMensaxe({ tipo, texto })
    if (tipo === 'ok') {
      // As mensaxes de éxito auto-despáchanse aos 4 s
      mensaxeTimerRef.current = setTimeout(() => setMensaxe(null), 4000)
    }
  }
  // ── FIN: mensaxe_helper ──────────────────────────────

  // ── INICIO: nodos_filtrados ──────────────────────────
  const nodosFiltrados = todosNodos
    .filter(n =>
      n.label?.toLowerCase().includes(busca.toLowerCase()) ||
      n.id?.toLowerCase().includes(busca.toLowerCase())
    )
    .slice(0, 8)
  // ── FIN: nodos_filtrados ─────────────────────────────

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── INICIO: gardar_nodo ──────────────────────────────
  const handleSubmit = async () => {
    if (!form || gardando) return
    setGardando(true)
    try {
      const res = await fetch(`${API}/nodo/${nodoId}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'gardadoOk') || 'Cambios gardados')
        setFormInicial(form)  // actualizar snapshot tras gardar
        if (onGardado) onGardado()
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non foi posible gardar'}`)
      }
    } catch {
      mostrarMensaxe('erro', t(idioma, 'erroConexion') || 'Erro de conexión')
    } finally {
      setGardando(false)
    }
  }
  // ── FIN: gardar_nodo ─────────────────────────────────

  // ── INICIO: abrir_modal_borrar ───────────────────────
  const abrirModalBorrar = async () => {
    try {
      const res = await fetch(`${API}/nodo/${nodoId}/relacions`, { headers: authHeaders() })
      const data = await res.json()
      setInfoRelacions(data.relacions?.length || 0)
    } catch {
      setInfoRelacions(0)
    }
    setModalBorrar(true)
  }
  // ── FIN: abrir_modal_borrar ──────────────────────────

  // ── INICIO: borrar_nodo ──────────────────────────────
  const handleBorrar = async () => {
    setBorrando(true)
    try {
      const res = await fetch(`${API}/nodo/${nodoId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      const data = await res.json()
      if (data.ok) {
        setModalBorrar(false)
        const idBorrado = nodoId
        setForm(null)
        setFormInicial(null)
        setNodoId(null)
        setMedia([])
        setTodosNodos(todosNodos.filter(n => n.id !== idBorrado))
        if (onBorrado) onBorrado(idBorrado)
      } else {
        mostrarMensaxe('erro', `Erro ao borrar: ${data.error || ''}`)
        setModalBorrar(false)
      }
    } catch {
      mostrarMensaxe('erro', t(idioma, 'erroConexion') || 'Erro de conexión')
      setModalBorrar(false)
    }
    setBorrando(false)
  }
  // ── FIN: borrar_nodo ─────────────────────────────────

  // ── INICIO: xestion_media ────────────────────────────
  const borrarMedia = async (mediaId) => {
    try {
      await fetch(`${API}/media/${mediaId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      setMedia(media.filter(m => m.id !== mediaId))
    } catch {
      mostrarMensaxe('erro', 'Non se puido eliminar o media')
    }
  }

  const engadirMedia = async () => {
    // Validación previa
    if (!novaMedia.url || !novaMedia.url.trim()) {
      mostrarMensaxe('erro', 'Escribe unha URL antes de engadir')
      return
    }

    const mediaPayload = {
      type:    novaMedia.type,
      url:     novaMedia.url.trim(),
      idioma:  tabIdioma,
      [`label_${tabIdioma}`]: novaMedia[`label_${tabIdioma}`] || '',
      label_gl: novaMedia.label_gl || novaMedia[`label_${tabIdioma}`] || ''
    }

    try {
      const res = await fetch(`${API}/nodo/${nodoId}/media`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaPayload)
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[engadirMedia] HTTP error:', res.status, res.statusText)
        return
      }

      const data = await res.json()
      console.log('[engadirMedia] Resposta do backend:', data)

      // Aceptamos varios formatos posibles de resposta do backend
      const mediaId = data.mediaId || data.id
      const temOk = data.ok !== undefined ? data.ok : Boolean(mediaId)

      if (temOk) {
        setMedia([...media, { ...mediaPayload, id: mediaId || `tmp_${Date.now()}` }])
        setNovaMedia({ type: 'youtube', url: '', idioma: tabIdioma })
        mostrarMensaxe('ok', `Media engadido en ${tabIdioma.toUpperCase()}`)
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido engadir o media'}`)
      }
    } catch (e) {
      console.error('[engadirMedia] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar co servidor'}`)
    }
  }
  // ── FIN: xestion_media ───────────────────────────────

  // ── INICIO: obter_label_mellor ───────────────────────
  // Para o modal de borrado: intenta label no idioma da app, logo no
  // tabIdioma actual, logo en galego, e finalmente o id.
  const obterLabelMellor = () => {
    if (!form) return nodoId
    return (
      form[`label_${idioma}`] ||
      form[`label_${tabIdioma}`] ||
      form.label_gl ||
      idiomasActivos.map(l => form[`label_${l}`]).find(Boolean) ||
      nodoId
    )
  }
  // ── FIN: obter_label_mellor ──────────────────────────

  // ── INICIO: estilos_base ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '9px 12px',
    marginBottom: 10,
    background: 'var(--gaia-cosmos-800)',
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
    marginBottom: 5
  }

  const seccion = {
    paddingTop: 20,
    marginTop: 20,
    borderTop: '1px solid var(--gaia-cosmos-400)'
  }
  // ── FIN: estilos_base ────────────────────────────────

  // ═══ RENDERIZADO ═════════════════════════════════════
  return (
    <div style={{
      padding: '28px 32px',
      maxWidth: 760,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ─── CABECEIRA ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoEditarPin size={12} />
          Editor de nodos
        </div>
        <h2 style={{
          fontFamily: 'var(--gaia-font-display)',
          color: 'var(--gaia-text-primary)',
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15
        }}>
          {t(idioma, 'editorTitulo') || 'Editar nodo'}
        </h2>
      </div>

      {/* ─── BUSCADOR ─── */}
      <label style={lbl}>{t(idioma, 'buscarNodo') || 'Buscar nodo'}</label>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <div style={{
          position: 'absolute',
          left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--gaia-text-tertiary)',
          pointerEvents: 'none'
        }}>
          <IconoLupa />
        </div>
        <input
          style={{ ...inp, paddingLeft: 36, marginBottom: 0 }}
          placeholder={t(idioma, 'escribeNome') || 'Escribe un nome ou id...'}
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
        />
      </div>

      {/* Dropdown de resultados */}
      {busca && (
        <div style={{
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 8,
          marginBottom: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          {nodosFiltrados.length === 0 && (
            <div style={{
              padding: '12px 14px',
              color: 'var(--gaia-text-tertiary)',
              fontSize: 12
            }}>
              {t(idioma, 'senResultados') || 'Sen resultados'}
            </div>
          )}
          {nodosFiltrados.map((n, i) => (
            <div
              key={n.id}
              onClick={() => trocarNodo(n.id)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < nodosFiltrados.length - 1 ? '1px solid var(--gaia-cosmos-400)' : 'none',
                transition: 'background 120ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--gaia-text-primary)'
              }}>
                {n.label}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginTop: 2,
                letterSpacing: '0.025em'
              }}>
                {n.type} · {n.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estados baleiros */}
      {!nodoId && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: 'var(--gaia-cosmos-800)',
          border: '1px dashed var(--gaia-cosmos-400)',
          borderRadius: 10,
          marginTop: 12
        }}>
          <div style={{
            color: 'var(--gaia-text-tertiary)',
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)'
          }}>
            {t(idioma, 'buscaNodoEditar') || 'Busca un nodo para editalo.'}
          </div>
        </div>
      )}

      {nodoId && !form && (
        <div style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 12,
          fontFamily: 'var(--gaia-font-mono)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '20px 0'
        }}>
          {t(idioma, 'cargando') || 'Cargando...'}
        </div>
      )}

      {/* ═══ FORMULARIO ═══ */}
      {form && (
        <>
          {/* Bandeirola de info do nodo editado */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--gaia-accent-bg)',
            border: '1px solid var(--gaia-accent-border)',
            borderLeft: '3px solid var(--gaia-accent)',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
              flex: 1
            }}>
              <span style={{ color: 'var(--gaia-accent)', flexShrink: 0 }}>
                <IconoEditarPin size={14} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Editando
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 2
                }}>
                  {obterLabelMellor()}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.025em',
              flexShrink: 0
            }}>
              id: {nodoId}
            </div>
            {tenCambios && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-warning)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontWeight: 700
              }}>
                <span style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'var(--gaia-warning)',
                  boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)',
                  animation: 'editorPulseDot 1.6s ease-in-out infinite'
                }} />
                Sen gardar
              </div>
            )}
          </div>

          <style>{`
            @keyframes editorPulseDot {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>

          {/* Selector de idioma */}
          <div style={{
            display: 'flex',
            gap: 3,
            marginBottom: 22,
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 8,
            padding: 3,
            width: 'fit-content'
          }}>
            {idiomasActivos.map(i => {
              const activo = tabIdioma === i
              return (
                <button key={i} onClick={() => setTabIdioma(i)} style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  background: activo ? 'var(--gaia-accent-bg)' : 'transparent',
                  color: activo ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                  border: 'none',
                  borderRadius: 6,
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

          {/* Nome (label) */}
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
            </div>
          ))}

          {/* Metadatos: tipo + nivel + status + relevancia */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>{t(idioma, 'tipoNodo') || 'Tipo de nodo'}</label>
              <select style={inp} name="type" value={form.type} onChange={set}>
                <option value="concept">{t(idioma, 'concepto') || 'Concepto'}</option>
                <option value="process">{t(idioma, 'proceso') || 'Proceso'}</option>
                <option value="system">{t(idioma, 'sistema') || 'Sistema'}</option>
                <option value="galaxy">{t(idioma, 'galaxia') || 'Galaxia'}</option>
                <option value="constellation">{t(idioma, 'constelacion') || 'Constelación'}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t(idioma, 'nivelLabel') || 'Nivel'}</label>
              <select style={inp} name="difficulty" value={form.difficulty} onChange={set}>
                <option value="primary">{t(idioma, 'primaria') || 'Primaria'}</option>
                <option value="secondary">{t(idioma, 'secundaria') || 'Secundaria'}</option>
                <option value="expert">{t(idioma, 'experto') || 'Experto'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>{t(idioma, 'statusLabel') || 'Estado'}</label>
              <select style={inp} name="status" value={form.status} onChange={set}>
                <option value="draft">{t(idioma, 'draft') || 'Borrador'}</option>
                <option value="validated">{t(idioma, 'validado') || 'Validado'}</option>
                <option value="deprecated">{t(idioma, 'deprecado') || 'Descartado'}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t(idioma, 'relevancia') || 'Relevancia'}</label>
              <select style={inp} name="relevance" value={form.relevance} onChange={set}>
                <option value="high">{t(idioma, 'alta') || 'Alta'}</option>
                <option value="medium">{t(idioma, 'media') || 'Media'}</option>
                <option value="low">{t(idioma, 'baixa') || 'Baixa'}</option>
              </select>
            </div>
          </div>

          {/* Autoría */}
          <div style={seccion}>
            <label style={lbl}>Autoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ ...lbl, fontSize: 9 }}>Autor/a</label>
                <input
                  style={inp}
                  name="autor"
                  value={form.autor || ''}
                  onChange={set}
                  placeholder="ex: Rosa Díaz"
                />
              </div>
              <div>
                <label style={{ ...lbl, fontSize: 9 }}>Centro</label>
                <input
                  style={inp}
                  name="centro"
                  value={form.centro || ''}
                  onChange={set}
                  placeholder="ex: IES Rosalía de Castro"
                />
              </div>
            </div>
          </div>

          {/* ═══ TEXTOS POR NIVEL PEDAGÓXICO ═══ */}
          <div style={seccion}>
            <label style={lbl}>{t(idioma, 'textosExplicativos') || 'Textos explicativos'}</label>

            {idiomasActivos.map(lang => (
              <div key={lang} style={{ display: tabIdioma === lang ? 'block' : 'none' }}>
                {['primary', 'secondary', 'expert'].map(nivel => {
                  const cor = NIVEL_COR[nivel]
                  return (
                    <div key={nivel} style={{
                      background: cor.bg,
                      border: `1px solid ${cor.border}`,
                      borderLeft: `3px solid ${cor.accent}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                      marginBottom: 10
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8
                      }}>
                        <div style={{
                          width: 8, height: 8,
                          borderRadius: '50%',
                          background: cor.accent,
                          boxShadow: `0 0 6px ${cor.accent}88`
                        }} />
                        <div style={{
                          fontSize: 11,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: cor.accent,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}>
                          {cor.label}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-body)',
                          color: 'var(--gaia-text-tertiary)',
                          fontStyle: 'italic'
                        }}>
                          · {cor.descr}
                        </div>
                      </div>
                      <textarea
                        style={{
                          ...inp,
                          height: 80,
                          marginBottom: 0,
                          background: 'var(--gaia-cosmos-900)',
                          border: '1px solid var(--gaia-cosmos-400)',
                          resize: 'vertical',
                          lineHeight: 1.5
                        }}
                        name={`text_${nivel}_${lang}`}
                        value={form[`text_${nivel}_${lang}`] || ''}
                        onChange={set}
                        onFocus={e => e.currentTarget.style.borderColor = cor.accent}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* ═══ RETOS ═══ */}
          <div style={seccion}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Retos</label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {/* Toggle desbloqueado */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-secondary)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={!form.reto_bloqueado}
                    onChange={e => setForm({ ...form, reto_bloqueado: !e.target.checked })}
                    style={{
                      width: 14, height: 14,
                      accentColor: 'var(--gaia-accent)',
                      cursor: 'pointer'
                    }}
                  />
                  Desbloqueado
                </label>
                {/* Puntos */}
                <select
                  value={form.reto_puntos || 10}
                  onChange={e => setForm({ ...form, reto_puntos: parseInt(e.target.value) })}
                  style={{
                    ...inp,
                    width: 'auto',
                    marginBottom: 0,
                    padding: '6px 10px',
                    fontSize: 11
                  }}>
                  <option value={10}>10 pts</option>
                  <option value={20}>20 pts</option>
                  <option value={50}>50 pts</option>
                </select>
              </div>
            </div>

            {idiomasActivos.map(lang => (
              <div key={lang} style={{ display: tabIdioma === lang ? 'block' : 'none' }}>
                {['primary', 'secondary', 'expert'].map(nivel => {
                  const cor = NIVEL_COR[nivel]
                  return (
                    <div key={nivel} style={{
                      background: cor.bg,
                      border: `1px solid ${cor.border}`,
                      borderLeft: `3px solid ${cor.accent}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      marginBottom: 8
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6
                      }}>
                        <div style={{
                          width: 7, height: 7,
                          borderRadius: '50%',
                          background: cor.accent,
                          boxShadow: `0 0 5px ${cor.accent}88`
                        }} />
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: cor.accent,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}>
                          Reto {cor.label}
                        </div>
                      </div>
                      <textarea
                        style={{
                          ...inp,
                          height: 60,
                          marginBottom: 0,
                          background: 'var(--gaia-cosmos-900)',
                          border: '1px solid var(--gaia-cosmos-400)',
                          resize: 'vertical',
                          fontSize: 13,
                          lineHeight: 1.5
                        }}
                        name={`reto_${nivel}_${lang}`}
                        value={form[`reto_${nivel}_${lang}`] || ''}
                        onChange={set}
                        placeholder={
                          nivel === 'primary'
                            ? 'ex: Nomea tres características de...'
                            : nivel === 'secondary'
                              ? 'ex: Explica a diferenza entre...'
                              : 'ex: Analiza o impacto de...'
                        }
                        onFocus={e => e.currentTarget.style.borderColor = cor.accent}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* ═══ MEDIA ═══ */}
          <div style={seccion}>
            <label style={lbl}>{t(idioma, 'mediaActual') || 'Media do nodo'}</label>

            {media.filter(m => !m.idioma || m.idioma === tabIdioma).length === 0 && (
              <div style={{
                color: 'var(--gaia-text-tertiary)',
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                padding: '8px 0 12px',
                fontStyle: 'italic'
              }}>
                {t(idioma, 'senMedia') || 'Sen media en'} {tabIdioma.toUpperCase()}
              </div>
            )}

            {media.filter(m => !m.idioma || m.idioma === tabIdioma).map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 8,
                marginBottom: 6,
                gap: 10
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-accent)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}>
                    {m.type}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    color: 'var(--gaia-text-primary)',
                    marginTop: 2
                  }}>
                    {m[`label_${tabIdioma}`] || m.label_gl || m.url}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {m.url}
                  </div>
                </div>
                <button
                  onClick={() => borrarMedia(m.id)}
                  style={{
                    background: 'var(--gaia-danger-bg)',
                    border: '1px solid var(--gaia-danger-border)',
                    color: 'var(--gaia-danger)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                  <IconoPapeleira size={12} />
                  {t(idioma, 'borrar') || 'Borrar'}
                </button>
              </div>
            ))}

            {/* Engadir novo media */}
            <div style={{
              marginTop: 14,
              padding: 14,
              background: 'var(--gaia-cosmos-800)',
              border: '1px dashed var(--gaia-cosmos-300)',
              borderRadius: 10
            }}>
              <label style={{ ...lbl, marginBottom: 10 }}>
                {t(idioma, 'engadirMedia') || 'Engadir novo media'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8 }}>
                <select
                  style={{ ...inp, marginBottom: 0 }}
                  value={novaMedia.type}
                  onChange={e => setNovaMedia({ ...novaMedia, type: e.target.value })}>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="instagram">Instagram</option>
                  <option value="image">Imaxe</option>
                  <option value="document">Documento</option>
                </select>
                <input
                  style={{ ...inp, marginBottom: 0 }}
                  placeholder="https://..."
                  value={novaMedia.url}
                  onChange={e => setNovaMedia({ ...novaMedia, url: e.target.value })}
                />
              </div>
              <input
                style={{ ...inp, marginTop: 8, marginBottom: 10 }}
                placeholder={`Descrición en ${tabIdioma.toUpperCase()}`}
                value={novaMedia[`label_${tabIdioma}`] || ''}
                onChange={e => setNovaMedia({
                  ...novaMedia,
                  [`label_${tabIdioma}`]: e.target.value,
                  idioma: tabIdioma
                })}
              />
              <button
                onClick={engadirMedia}
                disabled={!novaMedia.url}
                style={{
                  width: '100%',
                  padding: '9px',
                  background: novaMedia.url ? 'var(--gaia-accent-bg)' : 'transparent',
                  color: novaMedia.url ? 'var(--gaia-accent)' : 'var(--gaia-text-disabled)',
                  border: `1px solid ${novaMedia.url ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: 8,
                  cursor: novaMedia.url ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => {
                  if (novaMedia.url) e.currentTarget.style.background = 'rgba(232, 165, 71, 0.2)'
                }}
                onMouseLeave={e => {
                  if (novaMedia.url) e.currentTarget.style.background = 'var(--gaia-accent-bg)'
                }}>
                <IconoPlus size={12} />
                {t(idioma, 'engadirMedia') || 'Engadir media'}
              </button>
            </div>
          </div>

          {/* ═══ BOTÓNS ACCIÓN ═══ */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={handleSubmit}
              disabled={gardando || !tenCambios}
              style={{
                flex: 3,
                padding: 14,
                background: gardando
                  ? 'var(--gaia-cosmos-700)'
                  : tenCambios ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
                color: gardando
                  ? 'var(--gaia-text-disabled)'
                  : tenCambios ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
                border: `1px solid ${tenCambios && !gardando ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                cursor: gardando || !tenCambios ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: tenCambios && !gardando ? '0 0 20px rgba(232, 165, 71, 0.25)' : 'none',
                transition: 'all 150ms ease'
              }}>
              <IconoGardar />
              {gardando
                ? 'Gardando...'
                : tenCambios
                  ? (t(idioma, 'gardarCambios') || 'Gardar cambios')
                  : 'Sen cambios'}
            </button>
            <button
              onClick={abrirModalBorrar}
              style={{
                flex: 1,
                padding: 14,
                background: 'var(--gaia-danger-bg)',
                color: 'var(--gaia-danger)',
                border: '1px solid var(--gaia-danger-border)',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
              <IconoPapeleira />
              Borrar
            </button>
          </div>

          {/* Mensaxe */}
          {mensaxe && (
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 10,
              background: mensaxe.tipo === 'ok'
                ? 'var(--gaia-success-bg)'
                : 'var(--gaia-danger-bg)',
              border: `1px solid ${mensaxe.tipo === 'ok'
                ? 'var(--gaia-success-border)'
                : 'var(--gaia-danger-border)'}`,
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
        </>
      )}

      {/* ═══ MODAL: CAMBIOS SEN GARDAR ═══ */}
      {cambioPendente && (
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
            border: '1px solid var(--gaia-warning-border)',
            borderRadius: 14,
            padding: 28,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'var(--gaia-warning-bg)',
                border: '1px solid var(--gaia-warning-border)',
                display: 'grid', placeItems: 'center',
                color: 'var(--gaia-warning)',
                flexShrink: 0
              }}>
                <IconoAviso />
              </div>
              <h3 style={{
                fontFamily: 'var(--gaia-font-display)',
                color: 'var(--gaia-warning)',
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}>
                Cambios sen gardar
              </h3>
            </div>
            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              lineHeight: 1.6,
              margin: '0 0 20px 0'
            }}>
              Tes cambios sen gardar no nodo <strong style={{ color: 'var(--gaia-text-primary)' }}>"{obterLabelMellor()}"</strong>.
              Se continúas, perderás eses cambios.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={cancelarTrocaNodo}
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
                onClick={confirmarTrocaNodo}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'var(--gaia-warning-bg)',
                  color: 'var(--gaia-warning)',
                  border: '1px solid var(--gaia-warning-border)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700
                }}>
                Continuar sen gardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: BORRAR ═══ */}
      {modalBorrar && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
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
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
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
                <IconoPapeleira />
              </div>
              <h3 style={{
                fontFamily: 'var(--gaia-font-display)',
                color: 'var(--gaia-danger)',
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}>
                Borrar nodo
              </h3>
            </div>

            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              lineHeight: 1.6,
              margin: '0 0 14px 0'
            }}>
              Vas borrar o nodo <strong style={{ color: 'var(--gaia-text-primary)' }}>"{obterLabelMellor()}"</strong>.
            </p>

            {infoRelacions > 0 && (
              <div style={{
                background: 'var(--gaia-warning-bg)',
                border: '1px solid var(--gaia-warning-border)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <div style={{ color: 'var(--gaia-warning)', flexShrink: 0, marginTop: 1 }}>
                  <IconoAviso />
                </div>
                <div style={{
                  color: 'var(--gaia-warning)',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  lineHeight: 1.5
                }}>
                  Este nodo ten <strong>{infoRelacions} relación{infoRelacions !== 1 ? 's' : ''}</strong> que tamén serán eliminadas.
                </div>
              </div>
            )}

            <p style={{
              color: 'var(--gaia-text-tertiary)',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-mono)',
              margin: '0 0 20px 0',
              letterSpacing: '0.025em'
            }}>
              Esta acción non se pode desfacer.
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
                onClick={handleBorrar}
                disabled={borrando}
                style={{
                  flex: 1,
                  padding: 12,
                  background: borrando
                    ? 'var(--gaia-cosmos-700)'
                    : 'var(--gaia-danger)',
                  color: borrando
                    ? 'var(--gaia-text-disabled)'
                    : 'var(--gaia-cosmos-900)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: borrando ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                {borrando ? 'Borrando...' : <><IconoPapeleira /> Confirmar</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Editor
