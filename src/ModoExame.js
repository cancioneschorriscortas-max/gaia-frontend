import { useState, useEffect } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// ModoExame — Proba sobre unha constelación
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// Pantalla completa tipo test. LÚA (o asistente) avalía cada
// resposta do alumnado. Cinco fases:
//   1. cargando     — spinner
//   2. sen_retos    — constelación sen retos dispoñibles
//   3. intro        — presentación do exame
//   4. reto         — pregunta + textarea + resultado
//   5. resultado    — nota final + resumo de respostas
//
// API pública INTACTA: constelacionId, constelacionLabel, idioma,
// nivel, onPechar, onFin.
//
// LÓXICA INTACTA:
//   - authHeaders() xa estaba. Non cambia.
//   - rexistrarRetoXP, estaAutenticado, avaliar-reto, reto-respondido.
//   - Puntuación: >=70 excelente, >=40 medio, <40 mellorable.
//   - Só se suman puntos ao XP se puntos >= 40.
//
// IDENTIDADE VISUAL:
//   Modo Exame usa CONCEPT (lavanda #9bb3ff) como cor principal:
//   é o "modo cognitivo/abstracto" en contraste cos niveis
//   pedagóxicos (primary verde / secondary azul / expert lavanda).
//
// MELLORAS:
//   1. Paleta v1.1 completa. Cor concept para o modo.
//   2. Emojis (🎓🤔🎯🌟💡📚🌙🏆💪🔄) → SVGs.
//   3. Tipografía Fraunces para números grandes, Atkinson para texto,
//      JetBrains Mono para etiquetas.
//   4. Cabeceira con backdrop-blur coherente co resto.
//   5. Modal de pechar: sen cambiar lóxica, só visual.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cores_nivel ──────────────────────────────
// Mesmas cores que no VisorNodo/Editor para coherencia.
const COR_NIVEL = {
  primary:   { main: 'var(--gaia-constellation)', fb: '#5dd4a8', label: 'Primaria'   },
  secondary: { main: 'var(--gaia-system)',        fb: '#7dd3fc', label: 'Secundaria' },
  expert:    { main: 'var(--gaia-concept)',       fb: '#9bb3ff', label: 'Experto'    }
}
// ── FIN: cores_nivel ─────────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoGraduacion = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoPregunta = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconoDiana = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IconoEstrela = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoIdea = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.9c.6.5 1 1.2 1 2.1v1h6v-1c0-.9.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
  </svg>
)
const IconoLibros = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const IconoTrofeo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.15 18.75 13 20.24 13 22" />
    <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.85 18.75 11 20.24 11 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)
