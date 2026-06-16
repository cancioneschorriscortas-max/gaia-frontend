import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// AsistenteLua — Panel de LÚA (copiloto de GAIA)
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Tres estados visuais:
//   1. Icona flotante (bottom-right) con avatar
//   2. Burbulla proactiva (aparece tras 30s nun nodo)
//   3. Panel chat (conversa activa)
//
// API pública (props) sen cambios: nodoActivo, idioma
// Compatibilidade total coa lóxica de backend /lua
// ═══════════════════════════════════════════════════════════


// ── INICIO: mensaxes_proactivas ──────────────────────
const MENSAXES_PROACTIVAS = [
  (nome) => `${nome}… sona amplo.\nTi por onde empezarías: as persoas, as ferramentas ou as ideas?`,
  (nome) => `Levas un tempo con ${nome}.\nQue parte che chama máis a atención?`,
  (nome) => `${nome} ten máis capas das que parecen.\nHai algo que non remates de entender?`,
  (nome) => `Interesante que esteas aquí.\nQue che trouxo a ${nome}?`,
  (nome) => `${nome}… vida dura e sabia.\nQue parte deste mundo che chama máis: a xente, as técnicas ou as historias?`,
]

const getMensaxeProactiva = (nomeNodo) => {
  const idx = Math.floor(Math.random() * MENSAXES_PROACTIVAS.length)
  return MENSAXES_PROACTIVAS[idx](nomeNodo)
}
// ── FIN: mensaxes_proactivas ─────────────────────────

// ── INICIO: mensaxes_benvida ─────────────────────────
const MENSAXES_BENVIDA = [
  'Podes preguntarme ou pedirme que che guíe.',
  'Fai unha boa pregunta e eu farei outra mellor.',
  'Non dou respostas. Axúdoche a velas.',
]
// ── FIN: mensaxes_benvida ────────────────────────────

// ── INICIO: avatar_mini_style ────────────────────────
// Estilo para avatares pequenos nas mensaxes
const AVT_MINI = {
  width: 28, height: 28, borderRadius: '50%',
  flexShrink: 0,
  border: '1px solid var(--gaia-system-border)',
  objectFit: 'cover', objectPosition: 'center top'
}
// ── FIN: avatar_mini_style ───────────────────────────

