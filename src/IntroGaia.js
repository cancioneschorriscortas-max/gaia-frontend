import { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// IntroGaia — Splash screen inicial
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Primeira impresión de GAIA.
//
// Secuencia orquestrada de ~4.4s:
//   0-800ms    · Nodos da constelación aparecen un a un
//   800-1400ms · Líñas entre nodos tráxanse
//   1400-2200ms · Título "GAIA" con letter-spacing animado
//   2200-3200ms · Subtítulos + contador secuencialmente
//   3200-4000ms · Respiro (todo visible)
//   4000-4600ms · Fade-out + onFin()
//
// Respecta prefers-reduced-motion e .gaia-lite.
// API pública sen cambios: prop onFin
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: configuración_nodos_constelacion ─────────
// Posicións relativas (porcentaxe do contedor SVG 200×120)
// Pensadas para formar unha "W" suxerente — evoca o signo
// de Casiopea, fácil de recoñecer.
const NODOS_CONSTELACION = [
  { id: 'g1', x: 20,  y: 30, tipo: 'galaxy',        delay: 0   },
  { id: 'c1', x: 55,  y: 55, tipo: 'constellation', delay: 120 },
  { id: 'o',  x: 100, y: 35, tipo: 'origin',        delay: 240, central: true },
  { id: 'c2', x: 145, y: 55, tipo: 'constellation', delay: 360 },
  { id: 'g2', x: 180, y: 30, tipo: 'galaxy',        delay: 480 }
]

// Liñas a trazar (orde = orde de aparición)
const LINAS_CONSTELACION = [
  { from: 'g1', to: 'c1', delay: 800 },
  { from: 'c1', to: 'o',  delay: 950 },
  { from: 'o',  to: 'c2', delay: 1100 },
  { from: 'c2', to: 'g2', delay: 1250 }
]
// ── FIN: configuración_nodos_constelacion ───────────

// ── INICIO: cores_por_tipo ───────────────────────────
const COR_NODO = {
  origin:        '#f5f7ff',
  galaxy:        '#ffd966',
  constellation: '#5dd4a8'
}
const GLOW_NODO = {
  origin:        'rgba(245, 247, 255, 0.5)',
  galaxy:        'rgba(255, 217, 102, 0.6)',
  constellation: 'rgba(93, 212, 168, 0.5)'
}
const TAMANHO_NODO = {
  origin:        5,
  galaxy:        4,
  constellation: 3
}
// ── FIN: cores_por_tipo ──────────────────────────────

function IntroGaia({ onFin }) {

  // ── INICIO: estados ──────────────────────────────────
  const [nodosVisibles,  setNodosVisibles]  = useState([])
  const [linasVisibles,  setLinasVisibles]  = useState([])
  const [tituloVisible,  setTituloVisible]  = useState(false)
  const [subtitulosVis,  setSubtitulosVis]  = useState([])
  const [contadorVis,    setContadorVis]    = useState(false)
  const [numNodos,       setNumNodos]       = useState(0)
  const [saindo,         setSaindo]         = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: detectar_modo_reducido ───────────────────
  // Se o usuario pediu movemento reducido, saltamos directamente
  // á versión estática da splash (aparece todo á vez).
  const [modoReducido] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || document.body.classList.contains('gaia-lite')
  })
  // ── FIN: detectar_modo_reducido ──────────────────────

  // ── INICIO: carga_contador_nodos ─────────────────────
  useEffect(() => {
    fetch(`${API}/nodos`)
      .then(r => r.json())
      .then(d => setNumNodos(d.total || d.nodos?.length || 0))
      .catch(() => setNumNodos(0))
  }, [])
  // ── FIN: carga_contador_nodos ────────────────────────

  // ── INICIO: secuencia_animacion ──────────────────────
  useEffect(() => {
    const timers = []

    if (modoReducido) {
      // Todo visible directamente, só fade-out ao final
      setNodosVisibles(NODOS_CONSTELACION.map(n => n.id))
      setLinasVisibles(LINAS_CONSTELACION.map((_, i) => i))
      setTituloVisible(true)
      setSubtitulosVis([0, 1, 2])
      setContadorVis(true)
      timers.push(setTimeout(() => setSaindo(true), 2500))
      timers.push(setTimeout(() => onFin(), 3100))
      return () => timers.forEach(clearTimeout)
    }

    // Animación completa — 1. Nodos da constelación
    NODOS_CONSTELACION.forEach(n => {
      timers.push(setTimeout(() => {
        setNodosVisibles(prev => [...prev, n.id])
      }, n.delay))
    })

    // 2. Liñas tráxanse
    LINAS_CONSTELACION.forEach((l, i) => {
      timers.push(setTimeout(() => {
        setLinasVisibles(prev => [...prev, i])
      }, l.delay))
    })

    // 3. Título "GAIA"
    timers.push(setTimeout(() => setTituloVisible(true), 1400))

    // 4. Subtítulos secuenciais
    timers.push(setTimeout(() => setSubtitulosVis(prev => [...prev, 0]), 2200))
    timers.push(setTimeout(() => setSubtitulosVis(prev => [...prev, 1]), 2500))
    timers.push(setTimeout(() => setSubtitulosVis(prev => [...prev, 2]), 2800))

    // 5. Contador
    timers.push(setTimeout(() => setContadorVis(true), 3100))

    // 6. Saída
    timers.push(setTimeout(() => setSaindo(true), 4000))
    timers.push(setTimeout(() => onFin(), 4600))

    return () => timers.forEach(clearTimeout)
  }, [onFin, modoReducido])
  // ── FIN: secuencia_animacion ─────────────────────────

  // ── INICIO: helper_atopar_nodo ───────────────────────
  const atoparNodo = (id) => NODOS_CONSTELACION.find(n => n.id === id)
  // ── FIN: helper_atopar_nodo ──────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32,
      opacity: saindo ? 0 : 1,
      transition: saindo ? 'opacity 600ms ease' : 'none',
      fontFamily: 'var(--gaia-font-body)',
      overflow: 'hidden'
    }}>

      {/* ═══ FONDO CÓSMICO ═══ */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(232, 165, 71, 0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 80%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `
      }} />

      {/* Estrelas sutís */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(1px 1px at 8% 15%,  rgba(232, 165, 71, 0.35), transparent),
          radial-gradient(1px 1px at 22% 72%, rgba(93, 212, 168, 0.3),  transparent),
          radial-gradient(1px 1px at 38% 35%, rgba(155, 179, 255, 0.3), transparent),
          radial-gradient(1px 1px at 55% 85%, rgba(255, 217, 102, 0.28), transparent),
          radial-gradient(1px 1px at 68% 25%, rgba(125, 211, 252, 0.3), transparent),
          radial-gradient(1px 1px at 82% 65%, rgba(255, 159, 184, 0.25), transparent),
          radial-gradient(1.5px 1.5px at 92% 40%, rgba(255, 255, 255, 0.25), transparent),
          radial-gradient(1px 1px at 15% 90%, rgba(232, 165, 71, 0.3), transparent),
          radial-gradient(1px 1px at 45% 10%, rgba(125, 211, 252, 0.25), transparent)
        `,
        opacity: 0.6,
        animation: modoReducido ? 'none' : 'introStarsPulse 4s ease-in-out infinite'
      }} />

      {/* Scanlines moi sutís — herdanza do teu diseño */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(232, 165, 71, 0.008) 3px, rgba(232, 165, 71, 0.008) 4px)'
      }} />

      {/* ═══ CONSTELACIÓN + MARCA ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 28
      }}>

        {/* SVG da constelación viva */}
        <svg
          width="200"
          height="90"
          viewBox="0 0 200 90"
          style={{
            overflow: 'visible',
            filter: 'drop-shadow(0 0 20px rgba(232, 165, 71, 0.15))'
          }}
        >
          {/* Líñas entre nodos */}
          {LINAS_CONSTELACION.map((l, i) => {
            const from = atoparNodo(l.from)
            const to   = atoparNodo(l.to)
            const visible = linasVisibles.includes(i)
            return (
              <line
                key={`l-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(232, 165, 71, 0.4)"
                strokeWidth="1"
                strokeLinecap="round"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 500ms ease',
                  // Efecto "trazo que crece" via stroke-dasharray
                  strokeDasharray: '100',
                  strokeDashoffset: visible ? '0' : '100',
                  transitionProperty: 'opacity, stroke-dashoffset',
                  transitionDuration: '600ms'
                }}
              />
            )
          })}

          {/* Nodos */}
          {NODOS_CONSTELACION.map(n => {
            const visible = nodosVisibles.includes(n.id)
            return (
              <g key={n.id}>
                {/* Halo (para o origin, máis grande) */}
                {n.central && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={visible ? 12 : 0}
                    fill={GLOW_NODO[n.tipo]}
                    opacity={visible ? 0.35 : 0}
                    style={{
                      transition: 'r 800ms ease, opacity 800ms ease'
                    }}
                  />
                )}
                {/* Nodo principal */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={visible ? TAMANHO_NODO[n.tipo] : 0}
                  fill={COR_NODO[n.tipo]}
                  style={{
                    transition: `r 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${n.delay}ms`,
                    filter: `drop-shadow(0 0 6px ${GLOW_NODO[n.tipo]})`
                  }}
                />
                {/* Punto de respire para o central */}
                {n.central && visible && !modoReducido && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={TAMANHO_NODO[n.tipo]}
                    fill={COR_NODO[n.tipo]}
                    style={{
                      animation: 'introOriginBreathe 2.4s ease-in-out infinite'
                    }}
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* ═══ TÍTULO GAIA ═══ */}
        <div style={{
          fontFamily: 'var(--gaia-font-display)',
          fontSize: 'clamp(56px, 9vw, 112px)',
          fontWeight: 900,
          color: 'var(--gaia-accent)',
          letterSpacing: tituloVisible ? '0.15em' : '0.05em',
          textAlign: 'center',
          lineHeight: 1,
          opacity: tituloVisible ? 1 : 0,
          transform: tituloVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 700ms ease, transform 700ms ease, letter-spacing 900ms ease',
          textShadow: '0 0 40px rgba(232, 165, 71, 0.4), 0 0 80px rgba(232, 165, 71, 0.15)'
        }}>
          GAIA
        </div>

        {/* ═══ SUBTÍTULOS ═══ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 8,
          marginTop: -8
        }}>

          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--gaia-text-secondary)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            opacity: subtitulosVis.includes(0) ? 1 : 0,
            transform: subtitulosVis.includes(0) ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
            textAlign: 'center'
          }}>
            Arquivo do coñecemento galego
          </div>

          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 9,
            fontWeight: 400,
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: subtitulosVis.includes(1) ? 1 : 0,
            transform: subtitulosVis.includes(1) ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
            textAlign: 'center'
          }}>
            Plataforma educativa dixital
          </div>

          {/* Liña ornamental */}
          <div style={{
            width: 140, height: 1,
            marginTop: 12, marginBottom: 4,
            background: 'linear-gradient(90deg, transparent, var(--gaia-accent), transparent)',
            opacity: subtitulosVis.includes(2) ? 1 : 0,
            transition: 'opacity 500ms ease',
            boxShadow: '0 0 8px rgba(232, 165, 71, 0.4)'
          }} />

          <div style={{
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--gaia-accent)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            opacity: subtitulosVis.includes(2) ? 1 : 0,
            transform: subtitulosVis.includes(2) ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
            textAlign: 'center'
          }}>
            Grafo semántico · v0.7
          </div>
        </div>
      </div>

      {/* ═══ CONTADOR DE NODOS (embaixo) ═══ */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: contadorVis
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(6px)',
        fontFamily: 'var(--gaia-font-mono)',
        fontSize: 10,
        fontWeight: 400,
        color: 'var(--gaia-text-tertiary)',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        textAlign: 'center',
        opacity: contadorVis ? 0.7 : 0,
        transition: 'opacity 500ms ease, transform 500ms ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 1
      }}>
        {/* Punto de "sistema activo" con glow */}
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--gaia-constellation)',
          boxShadow: '0 0 8px var(--gaia-constellation-glow)',
          animation: modoReducido ? 'none' : 'introDotPulse 2s ease-in-out infinite'
        }} />
        <span>
          {numNodos > 0
            ? `${numNodos} nodos · 4 idiomas · ∞ conexións`
            : 'Sistema activo'
          }
        </span>
      </div>

      {/* ═══ ANIMACIÓNS GLOBAIS ═══ */}
      <style>{`
        @keyframes introStarsPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.75; }
        }
        @keyframes introOriginBreathe {
          0%, 100% { r: 5; opacity: 1; }
          50%       { r: 7; opacity: 0.85; }
        }
        @keyframes introDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}

export default IntroGaia