const IconoMuscle = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18h20" />
    <path d="M5 18V9a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v9" />
    <path d="M13 18v-3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" />
  </svg>
)
const IconoLibrosGrande = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const IconoCogitando = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    <path d="M8 16c1-1 2.5-1.5 4-1.5s3 0.5 4 1.5" />
  </svg>
)
const IconoRepetir = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
)
const IconoFlechaDer = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoLua = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const IconoSpinner = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'exameSpin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function ModoExame({ constelacionId, constelacionLabel, idioma = 'gl', nivel = 'primary', onPechar, onFin }) {

  const { authHeaders, rexistrarRetoXP, estaAutenticado } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [fase,            setFase]            = useState('cargando')
  const [nodos,           setNodos]           = useState([])
  const [indice,          setIndice]          = useState(0)
  const [resposta,        setResposta]        = useState('')
  const [avaliando,       setAvaliando]       = useState(false)
  const [resultadoActual, setResultadoActual] = useState(null)
  const [resultados,      setResultados]      = useState([])
  const [visible,         setVisible]         = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    fetch(`${API}/constelacion/${constelacionId}/nodos-reto`)
      .then(r => r.json())
      .then(d => {
        if (d.nodos?.length > 0) { setNodos(d.nodos); setFase('intro') }
        else setFase('sen_retos')
      })
      .catch(() => setFase('erro'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constelacionId])

  const nodoActual  = nodos[indice]

  // ── INICIO: pregunta_con_fallback ────────────────────
  // Se o nivel pedido non ten reto, intenta os outros en orde
  // (primary → secondary → expert). Devolve tamén o nivel real
  // encontrado para usar as cores e a etiqueta correctas.
  const getPregunta = () => {
    if (!nodoActual) return { texto: '', nivelReal: nivel }
    const ordem = [nivel, 'primary', 'secondary', 'expert'].filter((v, i, a) => a.indexOf(v) === i)
    for (const n of ordem) {
      const t = nodoActual[`reto_${n}_${idioma}`] || nodoActual[`reto_${n}_gl`]
      if (t) return { texto: t, nivelReal: n }
    }
    return { texto: '', nivelReal: nivel }
  }
  const { texto: pregunta, nivelReal } = getPregunta()
  // ── FIN: pregunta_con_fallback ───────────────────────

  const tituloNodo  = nodoActual?.[`label_${idioma}`] || nodoActual?.label_gl || nodoActual?.label || ''
  const totalRetos  = nodos.length
  const corNivel    = COR_NIVEL[nivelReal] || COR_NIVEL[nivel] || COR_NIVEL.primary

  // ── INICIO: enviar_resposta ──────────────────────────
  const enviarResposta = async () => {
    if (!resposta.trim() || avaliando) return
    setAvaliando(true)
    try {
      const res = await fetch(`${API}/avaliar-reto`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ pregunta, resposta, nivel: nivelReal, idioma, nodoLabel: tituloNodo })
      })

      if (res.status === 401) {
        setResultadoActual({ erro: true, mensaxe: 'Necesitas iniciar sesión para o modo exame' })
        return
      }
      if (res.status === 429) {
        const data = await res.json()
        setResultadoActual({ erro: true, mensaxe: data.error || 'Límite diario de retos alcanzado' })
        return
      }

      const data = await res.json()
      setResultadoActual(data)

      if (data.puntos >= 40 && estaAutenticado) {
        await rexistrarRetoXP(nivelReal, nodoActual?.id || null)
      }

      if (estaAutenticado) {
        try {
          await fetch(`${API}/reto-respondido`, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify({
              nodoId:    nodoActual?.id || tituloNodo,
              nodoLabel: tituloNodo,
              pregunta,  resposta,
              puntos:    data.puntos,
              nivel:     nivelReal, idioma
            })
          })
        } catch(e) {}
      }

    } catch(e) {
      setResultadoActual({ erro: true })
    } finally {
      setAvaliando(false)
    }
  }
  // ── FIN: enviar_resposta ─────────────────────────────

  const seguinte = () => {
    setResultados(prev => [...prev, { ...resultadoActual, nodoLabel: tituloNodo, pregunta }])
    if (indice + 1 < totalRetos) {
      setIndice(i => i + 1)
      setResposta('')
      setResultadoActual(null)
    } else {
      setFase('resultado')
    }
  }

  const mediaFinal = resultados.length > 0
    ? Math.round(resultados.reduce((a, r) => a + (r.puntos || 0), 0) / resultados.length)
    : 0

  const corPuntos = (p) => {
    if (p >= 70) return { main: 'var(--gaia-constellation)', fb: '#5dd4a8' }
    if (p >= 40) return { main: 'var(--gaia-accent)',        fb: '#e8a547' }
    return            { main: 'var(--gaia-danger)',          fb: '#f87171' }
  }

  const pechar = () => { setVisible(false); setTimeout(() => onPechar(), 300) }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 300ms ease',
      overflowY: 'auto'
    }}>

      <style>{`
        @keyframes exameSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes exameFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ FONDO CÓSMICO CON LIGEIRO TINTE LAVANDA ═══ */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(155, 179, 255, 0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 80%, rgba(232, 165, 71, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 15% 25%, rgba(155, 179, 255, 0.25), transparent),
          radial-gradient(1px 1px at 82% 70%, rgba(232, 165, 71, 0.2), transparent),
          radial-gradient(1px 1px at 48% 45%, rgba(93, 212, 168, 0.18), transparent)
        `,
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '14px 24px',
        background: 'rgba(10, 16, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, gap: 12, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'var(--gaia-concept-bg)',
            border: '1px solid var(--gaia-concept-border)',
            color: 'var(--gaia-concept)',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(155, 179, 255, 0.25)'
          }}>
            <IconoGraduacion size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-concept)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Modo exame
            </div>
            <div style={{
              fontSize: 13,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 700,
              color: 'var(--gaia-text-primary)',
              marginTop: 2,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {constelacionLabel}
            </div>
          </div>
        </div>

        {fase === 'reto' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {nodos.map((_, i) => (
              <div key={i} style={{
                width: i === indice ? 26 : 8,
                height: 4,
                borderRadius: 2,
                background: i < indice ? corNivel.fb : i === indice ? corNivel.fb : 'var(--gaia-cosmos-500)',
                opacity: i === indice ? 1 : i < indice ? 0.7 : 0.4,
                boxShadow: i === indice ? `0 0 8px ${corNivel.fb}88` : 'none',
                transition: 'all 300ms ease'
              }} />
            ))}
          </div>
        )}

        <button
          onClick={pechar}
          aria-label="Pechar exame"
          style={{
            background: 'transparent',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-tertiary)',
            borderRadius: '50%',
            width: 32, height: 32,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            transition: 'all 150ms ease',
            flexShrink: 0
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--gaia-text-primary)'
            e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
            e.currentTarget.style.background = 'transparent'
          }}>
          <IconoX />
        </button>
      </div>

      {/* ═══ CONTIDO ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          {/* ─── FASE: CARGANDO ─── */}
          {fase === 'cargando' && (
            <div style={{ textAlign: 'center', color: 'var(--gaia-text-tertiary)' }}>
              <div style={{
                display: 'inline-block',
                color: 'var(--gaia-concept)',
                marginBottom: 16
              }}>
                <IconoSpinner size={28} />
              </div>
              <div style={{
                fontSize: 13,
                fontFamily: 'var(--gaia-font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500
              }}>
                Preparando o exame...
              </div>
            </div>
          )}

          {/* ─── FASE: SEN RETOS ─── */}
          {fase === 'sen_retos' && (
            <div style={{ textAlign: 'center', animation: 'exameFadeIn 300ms ease' }}>
              <div style={{
                display: 'inline-flex',
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 18
              }}>
                <IconoCogitando size={34} />
              </div>
              <div style={{
                fontSize: 15,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                marginBottom: 6
              }}>
                Esta constelación non ten retos dispoñibles aínda.
              </div>
              <div style={{
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-tertiary)',
                fontStyle: 'italic',
                marginBottom: 28
              }}>
                Volve nun tempo, seguro que aparecen novos.
              </div>
              <button
                onClick={pechar}
                style={{
                  padding: '11px 28px',
                  background: 'var(--gaia-accent)',
                  color: 'var(--gaia-cosmos-900)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(232, 165, 71, 0.3)',
                  transition: 'all 150ms ease'
                }}>
                Volver ao mapa
              </button>
            </div>
          )}

          {/* ─── FASE: INTRO ─── */}
          {fase === 'intro' && (
            <div style={{ textAlign: 'center', animation: 'exameFadeIn 300ms ease' }}>
              <div style={{
                display: 'inline-flex',
                width: 88, height: 88,
                borderRadius: '50%',
                background: 'var(--gaia-concept-bg)',
                border: '1px solid var(--gaia-concept-border)',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--gaia-concept)',
                marginBottom: 22,
                boxShadow: '0 0 40px rgba(155, 179, 255, 0.3)'
              }}>
                <IconoGraduacion size={40} />
              </div>

              <div style={{
                fontSize: 11,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-concept)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: 10
              }}>
                Exame
              </div>

              <h2 style={{
                fontFamily: 'var(--gaia-font-display)',
                fontSize: 'clamp(26px, 3.4vw, 34px)',
                color: 'var(--gaia-text-primary)',
                margin: '0 0 14px 0',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}>
                {constelacionLabel}
              </h2>

              <p style={{
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                lineHeight: 1.65,
                margin: '0 0 28px 0'
              }}>
                LÚA preparou <strong style={{ color: 'var(--gaia-text-primary)' }}>{totalRetos} retos</strong> desta constelación.
              </p>

              {/* Indicador nivel */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'var(--gaia-cosmos-800)',
                border: `1px solid ${corNivel.fb}55`,
                borderLeft: `3px solid ${corNivel.fb}`,
                borderRadius: 9999,
                marginBottom: 32,
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 600
              }}>
                <span style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: corNivel.fb,
                  boxShadow: `0 0 6px ${corNivel.fb}`
                }} />
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Nivel
                </span>
                <span style={{ color: corNivel.main }}>
                  {corNivel.label}
                </span>
              </div>

              <div>
                <button
                  onClick={() => setFase('reto')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 32px',
                    background: 'var(--gaia-concept)',
                    color: 'var(--gaia-cosmos-900)',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 32px rgba(155, 179, 255, 0.45)',
                    letterSpacing: '0.02em',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 40px rgba(155, 179, 255, 0.6)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 0 32px rgba(155, 179, 255, 0.45)'
                  }}>
                  Comezar exame
                  <IconoFlechaDer />
                </button>
              </div>
            </div>
          )}

          {/* ─── FASE: RETO ─── */}
          {fase === 'reto' && nodoActual && (
            <div style={{ animation: 'exameFadeIn 300ms ease' }}>

              {/* Indicador reto X/N + nodo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em'
                }}>
                  Reto <span style={{ color: 'var(--gaia-concept)', fontWeight: 700 }}>{indice + 1}</span>
                  <span style={{ color: 'var(--gaia-text-disabled)' }}> / {totalRetos}</span>
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: corNivel.main,
                  background: 'var(--gaia-cosmos-800)',
                  border: `1px solid ${corNivel.fb}44`,
                  padding: '4px 11px',
                  borderRadius: 9999,
                  letterSpacing: '0.02em'
                }}>
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: corNivel.fb
                  }} />
                  {tituloNodo}
                  {nivelReal !== nivel && (
                    <span style={{
                      fontSize: 9,
                      color: 'var(--gaia-text-tertiary)',
                      fontWeight: 400,
                      marginLeft: 2,
                      letterSpacing: '0.05em'
                    }}>
                      · {corNivel.label.toLowerCase()}
                    </span>
                  )}
                </span>
              </div>

              {/* Pregunta */}
              <div style={{
                padding: '20px 22px',
                marginBottom: 18,
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderLeft: `3px solid ${corNivel.fb}`,
                borderRadius: 12
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: corNivel.main,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: 10
                }}>
                  <IconoDiana size={11} />
                  Pregunta
                </div>
                <p style={{
                  fontSize: 16,
                  fontFamily: 'var(--gaia-font-body)',
                  color: pregunta ? 'var(--gaia-text-primary)' : 'var(--gaia-text-tertiary)',
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: pregunta ? 'normal' : 'italic'
                }}>
                  {pregunta || 'Este nodo aínda non ten reto dispoñible.'}
                </p>
              </div>

              {!resultadoActual ? (
                !pregunta ? (
                  // ── SEN PREGUNTA: botón para saltar ao seguinte ──
                  <button
                    onClick={() => {
                      setResultados(prev => [...prev, { nodoLabel: tituloNodo, pregunta: '', puntos: 0, saltado: true }])
                      if (indice + 1 < totalRetos) {
                        setIndice(i => i + 1)
                        setResposta('')
                        setResultadoActual(null)
                      } else {
                        setFase('resultado')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'var(--gaia-cosmos-700)',
                      color: 'var(--gaia-text-secondary)',
                      border: '1px solid var(--gaia-cosmos-400)',
                      borderRadius: 10,
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--gaia-cosmos-600)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--gaia-cosmos-700)' }}>
                    {indice + 1 < totalRetos ? <>Saltar ao seguinte <IconoFlechaDer /></> : <>Ver resultados <IconoGraduacion size={14} /></>}
                  </button>
                ) : (
                <>
                  <textarea
                    value={resposta}
                    onChange={e => setResposta(e.target.value)}
                    placeholder="Escribe aquí a túa resposta..."
                    disabled={avaliando}
                    style={{
                      width: '100%',
                      minHeight: 110,
                      background: 'var(--gaia-cosmos-800)',
                      border: `1px solid ${resposta ? corNivel.fb + '66' : 'var(--gaia-cosmos-400)'}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: 'var(--gaia-text-primary)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: 'var(--gaia-font-body)',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      opacity: avaliando ? 0.55 : 1,
                      transition: 'border 150ms ease'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = corNivel.fb}
                    onBlur={e => e.currentTarget.style.borderColor = resposta ? corNivel.fb + '66' : 'var(--gaia-cosmos-400)'}
                  />
                  <button
                    onClick={enviarResposta}
                    disabled={!resposta.trim() || avaliando}
                    style={{
                      marginTop: 12,
                      width: '100%',
                      padding: '13px',
                      background: resposta.trim() && !avaliando ? corNivel.fb : 'var(--gaia-cosmos-700)',
                      color: resposta.trim() && !avaliando ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 700,
                      cursor: resposta.trim() && !avaliando ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      letterSpacing: '0.02em',
                      boxShadow: resposta.trim() && !avaliando ? `0 0 20px ${corNivel.fb}55` : 'none',
                      transition: 'all 150ms ease'
                    }}>
                    {avaliando
                      ? <><IconoSpinner size={14} /> LÚA avaliando...</>
                      : <><IconoCheck /> Enviar resposta</>
                    }
                  </button>
                </>
                )
              ) : (
                <div style={{ animation: 'exameFadeIn 250ms ease' }}>
                  {resultadoActual.erro ? (
                    <div style={{
                      padding: '14px 18px',
                      marginBottom: 14,
                      background: 'var(--gaia-danger-bg)',
                      border: '1px solid var(--gaia-danger-border)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: 'var(--gaia-font-body)',
                      color: 'var(--gaia-danger)',
                      textAlign: 'center'
                    }}>
                      {resultadoActual.mensaxe || 'Erro ao avaliar. Inténtao de novo.'}
                    </div>
                  ) : (
                    <>
                      {/* Tarxeta de puntos */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '16px 20px',
                        marginBottom: 12,
                        background: `${corPuntos(resultadoActual.puntos).fb}0f`,
                        borderRadius: 12,
                        border: `1px solid ${corPuntos(resultadoActual.puntos).fb}44`,
                        borderLeft: `3px solid ${corPuntos(resultadoActual.puntos).fb}`
                      }}>
                        <div style={{
                          fontFamily: 'var(--gaia-font-display)',
                          fontSize: 36,
                          fontWeight: 900,
                          color: corPuntos(resultadoActual.puntos).main,
                          letterSpacing: '-0.03em',
                          lineHeight: 1
                        }}>
                          {resultadoActual.puntos}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 10,
                            fontFamily: 'var(--gaia-font-mono)',
                            color: 'var(--gaia-text-tertiary)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: 3
                          }}>
                            Puntos sobre 100
                          </div>
                          <div style={{
                            fontSize: 13,
                            fontFamily: 'var(--gaia-font-body)',
                            fontWeight: 700,
                            color: corPuntos(resultadoActual.puntos).main
                          }}>
                            {resultadoActual.puntos >= 70 ? '¡Moi ben!' : resultadoActual.puntos >= 40 ? 'Ben, segue!' : 'Sigue intentándoo'}
                          </div>
                        </div>
                        <div style={{
                          color: corPuntos(resultadoActual.puntos).main,
                          flexShrink: 0
                        }}>
                          {resultadoActual.puntos >= 70
                            ? <IconoEstrela size={26} />
                            : resultadoActual.puntos >= 40
                              ? <IconoIdea size={24} />
                              : <IconoLibros size={22} />
                          }
                        </div>
                      </div>

                      {/* Pista de LÚA */}
                      {resultadoActual.pista && (
                        <div style={{
                          padding: '12px 16px',
                          marginBottom: 14,
                          background: 'var(--gaia-concept-bg)',
                          border: '1px solid var(--gaia-concept-border)',
                          borderLeft: '3px solid var(--gaia-concept)',
                          borderRadius: 10
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 10,
                            fontFamily: 'var(--gaia-font-mono)',
                            color: 'var(--gaia-concept)',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            marginBottom: 6
                          }}>
                            <IconoLua size={10} />
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
                            {resultadoActual.pista}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={seguinte}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: indice + 1 < totalRetos ? 'var(--gaia-concept)' : 'var(--gaia-accent)',
                      color: 'var(--gaia-cosmos-900)',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: indice + 1 < totalRetos
                        ? '0 0 20px rgba(155, 179, 255, 0.35)'
                        : '0 0 24px rgba(232, 165, 71, 0.4)',
                      letterSpacing: '0.02em',
                      transition: 'all 150ms ease'
                    }}>
                    {indice + 1 < totalRetos
                      ? <>Seguinte reto ({indice + 2}/{totalRetos}) <IconoFlechaDer /></>
                      : <><IconoGraduacion size={14} /> Ver resultados</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── FASE: RESULTADO ─── */}
          {fase === 'resultado' && (
            <div style={{ textAlign: 'center', animation: 'exameFadeIn 300ms ease' }}>

              {/* Icono segundo resultado */}
              <div style={{
                display: 'inline-flex',
                width: 88, height: 88,
                borderRadius: '50%',
                background: `${corPuntos(mediaFinal).fb}0f`,
                border: `1px solid ${corPuntos(mediaFinal).fb}44`,
                alignItems: 'center', justifyContent: 'center',
                color: corPuntos(mediaFinal).main,
                marginBottom: 18,
                boxShadow: `0 0 40px ${corPuntos(mediaFinal).fb}55`
              }}>
                {mediaFinal >= 70
                  ? <IconoTrofeo size={42} />
                  : mediaFinal >= 40
                    ? <IconoLibrosGrande size={40} />
                    : <IconoMuscle size={40} />
                }
              </div>

              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: 8
              }}>
                Resultado
              </div>

              <h2 style={{
                fontFamily: 'var(--gaia-font-display)',
                fontSize: 'clamp(36px, 4vw, 48px)',
                color: corPuntos(mediaFinal).main,
                margin: '0 0 6px 0',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                {mediaFinal}
                <span style={{
                  fontSize: 22,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em',
                  marginLeft: 6,
                  fontWeight: 600
                }}>
                  /100
                </span>
              </h2>

              <p style={{
                color: 'var(--gaia-text-secondary)',
                fontSize: 14,
                fontFamily: 'var(--gaia-font-body)',
                margin: '0 0 32px 0',
                lineHeight: 1.5
              }}>
                {mediaFinal >= 70
                  ? '¡Excelente! Dominaches esta constelación.'
                  : mediaFinal >= 40
                    ? 'Bo traballo! Hai marxe para mellorar.'
                    : 'Segue practicando, chegarás!'
                }
              </p>

              {/* Lista de respostas */}
              <div style={{ textAlign: 'left', marginBottom: 28 }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 10
                }}>
                  Respostas
                </div>
                {resultados.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    marginBottom: 6,
                    background: 'var(--gaia-cosmos-800)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderLeft: `3px solid ${corPuntos(r.puntos).fb}`,
                    borderRadius: 8,
                    gap: 12
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-primary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {r.nodoLabel}
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {r.pregunta?.slice(0, 70)}...
                      </div>
                    </div>
                    <div style={{
                      fontSize: 18,
                      fontFamily: 'var(--gaia-font-display)',
                      fontWeight: 900,
                      color: corPuntos(r.puntos).main,
                      flexShrink: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {r.puntos}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botóns finais */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={pechar}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '13px',
                    background: 'var(--gaia-cosmos-800)',
                    color: 'var(--gaia-text-secondary)',
                    border: '1px solid var(--gaia-cosmos-400)',
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                    e.currentTarget.style.color = 'var(--gaia-text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
                    e.currentTarget.style.color = 'var(--gaia-text-secondary)'
                  }}>
                  Volver ao mapa
                </button>
                <button
                  onClick={() => {
                    setIndice(0)
                    setResposta('')
                    setResultadoActual(null)
                    setResultados([])
                    setFase('intro')
                  }}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '13px',
                    background: 'var(--gaia-concept)',
                    color: 'var(--gaia-cosmos-900)',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 0 20px rgba(155, 179, 255, 0.35)',
                    transition: 'all 150ms ease'
                  }}>
                  <IconoRepetir /> Repetir exame
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ModoExame