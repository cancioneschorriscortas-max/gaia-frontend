import { useState, useRef, useEffect } from 'react'
import { t } from './i18n'

// ═══════════════════════════════════════════════════════════
// BarraInferiorMovil — Navegación principal en móbil
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: nodos, idioma, onSeleccionar, onEnviar,
// onLua, luaActiva, onMenu, onGaia.
//
// CAMBIO ESTRUTURAL:
//   Antes había DOIS botóns "GAIA" — un como fallback cando non
//   hai onEnviar (placeholder gris) e outro real á dereita. Iso
//   era confuso. Agora:
//   - Se hai onEnviar → barra de 5 botóns [Menú · Busca · GAIA · LÚA · +]
//   - Se non         → barra de 4 botóns [Menú · Busca · GAIA · LÚA]
//   GAIA ocupa sempre o centro e é o botón destacado (maior + glow).
//
// MELLORAS:
//   1. Todos os emojis (☰, 🔍, 🌙, ✦, ➕, ✕) → SVGs inline.
//   2. Paleta v1.1 completa.
//   3. Botón GAIA central "flotante" con glow ámbar (protagonismo
//      visual do corazón da app).
//   4. LÚA con cor concept (lavanda) cando activa.
//   5. Busca: resultados con cor semántica por tipo de nodo.
//   6. Animación slide-in para o panel de busca.
// ═══════════════════════════════════════════════════════════

// ── INICIO: iconos_svg ───────────────────────────────
const IconoMenu = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3"  y1="6"  x2="21" y2="6"  />
    <line x1="3"  y1="12" x2="21" y2="12" />
    <line x1="3"  y1="18" x2="21" y2="18" />
  </svg>
)
// Bruxula: o acceso á portada diaria do neno ("A miña viaxe").
// DECISIÓN EXECUTOR: o briefing pedía a icona 🧭, pero esta barra ten
// como norma da casa que todos os emojis son SVG (mellora 1 da cabeceira).
// Mantense a norma: bruxula debuxada, non emoji.
const IconoBruxula = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.5,8.5 10.5,10.5 8.5,15.5 13.5,13.5" fill="currentColor" stroke="none" />
  </svg>
)
const IconoBusca = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconoLua = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const IconoMais = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5"  x2="12" y2="19" />
    <line x1="5"  y1="12" x2="19" y2="12" />
  </svg>
)
const IconoX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
)
// Icona GAIA: sol/estrela de 8 raios — coherente co logo da app
const IconoGaia = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <line x1="12" y1="2"  x2="12" y2="5"  />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2"  y1="12" x2="5"  y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"  />
    <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
    <line x1="4.93"  y1="19.07" x2="7.05"  y2="16.95" />
    <line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"  />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: cor_tipo_nodo ────────────────────────────
// Paleta v1.1 aliñada con mapaConfig
const COR_TIPO = {
  origin:        'var(--gaia-text-primary)',
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}
// ── FIN: cor_tipo_nodo ───────────────────────────────

