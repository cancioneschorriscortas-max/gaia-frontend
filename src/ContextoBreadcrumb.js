import { useState, useEffect, useRef } from 'react'
import { useUser } from './contexts/UserContext'
import { API } from './config/api';

// ═══════════════════════════════════════════════════════════
// ContextoBreadcrumb — Ruta xerárquica dun nodo
// ═══════════════════════════════════════════════════════════
// Reescrito v1.2.
//
// API pública INTACTA: id, idioma
//
// CAMBIO IMPORTANTE v1.2:
//   Antes renderizaba todos os camiños apilados, o que en
//   cabeceiras pequenas (panel lateral, bottomsheet) causaba
//   2-4 liñas e taparse con outros elementos.
//
//   Agora:
//   - Se hai UN só camiño: breadcrumb normal dunha liña.
//   - Se hai VARIOS camiños: amosa SÓ o primeiro e un chip
//     "+N" clicable que despregra un popover con todos os
//     camiños, cun dot numerado por ruta.
//
// MELLORAS:
//   1. Sempre unha liña, altura constante.
//   2. Popover con todas as rutas ao clicar "+N".
//   3. Cores semánticas por tipo (constellation/galaxy/system).
//   4. authHeaders() defensivo.
//   5. Pechase ao clicar fóra ou premer Escape.
// ═══════════════════════════════════════════════════════════


function ContextoBreadcrumb({ id, idioma = 'gl' }) {

  const { authHeaders } = useUser()

  const [contextos,   setContextos]   = useState([])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!id) return
    setPopoverOpen(false)
    fetch(`${API}/nodo/${id}/contexto`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setContextos(data.contextos || []))
      .catch(e => console.error('[ContextoBreadcrumb] Erro:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── INICIO: pechar_popover ───────────────────────────
  useEffect(() => {
    if (!popoverOpen) return
    const handleClick = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setPopoverOpen(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setPopoverOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown',   handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown',   handleKey)
    }
  }, [popoverOpen])
  // ── FIN: pechar_popover ──────────────────────────────

  if (contextos.length === 0) return null

  const getLabel = (n) => {
    if (!n) return null
    return n[idioma] || n.gl || n.label || ''
  }

  const separador = (key) => (
    <span key={key} style={{
      color: 'var(--gaia-text-disabled)',
      fontFamily: 'var(--gaia-font-mono)',
      fontSize: 11,
      userSelect: 'none'
    }}>
      ›
    </span>
  )

  // ── INICIO: render_camino ────────────────────────────
  const renderCamino = (ctx, { small = false } = {}) => {
    const partes = []
    const fontSize = small ? 11 : 12

    if (getLabel(ctx.constellation)) {
      partes.push(
        <span key="c" style={{
          color: 'var(--gaia-constellation)',
          fontWeight: 500,
          fontSize,
          fontFamily: 'var(--gaia-font-body)',
          letterSpacing: '0.01em'
        }}>
          {getLabel(ctx.constellation)}
        </span>
      )
    }
    if (getLabel(ctx.galaxy)) {
      if (partes.length > 0) partes.push(separador('s1'))
      partes.push(
        <span key="g" style={{
          color: 'var(--gaia-galaxy)',
          fontWeight: 500,
          fontSize,
          fontFamily: 'var(--gaia-font-body)',
          letterSpacing: '0.01em'
        }}>
          {getLabel(ctx.galaxy)}
        </span>
      )
    }
    if (getLabel(ctx.system)) {
      if (partes.length > 0) partes.push(separador('s2'))
      partes.push(
        <span key="s" style={{
          color: 'var(--gaia-system)',
          fontWeight: 500,
          fontSize,
          fontFamily: 'var(--gaia-font-body)',
          letterSpacing: '0.01em'
        }}>
          {getLabel(ctx.system)}
        </span>
      )
    }

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        minWidth: 0
      }}>
        {partes}
      </div>
    )
  }
  // ── FIN: render_camino ───────────────────────────────

  const primeiroCamino = contextos[0]
  const numExtra = contextos.length - 1

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      maxWidth: '100%',
      minWidth: 0
    }}>
      <style>{`
        @keyframes breadcrumbPopoverIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Primeiro camiño (sempre visible, truncado se longo) */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {renderCamino(primeiroCamino)}
      </div>

      {/* Chip "+N" se hai máis camiños */}
      {numExtra > 0 && (
        <>
          <button
            ref={triggerRef}
            onClick={(e) => { e.stopPropagation(); setPopoverOpen(v => !v) }}
            aria-label={`Ver ${numExtra} camiño${numExtra !== 1 ? 's' : ''} máis`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 7px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              fontWeight: 700,
              color: popoverOpen ? 'var(--gaia-cosmos-900)' : 'var(--gaia-accent)',
              background: popoverOpen ? 'var(--gaia-accent)' : 'var(--gaia-accent-bg)',
              border: '1px solid var(--gaia-accent-border)',
              borderRadius: 9999,
              cursor: 'pointer',
              letterSpacing: '0.03em',
              lineHeight: 1.4,
              transition: 'all 150ms ease',
              flexShrink: 0
            }}
            onMouseEnter={e => { if (!popoverOpen) e.currentTarget.style.background = 'rgba(232, 165, 71, 0.25)' }}
            onMouseLeave={e => { if (!popoverOpen) e.currentTarget.style.background = 'var(--gaia-accent-bg)' }}>
            +{numExtra}
          </button>

          {/* Popover con todos os camiños */}
          {popoverOpen && (
            <div
              ref={popoverRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 30,
                minWidth: 280,
                maxWidth: 'min(420px, 90vw)',
                background: 'rgba(10, 16, 32, 0.97)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 10,
                padding: '10px 0',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                animation: 'breadcrumbPopoverIn 180ms ease'
              }}>
              {/* Cabeceira popover */}
              <div style={{
                padding: '2px 14px 8px',
                fontSize: 9,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700,
                borderBottom: '1px solid var(--gaia-cosmos-500)',
                marginBottom: 6
              }}>
                Neste nodo conflúen {contextos.length} camiños
              </div>

              {/* Lista de camiños */}
              {contextos.map((ctx, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 14px',
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-body)',
                  minWidth: 0
                }}>
                  {/* Dot numerador */}
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'var(--gaia-cosmos-700)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 9,
                    fontFamily: 'var(--gaia-font-mono)',
                    fontWeight: 700,
                    color: 'var(--gaia-text-tertiary)',
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {renderCamino(ctx, { small: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ContextoBreadcrumb