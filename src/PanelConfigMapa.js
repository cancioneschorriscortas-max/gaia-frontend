import { useState } from 'react'
import MAPA_CONFIG from './mapaConfig'

// ═══════════════════════════════════════════════════════════
// PanelConfigMapa — Panel de configuración visual do mapa
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: config, onChange.
//
// BUG CRÍTICO ARRANXADO:
//   A sección "RENDEMENTO 3D" estaba declarada fóra do return
//   (entre as funcións e o return), como JSX solto que React
//   evaluaba e descartaba. Isto significaba que os sliders de
//   bloom strength/radius/threshold + warmup_ticks NON EXISTÍAN
//   no panel. Agora están dentro do return, visibles.
//
// MELLORAS:
//   1. Paleta v1.1 completa. Ámbar como cor primaria do panel.
//   2. Compoñentes internos (Slider, ColorPicker, Toggle, Seccion)
//      redesignados para coherencia.
//   3. Emoji ⚙ → SVG.
//   4. Export/Reset con iconas + feedback visual.
// ═══════════════════════════════════════════════════════════

// ── INICIO: utilidade_deep_clone ─────────────────────
const clonar = (obj) => JSON.parse(JSON.stringify(obj))
// ── FIN: utilidade_deep_clone ────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoAxustes = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const IconoChevron = ({ aberto, size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconoReset = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
)
const IconoExportar = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: Slider ───────────────────────────────────
function Slider({ label, value, min, max, step = 1, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{
          color: 'var(--gaia-text-tertiary)',
          fontSize: 11,
          fontFamily: 'var(--gaia-font-body)'
        }}>
          {label}
        </span>
        <span style={{
          color: 'var(--gaia-accent)',
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--gaia-accent)',
          cursor: 'pointer'
        }}
      />
    </div>
  )
}
// ── FIN: Slider ──────────────────────────────────────

// ── INICIO: ColorPicker ──────────────────────────────
function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }}>
      <span style={{
        color: 'var(--gaia-text-tertiary)',
        fontSize: 11,
        fontFamily: 'var(--gaia-font-body)'
      }}>
        {label}
      </span>
      <div style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-disabled)',
          letterSpacing: '0.02em'
        }}>
          {value}
        </span>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 36,
            height: 22,
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 4,
            cursor: 'pointer',
            background: 'none',
            padding: 0
          }}
        />
      </div>
    </div>
  )
}
// ── FIN: ColorPicker ─────────────────────────────────

