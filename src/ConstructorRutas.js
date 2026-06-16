import { useState, useEffect, useRef } from 'react'
import { t } from './i18n'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// ConstructorRutas — Creación de rutas pedagóxicas (journeys)
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idiomasActivos, idioma.
// Endpoints backend INTACTOS.
//
// BUG CRÍTICO ARRANXADO: os 2 fetches (GET /nodos, POST /journeys)
// non levaban authHeaders(). Creación de rutas fallaba con 401.
//
// MELLORAS:
//   1. authHeaders() en todos os fetches.
//   2. Lista de stops con reorder (↑↓) e delete preservada.
//   3. Campo MÓDULO con datalist de suxestións.
//   4. Preview da ruta (secuencia de nodos).
//   5. Mensaxes tipadas con auto-dismiss.
//   6. Validación antes de enviar.
//   7. Emojis (↑↓✕) → SVGs.
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
const IconoLibro = ({ size = 14 }) => (
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
// ── FIN: iconos_svg ──────────────────────────────────

function ConstructorRutas({ idiomasActivos = ['gl', 'es', 'en'], idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: form_inicial ─────────────────────────────
  const xerarFormInicial = () => {
    const campos = { level: 'primary', type: 'educational', modulo: '', icono: '📚' }
    idiomasActivos.forEach(i => {
      campos[`label_${i}`]       = ''
      campos[`description_${i}`] = ''
    })
    return campos
  }
  // ── FIN: form_inicial ────────────────────────────────

  // ── INICIO: estados ──────────────────────────────────
  const [nodos, setNodos]       = useState([])
  const [busca, setBusca]       = useState('')
  const [stops, setStops]       = useState([])
  const [mensaxe, setMensaxe]   = useState(null)
  const [form, setForm]         = useState(xerarFormInicial)
  const [tabIdioma, setTabIdioma] = useState(idiomasActivos[0] || 'gl')
  const [enviando, setEnviando] = useState(false)
  const mensaxeTimerRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_nodos ──────────────────────────────
  useEffect(() => {
    fetch(`${API}/nodos`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setNodos(d.nodos || []))
      .catch(e => console.error('[ConstructorRutas] Erro cargando nodos:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── FIN: carga_nodos ─────────────────────────────────

  // ── INICIO: mensaxe_helper ───────────────────────────
  const mostrarMensaxe = (tipo, texto) => {
    if (mensaxeTimerRef.current) clearTimeout(mensaxeTimerRef.current)
    setMensaxe({ tipo, texto })
    if (tipo === 'ok') {
      mensaxeTimerRef.current = setTimeout(() => setMensaxe(null), 4000)
    }
  }
  // ── FIN: mensaxe_helper ──────────────────────────────

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── INICIO: buscador_nodos ───────────────────────────
  const nodosFiltrados = nodos
    .filter(n =>
      !stops.find(s => s.nodo === n.id) &&
      (n.label?.toLowerCase().includes(busca.toLowerCase()) ||
       n.id?.toLowerCase().includes(busca.toLowerCase()))
    ).slice(0, 8)
  // ── FIN: buscador_nodos ──────────────────────────────

  // ── INICIO: xestión_stops ────────────────────────────
  const engadirStop = (nodo) => {
    setStops([...stops, {
      nodo: nodo.id,
      label: nodo.label,
      type: nodo.type,
      order: stops.length + 1
    }])
    setBusca('')
  }

  const borrarStop = (index) => {
    const novos = stops.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }))
    setStops(novos)
  }

  const moverStop = (index, direccion) => {
    if (direccion === 'up' && index === 0) return
    if (direccion === 'down' && index === stops.length - 1) return
    const novos = [...stops]
    const swap = direccion === 'up' ? index - 1 : index + 1
    ;[novos[index], novos[swap]] = [novos[swap], novos[index]]
    setStops(novos.map((s, i) => ({ ...s, order: i + 1 })))
  }
  // ── FIN: xestión_stops ───────────────────────────────

  // ── INICIO: enviar_ruta ──────────────────────────────
  const handleSubmit = async () => {
    if (!form.label_gl) {
      mostrarMensaxe('erro', t(idioma, 'nomeObrigatorioErro') || 'O nome en galego é obrigatorio')
      return
    }
    if (stops.length === 0) {
      mostrarMensaxe('erro', t(idioma, 'senPasosErro') || 'Engade polo menos un paso á ruta')
      return
    }

    setEnviando(true)

    try {
      const res = await fetch(`${API}/journeys`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stops })
      })

      if (!res.ok) {
        if (res.status === 401) {
          mostrarMensaxe('erro', 'Sesión caducada — volve iniciar sesión')
        } else {
          mostrarMensaxe('erro', `Erro do servidor (${res.status})`)
        }
        console.error('[ConstructorRutas] HTTP error:', res.status)
        return
      }

      const data = await res.json()
      console.log('[ConstructorRutas] Resposta:', data)

      if (data.ok) {
        mostrarMensaxe('ok', t(idioma, 'rutaCreadaOk', form.label_gl, data.id) || `Ruta "${form.label_gl}" creada`)
        setForm(xerarFormInicial())
        setStops([])
      } else {
        mostrarMensaxe('erro', `Erro: ${data.error || 'non se puido crear a ruta'}`)
      }
    } catch (e) {
      console.error('[ConstructorRutas] Excepción:', e)
      mostrarMensaxe('erro', `Erro de conexión: ${e.message || 'non se puido contactar'}`)
    } finally {
      setEnviando(false)
    }
  }
  // ── FIN: enviar_ruta ─────────────────────────────────

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
          color: 'var(--gaia-system)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <IconoLibro size={12} />
          Nova ruta pedagóxica
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
          {t(idioma, 'constructorRutasTitulo') || 'Crear ruta'}
        </h2>
      </div>

      {/* Selector de idioma */}
      <div style={{
        display: 'flex',
        gap: 3,
        marginBottom: 16,
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

      {/* Nome + descrición por idioma */}
      {idiomasActivos.map(i => (
        <div key={i} style={{ display: tabIdioma === i ? 'block' : 'none' }}>
          <label style={lbl}>
            {i === 'gl' ? 'Nome da ruta (obrigatorio)' : `Nome (${i.toUpperCase()})`}
          </label>
          <input
            style={{
              ...inp,
              borderColor: i === 'gl' && !form.label_gl ? 'var(--gaia-warning-border)' : 'var(--gaia-cosmos-400)'
            }}
            name={`label_${i}`}
            value={form[`label_${i}`] || ''}
            onChange={set}
            placeholder={i === 'gl' ? 'ex: Como se fai o pan' : ''}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = i === 'gl' && !form.label_gl ? 'var(--gaia-warning-border)' : 'var(--gaia-cosmos-400)'}
          />
          <label style={lbl}>Descrición ({i.toUpperCase()})</label>
          <textarea
            style={{ ...inp, height: 60, resize: 'vertical', lineHeight: 1.5 }}
            name={`description_${i}`}
            value={form[`description_${i}`] || ''}
            onChange={set}
            placeholder={
              i === 'gl'
                ? 'Unha ruta para aprender sobre...'
                : i === 'es'
                  ? 'Una ruta para aprender sobre...'
                  : 'A journey to learn about...'
            }
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
          />
        </div>
      ))}

      {/* Tipo + nivel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>{t(idioma, 'tipoRuta') || 'Tipo de ruta'}</label>
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
      </div>

      {/* Módulo + icono */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Módulo (categoría do árbore)</label>
          <input
            style={inp}
            name="modulo"
            value={form.modulo}
            onChange={set}
            list="modulos-suxeridos"
            placeholder="ex: Galicia, Ciencias, Oficios..."
            onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
          />
          <datalist id="modulos-suxeridos">
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
            value={form.icono}
            onChange={set}
            placeholder="📚"
            maxLength={2}
          />
        </div>
      </div>

      {/* Lista de pasos */}
      <div style={seccion}>
        <label style={lbl}>
          Pasos da ruta
          {stops.length > 0 && (
            <span style={{
              marginLeft: 8,
              color: 'var(--gaia-accent)',
              fontWeight: 700
            }}>
              · {stops.length}
            </span>
          )}
        </label>

        {stops.length === 0 && (
          <div style={{
            padding: '24px 16px',
            background: 'var(--gaia-cosmos-800)',
            border: '1px dashed var(--gaia-cosmos-400)',
            borderRadius: 10,
            textAlign: 'center',
            color: 'var(--gaia-text-tertiary)',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            marginBottom: 10
          }}>
            {t(idioma, 'senPasos') || 'Aínda non engadiches pasos á ruta'}
          </div>
        )}

        {stops.map((stop, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            marginBottom: 6,
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderLeft: `3px solid ${COR_TIPO[stop.type] || 'var(--gaia-accent)'}`,
            borderRadius: 8
          }}>
            {/* Número de paso */}
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

            {/* Info nodo */}
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
                {stop.label}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                marginTop: 2,
                letterSpacing: '0.025em'
              }}>
                <span style={{ color: COR_TIPO[stop.type] || 'var(--gaia-text-secondary)' }}>
                  {stop.type}
                </span>
                <span style={{ color: 'var(--gaia-text-disabled)' }}> · {stop.nodo}</span>
              </div>
            </div>

            {/* Controis */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => moverStop(i, 'up')}
                disabled={i === 0}
                title="Mover arriba"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gaia-cosmos-400)',
                  color: i === 0 ? 'var(--gaia-text-disabled)' : 'var(--gaia-text-secondary)',
                  borderRadius: 6,
                  padding: '5px 7px',
                  cursor: i === 0 ? 'not-allowed' : 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { if (i !== 0) e.currentTarget.style.color = 'var(--gaia-text-primary)' }}
                onMouseLeave={e => { if (i !== 0) e.currentTarget.style.color = 'var(--gaia-text-secondary)' }}>
                <IconoArriba />
              </button>
              <button
                onClick={() => moverStop(i, 'down')}
                disabled={i === stops.length - 1}
                title="Mover abaixo"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gaia-cosmos-400)',
                  color: i === stops.length - 1 ? 'var(--gaia-text-disabled)' : 'var(--gaia-text-secondary)',
                  borderRadius: 6,
                  padding: '5px 7px',
                  cursor: i === stops.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { if (i !== stops.length - 1) e.currentTarget.style.color = 'var(--gaia-text-primary)' }}
                onMouseLeave={e => { if (i !== stops.length - 1) e.currentTarget.style.color = 'var(--gaia-text-secondary)' }}>
                <IconoAbaixo />
              </button>
              <button
                onClick={() => borrarStop(i)}
                title="Eliminar"
                style={{
                  background: 'var(--gaia-danger-bg)',
                  border: '1px solid var(--gaia-danger-border)',
                  color: 'var(--gaia-danger)',
                  borderRadius: 6,
                  padding: '5px 7px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}>
                <IconoX />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buscador para engadir pasos */}
      <div style={{ marginTop: 16 }}>
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
            marginBottom: 12,
            overflow: 'hidden',
            maxHeight: 260,
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

      {/* Preview da ruta */}
      {stops.length > 0 && (
        <div style={{
          padding: '14px 16px',
          marginTop: 8,
          background: 'var(--gaia-success-bg)',
          border: '1px solid var(--gaia-success-border)',
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-success)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 8
          }}>
            Percorrido
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            lineHeight: 1.8
          }}>
            {stops.map((s, i) => (
              <span key={i}>
                <span style={{
                  color: COR_TIPO[s.type] || 'var(--gaia-accent)',
                  fontWeight: 600
                }}>
                  {s.label}
                </span>
                {i < stops.length - 1 && (
                  <span style={{ color: 'var(--gaia-text-tertiary)', margin: '0 8px' }}>→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón crear */}
      <button
        onClick={handleSubmit}
        disabled={enviando || !form.label_gl || stops.length === 0}
        style={{
          width: '100%',
          padding: 14,
          marginTop: 24,
          background: enviando
            ? 'var(--gaia-cosmos-700)'
            : (form.label_gl && stops.length > 0) ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
          color: enviando
            ? 'var(--gaia-text-disabled)'
            : (form.label_gl && stops.length > 0) ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
          border: `1px solid ${(form.label_gl && stops.length > 0) && !enviando ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10,
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          fontWeight: 700,
          cursor: enviando || !form.label_gl || stops.length === 0 ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: (form.label_gl && stops.length > 0) && !enviando ? '0 0 20px rgba(232, 165, 71, 0.25)' : 'none',
          transition: 'all 150ms ease'
        }}>
        {enviando
          ? 'Creando...'
          : <><IconoPlus /> {t(idioma, 'crearRuta') || 'Crear ruta'}</>
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

export default ConstructorRutas