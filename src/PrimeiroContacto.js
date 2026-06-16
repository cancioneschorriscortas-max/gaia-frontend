import { useState, useEffect, useRef } from 'react'
import { iniciarMusica, sonZoom } from './sistemaAudio'

// ═══════════════════════════════════════════════════════════
// PrimeiroContacto — Onboarding narrativo de LÚA
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Secuencia de 7 escenas animadas que presentan
// a LÚA ao usuario despois do login.
//
// Preservada a estrutura narrativa completa e tempos.
// Actualizada: paleta semántica nos canvas, fonte Fraunces
// para os textos narrativos, botón "ENTRAR" v1.1.
//
// API pública sen cambios: onFin, idioma, conAudio
// ═══════════════════════════════════════════════════════════

// ── INICIO: config_escenas ───────────────────────────
const ESCENAS = [
  { id: 'silencio',     duracion: 2800, texto: null,                                        subtexto: null,                                        fondo: 'negro' },
  { id: 'escoitas',     duracion: 3200, texto: 'Escoitas iso?',                             subtexto: null,                                        fondo: 'negro' },
  { id: 'conhecemento', duracion: 4000, texto: 'É o coñecemento de Galicia.',               subtexto: 'Todo el. Dende sempre.',                    fondo: 'estrelas' },
  { id: 'grafo',        duracion: 4000, texto: 'Cada estrela é unha idea.',                 subtexto: 'Cada liña, unha conexión.',                 fondo: 'grafo' },
  { id: 'persoas',      duracion: 4000, texto: 'Algúns foron postos aquí',                  subtexto: 'por persoas coma ti.',                      fondo: 'grafo' },
  { id: 'lua',          duracion: 4500, texto: 'Son LÚA.',                                  subtexto: 'Non che dou respostas. Axúdoche a velas.',   fondo: 'lua', mostrarLua: true },
  { id: 'entrar',       duracion: null, texto: 'Comeza por algo que che chame a atención.', subtexto: null,                                        fondo: 'entrar', mostrarBoton: true }
]
// ── FIN: config_escenas ──────────────────────────────

// ── INICIO: canvas_estrelas ──────────────────────────
// Estrelas de fondo. Agora con paleta suave coherente.
function CanvasEstrelas({ visible, density = 120 }) {
  useEffect(() => {
    const canvas = document.getElementById('pc-canvas-estrelas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const estrelas = Array.from({ length: density }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.3,
      vel: Math.random() * 0.008 + 0.003,
      fase: Math.random() * Math.PI * 2
    }))
    let frame, t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      estrelas.forEach(s => {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.vel + s.fase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fill()
      })
      t++
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [density])
  return (
    <canvas
      id="pc-canvas-estrelas"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none'
      }}
    />
  )
}
// ── FIN: canvas_estrelas ─────────────────────────────

