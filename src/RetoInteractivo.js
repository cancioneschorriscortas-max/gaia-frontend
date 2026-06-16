import { useState } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// RetoInteractivo — Reto con avaliación LÚA
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Núcleo pedagóxico: aquí é onde o alumnado
// responde a un reto e LÚA devolve avaliación + puntos + feedback.
//
// API pública (props) sen cambios: nodoId, nodoLabel, pregunta,
// nivel, idioma, puntosTotais, onXP.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cores_nivel_semanticas ───────────────────
// Aliñado coa paleta semántica GAIA v1.1
const NIVEL_COR = {
  primary:   'var(--gaia-constellation)',
  secondary: 'var(--gaia-system)',
  expert:    'var(--gaia-concept)'
}
const NIVEL_COR_GLOW = {
  primary:   'var(--gaia-constellation-glow)',
  secondary: 'var(--gaia-system-glow)',
  expert:    'var(--gaia-concept-glow)'
}
const NIVEL_COR_BG = {
  primary:   'var(--gaia-constellation-bg)',
  secondary: 'var(--gaia-system-bg)',
  expert:    'var(--gaia-concept-bg)'
}
const NIVEL_COR_BORDER = {
  primary:   'var(--gaia-constellation-border)',
  secondary: 'var(--gaia-system-border)',
  expert:    'var(--gaia-concept-border)'
}
// Hardcoded de fallback para bordes (non podemos usar var en borderLeft dinámico)
const NIVEL_COR_FALLBACK = {
  primary:   '#5dd4a8',
  secondary: '#7dd3fc',
  expert:    '#9bb3ff'
}
// ── FIN: cores_nivel_semanticas ──────────────────────

