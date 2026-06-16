import { useState, useEffect, useMemo } from 'react'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// TabelaNodos — Administración de datos GAIA
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1 para sistema de deseño GAIA.
// API pública (props) non cambiou: onEditarNodo, onBorrarNodo,
// idioma. Compatibilidade total con App.js e ModoArquitecto.
// ═══════════════════════════════════════════════════════════

// ── INICIO: config_api ───────────────────────────────
// ── FIN: config_api ──────────────────────────────────

// ── INICIO: cores_tipo_semanticas ────────────────────
// Cores da paleta semántica oficial GAIA v1.1.
// Coherentes co mapa e o resto da UI.
const COR_TIPO = {
  origin:        '#f5f7ff',  // var(--gaia-origin)
  galaxy:        '#ffd966',  // var(--gaia-galaxy)
  constellation: '#5dd4a8',  // var(--gaia-constellation)
  system:        '#7dd3fc',  // var(--gaia-system)
  concept:       '#9bb3ff',  // var(--gaia-concept)
  process:       '#ff9fb8'   // var(--gaia-process)
}

// Glow equivalente para cada tipo (usado nos dots dos chips)
const COR_TIPO_GLOW = {
  origin:        'rgba(245, 247, 255, 0.4)',
  galaxy:        'rgba(255, 217, 102, 0.5)',
  constellation: 'rgba(93, 212, 168, 0.5)',
  system:        'rgba(125, 211, 252, 0.5)',
  concept:       'rgba(155, 179, 255, 0.5)',
  process:       'rgba(255, 159, 184, 0.5)'
}
// ── FIN: cores_tipo_semanticas ───────────────────────

// ── INICIO: estilos_base ─────────────────────────────
const inp = {
  padding: '7px 12px',
  background: 'var(--gaia-cosmos-800)',
  border: '1px solid var(--gaia-cosmos-400)',
  color: 'var(--gaia-text-primary)',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'var(--gaia-font-body)',
  outline: 'none',
  transition: 'all 150ms ease'
}

const th = {
  padding: '10px 12px',
  fontSize: 10,
  color: 'var(--gaia-text-tertiary)',
  fontFamily: 'var(--gaia-font-mono)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 600,
  borderBottom: '1px solid var(--gaia-cosmos-400)',
  textAlign: 'left',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap'
}

const td = {
  padding: '10px 12px',
  fontSize: 12,
  fontFamily: 'var(--gaia-font-body)',
  borderBottom: '1px solid var(--gaia-cosmos-400)',
  color: 'var(--gaia-text-secondary)',
  verticalAlign: 'middle'
}
// ── FIN: estilos_base ────────────────────────────────

// ── INICIO: barra_relacions ──────────────────────────
function BarraRelacions({ valor, max }) {
  const pct = max > 0 ? (valor / max) * 100 : 0
  const cor = valor === 0
    ? 'var(--gaia-danger)'
    : valor < 3
      ? 'var(--gaia-warning)'
      : 'var(--gaia-success)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 80,
        height: 6,
        background: 'var(--gaia-cosmos-500)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: cor,
          borderRadius: 3,
          transition: 'width 300ms ease'
        }} />
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: 'var(--gaia-font-mono)',
        color: valor === 0 ? 'var(--gaia-danger)' : 'var(--gaia-text-tertiary)',
        minWidth: 16
      }}>
        {valor}
      </span>
    </div>
  )
}
// ── FIN: barra_relacions ─────────────────────────────

// ── INICIO: chip_semantico ───────────────────────────
// Chip con dot coloreado e glow para tipos de nodo.
// Substitúe os badges uniformes antigos.
function ChipTipo({ tipo }) {
  const cor = COR_TIPO[tipo] || '#888'
  const glow = COR_TIPO_GLOW[tipo] || 'transparent'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'var(--gaia-font-body)',
      letterSpacing: '0.025em',
      textTransform: 'lowercase',
      background: `${cor}14`,
      color: cor,
      border: `1px solid ${cor}44`
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cor,
        boxShadow: `0 0 4px ${glow}`,
        flexShrink: 0
      }} />
      {tipo}
    </span>
  )
}
// ── FIN: chip_semantico ──────────────────────────────

// ── INICIO: badge_status ─────────────────────────────
// Badge con estilo diferente ao ChipTipo para evitar colisión visual.
// Formato: fondo suave + dot con glow + texto.
function BadgeStatus({ status }) {
  const mapa = {
    validated:  { label: 'validado',   cor: 'var(--gaia-success)', bg: 'var(--gaia-success-bg)', border: 'var(--gaia-success-border)' },
    draft:      { label: 'borrador',   cor: 'var(--gaia-text-tertiary)', bg: 'var(--gaia-cosmos-700)', border: 'var(--gaia-cosmos-400)' },
    deprecated: { label: 'deprecado',  cor: 'var(--gaia-danger)', bg: 'var(--gaia-danger-bg)', border: 'var(--gaia-danger-border)' },
  }
  const s = mapa[status] || mapa.draft

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 500,
      fontFamily: 'var(--gaia-font-body)',
      background: s.bg,
      color: s.cor,
      border: `1px solid ${s.border}`
    }}>
      <span style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: s.cor,
        boxShadow: `0 0 6px ${s.cor}`,
        flexShrink: 0
      }} />
      {s.label}
    </span>
  )
}
// ── FIN: badge_status ────────────────────────────────

// ── INICIO: chip_relacion_tipo ───────────────────────
// Badge para tipos de relación (PERTENCE_A, CONTÉN...)
function ChipRelacion({ tipo }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'var(--gaia-font-mono)',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: 'var(--gaia-accent-bg)',
      color: 'var(--gaia-accent)',
      border: '1px solid var(--gaia-accent-border)'
    }}>
      {tipo}
    </span>
  )
}
// ── FIN: chip_relacion_tipo ──────────────────────────

// ── INICIO: celda_autoria ────────────────────────────
// Celda que mostra autor + centro con avatar.
// Peza crítica para o pitch AMTEGA.
function CeldaAutoria({ autor, centro }) {
  if (!autor && !centro) {
    return <span style={{ fontSize: 10, color: 'var(--gaia-text-disabled)' }}>—</span>
  }

  const inicial = (autor || centro || '?').charAt(0).toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--gaia-concept), var(--gaia-constellation))',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--gaia-font-display)',
        fontWeight: 700,
        fontSize: 10,
        color: 'var(--gaia-cosmos-900)',
        flexShrink: 0
      }}>
        {inicial}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.25 }}>
        {autor && (
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--gaia-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {autor}
          </span>
        )}
        {centro && (
          <span style={{
            fontSize: 9,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.025em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {centro}
          </span>
        )}
      </div>
    </div>
  )
}
// ── FIN: celda_autoria ───────────────────────────────