// ── INICIO: canvas_grafo ─────────────────────────────
// Mini-grafo central con cores semánticas GAIA v1.1.
function CanvasGrafo({ visible }) {
  useEffect(() => {
    const canvas = document.getElementById('pc-canvas-grafo')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Nodos coa paleta semántica oficial GAIA v1.1
    const nodos = [
      { x: cx,       y: cy,       r: 6,   cor: '#e8a547' },  // accent (central)
      { x: cx - 180, y: cy - 120, r: 4,   cor: '#5dd4a8' },  // constellation
      { x: cx + 200, y: cy - 80,  r: 4,   cor: '#7dd3fc' },  // system
      { x: cx - 220, y: cy + 100, r: 3,   cor: '#ff9fb8' },  // process
      { x: cx + 160, y: cy + 130, r: 3,   cor: '#9bb3ff' },  // concept
      { x: cx - 80,  y: cy - 200, r: 3,   cor: '#7dd3fc' },  // system
      { x: cx + 80,  y: cy + 200, r: 3,   cor: '#ffd966' },  // galaxy
      { x: cx - 300, y: cy - 20,  r: 2.5, cor: '#5dd4a8' },  // constellation
      { x: cx + 300, y: cy + 20,  r: 2.5, cor: '#ff9fb8' },  // process
      { x: cx + 20,  y: cy - 260, r: 2,   cor: '#9bb3ff' },  // concept
    ]
    const arestas = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,7],[2,8],[5,9],[1,5],[2,4],[3,7]]

    let frame, t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Halo ambiental
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320)
      grad.addColorStop(0, 'rgba(232, 165, 71, 0.06)')
      grad.addColorStop(0.5, 'rgba(93, 212, 168, 0.03)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Arestas con pulso
      arestas.forEach(([i, j]) => {
        const a = nodos[i]
        const b = nodos[j]
        const pulse = 0.3 + 0.2 * Math.sin(t * 0.02 + i)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      })

      // Nodos con glow pulsante
      nodos.forEach((n, i) => {
        const pulso = 1 + 0.15 * Math.sin(t * 0.03 + i * 0.8)

        // Halo exterior
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4 * pulso)
        glow.addColorStop(0, n.cor + '88')
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 4 * pulso, 0, Math.PI * 2)
        ctx.fill()

        // Nodo core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulso, 0, Math.PI * 2)
        ctx.fillStyle = n.cor
        ctx.fill()
      })

      t++
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <canvas
      id="pc-canvas-grafo"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.5s ease',
        pointerEvents: 'none'
      }}
    />
  )
}
// ── FIN: canvas_grafo ────────────────────────────────