function RetoInteractivo({ nodoId, nodoLabel, pregunta, nivel, idioma, puntosTotais = 20, onXP }) {

  // ── INICIO: contexto ─────────────────────────────────
  const { authHeaders, rexistrarRetoXP, estaAutenticado } = useUser()
  // ── FIN: contexto ────────────────────────────────────

  // ── INICIO: estados ──────────────────────────────────
  const [resposta,  setResposta]  = useState('')
  const [avaliando, setAvaliando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [enviado,   setEnviado]   = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  const corNivel = NIVEL_COR[nivel] || 'var(--gaia-accent)'
  const corNivelFallback = NIVEL_COR_FALLBACK[nivel] || '#e8a547'
  const corNivelBg = NIVEL_COR_BG[nivel] || 'var(--gaia-accent-bg)'
  const corNivelBorder = NIVEL_COR_BORDER[nivel] || 'var(--gaia-accent-border)'
  const corNivelGlow = NIVEL_COR_GLOW[nivel] || 'var(--gaia-accent-glow)'

  // ── INICIO: enviar_resposta ──────────────────────────
  const enviarResposta = async () => {
    if (!resposta.trim() || avaliando) return
    setAvaliando(true)
    try {
      const res = await fetch(`${API}/avaliar-reto`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ pregunta, resposta, nivel, idioma, nodoLabel })
      })

      if (res.status === 401) {
        setResultado({ erro: true, mensaxe: 'Necesitas iniciar sesión para responder retos' })
        return
      }
      if (res.status === 429) {
        const data = await res.json()
        setResultado({ erro: true, mensaxe: data.error || 'Límite diario de retos alcanzado' })
        return
      }

      const data = await res.json()
      setResultado(data)
      setEnviado(true)

      // Rexistrar XP no servidor
      if (data.puntos >= 40) {
        await rexistrarRetoXP(nivel, nodoId || null)
      }
      if (onXP) onXP(Math.round((data.puntos / 100) * puntosTotais))

      // Gardar no historial
      if (estaAutenticado) {
        try {
          await fetch(`${API}/reto-respondido`, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify({
              nodoId:    nodoId || nodoLabel,
              nodoLabel, pregunta, resposta,
              puntos:    data.puntos, nivel, idioma
            })
          })
        } catch (e) {}
      }

    } catch (e) {
      setResultado({ erro: true })
    } finally {
      setAvaliando(false)
    }
  }
  // ── FIN: enviar_resposta ─────────────────────────────

  const resetar = () => {
    setResposta('')
    setResultado(null)
    setEnviado(false)
  }

  // ── INICIO: helper_cor_puntuacion ────────────────────
  const corPuntuacion = (puntos) => {
    if (puntos >= 70) return 'var(--gaia-success)'
    if (puntos >= 40) return 'var(--gaia-accent)'
    return 'var(--gaia-danger)'
  }
  const bgPuntuacion = (puntos) => {
    if (puntos >= 70) return 'var(--gaia-success-bg)'
    if (puntos >= 40) return 'var(--gaia-accent-bg)'
    return 'var(--gaia-danger-bg)'
  }
  const borderPuntuacion = (puntos) => {
    if (puntos >= 70) return 'var(--gaia-success-border)'
    if (puntos >= 40) return 'var(--gaia-accent-border)'
    return 'var(--gaia-danger-border)'
  }
  const mensaxePuntuacion = (puntos) => {
    if (puntos >= 70) return '¡Moi ben!'
    if (puntos >= 40) return 'Ben, pero mellora'
    return 'Sigue intentándoo'
  }
  // ── FIN: helper_cor_puntuacion ───────────────────────

  return (
    <div style={{
      marginTop: 16,
      padding: '16px 18px',
      background: 'var(--gaia-accent-bg)',
      borderRadius: 12,
      border: '1px solid var(--gaia-accent-border)',
      borderLeft: '3px solid #e8a547',
      fontFamily: 'var(--gaia-font-body)'
    }}>

      {/* ═══ CABECEIRA DO RETO ═══ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: corNivel,
            boxShadow: `0 0 6px ${corNivelGlow}`,
            flexShrink: 0
          }} />
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: corNivel,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700
          }}>
            Reto · {nivel}
          </span>
        </div>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-accent)',
          background: 'var(--gaia-accent-bg)',
          padding: '3px 10px',
          borderRadius: 10,
          border: '1px solid var(--gaia-accent-border)',
          letterSpacing: '0.05em',
          fontWeight: 600
        }}>
          +{puntosTotais} XP
        </span>
      </div>

      {/* ═══ PREGUNTA ═══ */}
      <p style={{
        fontFamily: 'var(--gaia-font-display)',
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--gaia-text-primary)',
        lineHeight: 1.55,
        margin: '0 0 16px 0',
        letterSpacing: '-0.01em'
      }}>
        {pregunta}
      </p>

      {/* ═══ FORMULARIO (se non enviado) ═══ */}
      {!enviado && (
        <>
          <textarea
            value={resposta}
            onChange={e => setResposta(e.target.value)}
            placeholder="Escribe aquí a túa resposta..."
            disabled={avaliando}
            style={{
              width: '100%',
              minHeight: 90,
              background: 'var(--gaia-cosmos-800)',
              border: `1px solid ${resposta ? corNivelFallback : 'var(--gaia-cosmos-400)'}`,
              borderRadius: 8,
              padding: '10px 12px',
              color: 'var(--gaia-text-primary)',
              fontSize: 14,
              fontFamily: 'var(--gaia-font-body)',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              transition: 'border 200ms ease, box-shadow 200ms ease',
              boxSizing: 'border-box',
              opacity: avaliando ? 0.6 : 1
            }}
            onFocus={e => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${corNivelBg}`
            }}
            onBlur={e => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={enviarResposta}
            disabled={!resposta.trim() || avaliando}
            style={{
              marginTop: 10,
              width: '100%',
              padding: 12,
              background: resposta.trim() && !avaliando
                ? corNivelFallback
                : 'var(--gaia-cosmos-700)',
              color: resposta.trim() && !avaliando
                ? 'var(--gaia-cosmos-900)'
                : 'var(--gaia-text-disabled)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--gaia-font-body)',
              cursor: resposta.trim() && !avaliando ? 'pointer' : 'not-allowed',
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.025em'
            }}
          >
            {avaliando ? (
              <>
                <span style={{
                  display: 'inline-block',
                  animation: 'retoSpin 1s linear infinite',
                  fontSize: 14
                }}>◌</span>
                LÚA está avaliando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Enviar resposta
              </>
            )}
          </button>
          <style>{`@keyframes retoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
      )}

      {/* ═══ RESULTADO ═══ */}
      {resultado && !resultado.erro && (
        <div style={{ marginTop: 4 }}>

          {/* Card de puntuación */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            marginBottom: 12,
            background: bgPuntuacion(resultado.puntos),
            borderRadius: 10,
            border: `1px solid ${borderPuntuacion(resultado.puntos)}`
          }}>
            <div style={{
              fontSize: 32,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 900,
              color: corPuntuacion(resultado.puntos),
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {resultado.puntos}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 3
              }}>
                Puntos sobre 100
              </div>
              <div style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                color: corPuntuacion(resultado.puntos)
              }}>
                {mensaxePuntuacion(resultado.puntos)}
              </div>
            </div>
            {/* Indicador visual circular */}
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: corPuntuacion(resultado.puntos),
              display: 'grid',
              placeItems: 'center',
              color: 'var(--gaia-cosmos-900)',
              boxShadow: `0 0 16px ${corPuntuacion(resultado.puntos)}66`
            }}>
              {resultado.puntos >= 70 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : resultado.puntos >= 40 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
            </div>
          </div>

          {/* Feedback detallado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {resultado.acertou && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--gaia-success-bg)',
                borderRadius: 8,
                borderLeft: '3px solid #5dd4a8'
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-success)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  O que acertaches
                </div>
                <p style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  {resultado.acertou}
                </p>
              </div>
            )}

            {resultado.mellorar && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--gaia-accent-bg)',
                borderRadius: 8,
                borderLeft: '3px solid #e8a547'
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{ fontSize: 12 }}>→</span>
                  Que mellorar
                </div>
                <p style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  {resultado.mellorar}
                </p>
              </div>
            )}

            {resultado.pista && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--gaia-concept-bg)',
                borderRadius: 8,
                borderLeft: '3px solid #9bb3ff'
              }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-concept)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: 'var(--gaia-concept)',
                    boxShadow: '0 0 4px var(--gaia-concept-glow)'
                  }} />
                  LÚA di
                </div>
                <p style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)',
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>
                  {resultado.pista}
                </p>
              </div>
            )}
          </div>

          {/* Botón de reintento */}
          <button
            onClick={resetar}
            style={{
              marginTop: 12,
              width: '100%',
              padding: 10,
              background: 'transparent',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-tertiary)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = corNivelFallback
              e.currentTarget.style.color = corNivel
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Intentar de novo
          </button>
        </div>
      )}

      {/* ═══ ERRO ═══ */}
      {resultado?.erro && (
        <div style={{
          marginTop: 8,
          padding: '12px 14px',
          background: 'var(--gaia-danger-bg)',
          border: '1px solid var(--gaia-danger-border)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          color: 'var(--gaia-danger)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {resultado.mensaxe || 'Erro ao avaliar. Inténtao de novo.'}
        </div>
      )}

    </div>
  )
}

export default RetoInteractivo