function AsistenteLua({ nodoActivo, idioma = 'gl' }) {

  // ── INICIO: contexto ─────────────────────────────────
  const { authHeaders } = useUser()
  // ── FIN: contexto ────────────────────────────────────

  // ── INICIO: estados ──────────────────────────────────
  const [panelAberto,       setPanelAberto]       = useState(false)
  const [proactivoVisible,  setProactivoVisible]  = useState(false)
  const [proactivoTexto,    setProactivoTexto]    = useState('')
  const [luaAnimada,        setLuaAnimada]        = useState(false)
  const [mensaxes,          setMensaxes]          = useState([])
  const [input,             setInput]             = useState('')
  const [cargando,          setCargando]          = useState(false)
  const timerRef          = useRef(null)
  const chatRef           = useRef(null)
  const nodoAnteriorRef   = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: timer_proactivo ──────────────────────────
  useEffect(() => {
    if (!nodoActivo) {
      clearTimeout(timerRef.current)
      setProactivoVisible(false)
      setLuaAnimada(false)
      return
    }

    if (nodoActivo.id !== nodoAnteriorRef.current) {
      nodoAnteriorRef.current = nodoActivo.id
      setProactivoVisible(false)
      setLuaAnimada(false)
      clearTimeout(timerRef.current)

      if (panelAberto) return

      timerRef.current = setTimeout(() => {
        const nome = nodoActivo.labels?.[idioma] || nodoActivo.labels?.gl || nodoActivo.id
        setProactivoTexto(getMensaxeProactiva(nome))
        setLuaAnimada(true)
        setProactivoVisible(true)
      }, 30000)
    }

    return () => clearTimeout(timerRef.current)
  }, [nodoActivo, panelAberto, idioma])
  // ── FIN: timer_proactivo ─────────────────────────────

  // ── INICIO: cleanup_desmontaxe ───────────────────────
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])
  // ── FIN: cleanup_desmontaxe ──────────────────────────

  // ── INICIO: scroll_chat ──────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensaxes])
  // ── FIN: scroll_chat ─────────────────────────────────

  // ── INICIO: abrir_panel ──────────────────────────────
  const abrirPanel = useCallback(() => {
    setPanelAberto(true)
    setProactivoVisible(false)
    setLuaAnimada(false)
    clearTimeout(timerRef.current)

    if (mensaxes.length === 0) {
      const benvida   = MENSAXES_BENVIDA[Math.floor(Math.random() * MENSAXES_BENVIDA.length)]
      const nomeNodo  = nodoActivo ? (nodoActivo.labels?.[idioma] || nodoActivo.labels?.gl || '') : ''
      const textoInicial = nodoActivo
        ? `${getMensaxeProactiva(nomeNodo)}\n\n${benvida}`
        : `Ola. Son LÚA.\n\n${benvida}`
      setMensaxes([{ rol: 'lua', texto: textoInicial }])
    }
  }, [mensaxes.length, nodoActivo, idioma])
  // ── FIN: abrir_panel ─────────────────────────────────

  // ── INICIO: enviar_mensaxe ───────────────────────────
  const enviarMensaxe = useCallback(async () => {
    if (!input.trim() || cargando) return
    const textoUsuario  = input.trim()
    setInput('')
    const novasMensaxes = [...mensaxes, { rol: 'usuario', texto: textoUsuario }]
    setMensaxes(novasMensaxes)
    setCargando(true)

    try {
      const res = await fetch(`${API}/lua`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({
          nodoId:   nodoActivo?.id || null,
          mensaxes: novasMensaxes.filter((m, i) => i > 0 || m.rol !== 'lua'),
          idioma
        })
      })
      const data = await res.json()

      if (res.status === 429) {
        setMensaxes(prev => [...prev, { rol: 'lua', texto: data.error || 'Límite diario alcanzado.' }])
        return
      }

      setMensaxes(prev => [...prev, { rol: 'lua', texto: data.resposta || '…' }])
    } catch {
      setMensaxes(prev => [...prev, { rol: 'lua', texto: 'Algo fallou. Proba de novo.' }])
    } finally {
      setCargando(false)
    }
  }, [input, cargando, mensaxes, nodoActivo, idioma, authHeaders])
  // ── FIN: enviar_mensaxe ──────────────────────────────

  // ── INICIO: render_icona_lua ─────────────────────────
  const renderIconaLua = () => (
    <div
      className="lua-icona"
      onClick={abrirPanel}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 100,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        animation: luaAnimada
          ? 'luaPulse 1.5s ease-in-out infinite'
          : 'luaFloat 6s ease-in-out infinite',
        transition: 'filter 600ms ease'
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Halo ambiente detrás do avatar */}
        <div style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--gaia-system-glow) 0%, transparent 65%)',
          opacity: luaAnimada ? 0.8 : 0.4,
          filter: 'blur(8px)',
          zIndex: -1,
          transition: 'opacity 400ms ease'
        }} />
        <img
          src="/assets/lua-avatar.png"
          alt="LÚA"
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: `2px solid ${luaAnimada ? 'var(--gaia-system)' : 'var(--gaia-system-border)'}`,
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'transform 200ms ease, border 600ms ease',
            boxShadow: luaAnimada
              ? '0 0 20px var(--gaia-system-glow), 0 0 40px rgba(125, 211, 252, 0.3)'
              : '0 0 8px rgba(125, 211, 252, 0.25)'
          }}
        />
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: 'var(--gaia-font-mono)',
        color: 'var(--gaia-system)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: 0.9,
        fontWeight: 600
      }}>
        LÚA
      </span>
    </div>
  )
  // ── FIN: render_icona_lua ────────────────────────────

  // ── INICIO: render_burbulla_proactiva ────────────────
  const renderBurbullaProactiva = () => (
    <div
      onClick={abrirPanel}
      style={{
        position: 'fixed', bottom: 110, right: 24, zIndex: 99,
        maxWidth: 300,
        background: 'rgba(15, 23, 41, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--gaia-system-border)',
        borderRadius: '16px 16px 4px 16px',
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(125, 211, 252, 0.15)',
        animation: 'luaFadeIn 400ms ease',
        cursor: 'pointer'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        fontFamily: 'var(--gaia-font-mono)',
        color: 'var(--gaia-system)',
        marginBottom: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 600
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--gaia-system)',
          boxShadow: '0 0 6px var(--gaia-system-glow)'
        }} />
        LÚA
      </div>
      <p style={{
        margin: 0,
        fontFamily: 'var(--gaia-font-body)',
        fontSize: 13,
        color: 'var(--gaia-text-primary)',
        lineHeight: 1.6,
        whiteSpace: 'pre-line'
      }}>
        {proactivoTexto}
      </p>
      <div style={{
        marginTop: 10,
        fontSize: 10,
        fontFamily: 'var(--gaia-font-mono)',
        color: 'var(--gaia-accent)',
        letterSpacing: '0.05em',
        opacity: 0.8
      }}>
        Pincha para responder →
      </div>
    </div>
  )
  // ── FIN: render_burbulla_proactiva ───────────────────

  // ── INICIO: render_panel_chat ────────────────────────
  const renderPanelChat = () => (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      width: 360, height: 520,
      background: 'rgba(15, 23, 41, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--gaia-cosmos-400)',
      borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(125, 211, 252, 0.1)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'luaFadeIn 300ms ease',
      fontFamily: 'var(--gaia-font-body)'
    }}>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: 'rgba(125, 211, 252, 0.04)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        flexShrink: 0
      }}>
        <div style={{ position: 'relative' }}>
          {/* Halo detrás do avatar da cabeceira */}
          <div style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--gaia-system-glow) 0%, transparent 70%)',
            opacity: 0.6,
            filter: 'blur(6px)',
            zIndex: -1
          }} />
          <img
            src="/assets/lua-avatar.png"
            alt="LÚA"
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: '2px solid var(--gaia-system)',
              boxShadow: '0 0 16px var(--gaia-system-glow)',
              objectFit: 'cover', objectPosition: 'center top',
              animation: 'luaGlow 3s ease-in-out infinite'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            color: 'var(--gaia-system)',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--gaia-font-mono)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            LÚA
          </div>
          <div style={{
            color: 'var(--gaia-text-tertiary)',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-body)',
            fontStyle: 'italic'
          }}>
            A túa copiloto
          </div>
        </div>
        <button
          onClick={() => setPanelAberto(false)}
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            color: 'var(--gaia-text-tertiary)',
            borderRadius: 6,
            width: 28, height: 28,
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
            e.currentTarget.style.color = 'var(--gaia-text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ═══ MENSAXES ═══ */}
      <div
        ref={chatRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12
        }}
      >
        {mensaxes.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: m.rol === 'lua' ? 'row' : 'row-reverse',
            gap: 8,
            alignItems: 'flex-start'
          }}>
            {m.rol === 'lua' && (
              <img
                src="/assets/lua-avatar.png"
                alt="LÚA"
                style={AVT_MINI}
              />
            )}
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: m.rol === 'lua'
                ? '4px 14px 14px 14px'
                : '14px 4px 14px 14px',
              background: m.rol === 'lua'
                ? 'var(--gaia-system-bg)'
                : 'var(--gaia-accent-bg)',
              border: `1px solid ${m.rol === 'lua'
                ? 'var(--gaia-system-border)'
                : 'var(--gaia-accent-border)'}`,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-line'
            }}>
              {m.texto}
            </div>
          </div>
        ))}

        {cargando && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <img src="/assets/lua-avatar.png" alt="LÚA" style={AVT_MINI} />
            <div style={{
              padding: '10px 14px',
              background: 'var(--gaia-system-bg)',
              border: '1px solid var(--gaia-system-border)',
              borderRadius: '4px 14px 14px 14px',
              display: 'flex',
              gap: 3
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'var(--gaia-system)',
                  animation: `luaTypingDot 1.4s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ INPUT ═══ */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--gaia-cosmos-400)',
        display: 'flex', gap: 8,
        flexShrink: 0,
        background: 'rgba(125, 211, 252, 0.02)'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enviarMensaxe()}
          placeholder="Escribe ou pregunta..."
          style={{
            flex: 1,
            padding: '8px 14px',
            background: 'var(--gaia-cosmos-800)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 20,
            color: 'var(--gaia-text-primary)',
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            outline: 'none',
            transition: 'border 150ms ease'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--gaia-system)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}
        />
        <button
          onClick={enviarMensaxe}
          disabled={!input.trim() || cargando}
          style={{
            width: 36, height: 36,
            padding: 0,
            background: input.trim() && !cargando
              ? 'var(--gaia-system)'
              : 'var(--gaia-cosmos-700)',
            border: 'none',
            borderRadius: '50%',
            color: input.trim() && !cargando
              ? 'var(--gaia-cosmos-900)'
              : 'var(--gaia-text-disabled)',
            cursor: input.trim() && !cargando ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            transition: 'all 150ms ease',
            boxShadow: input.trim() && !cargando
              ? '0 0 12px rgba(125, 211, 252, 0.4)'
              : 'none'
          }}
          onMouseEnter={e => {
            if (input.trim() && !cargando) {
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="Enviar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

    </div>
  )
  // ── FIN: render_panel_chat ───────────────────────────

  return (
    <>
      <style>{`
        @keyframes luaFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-4px) scale(1); }
        }
        @keyframes luaPulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-4px) scale(1.06); }
        }
        @keyframes luaFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes luaGlow {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50%       { transform: scale(1.04); opacity: 1; }
        }
        @keyframes luaTypingDot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30%           { opacity: 1;   transform: scale(1.1); }
        }
        .lua-icona {
          transition: transform 200ms ease, filter 200ms ease;
        }
        .lua-icona:hover img {
          transform: scale(1.08);
          filter: brightness(1.15);
        }
      `}</style>

      {!panelAberto && renderIconaLua()}
      {!panelAberto && proactivoVisible && renderBurbullaProactiva()}
      {panelAberto && renderPanelChat()}
    </>
  )
}

export default AsistenteLua