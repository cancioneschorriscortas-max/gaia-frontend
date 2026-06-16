import { useState, useEffect, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// EditorRelacions — Editar / eliminar relacións existentes
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idiomasActivos, idioma.
// Endpoints backend INTACTOS.
//
// BUG CRÍTICO ARRANXADO: os 4 fetches (GET /nodos, GET /relacions/tipos,
// GET /nodo/:id/relacions, PUT /relacion, DELETE /relacion) non levaban
// authHeaders(). A edición e eliminación fallaban con 401 Unauthorized.
//
// MELLORAS:
//   1. authHeaders() en todos os fetches.
//   2. Confirmación de borrado con modal custom (non window.confirm).
//   3. Dirección da relación con SVG arrow visible (→).
//   4. Expansión inline con animación sutil.
//   5. Mensaxes tipadas con auto-dismiss.
//   6. Cor semántica do nodo relacionado (según type).
// ═══════════════════════════════════════════════════════════


// ── INICIO: cor_tipo_nodo ────────────────────────────
const COR_TIPO = {
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}
// ── FIN: cor_tipo_nodo ───────────────────────────────

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
const IconoEditar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
const IconoRede = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)
const IconoLupa = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconoX = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function EditorRelacions({ idiomasActivos = ['gl', 'es', 'en'], idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [nodos, setNodos]                 = useState([])
  const [tiposRelacion, setTiposRelacion] = useState([])
  const [busca, setBusca]                 = useState('')
  const [nodoActivo, setNodoActivo]       = useState(null)
  const [relacions, setRelacions]         = useState([])
  const [editando, setEditando]           = useState(null)
  const [mensaxe, setMensaxe]             = useState(null)
  const [relBorrar, setRelBorrar]         = useState(null)
  const mensaxeTimerRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_inicial ────────────────────────────
  useEffect(() => {
    fetch(`${API}/nodos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setNodos(d.nodos || []))
      .catch(e => console.error('[EditorRelacions] Erro nodos:', e))

    fetch(`${API}/relacions/tipos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setTiposRelacion(d.tipos || []))
      .catch(e => console.error('[EditorRelacions] Erro tipos:', e))
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

  // ── INICIO: cargar_relacions ─────────────────────────
  const cargarRelacions = (id) => {
    fetch(`${API}/nodo/${id}/relacions`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setRelacions(d.relacions || []))
      .catch(e => console.error('[EditorRelacions] Erro cargando relacions:', e))
  }

  const seleccionarNodo = (nodo) => {
    setNodoActivo(nodo)
    setBusca('')
    setEditando(null)
    setMensaxe(null)
    cargarRelacions(nodo.id)
  }
  // ── FIN: cargar_relacions ────────────────────────────

  const nodosFiltrados = nodos
    .filter(n =>
      n.label?.toLowerCase().includes(busca.toLowerCase()) ||
      n.id?.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 8)

  // ── INICIO: borrar_relacion ──────────────────────────
  const executarBorrar = async () => {
    const rel = relBorrar
    if (!rel) return

    try {
      const res = await fetch(`${API}/relacion`, {
        method: 'DELETE',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: rel.direccion === 'out' ? nodoActivo.id : rel.id,
          target: rel.direccion === 'out' ? rel.id : nodoActivo.id,
          tipo: rel.tipo
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[EditorRelacions] DELETE error:', res.status)
        setRelBorrar(null)
        return
      }

      const data = await res.json()
      console.log('[EditorRelacions] Resposta borrar:', data)

      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'relacionBorradaOk') || 'Relación eliminada')
        cargarRelacions(nodoActivo.id)
        setEditando(null)
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido borrar'}`)
      }
    } catch (e) {
      console.error('[EditorRelacions] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar'}`)
    } finally {
      setRelBorrar(null)
    }
  }
  // ── FIN: borrar_relacion ─────────────────────────────

  // ── INICIO: gardar_relacion ──────────────────────────
  const gardarRelacion = async (i) => {
    const rel = relacions[i]
    const contextos = {}
    idiomasActivos.forEach(lang => {
      contextos[`context_${lang}`] = rel.context?.[lang] || ''
    })

    try {
      const res = await fetch(`${API}/relacion`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: rel.direccion === 'out' ? nodoActivo.id : rel.id,
          target: rel.direccion === 'out' ? rel.id : nodoActivo.id,
          tipo_orixinal: rel.tipo_orixinal,
          tipo: rel.tipo,
          ...contextos,
          level: rel.level,
          strength: rel.strength
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[EditorRelacions] PUT error:', res.status)
        return
      }

      const data = await res.json()
      console.log('[EditorRelacions] Resposta gardar:', data)

      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'relacionActualizadaOk') || 'Relación actualizada')
        cargarRelacions(nodoActivo.id)
        setEditando(null)
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido gardar'}`)
      }
    } catch (e) {
      console.error('[EditorRelacions] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar'}`)
    }
  }
  // ── FIN: gardar_relacion ─────────────────────────────

  // ── INICIO: actualizar_rel ───────────────────────────
  const actualizarRel = (i, campo, valor) => {
    const nova = [...relacions]
    if (campo.startsWith('context.')) {
      const lang = campo.split('.')[1]
      nova[i] = { ...nova[i], context: { ...nova[i].context, [lang]: valor } }
    } else {
      nova[i] = { ...nova[i], [campo]: valor }
    }
    setRelacions(nova)
  }
  // ── FIN: actualizar_rel ──────────────────────────────

  // ── INICIO: estilos_base ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '8px 12px',
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
      padding: '28px 32px',
      maxWidth: 820,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* Cabeceira */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-concept)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoRede />
          Editar relacións
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
          {t(idioma, 'editorRelTitulo') || 'Editor de relacións'}
        </h2>
      </div>

      {/* Buscador de nodo */}
      <label style={lbl}>{t(idioma, 'seleccionaRelacions') || 'Selecciona un nodo para ver as súas relacións'}</label>
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
          style={{
            ...inp,
            background: 'var(--gaia-cosmos-800)',
            paddingLeft: 36,
            marginBottom: 0
          }}
          placeholder={t(idioma, 'buscarNodoLabel') || 'Buscar nodo...'}
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
        />
      </div>

      {busca && (
        <div style={{
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 8,
          marginBottom: 16,
          overflow: 'hidden',
          maxHeight: 280,
          overflowY: 'auto',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
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
          {nodosFiltrados.map((n, i, arr) => (
            <div key={n.id}
              onClick={() => seleccionarNodo(n)}
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
                <span style={{ color: COR_TIPO[n.type] || 'var(--gaia-text-secondary)' }}>{n.type}</span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}> · {n.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nodo activo (bandeirola) */}
      {nodoActivo && (
        <div style={{
          padding: '14px 16px',
          marginBottom: 16,
          background: 'var(--gaia-accent-bg)',
          border: '1px solid var(--gaia-accent-border)',
          borderLeft: `3px solid ${COR_TIPO[nodoActivo.type] || 'var(--gaia-accent)'}`,
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 4
          }}>
            Nodo activo · {relacions.length} relación{relacions.length !== 1 ? 's' : ''}
          </div>
          <div style={{
            fontSize: 15,
            fontFamily: 'var(--gaia-font-display)',
            color: 'var(--gaia-text-primary)',
            fontWeight: 600,
            letterSpacing: '-0.01em'
          }}>
            {nodoActivo.label}
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            marginTop: 2,
            letterSpacing: '0.025em'
          }}>
            <span style={{ color: COR_TIPO[nodoActivo.type] || 'var(--gaia-text-secondary)' }}>
              {nodoActivo.type}
            </span>
            <span style={{ color: 'var(--gaia-text-disabled)' }}> · {nodoActivo.id}</span>
          </div>
        </div>
      )}

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

      {/* Estado baleiro */}
      {nodoActivo && relacions.length === 0 && (
        <div style={{
          padding: '32px 20px',
          textAlign: 'center',
          background: 'var(--gaia-cosmos-800)',
          border: '1px dashed var(--gaia-cosmos-400)',
          borderRadius: 10,
          color: 'var(--gaia-text-tertiary)',
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)'
        }}>
          {t(idioma, 'senRelacions') || 'Este nodo aínda non ten relacións'}
        </div>
      )}

      {/* Lista de relacións */}
      {relacions.map((rel, i) => {
        const tipoActivo = tiposRelacion.find(tp => tp.id === rel.tipo)
        const esOut = rel.direccion === 'out'
        const corNodoRel = COR_TIPO[rel.type] || 'var(--gaia-text-secondary)'
        const estaEditando = editando === i

        return (
          <div key={i} style={{
            padding: estaEditando ? '14px 16px' : '12px 14px',
            marginBottom: 8,
            background: estaEditando ? 'var(--gaia-cosmos-800)' : 'var(--gaia-cosmos-800)',
            border: `1px solid ${estaEditando ? 'var(--gaia-concept-border)' : 'var(--gaia-cosmos-400)'}`,
            borderLeft: `3px solid ${estaEditando ? 'var(--gaia-concept)' : corNodoRel}`,
            borderRadius: 10,
            transition: 'all 200ms ease'
          }}>

            {/* Resumo da relación (sempre visible) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div style={{
                fontFamily: 'var(--gaia-font-mono)',
                fontSize: 12,
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
                flex: 1,
                flexWrap: 'wrap'
              }}>
                <span style={{
                  color: esOut ? 'var(--gaia-accent)' : corNodoRel,
                  fontWeight: 600
                }}>
                  {esOut ? nodoActivo.label : rel.label}
                </span>
                <span style={{
                  color: 'var(--gaia-text-tertiary)',
                  padding: '2px 8px',
                  background: 'var(--gaia-cosmos-700)',
                  borderRadius: 9999,
                  fontSize: 10,
                  letterSpacing: '0.05em'
                }}>
                  {tipoActivo?.[idioma] || tipoActivo?.gl || rel.tipo}
                </span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}>→</span>
                <span style={{
                  color: esOut ? corNodoRel : 'var(--gaia-accent)',
                  fontWeight: 600
                }}>
                  {esOut ? rel.label : nodoActivo.label}
                </span>
              </div>

              {/* Botóns */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    if (estaEditando) {
                      setEditando(null)
                    } else {
                      const nova = [...relacions]
                      nova[i] = { ...nova[i], tipo_orixinal: nova[i].tipo }
                      setRelacions(nova)
                      setEditando(i)
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: estaEditando ? 'var(--gaia-cosmos-700)' : 'var(--gaia-concept-bg)',
                    border: `1px solid ${estaEditando ? 'var(--gaia-cosmos-300)' : 'var(--gaia-concept-border)'}`,
                    color: estaEditando ? 'var(--gaia-text-secondary)' : 'var(--gaia-concept)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 150ms ease'
                  }}>
                  {estaEditando
                    ? <>{t(idioma, 'cancelar') || 'Cancelar'}</>
                    : <><IconoEditar /> {t(idioma, 'editar') || 'Editar'}</>
                  }
                </button>
                <button
                  onClick={() => setRelBorrar(rel)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--gaia-danger-bg)',
                    border: '1px solid var(--gaia-danger-border)',
                    color: 'var(--gaia-danger)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                  <IconoPapeleira />
                  {t(idioma, 'borrar') || 'Borrar'}
                </button>
              </div>
            </div>

            {/* Formulario de edición (expandido) */}
            {estaEditando && (
              <div style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--gaia-cosmos-400)'
              }}>
                {/* Tipo + nivel + forza */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>{t(idioma, 'tipoRelacion') || 'Tipo'}</label>
                    <select
                      style={inp}
                      value={relacions[i].tipo}
                      onChange={e => actualizarRel(i, 'tipo', e.target.value)}>
                      {tiposRelacion.map(tp => (
                        <option key={tp.id} value={tp.id}>
                          {tp[idioma] || tp.gl} ({tp.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{t(idioma, 'nivelLabel') || 'Nivel'}</label>
                    <select
                      style={inp}
                      value={relacions[i].level}
                      onChange={e => actualizarRel(i, 'level', e.target.value)}>
                      <option value="primary">{t(idioma, 'primaria') || 'Primaria'}</option>
                      <option value="secondary">{t(idioma, 'secundaria') || 'Secundaria'}</option>
                      <option value="expert">{t(idioma, 'experto') || 'Experto'}</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{t(idioma, 'forza') || 'Forza'}</label>
                    <select
                      style={inp}
                      value={relacions[i].strength}
                      onChange={e => actualizarRel(i, 'strength', e.target.value)}>
                      <option value="high">{t(idioma, 'alta') || 'Alta'}</option>
                      <option value="medium">{t(idioma, 'media') || 'Media'}</option>
                      <option value="low">{t(idioma, 'baixa') || 'Baixa'}</option>
                    </select>
                  </div>
                </div>

                {/* Contextos por idioma */}
                <label style={{ ...lbl, marginTop: 8 }}>Contexto da relación</label>
                {idiomasActivos.map(lang => (
                  <div key={lang} style={{ marginBottom: 6 }}>
                    <label style={{ ...lbl, fontSize: 9, marginBottom: 3 }}>{lang.toUpperCase()}</label>
                    <input
                      style={inp}
                      value={relacions[i].context?.[lang] || ''}
                      onChange={e => actualizarRel(i, `context.${lang}`, e.target.value)}
                      placeholder="ex: ingrediente principal, proceso clave..."
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-concept)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
                    />
                  </div>
                ))}

                <button
                  onClick={() => gardarRelacion(i)}
                  style={{
                    width: '100%',
                    padding: 11,
                    marginTop: 10,
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
                  {t(idioma, 'gardarCambios') || 'Gardar cambios'}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Modal confirmar borrar */}
      {relBorrar && (
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
            maxWidth: 440,
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
                Eliminar relación
              </h3>
            </div>
            <p style={{
              color: 'var(--gaia-text-secondary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              lineHeight: 1.6,
              margin: '0 0 20px 0'
            }}>
              Esta acción non se pode desfacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRelBorrar(null)}
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
                onClick={executarBorrar}
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
                <IconoPapeleira /> Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorRelacions