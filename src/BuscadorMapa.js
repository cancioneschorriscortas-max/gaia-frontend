import { useState, useRef, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════
// BuscadorMapa — Lupa flotante + busca do mapa
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Apareece centrada abaixo no mapa.
// Dous estados:
//   1. Compacta (só icona lupa)
//   2. Expandida (lupa + input + dropdown de resultados)
//
// `lupaActiva` é un modo secundario ("MODO EXPLORACIÓN") que
// muda a cor e o comportamento da busca.
//
// API pública sen cambios: nodos, onSeleccionar, nodoActivo,
// idioma, lupaActiva, onCambiarModo.
// ═══════════════════════════════════════════════════════════

// ── INICIO: cores_tipo_semanticas ────────────────────
// Aliñado coa paleta semántica GAIA v1.1
const COR_TIPO = {
  origin:        '#f5f7ff',
  galaxy:        '#ffd966',
  constellation: '#5dd4a8',
  system:        '#7dd3fc',
  concept:       '#9bb3ff',
  process:       '#ff9fb8'
}
const COR_TIPO_GLOW = {
  origin:        'rgba(245, 247, 255, 0.5)',
  galaxy:        'rgba(255, 217, 102, 0.5)',
  constellation: 'rgba(93, 212, 168, 0.5)',
  system:        'rgba(125, 211, 252, 0.5)',
  concept:       'rgba(155, 179, 255, 0.5)',
  process:       'rgba(255, 159, 184, 0.5)'
}
// ── FIN: cores_tipo_semanticas ───────────────────────

function BuscadorMapa({ nodos, onSeleccionar, nodoActivo, idioma = 'gl', lupaActiva, onCambiarModo }) {

  // ── INICIO: estados ──────────────────────────────────
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const inputRef = useRef(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: foco_automatico ──────────────────────────
  useEffect(() => {
    if (aberto && inputRef.current) {
      inputRef.current.focus()
    }
  }, [aberto])
  // ── FIN: foco_automatico ─────────────────────────────

  // ── INICIO: filtro_nodos ─────────────────────────────
  const nodosFiltrados = busca.length < 2 ? [] : nodos
    .filter(n => {
      const labelIdioma = n[`label_${idioma}`] || n.label || ''
      return (
        labelIdioma.toLowerCase().includes(busca.toLowerCase()) ||
        n.label?.toLowerCase().includes(busca.toLowerCase()) ||
        n.id?.toLowerCase().includes(busca.toLowerCase())
      )
    }).slice(0, 8)
  // ── FIN: filtro_nodos ────────────────────────────────

  const getLabel = (n) => n[`label_${idioma}`] || n.label || n.id

  // ── INICIO: toggle_lupa ──────────────────────────────
  const toggleLupa = () => {
    const novoModo = !lupaActiva
    onCambiarModo(novoModo)
    if (novoModo) {
      setAberto(true)
    } else {
      setAberto(false)
      setBusca('')
    }
  }
  // ── FIN: toggle_lupa ─────────────────────────────────

  return (
    <div style={{
      position: 'absolute',
      bottom: 28, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10,
      fontFamily: 'var(--gaia-font-body)'
    }}>

      {/* ═══ RESULTADOS DA BUSCA ═══ */}
      {aberto && nodosFiltrados.length > 0 && (
        <div style={{
          background: 'rgba(15, 23, 41, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 12,
          overflow: 'hidden',
          width: 320,
          maxHeight: 300,
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(232, 165, 71, 0.1)',
          animation: 'buscadorFadeUp 200ms ease'
        }}>
          {nodosFiltrados.map((n, i) => {
            const cor = COR_TIPO[n.type] || 'var(--gaia-text-primary)'
            const glow = COR_TIPO_GLOW[n.type] || 'transparent'
            return (
              <div
                key={n.id}
                onClick={() => {
                  onSeleccionar(n.id)
                  setBusca('')
                  setAberto(false)
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: i < nodosFiltrados.length - 1
                    ? '1px solid var(--gaia-cosmos-400)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Dot do tipo de nodo */}
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: cor,
                  boxShadow: `0 0 6px ${glow}`,
                  flexShrink: 0
                }} />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'var(--gaia-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {getLabel(n)}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    letterSpacing: '0.05em',
                    textTransform: 'lowercase',
                    marginTop: 2
                  }}>
                    {n.type}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ BARRA PRINCIPAL (lupa + input) ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: lupaActiva
          ? 'var(--gaia-accent-bg)'
          : 'rgba(15, 23, 41, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${lupaActiva
          ? 'var(--gaia-accent-border)'
          : 'var(--gaia-cosmos-400)'}`,
        borderRadius: 24,
        padding: '8px 16px',
        transition: 'all 300ms ease',
        width: aberto ? 320 : 48,
        height: 44,
        overflow: 'hidden',
        boxShadow: lupaActiva
          ? '0 0 20px rgba(232, 165, 71, 0.25), 0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>

        {/* ── INICIO: icono_lupa_svg ── */}
        <div
          onClick={toggleLupa}
          style={{
            cursor: 'pointer',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            width: 24, height: 24,
            transition: 'transform 300ms ease',
            transform: lupaActiva ? 'scale(1.15)' : 'scale(1)'
          }}
        >
          <svg
            width="20" height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              transition: 'all 300ms ease',
              filter: lupaActiva
                ? 'drop-shadow(0 0 6px rgba(232, 165, 71, 0.8))'
                : 'none'
            }}
          >
            <circle
              cx="8.5" cy="8.5" r="5.5"
              stroke={lupaActiva ? '#e8a547' : '#8892a8'}
              strokeWidth={lupaActiva ? '2' : '1.75'}
              fill={lupaActiva ? 'rgba(232, 165, 71, 0.1)' : 'none'}
            />
            <line
              x1="12.5" y1="12.5"
              x2="17" y2="17"
              stroke={lupaActiva ? '#e8a547' : '#8892a8'}
              strokeWidth={lupaActiva ? '2' : '1.75'}
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* ── FIN: icono_lupa_svg ── */}

        {/* Tooltip "MODO EXPLORACIÓN" (cando a lupa está activa e a barra non aberta) */}
        {!aberto && lupaActiva && (
          <div style={{
            position: 'absolute',
            bottom: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 41, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--gaia-accent-border)',
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'buscadorFadeUp 250ms ease forwards',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            Modo exploración
          </div>
        )}

        {/* Input de busca */}
        {aberto && (
          <input
            ref={inputRef}
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setBusca('')
                if (!lupaActiva) setAberto(false)
              }
            }}
            placeholder={lupaActiva ? 'Explorar nodo...' : 'Buscar no universo...'}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: lupaActiva
                ? 'var(--gaia-accent)'
                : 'var(--gaia-text-primary)',
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              width: '100%',
              letterSpacing: '0.01em'
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes buscadorFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default BuscadorMapa