// ── INICIO: compoñente_paxinacion ────────────────────
function ControlsPaxinacion({ paxinaActual, totalPaxinas, porPaxina, onCambioPaxina, onCambioPorPaxina, totalItems, etiqueta }) {
  if (totalItems === 0) return null

  const inicio = (paxinaActual - 1) * porPaxina + 1
  const fin = Math.min(paxinaActual * porPaxina, totalItems)

  const botoesVisibes = () => {
    const bots = []
    const delta = 2
    for (let i = 1; i <= totalPaxinas; i++) {
      if (i === 1 || i === totalPaxinas || (i >= paxinaActual - delta && i <= paxinaActual + delta)) {
        bots.push(i)
      }
    }
    const result = []
    let anterior = null
    for (const b of bots) {
      if (anterior !== null && b - anterior > 1) result.push('...')
      result.push(b)
      anterior = b
    }
    return result
  }

  const btnBase = {
    padding: '4px 9px',
    fontSize: 11,
    fontFamily: 'var(--gaia-font-mono)',
    cursor: 'pointer',
    border: '1px solid var(--gaia-cosmos-400)',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--gaia-text-secondary)',
    transition: 'all 150ms'
  }
  const btnActivo = {
    ...btnBase,
    background: 'var(--gaia-accent)',
    color: 'var(--gaia-cosmos-900)',
    border: '1px solid var(--gaia-accent)',
    fontWeight: 700
  }
  const btnDesact = { ...btnBase, cursor: 'not-allowed', opacity: 0.3 }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 4px',
      flexWrap: 'wrap',
      gap: 8
    }}>
      <span style={{
        fontSize: 11,
        fontFamily: 'var(--gaia-font-mono)',
        color: 'var(--gaia-text-tertiary)'
      }}>
        <strong style={{ color: 'var(--gaia-text-primary)' }}>{inicio}–{fin}</strong> de {totalItems} {etiqueta}
      </span>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          style={paxinaActual === 1 ? btnDesact : btnBase}
          disabled={paxinaActual === 1}
          onClick={() => onCambioPaxina(paxinaActual - 1)}
        >‹</button>
        {botoesVisibes().map((b, i) =>
          b === '...'
            ? <span key={`sep-${i}`} style={{
                color: 'var(--gaia-text-disabled)',
                fontSize: 11,
                padding: '0 4px'
              }}>…</span>
            : <button
                key={b}
                style={b === paxinaActual ? btnActivo : btnBase}
                onClick={() => onCambioPaxina(b)}
              >{b}</button>
        )}
        <button
          style={paxinaActual === totalPaxinas ? btnDesact : btnBase}
          disabled={paxinaActual === totalPaxinas}
          onClick={() => onCambioPaxina(paxinaActual + 1)}
        >›</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)'
        }}>
          Por páxina:
        </span>
        <select
          style={{ ...inp, padding: '3px 6px', fontSize: 11 }}
          value={porPaxina}
          onChange={e => onCambioPorPaxina(Number(e.target.value))}
        >
          {[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  )
}
// ── FIN: compoñente_paxinacion ───────────────────────