function PrimeiroContacto({ onFin, idioma = 'gl', conAudio = false }) {

  // ── INICIO: estados ──────────────────────────────────
  const [escenaIdx,    setEscenaIdx]    = useState(0)
  const [textoVisible, setTextoVisible] = useState(false)
  const [luaVisible,   setLuaVisible]   = useState(false)
  const [saindo,       setSaindo]       = useState(false)
  const audioVozRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  const escena = ESCENAS[escenaIdx]

  // ── INICIO: voz_lua ──────────────────────────────────
  useEffect(() => {
    if (!conAudio) return
    try {
      const audio = new Audio('/assets/lua-intro.mp3')
      audioVozRef.current = audio
      audio.volume = 0.9
      audio.play().catch(() => {})
    } catch (e) {}
  }, [conAudio])
  // ── FIN: voz_lua ─────────────────────────────────────

  // ── INICIO: avanzar_escena ───────────────────────────
  useEffect(() => {
    setTextoVisible(false)
    setLuaVisible(false)

    if (escenaIdx > 0 && escenaIdx < ESCENAS.length - 1) {
      sonZoom('in')
    }

    const timerTexto = setTimeout(() => {
      setTextoVisible(true)
      if (escena.mostrarLua) setTimeout(() => setLuaVisible(true), 600)
    }, escena.id === 'escoitas' ? 1200 : 400)

    let timerAvance
    if (escena.duracion) {
      timerAvance = setTimeout(() => setEscenaIdx(i => i + 1), escena.duracion)
    }

    return () => {
      clearTimeout(timerTexto)
      clearTimeout(timerAvance)
    }
  }, [escenaIdx])
  // ── FIN: avanzar_escena ──────────────────────────────

  // ── INICIO: handler_entrar ───────────────────────────
  const handleEntrar = () => {
    if (audioVozRef.current) {
      audioVozRef.current.pause()
      audioVozRef.current.currentTime = 0
    }
    iniciarMusica('/assets/orbital-halo-drift.mp3')
    sonZoom('in')
    setSaindo(true)
    setTimeout(() => onFin(), 800)
  }
  // ── FIN: handler_entrar ──────────────────────────────

  const mostrarEstrelas = ['estrelas', 'grafo', 'lua', 'entrar'].includes(escena.fondo)
  const mostrarGrafo    = ['grafo', 'entrar'].includes(escena.fondo)
  const mostrarLuaBg    = escena.fondo === 'lua' || escena.fondo === 'entrar'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      opacity: saindo ? 0 : 1,
      transition: saindo ? 'opacity 0.8s ease' : 'none',
      fontFamily: 'var(--gaia-font-body)'
    }}>

      <CanvasEstrelas visible={mostrarEstrelas} />
      <CanvasGrafo visible={mostrarGrafo} />

      {/* Halo ambiental azul para escenas de LÚA */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(125, 211, 252, 0.1) 0%, transparent 70%)',
        opacity: mostrarLuaBg ? 1 : 0,
        transition: 'opacity 1.5s ease',
        pointerEvents: 'none'
      }} />

      {/* ═══ AVATAR DE LÚA ═══ */}
      {escena.mostrarLua && (
        <div style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: luaVisible ? 1 : 0,
          transition: 'opacity 1s ease',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Halo pulsante detrás do avatar */}
            <div style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--gaia-system-glow) 0%, transparent 65%)',
              opacity: 0.7,
              filter: 'blur(10px)',
              zIndex: -1
            }} />
            <img
              src="/assets/lua-avatar.png"
              alt="LÚA"
              style={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                border: '2px solid var(--gaia-system)',
                boxShadow: '0 0 30px var(--gaia-system-glow), 0 0 60px rgba(125, 211, 252, 0.25)',
                animation: luaVisible ? 'pcLuaFloat 3s ease-in-out infinite' : 'none',
                objectFit: 'cover',
                objectPosition: 'center top'
              }}
            />
          </div>
          <div style={{
            color: 'var(--gaia-system)',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            marginTop: 12,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0.9
          }}>
            LÚA
          </div>
        </div>
      )}

      {/* ═══ TEXTO CENTRAL ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center',
        padding: '0 40px',
        maxWidth: 640,
        opacity: textoVisible ? 1 : 0,
        transition: 'opacity 1.1s ease'
      }}>
        {escena.texto && (
          <div style={{
            fontSize: 'clamp(24px, 3.5vw, 34px)',
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 400,
            color: escena.mostrarLua ? 'var(--gaia-system)' : 'var(--gaia-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: escena.subtexto ? 16 : 0,
            textShadow: escena.mostrarLua
              ? '0 0 40px rgba(125, 211, 252, 0.6)'
              : '0 0 30px rgba(255, 255, 255, 0.15)'
          }}>
            {escena.texto}
          </div>
        )}

        {escena.subtexto && (
          <div style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 300,
            color: escena.mostrarLua
              ? 'rgba(125, 211, 252, 0.75)'
              : 'var(--gaia-text-secondary)',
            letterSpacing: '0.02em',
            fontStyle: 'italic',
            lineHeight: 1.5
          }}>
            {escena.subtexto}
          </div>
        )}

        {escena.mostrarBoton && (
          <button
            onClick={handleEntrar}
            style={{
              marginTop: 48,
              padding: '14px 44px',
              background: 'transparent',
              border: '1px solid var(--gaia-accent-border)',
              color: 'var(--gaia-accent)',
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 300ms ease',
              opacity: textoVisible ? 1 : 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gaia-accent-bg)'
              e.currentTarget.style.borderColor = 'var(--gaia-accent)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(232, 165, 71, 0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--gaia-accent-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Entrar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>

      {/* ═══ INDICADOR DE PROGRESO ═══ */}
      <div style={{
        position: 'absolute',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 2
      }}>
        {ESCENAS.map((e, i) => (
          <div key={e.id} style={{
            width: i === escenaIdx ? 22 : 6,
            height: 4,
            borderRadius: 2,
            background: i === escenaIdx
              ? 'var(--gaia-accent)'
              : i < escenaIdx
                ? 'rgba(245, 247, 255, 0.3)'
                : 'rgba(245, 247, 255, 0.1)',
            boxShadow: i === escenaIdx ? '0 0 8px var(--gaia-accent-glow)' : 'none',
            transition: 'all 400ms ease'
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pcLuaFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}

export default PrimeiroContacto