// ── INICIO: Toggle ───────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }}>
      <span style={{
        color: 'var(--gaia-text-tertiary)',
        fontSize: 11,
        fontFamily: 'var(--gaia-font-body)'
      }}>
        {label}
      </span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 18,
          borderRadius: 9,
          background: value ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-600)',
          border: `1px solid ${value ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 200ms ease, border 200ms ease',
          boxShadow: value ? '0 0 8px rgba(232, 165, 71, 0.35)' : 'none'
        }}>
        <div style={{
          position: 'absolute',
          top: 1,
          left: value ? 18 : 2,
          width: 14, height: 14,
          borderRadius: '50%',
          background: value ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-primary)',
          transition: 'left 200ms ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
      </div>
    </div>
  )
}
// ── FIN: Toggle ──────────────────────────────────────

// ── INICIO: Seccion ──────────────────────────────────
function Seccion({ titulo, children }) {
  const [aberta, setAberta] = useState(true)
  return (
    <div style={{
      marginBottom: 10,
      border: '1px solid var(--gaia-cosmos-400)',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--gaia-cosmos-800)'
    }}>
      <div
        onClick={() => setAberta(!aberta)}
        style={{
          padding: '9px 12px',
          background: 'var(--gaia-cosmos-700)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-accent)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'background 150ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-600)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}>
        {titulo}
        <IconoChevron aberto={aberta} />
      </div>
      {aberta && <div style={{ padding: '12px' }}>{children}</div>}
    </div>
  )
}
// ── FIN: Seccion ─────────────────────────────────────

function PanelConfigMapa({ config, onChange }) {
  const cfg = config || clonar(MAPA_CONFIG)

  const set = (path, value) => {
    const novo = clonar(cfg)
    const keys = path.split('.')
    let obj = novo
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
    obj[keys[keys.length - 1]] = value
    onChange(novo)
  }

  const resetear = () => onChange(clonar(MAPA_CONFIG))

  const exportar = () => {
    const texto = `const MAPA_CONFIG = ${JSON.stringify(cfg, null, 2)}\n\nexport default MAPA_CONFIG`
    navigator.clipboard.writeText(texto)
    alert('Config copiado ao portapapeis — pega en mapaConfig.js')
  }

  return (
    <div style={{
      width: 260,
      height: '100%',
      overflowY: 'auto',
      background: 'var(--gaia-cosmos-900)',
      borderLeft: '1px solid var(--gaia-cosmos-400)',
      padding: 14,
      flexShrink: 0,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: '1px solid var(--gaia-cosmos-400)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: 'var(--gaia-accent)', display: 'grid', placeItems: 'center' }}>
            <IconoAxustes />
          </div>
          <h3 style={{
            color: 'var(--gaia-accent)',
            margin: 0,
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            Config mapa
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={resetear}
            title="Resetear aos valores por defecto"
            style={{
              padding: '4px 8px',
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-tertiary)',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: '0.05em',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-text-primary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            }}>
            <IconoReset />
            Reset
          </button>
          <button
            onClick={exportar}
            title="Copiar config ao portapapeis"
            style={{
              padding: '4px 8px',
              background: 'var(--gaia-constellation-bg)',
              border: '1px solid var(--gaia-constellation-border)',
              color: 'var(--gaia-constellation)',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: '0.05em',
              fontWeight: 600,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(93, 212, 168, 0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--gaia-constellation-bg)' }}>
            <IconoExportar />
            Exportar
          </button>
        </div>
      </div>

      {/* ── SECCIÓN: NODOS — TAMAÑO ── */}
      <Seccion titulo="Nodos — tamaño">
        <Slider label="Origin (GAIA)"     value={cfg.tamaño.origin}        min={10} max={60} onChange={v => set('tamaño.origin', v)} />
        <Slider label="Constellation"     value={cfg.tamaño.constellation} min={5}  max={40} onChange={v => set('tamaño.constellation', v)} />
        <Slider label="Galaxy"            value={cfg.tamaño.galaxy}        min={5}  max={30} onChange={v => set('tamaño.galaxy', v)} />
        <Slider label="System"            value={cfg.tamaño.system}        min={2}  max={20} onChange={v => set('tamaño.system', v)} />
        <Slider label="Concept / Process" value={cfg.tamaño.concept}       min={2}  max={15} onChange={v => {
          set('tamaño.concept', v)
          set('tamaño.process', v)
        }} />
      </Seccion>

      {/* ── SECCIÓN: NODOS — CORES ── */}
      <Seccion titulo="Nodos — cores">
        <ColorPicker label="Origin (GAIA)"   value={cfg.cor.origin}        onChange={v => set('cor.origin', v)} />
        <ColorPicker label="Constellation"   value={cfg.cor.constellation} onChange={v => set('cor.constellation', v)} />
        <ColorPicker label="Galaxy"          value={cfg.cor.galaxy}        onChange={v => set('cor.galaxy', v)} />
        <ColorPicker label="System"          value={cfg.cor.system}        onChange={v => set('cor.system', v)} />
        <ColorPicker label="Concept"         value={cfg.cor.concept}       onChange={v => set('cor.concept', v)} />
        <ColorPicker label="Process"         value={cfg.cor.process}       onChange={v => set('cor.process', v)} />
        <ColorPicker label="Fondo"           value={cfg.fondo}             onChange={v => set('fondo', v)} />
      </Seccion>

      {/* ── SECCIÓN: GLOW ── */}
      <Seccion titulo="Glow">
        <Toggle label="Activo"      value={cfg.glow.activo}      onChange={v => set('glow.activo', v)} />
        <Slider label="Intensidade" value={cfg.glow.intensidade} min={0} max={60} onChange={v => set('glow.intensidade', v)} />
      </Seccion>

      {/* ── SECCIÓN: LIÑAS ── */}
      <Seccion titulo="Liñas">
        <Slider label="Opacidade"        value={cfg.relacions.opacidade}             min={0}   max={1}  step={0.01} onChange={v => set('relacions.opacidade', v)} />
        <Slider label="Grosor activo"    value={cfg.seleccion.grosor_link_activo}    min={0.5} max={8}  step={0.5}  onChange={v => set('seleccion.grosor_link_activo', v)} />
        <Slider label="Grosor inactivo"  value={cfg.seleccion.grosor_link_inactivo}  min={0}   max={3}  step={0.1}  onChange={v => set('seleccion.grosor_link_inactivo', v)} />
      </Seccion>

      {/* ── SECCIÓN: PARTÍCULAS ── */}
      <Seccion titulo="Partículas">
        <Toggle label="Activas"    value={cfg.relacions.particulas}            onChange={v => set('relacions.particulas', v)} />
        <Slider label="Tamaño"     value={cfg.relacions.particulas_tamaño}     min={0.5} max={5}  step={0.5} onChange={v => set('relacions.particulas_tamaño', v)} />
        <Slider label="Velocidade" value={cfg.relacions.particulas_velocidade} min={1}   max={10}            onChange={v => set('relacions.particulas_velocidade', v)} />
      </Seccion>

      {/* ── SECCIÓN: FORZAS ── */}
      <Seccion titulo="Forzas">
        <Slider label="Repulsión"    value={cfg.forzas.repulsion}      min={-800} max={-50} onChange={v => set('forzas.repulsion', v)} />
        <Slider label="Dist. links"  value={cfg.forzas.distancia_link} min={20}   max={300} onChange={v => set('forzas.distancia_link', v)} />
      </Seccion>

      {/* ── SECCIÓN: SELECCIÓN ── */}
      <Seccion titulo="Selección">
        <Slider label="Opac. non conectado" value={cfg.seleccion.opacidade_non_conectado} min={0} max={1} step={0.01} onChange={v => set('seleccion.opacidade_non_conectado', v)} />
      </Seccion>

      {/* ── SECCIÓN: RENDEMENTO 3D ──
           ARRANXO CRÍTICO: Esta sección estaba fóra do return no
           código antigo, como JSX solto que React evaluaba e
           descartaba. Agora está no sitio correcto e funciona. */}
      <Seccion titulo="Rendemento 3D">
        <Slider label="Warmup ticks"     value={cfg.rendemento?.warmup_ticks    ?? 50}  min={10} max={200} step={10}   onChange={v => set('rendemento.warmup_ticks', v)} />
        <Slider label="Bloom strength"   value={cfg.rendemento?.bloom_strength  ?? 1.8} min={0}  max={5}   step={0.1}  onChange={v => set('rendemento.bloom_strength', v)} />
        <Slider label="Bloom radius"     value={cfg.rendemento?.bloom_radius    ?? 0.8} min={0}  max={2}   step={0.1}  onChange={v => set('rendemento.bloom_radius', v)} />
        <Slider label="Bloom threshold"  value={cfg.rendemento?.bloom_threshold ?? 0.1} min={0}  max={1}   step={0.05} onChange={v => set('rendemento.bloom_threshold', v)} />
      </Seccion>

    </div>
  )
}

export default PanelConfigMapa