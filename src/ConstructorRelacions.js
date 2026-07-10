import { useState, useEffect, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { useTiposRelacion } from './hooks/useTiposRelacion'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// ConstructorRelacions — Creación de relacións entre nodos
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idiomasActivos, idioma.
// Endpoints backend INTACTOS.
//
// BUG CRÍTICO ARRANXADO: os 3 fetches (GET /nodos, GET /relacions/tipos,
// POST /relacion) non levaban authHeaders(). Creación de relacións fallaba
// silenciosamente con 401 Unauthorized.
//
// MELLORAS:
//   1. authHeaders() en todos os fetches.
//   2. Filtros de destino por tipo de relación preservados (FILTRO_DESTINO).
//   3. Contextos multilingües con campos dinámicos.
//   4. Vista previa da relación co tipo traducido.
//   5. Mensaxes tipadas con auto-dismiss.
//   6. Validación antes de enviar (orixe ≠ destino, ambos definidos).
//   7. Emojis → SVGs.
// ═══════════════════════════════════════════════════════════


// ── INICIO: filtro_destino_por_tipo ──────────────────
// Lóxica orixinal preservada. Define que tipos de nodo poden ser destino
// de cada tipo de relación (ontoloxía GAIA).
const FILTRO_DESTINO = {
  PERTENCE_A:      ['galaxy', 'constellation', 'system'],
  PARTE_DE:        ['concept', 'system', 'process', 'galaxy', 'constellation'],
  E_UN:            ['concept', 'process'],
  INSTANCIA_DE:    ['concept', 'process'],
  TRANSFORMA:      ['concept', 'process'],
  PRODUCE:         ['concept', 'process'],
  USA:             ['concept', 'process', 'system'],
  RELACIONADO_CON: null,
  SIMILAR_A:       null,
  INSPIRADO_EN:    null,
  ANTES_DE:        ['process'],
  DESPOIS_DE:      ['process']
}
// ── FIN: filtro_destino_por_tipo ─────────────────────

// ── INICIO: cor_tipo_nodo ────────────────────────────
// Para mostrar o type dun nodo coa cor semántica correspondente.
const COR_TIPO = {
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}
// ── FIN: cor_tipo_nodo ───────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoPlus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
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
const IconoX = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoRede = ({ size = 14 }) => (
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
// ── FIN: iconos_svg ──────────────────────────────────

function ConstructorRelacions({ idiomasActivos = ['gl', 'es', 'en'], idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [nodos, setNodos]                 = useState([])
  //const [tiposRelacion, setTiposRelacion] = useState([])
  const { tipos: tiposRelacion } = useTiposRelacion()
  const [busca, setBusca]                 = useState('')
  const [buscaDestino, setBuscaDestino]   = useState('')
  const [orixe, setOrixe]                 = useState(null)
  const [destino, setDestino]             = useState(null)
  const [form, setForm]                   = useState({
    tipo: 'PERTENCE_A',
    level: 'primary',
    strength: 'high'
  })
  const [mensaxe, setMensaxe]   = useState(null)
  const [enviando, setEnviando] = useState(false)
  const mensaxeTimerRef = useRef(null)

  const contextoInicial = () => {
    const c = {}
    idiomasActivos.forEach(i => { c[`context_${i}`] = '' })
    return c
  }
  const [contextos, setContextos] = useState(contextoInicial)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_inicial ────────────────────────────
  useEffect(() => {
    fetch(`${API}/nodos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setNodos(d.nodos || []))
      .catch(e => console.error('[ConstructorRelacions] Erro cargando nodos:', e))

    //fetch(`${API}/relacions/tipos`, { headers: authHeaders() })
     // .then(r => r.json())
      //.then(d => setTiposRelacion(d.tipos || []))
      //.catch(e => console.error('[ConstructorRelacions] Erro cargando tipos:', e))
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

  // ── INICIO: set_form ─────────────────────────────────
  const set = (e) => {
    const novo = { ...form, [e.target.name]: e.target.value }
    // Se cambia o tipo de relación e o destino non é compatible, limpalo
    if (e.target.name === 'tipo') {
      const filtro = FILTRO_DESTINO[e.target.value]
      if (filtro && destino && !filtro.includes(destino.type)) {
        setDestino(null)
        setBuscaDestino('')
      }
    }
    setForm(novo)
  }

  const setCtx = (e) => setContextos({ ...contextos, [e.target.name]: e.target.value })
  // ── FIN: set_form ────────────────────────────────────

  // ── INICIO: filtrar_nodos ────────────────────────────
  const nodosFiltrados = (buscaTxt, soloTipos) =>
    nodos.filter(n => {
      const coincide =
        n.label?.toLowerCase().includes(buscaTxt.toLowerCase()) ||
        n.id?.toLowerCase().includes(buscaTxt.toLowerCase())
      if (!coincide) return false
      if (soloTipos && soloTipos.length > 0) return soloTipos.includes(n.type)
      return true
    }).slice(0, 8)
  // ── FIN: filtrar_nodos ───────────────────────────────

  // ── INICIO: enviar_relacion ──────────────────────────
  const handleSubmit = async () => {
    if (!orixe || !destino) {
      mostrarMensaxe('erro', t(idioma, 'seleccionaOrixeDestino') || 'Selecciona nodo de orixe e destino')
      return
    }
    if (orixe.id === destino.id) {
      mostrarMensaxe('erro', t(idioma, 'orixeDestinoIguais') || 'O nodo de orixe e destino non poden ser o mesmo')
      return
    }

    setEnviando(true)

    try {
      const res = await fetch(`${API}/relacion`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: orixe.id,
          target: destino.id,
          ...form,
          ...contextos
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[ConstructorRelacions] HTTP error:', res.status)
        return
      }

      const data = await res.json()
      console.log('[ConstructorRelacions] Resposta:', data)

      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'relacionCreadaOk', orixe.label, destino.label) || `Relación creada: ${orixe.label} → ${destino.label}`)
        setOrixe(null)
        setDestino(null)
        setBusca('')
        setBuscaDestino('')
        setContextos(contextoInicial())
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido crear a relación'}`)
      }
    } catch (e) {
      console.error('[ConstructorRelacions] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar'}`)
    } finally {
      setEnviando(false)
    }
  }
  // ── FIN: enviar_relacion ─────────────────────────────

  // ── INICIO: estilos_base ─────────────────────────────
  const inp = {
    width: '100%',
    padding: '9px 12px',
    marginBottom: 8,
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
  // ── FIN: estilos_base ────────────────────────────────

  // ── INICIO: selector_nodo_subcompoñente ──────────────
  const SelectorNodo = ({ titulo, valor, busca: buscaVal, setBusca: setBuscaFn, onSelect, soloTipos }) => (
    <div style={{ flex: 1 }}>
      <label style={lbl}>
        {titulo}
        {soloTipos && (
          <span style={{
            color: 'var(--gaia-text-disabled)',
            marginLeft: 6,
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 9,
            textTransform: 'lowercase',
            letterSpacing: '0.025em'
          }}>
            [{soloTipos.join(', ')}]
          </span>
        )}
      </label>
      {valor ? (
        <div style={{
          padding: '12px 14px',
          background: 'var(--gaia-accent-bg)',
          border: '1px solid var(--gaia-accent-border)',
          borderLeft: `3px solid ${COR_TIPO[valor.type] || 'var(--gaia-accent)'}`,
          borderRadius: 8,
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8
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
              {valor.label}
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              marginTop: 2,
              letterSpacing: '0.025em'
            }}>
              <span style={{ color: COR_TIPO[valor.type] || 'var(--gaia-text-secondary)' }}>
                {valor.type}
              </span>
              <span style={{ color: 'var(--gaia-text-disabled)' }}> · {valor.id}</span>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gaia-text-tertiary)',
              cursor: 'pointer',
              padding: 4,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 4,
              flexShrink: 0,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-danger)'
              e.currentTarget.style.background = 'var(--gaia-danger-bg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.background = 'transparent'
            }}>
            <IconoX />
          </button>
        </div>
      ) : (
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
            value={buscaVal}
            onChange={e => setBuscaFn(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
          />
          {buscaVal && (
            <div style={{
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 8,
              marginBottom: 8,
              overflow: 'hidden',
              maxHeight: 260,
              overflowY: 'auto',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
            }}>
              {nodosFiltrados(buscaVal, soloTipos).length === 0 && (
                <div style={{
                  padding: '12px 14px',
                  color: 'var(--gaia-text-tertiary)',
                  fontSize: 12
                }}>
                  {t(idioma, 'senResultados') || 'Sen resultados'}
                  {soloTipos && <span style={{ color: 'var(--gaia-text-disabled)' }}> (só: {soloTipos.join(', ')})</span>}
                </div>
              )}
              {nodosFiltrados(buscaVal, soloTipos).map((n, i, arr) => (
                <div key={n.id}
                  onClick={() => { onSelect(n); setBuscaFn('') }}
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
      )}
    </div>
  )
  // ── FIN: selector_nodo_subcompoñente ─────────────────

  const filtroDestino = FILTRO_DESTINO[form.tipo] || null
  const tipoActivo = tiposRelacion.find(tp => tp.id === form.tipo)

  return (
    <div style={{
      padding: '28px 32px',
      maxWidth: 760,
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
          <IconoRede size={12} />
          Nova relación
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
          {t(idioma, 'constructorRelTitulo') || 'Crear relación'}
        </h2>
      </div>

      {/* Selectores orixe / destino */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 20,
        alignItems: 'flex-start'
      }}>
        <SelectorNodo
          titulo={t(idioma, 'nodoOrixe') || 'Orixe'}
          valor={orixe}
          busca={busca}
          setBusca={setBusca}
          onSelect={setOrixe}
          soloTipos={null}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: 28,
          color: 'var(--gaia-accent)',
          fontSize: 20,
          fontFamily: 'var(--gaia-font-display)'
        }}>
          →
        </div>
        <SelectorNodo
          titulo={t(idioma, 'nodoDestino') || 'Destino'}
          valor={destino}
          busca={buscaDestino}
          setBusca={setBuscaDestino}
          onSelect={setDestino}
          soloTipos={filtroDestino}
        />
      </div>

      {/* Tipo de relación */}
      <label style={lbl}>{t(idioma, 'tipoRelacion') || 'Tipo de relación'}</label>
      <select style={inp} name="tipo" value={form.tipo} onChange={set}>
        {tiposRelacion.map(tp => (
          <option key={tp.id} value={tp.id}>
            {tp[idioma] || tp.gl} ({tp.id})
          </option>
        ))}
      </select>

      {/* Nome do tipo por idioma */}
      {tipoActivo && (
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 10,
          flexWrap: 'wrap'
        }}>
          {idiomasActivos.map(i => (
            <div key={i} style={{
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 6,
              letterSpacing: '0.025em'
            }}>
              <span style={{ color: 'var(--gaia-text-tertiary)' }}>{i.toUpperCase()}: </span>
              <span style={{ color: 'var(--gaia-concept)', fontWeight: 600 }}>
                {tipoActivo[i] || tipoActivo.gl}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Vista previa da relación */}
      {orixe && destino && (
        <div style={{
          padding: '14px 16px',
          marginBottom: 16,
          background: 'var(--gaia-success-bg)',
          border: '1px solid var(--gaia-success-border)',
          borderRadius: 10,
          fontFamily: 'var(--gaia-font-mono)',
          fontSize: 13,
          letterSpacing: '0.025em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          <div style={{
            fontSize: 10,
            color: 'var(--gaia-success)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
            marginRight: 4
          }}>
            Vista previa:
          </div>
          <span style={{ color: COR_TIPO[orixe.type] || 'var(--gaia-accent)', fontWeight: 600 }}>
            {orixe.label}
          </span>
          <span style={{ color: 'var(--gaia-text-tertiary)' }}>
            —[{tipoActivo?.[idioma] || tipoActivo?.gl || form.tipo}]→
          </span>
          <span style={{ color: COR_TIPO[destino.type] || 'var(--gaia-accent)', fontWeight: 600 }}>
            {destino.label}
          </span>
        </div>
      )}

      {/* Contextos por idioma */}
      <div style={{
        paddingTop: 18,
        marginTop: 14,
        borderTop: '1px solid var(--gaia-cosmos-400)'
      }}>
        <label style={lbl}>Contexto (descrición da relación)</label>
        {idiomasActivos.map(i => (
          <div key={i} style={{ marginBottom: 8 }}>
            <label style={{ ...lbl, fontSize: 9, marginBottom: 4 }}>{i.toUpperCase()}</label>
            <input
              style={inp}
              name={`context_${i}`}
              value={contextos[`context_${i}`] || ''}
              onChange={setCtx}
              placeholder={
                i === 'gl'
                  ? 'ex: ingrediente principal, proceso clave...'
                  : i === 'es'
                    ? 'ex: ingrediente principal, proceso clave...'
                    : 'ex: main ingredient, key process...'
              }
              onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-concept)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
            />
          </div>
        ))}
      </div>

      {/* Nivel e forza */}
      <div style={{
        paddingTop: 18,
        marginTop: 14,
        borderTop: '1px solid var(--gaia-cosmos-400)'
      }}>
        <label style={lbl}>Propiedades</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'nivelLabel') || 'Nivel'}</label>
            <select style={inp} name="level" value={form.level} onChange={set}>
              <option value="primary">{t(idioma, 'primaria') || 'Primaria'}</option>
              <option value="secondary">{t(idioma, 'secundaria') || 'Secundaria'}</option>
              <option value="expert">{t(idioma, 'experto') || 'Experto'}</option>
            </select>
          </div>
          <div>
            <label style={{ ...lbl, fontSize: 9 }}>{t(idioma, 'forza') || 'Forza'}</label>
            <select style={inp} name="strength" value={form.strength} onChange={set}>
              <option value="high">{t(idioma, 'alta') || 'Alta'}</option>
              <option value="medium">{t(idioma, 'media') || 'Media'}</option>
              <option value="low">{t(idioma, 'baixa') || 'Baixa'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botón crear */}
      <button
        onClick={handleSubmit}
        disabled={enviando || !orixe || !destino}
        style={{
          width: '100%',
          padding: 14,
          marginTop: 24,
          background: enviando
            ? 'var(--gaia-cosmos-700)'
            : (orixe && destino) ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
          color: enviando
            ? 'var(--gaia-text-disabled)'
            : (orixe && destino) ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
          border: `1px solid ${(orixe && destino) && !enviando ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10,
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          fontWeight: 700,
          cursor: enviando || !orixe || !destino ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: (orixe && destino) && !enviando ? '0 0 20px rgba(232, 165, 71, 0.25)' : 'none',
          transition: 'all 150ms ease'
        }}>
        {enviando
          ? 'Creando...'
          : <><IconoPlus /> {t(idioma, 'crearRelacion') || 'Crear relación'}</>
        }
      </button>

      {/* Mensaxe */}
      {mensaxe && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 10,
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
    </div>
  )
}

export default ConstructorRelacions