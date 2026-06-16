import { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// NotificacionXP — Toast flotante ao gañar XP
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// Toast que salta desde abaixo centrado cando o usuario gaña XP
// (ao completar un reto, unha misión, ou similar).
//
// API pública INTACTA: eventos (array), onFin.
//
// MELLORAS:
//   1. Keyframe propia (notifXPFadeInUp) — non depende de luaFadeIn
//      global (que puidera ou non estar definida nalgún css).
//   2. Cores semánticas v1.1:
//      - misión   → constellation (verde xade)
//      - XP xeral → accent        (ámbar)
//   3. Tipografía Atkinson + valor XP en Fraunces destacado.
//   4. Aparece cun sutil efecto "bounce" e desaparece fade-out.
//   5. backdrop-blur para elegancia.
// ═══════════════════════════════════════════════════════════

function NotificacionXP({ eventos, onFin }) {
  const [visible, setVisible] = useState(true)
  const [saindo,  setSaindo]  = useState(false)
  const [indice,  setIndice]  = useState(0)

  useEffect(() => {
    if (!eventos || eventos.length === 0) return
    setVisible(true)
    setSaindo(false)
    setIndice(0)

    // Tempo total visible: 2500ms, fade-out: últimos 300ms
    const timerSaindo = setTimeout(() => setSaindo(true), 2200)
    const timerFin    = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onFin && onFin(), 100)
    }, 2500)

    return () => {
      clearTimeout(timerSaindo)
      clearTimeout(timerFin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos])

  if (!visible || !eventos || eventos.length === 0) return null

  const evento     = eventos[indice]
  const eMision    = evento.tipo === 'mision'
  const corMain    = eMision ? 'var(--gaia-constellation)'        : 'var(--gaia-accent)'
  const corBg      = eMision ? 'var(--gaia-constellation-bg)'     : 'var(--gaia-accent-bg)'
  const corBorder  = eMision ? 'var(--gaia-constellation-border)' : 'var(--gaia-accent-border)'
  const corGlowFB  = eMision ? 'rgba(93, 212, 168, 0.5)'          : 'rgba(232, 165, 71, 0.5)'

  return (
    <div style={{
      position: 'fixed',
      bottom: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      pointerEvents: 'none'
    }}>
      <style>{`
        @keyframes notifXPFadeInUp {
          0%   { opacity: 0; transform: translate(-50%, 20px) scale(0.92); }
          60%  { opacity: 1; transform: translate(-50%, -3px) scale(1.02); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes notifXPFadeOut {
          0%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, 10px) scale(0.95); }
        }
      `}</style>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: corBg,
        border: `1px solid ${corBorder}`,
        borderLeft: `3px solid ${corMain}`,
        borderRadius: 9999,
        padding: '10px 20px',
        color: corMain,
        fontSize: 13,
        fontFamily: 'var(--gaia-font-body)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px ${corGlowFB}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: saindo
          ? 'notifXPFadeOut 300ms ease forwards'
          : 'notifXPFadeInUp 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        {/* Icona segundo tipo */}
        {eMision ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 12l2 2 4-4" />
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.7 0 3.3.47 4.66 1.29" />
            <polyline points="22 4 12 14 8 10" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}

        {/* Texto */}
        <span>{evento.texto}</span>
      </div>
    </div>
  )
}

export default NotificacionXP