function TabelaNodos({ onEditarNodo, onBorrarNodo, idioma = 'gl' }) {

  // ── INICIO: estados ──────────────────────────────────
  const [vista, setVista] = useState('nodos')
  const [nodos, setNodos] = useState([])
  const [relacions, setRelacions] = useState([])
  const [conteoRelacions, setConteoRelacions] = useState({})
  const [cargando, setCargando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroIllado, setFiltroIllado] = useState(false)
  const [filtroSenContexto, setFiltroSenContexto] = useState(false)
  const [filtroCentro, setFiltroCentro] = useState('todos')
  const [ordenPor, setOrdenPor] = useState('relacions')
  const [ordenDir, setOrdenDir] = useState('desc')
  const [paxinaNodos, setPaxinaNodos] = useState(1)
  const [paxinaRelacions, setPaxinaRelacions] = useState(1)
  const [porPaxinaNodos, setPorPaxinaNodos] = useState(25)
  const [porPaxinaRelacions, setPorPaxinaRelacions] = useState(25)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: reset_paxina_en_filtro ───────────────────
  useEffect(() => { setPaxinaNodos(1) }, [busca, filtroTipo, filtroStatus, filtroIllado, filtroCentro, ordenPor, ordenDir])
  useEffect(() => { setPaxinaRelacions(1) }, [busca, filtroSenContexto, ordenPor, ordenDir])
  // ── FIN: reset_paxina_en_filtro ──────────────────────

  // ── INICIO: carga_datos ──────────────────────────────
  useEffect(() => {
    setCargando(true)
    Promise.all([
      fetch(`${API}/nodos`).then(r => r.json()),
      fetch(`${API}/relacions`).then(r => r.json())
    ]).then(([nodosData, relData]) => {
      const todosNodos = nodosData.nodos || []
      const todasRelacions = relData.relacions || []

      const conteo = {}
      todosNodos.forEach(n => { conteo[n.id] = 0 })
      todasRelacions.forEach(r => {
        if (conteo[r.source] !== undefined) conteo[r.source]++
        if (conteo[r.target] !== undefined) conteo[r.target]++
      })

      setNodos(todosNodos)
      setRelacions(todasRelacions)
      setConteoRelacions(conteo)
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])
  // ── FIN: carga_datos ─────────────────────────────────

  // ── INICIO: ordenar ──────────────────────────────────
  const toggleOrden = (campo) => {
    if (ordenPor === campo) {
      setOrdenDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenPor(campo)
      setOrdenDir('desc')
    }
  }
  const flechaOrden = (campo) => ordenPor === campo ? (ordenDir === 'asc' ? ' ↑' : ' ↓') : ''
  // ── FIN: ordenar ─────────────────────────────────────

  // ── INICIO: centros_unicos ───────────────────────────
  const centrosUnicos = useMemo(() => {
    const cs = [...new Set(nodos.map(n => n.centro).filter(Boolean))].sort()
    return cs
  }, [nodos])
  // ── FIN: centros_unicos ──────────────────────────────

  // ── INICIO: nodos_filtrados ──────────────────────────
  const nodosFiltrados = useMemo(() => {
    let resultado = [...nodos]

    if (busca) {
      const b = busca.toLowerCase()
      resultado = resultado.filter(n =>
        n.label?.toLowerCase().includes(b) ||
        n.id?.toLowerCase().includes(b) ||
        n.autor?.toLowerCase().includes(b) ||
        n.centro?.toLowerCase().includes(b)
      )
    }
    if (filtroTipo !== 'todos') resultado = resultado.filter(n => n.type === filtroTipo)
    if (filtroStatus !== 'todos') resultado = resultado.filter(n => n.status === filtroStatus)
    if (filtroIllado) resultado = resultado.filter(n => (conteoRelacions[n.id] || 0) === 0)
    if (filtroCentro !== 'todos') resultado = resultado.filter(n => n.centro === filtroCentro)

    resultado.sort((a, b) => {
      let va, vb
      if (ordenPor === 'relacions') { va = conteoRelacions[a.id] || 0; vb = conteoRelacions[b.id] || 0 }
      else if (ordenPor === 'nome') { va = a.label || ''; vb = b.label || '' }
      else if (ordenPor === 'tipo') { va = a.type || ''; vb = b.type || '' }
      else if (ordenPor === 'status') { va = a.status || ''; vb = b.status || '' }
      else if (ordenPor === 'centro') { va = a.centro || ''; vb = b.centro || '' }
      else { va = 0; vb = 0 }

      if (typeof va === 'string') return ordenDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return ordenDir === 'asc' ? va - vb : vb - va
    })

    return resultado
  }, [nodos, busca, filtroTipo, filtroStatus, filtroIllado, filtroCentro, ordenPor, ordenDir, conteoRelacions])
  // ── FIN: nodos_filtrados ─────────────────────────────

  // ── INICIO: nodos_paxinados ──────────────────────────
  const totalPaxinasNodos = Math.max(1, Math.ceil(nodosFiltrados.length / porPaxinaNodos))
  const nodosPaxinados = useMemo(() => {
    const inicio = (paxinaNodos - 1) * porPaxinaNodos
    return nodosFiltrados.slice(inicio, inicio + porPaxinaNodos)
  }, [nodosFiltrados, paxinaNodos, porPaxinaNodos])
  // ── FIN: nodos_paxinados ─────────────────────────────

  // ── INICIO: relacions_filtradas ──────────────────────
  const relacionsFiltradas = useMemo(() => {
    let resultado = [...relacions]

    if (busca) {
      const b = busca.toLowerCase()
      resultado = resultado.filter(r =>
        r.source?.toLowerCase().includes(b) ||
        r.target?.toLowerCase().includes(b) ||
        r.tipo?.toLowerCase().includes(b)
      )
    }
    if (filtroSenContexto) {
      resultado = resultado.filter(r => !r.context_gl && !r.context_es && !r.context_en)
    }

    resultado.sort((a, b) => {
      if (ordenPor === 'tipo') return ordenDir === 'asc'
        ? a.tipo?.localeCompare(b.tipo)
        : b.tipo?.localeCompare(a.tipo)
      return 0
    })

    return resultado
  }, [relacions, busca, filtroSenContexto, ordenPor, ordenDir])
  // ── FIN: relacions_filtradas ─────────────────────────

  // ── INICIO: relacions_paxinadas ──────────────────────
  const totalPaxinasRelacions = Math.max(1, Math.ceil(relacionsFiltradas.length / porPaxinaRelacions))
  const relacionsPaxinadas = useMemo(() => {
    const inicio = (paxinaRelacions - 1) * porPaxinaRelacions
    return relacionsFiltradas.slice(inicio, inicio + porPaxinaRelacions)
  }, [relacionsFiltradas, paxinaRelacions, porPaxinaRelacions])
  // ── FIN: relacions_paxinadas ─────────────────────────

  // ── INICIO: stats ────────────────────────────────────
  const maxRelacions = Math.max(...Object.values(conteoRelacions), 1)
  const nodosIllados = nodos.filter(n => (conteoRelacions[n.id] || 0) === 0).length
  const relacionsSenContexto = relacions.filter(r => !r.context_gl && !r.context_es && !r.context_en).length
  const tiposUnicos = [...new Set(nodos.map(n => n.type))].sort()
  // ── FIN: stats ───────────────────────────────────────

  // ── INICIO: tab_btn ──────────────────────────────────
  const tabBtn = (v) => ({
    padding: '8px 18px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--gaia-font-body)',
    cursor: 'pointer',
    background: vista === v ? 'var(--gaia-accent)' : 'transparent',
    color: vista === v ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-secondary)',
    border: `1px solid ${vista === v ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
    borderRadius: 6,
    transition: 'all 150ms ease'
  })
  // ── FIN: tab_btn ─────────────────────────────────────

  if (cargando) return (
    <div style={{
      padding: 40,
      color: 'var(--gaia-text-tertiary)',
      fontFamily: 'var(--gaia-font-mono)',
      fontSize: 13,
      textAlign: 'center'
    }}>
      Cargando datos...
    </div>
  )

  return (
    <div style={{
      padding: '20px 24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ═════════════════════════════════════════
          CABECEIRA
          ═════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--gaia-font-display)',
            color: 'var(--gaia-text-primary)',
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Administración de datos
          </h2>
          <p style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 11,
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.05em',
            margin: '4px 0 0 0'
          }}>
            {nodos.length} nodos · {relacions.length} relacións
            {centrosUnicos.length > 0 && ` · ${centrosUnicos.length} centros participantes`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={tabBtn('nodos')} onClick={() => setVista('nodos')}>
            Nodos ({nodos.length})
          </button>
          <button style={tabBtn('relacions')} onClick={() => setVista('relacions')}>
            Relacións ({relacions.length})
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════
          MÉTRICAS (xerarquizadas: 2 principais + 2 alertas)
          ═════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr 1fr',
        gap: 12
      }}>
        {/* Total nodos */}
        <div style={{
          padding: '14px 16px',
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 10,
          transition: 'border-color 200ms ease'
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4
          }}>
            Total nodos
          </div>
          <div style={{
            fontSize: 28,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: 'var(--gaia-text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {nodos.length}
          </div>
        </div>

        {/* Total relacións */}
        <div style={{
          padding: '14px 16px',
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4
          }}>
            Total relacións
          </div>
          <div style={{
            fontSize: 28,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: 'var(--gaia-text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {relacions.length}
          </div>
        </div>

        {/* Alerta: illados */}
        <div style={{
          padding: '14px 16px',
          background: nodosIllados > 0 ? 'rgba(248, 113, 113, 0.03)' : 'var(--gaia-cosmos-800)',
          border: `1px solid ${nodosIllados > 0 ? 'rgba(248, 113, 113, 0.15)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4
          }}>
            Illados
          </div>
          <div style={{
            fontSize: 22,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: nodosIllados > 0 ? 'var(--gaia-danger)' : 'var(--gaia-success)',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {nodosIllados}
          </div>
        </div>

        {/* Alerta: sen contexto */}
        <div style={{
          padding: '14px 16px',
          background: relacionsSenContexto > 0 ? 'rgba(251, 191, 36, 0.03)' : 'var(--gaia-cosmos-800)',
          border: `1px solid ${relacionsSenContexto > 0 ? 'rgba(251, 191, 36, 0.15)' : 'var(--gaia-cosmos-400)'}`,
          borderRadius: 10
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4
          }}>
            Sen contexto
          </div>
          <div style={{
            fontSize: 22,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: relacionsSenContexto > 0 ? 'var(--gaia-warning)' : 'var(--gaia-success)',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {relacionsSenContexto}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════
          FILTROS
          ═════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gaia-text-tertiary)',
              pointerEvents: 'none'
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={{ ...inp, paddingLeft: 34, width: '100%' }}
            placeholder="Buscar por nome, id, autor ou centro..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {vista === 'nodos' && <>
          <select style={inp} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select style={inp} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="draft">Borrador</option>
            <option value="validated">Validado</option>
            <option value="deprecated">Deprecado</option>
          </select>

          {centrosUnicos.length > 0 && (
            <select style={inp} value={filtroCentro} onChange={e => setFiltroCentro(e.target.value)}>
              <option value="todos">Todos os centros</option>
              {centrosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            color: filtroIllado ? 'var(--gaia-danger)' : 'var(--gaia-text-tertiary)',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${filtroIllado ? 'var(--gaia-danger-border)' : 'var(--gaia-cosmos-400)'}`,
            background: filtroIllado ? 'var(--gaia-danger-bg)' : 'transparent',
            transition: 'all 150ms ease'
          }}>
            <input
              type="checkbox"
              checked={filtroIllado}
              onChange={e => setFiltroIllado(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Só illados
          </label>
        </>}

        {vista === 'relacions' && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            color: filtroSenContexto ? 'var(--gaia-warning)' : 'var(--gaia-text-tertiary)',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${filtroSenContexto ? 'var(--gaia-warning-border)' : 'var(--gaia-cosmos-400)'}`,
            background: filtroSenContexto ? 'var(--gaia-warning-bg)' : 'transparent',
            transition: 'all 150ms ease'
          }}>
            <input
              type="checkbox"
              checked={filtroSenContexto}
              onChange={e => setFiltroSenContexto(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Só sen contexto
          </label>
        )}

        <div style={{
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          marginLeft: 'auto',
          letterSpacing: '0.025em'
        }}>
          {vista === 'nodos' ? `${nodosFiltrados.length} nodos` : `${relacionsFiltradas.length} relacións`}
        </div>
      </div>

      {/* ═════════════════════════════════════════
          TÁBOA DE NODOS
          ═════════════════════════════════════════ */}
      {vista === 'nodos' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '10px 10px 0 0',
            border: '1px solid var(--gaia-cosmos-400)',
            borderBottom: 'none',
            background: 'var(--gaia-cosmos-800)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                position: 'sticky',
                top: 0,
                background: 'var(--gaia-cosmos-700)',
                zIndex: 1
              }}>
                <tr>
                  <th style={th} onClick={() => toggleOrden('nome')}>Nome{flechaOrden('nome')}</th>
                  <th style={th} onClick={() => toggleOrden('tipo')}>Tipo{flechaOrden('tipo')}</th>
                  <th style={th} onClick={() => toggleOrden('status')}>Status{flechaOrden('status')}</th>
                  <th style={th} onClick={() => toggleOrden('relacions')}>Relacións{flechaOrden('relacions')}</th>
                  <th style={th} onClick={() => toggleOrden('centro')}>Autor · Centro{flechaOrden('centro')}</th>
                  <th style={th}>Illado</th>
                  <th style={{ ...th, cursor: 'default' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {nodosPaxinados.map(n => {
                  const numRel = conteoRelacions[n.id] || 0
                  const illado = numRel === 0
                  return (
                    <tr key={n.id}
                      style={{
                        background: illado ? 'rgba(248, 113, 113, 0.04)' : 'transparent',
                        transition: 'background 150ms'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = illado
                        ? 'rgba(248, 113, 113, 0.08)'
                        : 'var(--gaia-cosmos-700)'
                      }
                      onMouseLeave={e => e.currentTarget.style.background = illado
                        ? 'rgba(248, 113, 113, 0.04)'
                        : 'transparent'
                      }
                    >
                      <td style={td}>
                        <div style={{
                          fontWeight: 600,
                          color: 'var(--gaia-text-primary)',
                          fontSize: 13
                        }}>
                          {n.label}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--gaia-font-mono)',
                          color: 'var(--gaia-text-disabled)',
                          marginTop: 2,
                          letterSpacing: '0.025em'
                        }}>
                          {n.id}
                        </div>
                      </td>
                      <td style={td}>
                        <ChipTipo tipo={n.type} />
                      </td>
                      <td style={td}>
                        <BadgeStatus status={n.status} />
                      </td>
                      <td style={td}>
                        <BarraRelacions valor={numRel} max={maxRelacions} />
                      </td>
                      <td style={td}>
                        <CeldaAutoria autor={n.autor} centro={n.centro} />
                      </td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        {illado && (
                          <span
                            style={{ color: 'var(--gaia-danger)', fontSize: 14 }}
                            title="Sen relacións"
                          >⚠</span>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {onEditarNodo && (
                            <button
                              onClick={() => onEditarNodo(n.id)}
                              style={{
                                padding: '4px 10px',
                                fontSize: 11,
                                fontFamily: 'var(--gaia-font-body)',
                                fontWeight: 500,
                                background: 'var(--gaia-accent-bg)',
                                border: '1px solid var(--gaia-accent-border)',
                                color: 'var(--gaia-accent)',
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'all 150ms ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--gaia-accent)'
                                e.currentTarget.style.color = 'var(--gaia-cosmos-900)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--gaia-accent-bg)'
                                e.currentTarget.style.color = 'var(--gaia-accent)'
                              }}
                            >
                              Editar
                            </button>
                          )}
                          {onBorrarNodo && (
                            <button
                              onClick={() => onBorrarNodo(n.id, n.label)}
                              style={{
                                padding: '4px 10px',
                                fontSize: 11,
                                background: 'var(--gaia-danger-bg)',
                                border: '1px solid var(--gaia-danger-border)',
                                color: 'var(--gaia-danger)',
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'all 150ms ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--gaia-danger-bg)'
                              }}
                              title="Borrar"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {nodosPaxinados.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{
                      ...td,
                      textAlign: 'center',
                      color: 'var(--gaia-text-disabled)',
                      padding: 32,
                      fontFamily: 'var(--gaia-font-mono)'
                    }}>
                      Sen resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{
            borderRadius: '0 0 10px 10px',
            border: '1px solid var(--gaia-cosmos-400)',
            borderTop: 'none',
            background: 'var(--gaia-cosmos-700)',
            padding: '0 12px'
          }}>
            <ControlsPaxinacion
              paxinaActual={paxinaNodos}
              totalPaxinas={totalPaxinasNodos}
              porPaxina={porPaxinaNodos}
              onCambioPaxina={setPaxinaNodos}
              onCambioPorPaxina={(n) => { setPorPaxinaNodos(n); setPaxinaNodos(1) }}
              totalItems={nodosFiltrados.length}
              etiqueta="nodos"
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════
          TÁBOA DE RELACIÓNS
          ═════════════════════════════════════════ */}
      {vista === 'relacions' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '10px 10px 0 0',
            border: '1px solid var(--gaia-cosmos-400)',
            borderBottom: 'none',
            background: 'var(--gaia-cosmos-800)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                position: 'sticky',
                top: 0,
                background: 'var(--gaia-cosmos-700)',
                zIndex: 1
              }}>
                <tr>
                  <th style={th}>Orixe</th>
                  <th style={{ ...th, cursor: 'default' }}>Tipo</th>
                  <th style={th}>Destino</th>
                  <th style={th} onClick={() => toggleOrden('tipo')}>
                    Contexto GL{flechaOrden('tipo')}
                  </th>
                  <th style={{ ...th, cursor: 'default', textAlign: 'center' }}>ES</th>
                  <th style={{ ...th, cursor: 'default', textAlign: 'center' }}>EN</th>
                </tr>
              </thead>
              <tbody>
                {relacionsPaxinadas.map((r, i) => {
                  const tenGL = !!r.context_gl
                  const tenES = !!r.context_es
                  const tenEN = !!r.context_en
                  const senContexto = !tenGL && !tenES && !tenEN
                  return (
                    <tr key={i}
                      style={{
                        background: senContexto ? 'rgba(251, 191, 36, 0.04)' : 'transparent'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = senContexto
                        ? 'rgba(251, 191, 36, 0.08)'
                        : 'var(--gaia-cosmos-700)'
                      }
                      onMouseLeave={e => e.currentTarget.style.background = senContexto
                        ? 'rgba(251, 191, 36, 0.04)'
                        : 'transparent'
                      }
                    >
                      <td style={td}>
                        <span style={{
                          fontSize: 11,
                          color: 'var(--gaia-system)',
                          fontFamily: 'var(--gaia-font-mono)'
                        }}>
                          {r.source}
                        </span>
                      </td>
                      <td style={td}>
                        <ChipRelacion tipo={r.tipo} />
                      </td>
                      <td style={td}>
                        <span style={{
                          fontSize: 11,
                          color: 'var(--gaia-system)',
                          fontFamily: 'var(--gaia-font-mono)'
                        }}>
                          {r.target}
                        </span>
                      </td>
                      <td style={{ ...td, maxWidth: 260 }}>
                        {tenGL ? (
                          <span
                            style={{
                              fontSize: 11,
                              color: 'var(--gaia-text-secondary)',
                              fontStyle: 'italic'
                            }}
                            title={r.context_gl}
                          >
                            {r.context_gl.length > 60 ? r.context_gl.slice(0, 60) + '...' : r.context_gl}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 11,
                            color: 'var(--gaia-warning)',
                            fontFamily: 'var(--gaia-font-mono)'
                          }}>
                            ⚠ Sen contexto
                          </span>
                        )}
                      </td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        {tenES
                          ? <span style={{ color: 'var(--gaia-success)', fontSize: 14 }}>✓</span>
                          : <span style={{ color: 'var(--gaia-text-disabled)', fontSize: 14 }}>—</span>
                        }
                      </td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        {tenEN
                          ? <span style={{ color: 'var(--gaia-success)', fontSize: 14 }}>✓</span>
                          : <span style={{ color: 'var(--gaia-text-disabled)', fontSize: 14 }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
                {relacionsPaxinadas.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{
                      ...td,
                      textAlign: 'center',
                      color: 'var(--gaia-text-disabled)',
                      padding: 32,
                      fontFamily: 'var(--gaia-font-mono)'
                    }}>
                      Sen resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{
            borderRadius: '0 0 10px 10px',
            border: '1px solid var(--gaia-cosmos-400)',
            borderTop: 'none',
            background: 'var(--gaia-cosmos-700)',
            padding: '0 12px'
          }}>
            <ControlsPaxinacion
              paxinaActual={paxinaRelacions}
              totalPaxinas={totalPaxinasRelacions}
              porPaxina={porPaxinaRelacions}
              onCambioPaxina={setPaxinaRelacions}
              onCambioPorPaxina={(n) => { setPorPaxinaRelacions(n); setPaxinaRelacions(1) }}
              totalItems={relacionsFiltradas.length}
              etiqueta="relacións"
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default TabelaNodos