function BarraInferiorMovil({ nodos = [], idioma = 'gl', onSeleccionar, onEnviar, onLua, luaActiva, onMenu, onGaia, onMinaViaxe }) {

  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca,       setBusca]       = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (buscaAberta && inputRef.current) inputRef.current.focus()
  }, [buscaAberta])

  // ── INICIO: filtro_nodos ─────────────────────────────
  const nodosFiltrados = busca.length < 2 ? [] : nodos
    .filter(n => (n.label || '').toLowerCase().includes(busca.toLowerCase()))
    .slice(0, 6)
  // ── FIN: filtro_nodos ────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes barraMBuscaIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ RESULTADOS DE BUSCA ═══ */}
      {buscaAberta && nodosFiltrados.length > 0 && (
        <div style={{
          position: 'fixed',
          left: 12, right: 12,
          bottom: 144,
          zIndex: 50,
          background: 'rgba(10, 16, 32, 0.97)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          animation: 'barraMBuscaIn 180ms ease',
          maxHeight: '50vh',
          overflowY: 'auto'
        }}>
          {nodosFiltrados.map((n, i) => (
            <div
              key={n.id}
              onClick={() => {
                onSeleccionar(n.id)
                setBusca('')
                setBuscaAberta(false)
              }}
              style={{
                padding: '12px 16px',
                borderBottom: i < nodosFiltrados.length - 1 ? '1px solid var(--gaia-cosmos-500)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'background 120ms ease'
              }}
              onTouchStart={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: COR_TIPO[n.type] || 'var(--gaia-text-primary)',
                boxShadow: `0 0 8px ${COR_TIPO[n.type] || 'var(--gaia-text-primary)'}`,
                flexShrink: 0
              }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {n.label}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  marginTop: 2,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {n.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ PANEL DE BUSCA ═══ */}
      {buscaAberta && (
        <div style={{
          position: 'fixed',
          left: 12, right: 12,
          bottom: 80,
          zIndex: nodosFiltrados.length > 0 ? 49 : 50,
          background: 'rgba(10, 16, 32, 0.96)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderLeft: '3px solid var(--gaia-accent)',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.6)',
          animation: 'barraMBuscaIn 180ms ease'
        }}>
          <div style={{ color: 'var(--gaia-accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconoBusca size={18} />
          </div>
          <input
            ref={inputRef}
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setBuscaAberta(false)}
            placeholder="Buscar no universo..."
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--gaia-text-primary)',
              fontSize: 15,
              fontFamily: 'var(--gaia-font-body)'
            }}
          />
          <button
            onClick={() => { setBuscaAberta(false); setBusca('') }}
            aria-label="Pechar busca"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gaia-text-tertiary)',
              cursor: 'pointer',
              padding: 6,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
            <IconoX size={14} />
          </button>
        </div>
      )}

      {/* ═══ BARRA INFERIOR ═══ */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: 68,
        zIndex: 45,
        background: 'rgba(10, 16, 32, 0.92)',
        borderTop: '1px solid var(--gaia-cosmos-400)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        fontFamily: 'var(--gaia-font-body)',
        // Safe area para iPhones con notch inferior
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        boxSizing: 'content-box'
      }}>

        {/* A miña viaxe — portada diaria do neno. Primeiro item da barra. */}
        {onMinaViaxe && (
          <BtnBarra
            Icono={IconoBruxula}
            label={t(idioma, 'aMinaViaxe')}
            onClick={onMinaViaxe}
            cor="var(--gaia-accent)"
          />
        )}

        {/* Menú */}
        <BtnBarra
          Icono={IconoMenu}
          label="Menú"
          onClick={onMenu}
          cor="var(--gaia-text-secondary)"
        />

        {/* Busca */}
        <BtnBarra
          Icono={IconoBusca}
          label="Buscar"
          onClick={() => setBuscaAberta(v => !v)}
          cor={buscaAberta ? 'var(--gaia-accent)' : 'var(--gaia-text-secondary)'}
          activo={buscaAberta}
        />

        {/* GAIA — central destacado */}
        <BtnGaia onClick={onGaia} />

        {/* LÚA */}
        <BtnBarra
          Icono={IconoLua}
          label="LÚA"
          onClick={onLua}
          cor={luaActiva ? 'var(--gaia-concept)' : 'var(--gaia-text-secondary)'}
          activo={luaActiva}
        />

        {/* Enviar contido — só autenticados non-exploradores.
            Se non hai onEnviar, este slot QUEDA OCULTO e a barra
            redistribúe os 4 botóns restantes. */}
        {onEnviar && (
          <BtnBarra
            Icono={IconoMais}
            label="Enviar"
            onClick={onEnviar}
            cor="var(--gaia-constellation)"
          />
        )}

      </div>
    </>
  )
}

// ── INICIO: BtnBarra ─────────────────────────────────
function BtnBarra({ Icono, label, onClick, cor = 'var(--gaia-text-secondary)', activo = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '8px 4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: cor,
        opacity: activo ? 1 : 0.85,
        transition: 'opacity 150ms ease, transform 150ms ease',
        minHeight: 56,
        WebkitTapHighlightColor: 'transparent'
      }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}>
      <Icono size={22} />
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--gaia-font-body)',
        fontWeight: activo ? 700 : 500,
        letterSpacing: '0.02em',
        lineHeight: 1
      }}>
        {label}
      </span>
    </button>
  )
}
// ── FIN: BtnBarra ────────────────────────────────────

// ── INICIO: BtnGaia ──────────────────────────────────
// Botón central destacado: círculo elevado, glow ámbar,
// protagonismo visual do corazón da app.
function BtnGaia({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver a GAIA"
      style={{
        flex: '0 0 auto',
        width: 56,
        height: 56,
        margin: '0 8px',
        marginTop: -16,   // "flota" sobre a barra
        borderRadius: '50%',
        background: 'var(--gaia-cosmos-800)',
        border: '2px solid var(--gaia-accent)',
        color: 'var(--gaia-accent)',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 0 24px rgba(232, 165, 71, 0.45), 0 4px 16px rgba(0, 0, 0, 0.5)',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative'
      }}
      onTouchStart={e => {
        e.currentTarget.style.transform = 'scale(0.88)'
        e.currentTarget.style.boxShadow = '0 0 32px rgba(232, 165, 71, 0.7), 0 4px 20px rgba(0, 0, 0, 0.6)'
      }}
      onTouchEnd={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 0 24px rgba(232, 165, 71, 0.45), 0 4px 16px rgba(0, 0, 0, 0.5)'
      }}>
      <IconoGaia size={24} />
    </button>
  )
}
// ── FIN: BtnGaia ─────────────────────────────────────

export default BarraInferiorMovil