import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════
// RankingCentros — Páxina pública de ranking institucional
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Esta é a carta de presentación máis directa
// para AMTEGA: cantos centros están contribuíndo, quen lidera,
// canto se construíu no total.
//
// URL: /ranking
// API: GET /ranking/centros → { centros: [...] }
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: config_puntos ────────────────────────────
const PUNTOS = {
  nodo:     10,
  validado: 25,
  autor:    15,
  relacion:  5
}
// ── FIN: config_puntos ───────────────────────────────

// ── INICIO: cores_metricas ───────────────────────────
// Aliñado coa paleta semántica GAIA v1.1
const COR_NODO     = 'var(--gaia-galaxy)'           // dourado
const COR_NODO_FB  = '#ffd966'
const COR_VALID    = 'var(--gaia-success)'           // verde xade
const COR_VALID_FB = '#5dd4a8'
const COR_AUTOR    = 'var(--gaia-concept)'           // lavanda
const COR_AUTOR_FB = '#9bb3ff'
const COR_REL      = 'var(--gaia-accent)'            // ámbar
const COR_REL_FB   = '#e8a547'
// ── FIN: cores_metricas ──────────────────────────────

// ── INICIO: icono_medalla ────────────────────────────
// Substitúe os emojis 🥇🥈🥉 por círculos graduados.
function MedallaBadge({ posicion }) {
  if (posicion > 2) {
    return (
      <div style={{
        width: 32, height: 32,
        borderRadius: '50%',
        background: 'var(--gaia-cosmos-700)',
        border: '1px solid var(--gaia-cosmos-400)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--gaia-font-mono)',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--gaia-text-tertiary)'
      }}>
        {posicion + 1}
      </div>
    )
  }

  const mapa = [
    { bg: '#ffd966', cor: '#0a1020', glow: 'rgba(255, 217, 102, 0.5)' },   // ouro
    { bg: '#c5cbd8', cor: '#0a1020', glow: 'rgba(197, 203, 216, 0.4)' },   // prata
    { bg: '#cd7f32', cor: '#0a1020', glow: 'rgba(205, 127, 50, 0.4)' },    // bronce
  ]
  const s = mapa[posicion]

  return (
    <div style={{
      width: 32, height: 32,
      borderRadius: '50%',
      background: s.bg,
      display: 'grid', placeItems: 'center',
      color: s.cor,
      fontFamily: 'var(--gaia-font-display)',
      fontSize: 14,
      fontWeight: 900,
      boxShadow: `0 0 12px ${s.glow}`,
      flexShrink: 0
    }}>
      {posicion + 1}
    </div>
  )
}
// ── FIN: icono_medalla ───────────────────────────────

// ── INICIO: barra_progreso ───────────────────────────
function BarraProgreso({ valor, max, cor, corFallback, label, numero }) {
  const pct = max > 0 ? Math.min(100, Math.round((valor / max) * 100)) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--gaia-font-body)',
          color: cor,
          fontWeight: 700
        }}>
          {numero}
        </span>
      </div>
      <div style={{
        height: 5,
        background: 'var(--gaia-cosmos-500)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: corFallback,
          borderRadius: 3,
          transition: 'width 800ms ease',
          boxShadow: `0 0 6px ${corFallback}66`
        }} />
      </div>
    </div>
  )
}
// ── FIN: barra_progreso ──────────────────────────────

// ── INICIO: icono_edificio ───────────────────────────
// SVG de edificio institucional (substitúe ao emoji 🏫)
function IconoEdificio({ size = 24, color = 'currentColor' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="13" />
      <path d="M9 21V11h6v10" />
      <path d="M12 4L3 8h18z" />
    </svg>
  )
}
// ── FIN: icono_edificio ──────────────────────────────

// ── INICIO: tarxeta_centro ───────────────────────────
function TarxetaCentro({ centro, posicion, maxPuntos }) {
  const destacado = posicion < 3

  return (
    <div style={{
      background: destacado
        ? 'var(--gaia-cosmos-800)'
        : 'var(--gaia-cosmos-800)',
      border: `1px solid ${destacado
        ? 'var(--gaia-accent-border)'
        : 'var(--gaia-cosmos-400)'}`,
      borderLeft: `3px solid ${
        posicion === 0 ? '#ffd966' :
        posicion === 1 ? '#c5cbd8' :
        posicion === 2 ? '#cd7f32' :
        '#3d4a6b'
      }`,
      borderRadius: 12,
      padding: '22px 26px',
      marginBottom: 12,
      transition: 'all 200ms ease'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderLeftWidth = '5px'
        e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderLeftWidth = '3px'
        e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
      }}
    >

      {/* Cabeceira: medalla + nome + puntos */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <MedallaBadge posicion={posicion} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 17,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 700,
              color: 'var(--gaia-text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              {centro.centro}
            </div>
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              marginTop: 4,
              letterSpacing: '0.05em'
            }}>
              {centro.autores} {centro.autores === 1 ? 'autor/a' : 'autores/as'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: 28,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: destacado ? 'var(--gaia-accent)' : 'var(--gaia-text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            {centro.puntos}
          </div>
          <div style={{
            fontSize: 9,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: 4,
            fontWeight: 600
          }}>
            Puntos
          </div>
        </div>
      </div>

      {/* Barras de progreso */}
      <BarraProgreso
        valor={centro.totalNodos}
        max={maxPuntos / PUNTOS.nodo}
        cor={COR_NODO}
        corFallback={COR_NODO_FB}
        label="Nodos creados"
        numero={centro.totalNodos}
      />
      <BarraProgreso
        valor={centro.validados}
        max={centro.totalNodos || 1}
        cor={COR_VALID}
        corFallback={COR_VALID_FB}
        label="Nodos validados"
        numero={`${centro.validados} / ${centro.totalNodos}`}
      />
      <BarraProgreso
        valor={centro.autores}
        max={10}
        cor={COR_AUTOR}
        corFallback={COR_AUTOR_FB}
        label="Autores distintos"
        numero={centro.autores}
      />
      <BarraProgreso
        valor={centro.relacions}
        max={maxPuntos / PUNTOS.relacion}
        cor={COR_REL}
        corFallback={COR_REL_FB}
        label="Relacións creadas"
        numero={centro.relacions}
      />

      {/* Chips de métricas con puntuación desglosada */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 16,
        flexWrap: 'wrap'
      }}>
        {[
          { label: `${centro.totalNodos} nodos`,      cor: COR_NODO_FB,  pts: centro.totalNodos * PUNTOS.nodo },
          { label: `${centro.validados} validados`,   cor: COR_VALID_FB, pts: centro.validados * PUNTOS.validado },
          { label: `${centro.autores} autores/as`,    cor: COR_AUTOR_FB, pts: centro.autores * PUNTOS.autor },
          { label: `${centro.relacions} relacións`,   cor: COR_REL_FB,   pts: centro.relacions * PUNTOS.relacion },
        ].map(chip => (
          <div key={chip.label} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            fontFamily: 'var(--gaia-font-body)',
            padding: '3px 10px',
            borderRadius: 9999,
            background: `${chip.cor}14`,
            color: chip.cor,
            border: `1px solid ${chip.cor}44`
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: chip.cor,
              boxShadow: `0 0 4px ${chip.cor}66`
            }} />
            {chip.label}
            <span style={{
              opacity: 0.55,
              fontFamily: 'var(--gaia-font-mono)',
              fontSize: 9
            }}>
              +{chip.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
// ── FIN: tarxeta_centro ──────────────────────────────

function RankingCentros() {

  // ── INICIO: estados ──────────────────────────────────
  const [centros, setCentros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [erro, setErro] = useState(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_datos ──────────────────────────────
  const cargar = () => {
    setCargando(true)
    fetch(`${API}/ranking/centros`)
      .then(r => r.json())
      .then(data => {
        setCentros(data.centros || [])
        setUltimaActualizacion(new Date())
        setCargando(false)
      })
      .catch(() => {
        setErro('Non se puido conectar co servidor')
        setCargando(false)
      })
  }

  useEffect(() => { cargar() }, [])
  // ── FIN: carga_datos ─────────────────────────────────

  const maxPuntos = centros[0]?.puntos || 1
  const totalNodos = centros.reduce((s, c) => s + (c.totalNodos || 0), 0)
  const totalValidados = centros.reduce((s, c) => s + (c.validados || 0), 0)
  const totalAutores = centros.reduce((s, c) => s + (c.autores || 0), 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gaia-cosmos-900)',
      color: 'var(--gaia-text-primary)',
      fontFamily: 'var(--gaia-font-body)'
    }}>

      {/* ═══ FONDO CÓSMICO ═══ */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(232, 165, 71, 0.05) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 90%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(15, 23, 41, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gaia-cosmos-400)',
        padding: '28px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 8
          }}>
            GAIA · Ranking institucional
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--gaia-font-display)',
            fontSize: 'clamp(28px, 3.5vw, 38px)',
            fontWeight: 700,
            color: 'var(--gaia-text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Centros educativos
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            maxWidth: '55ch',
            lineHeight: 1.5
          }}>
            Os centros que están a construír o arquivo do coñecemento galego, ordenados por contribución.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {ultimaActualizacion && (
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.05em'
            }}>
              Actualizado: {ultimaActualizacion.toLocaleTimeString('gl')}
            </span>
          )}
          <button onClick={cargar} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-secondary)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--gaia-font-body)',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
            e.currentTarget.style.color = 'var(--gaia-text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            e.currentTarget.style.color = 'var(--gaia-text-secondary)'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'var(--gaia-accent-bg)',
            border: '1px solid var(--gaia-accent-border)',
            color: 'var(--gaia-accent)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--gaia-font-body)',
            textDecoration: 'none',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(232, 165, 71, 0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--gaia-accent-bg)'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver a GAIA
          </a>
        </div>
      </div>

      {/* ═══ CONTIDO ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 880,
        margin: '0 auto',
        padding: '40px 24px 80px'
      }}>

        {/* ───── MÉTRICAS GLOBAIS (se hai datos) ───── */}
        {!cargando && centros.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 28
          }}>
            {[
              { label: 'Centros activos', valor: centros.length, icono: <IconoEdificio size={16} /> },
              { label: 'Nodos creados', valor: totalNodos, cor: COR_NODO_FB },
              { label: 'Validados', valor: totalValidados, cor: COR_VALID_FB },
              { label: 'Autores/as', valor: totalAutores, cor: COR_AUTOR_FB }
            ].map(m => (
              <div key={m.label} style={{
                padding: '14px 16px',
                background: 'var(--gaia-cosmos-800)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 10
              }}>
                <div style={{
                  fontSize: 9,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {m.icono}
                  {m.label}
                </div>
                <div style={{
                  fontSize: 22,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 900,
                  color: m.cor || 'var(--gaia-text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {m.valor}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ───── LENDA DE PUNTOS ───── */}
        <div style={{
          display: 'flex',
          gap: 14,
          marginBottom: 32,
          padding: '14px 18px',
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 10,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginRight: 4
          }}>
            Sistema de puntos:
          </span>
          {[
            { label: 'Nodo creado',    pts: PUNTOS.nodo,     cor: COR_NODO_FB },
            { label: 'Nodo validado',  pts: PUNTOS.validado, cor: COR_VALID_FB },
            { label: 'Autor distinto', pts: PUNTOS.autor,    cor: COR_AUTOR_FB },
            { label: 'Relación',       pts: PUNTOS.relacion, cor: COR_REL_FB },
          ].map(item => (
            <span key={item.label} style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: '50%',
                background: item.cor,
                boxShadow: `0 0 4px ${item.cor}66`
              }} />
              {item.label}: <strong style={{ color: item.cor, fontFamily: 'var(--gaia-font-mono)' }}>+{item.pts}pts</strong>
            </span>
          ))}
        </div>

        {/* ───── ESTADO DE CARGA / ERRO / BALEIRO ───── */}
        {cargando && (
          <div style={{
            textAlign: 'center',
            color: 'var(--gaia-text-tertiary)',
            padding: 60,
            fontFamily: 'var(--gaia-font-mono)',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Cargando ranking...
          </div>
        )}

        {erro && (
          <div style={{
            textAlign: 'center',
            color: 'var(--gaia-danger)',
            padding: 40,
            fontSize: 13,
            background: 'var(--gaia-danger-bg)',
            border: '1px solid var(--gaia-danger-border)',
            borderRadius: 10
          }}>
            {erro}
          </div>
        )}

        {!cargando && !erro && centros.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gaia-text-tertiary)',
            border: '1px dashed var(--gaia-cosmos-400)',
            borderRadius: 12,
            background: 'var(--gaia-cosmos-800)'
          }}>
            <div style={{
              display: 'inline-flex',
              marginBottom: 16,
              color: 'var(--gaia-cosmos-300)'
            }}>
              <IconoEdificio size={40} color="currentColor" />
            </div>
            <div style={{
              fontSize: 16,
              fontFamily: 'var(--gaia-font-display)',
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--gaia-text-secondary)'
            }}>
              Aínda non hai centros no ranking
            </div>
            <div style={{
              fontSize: 12,
              maxWidth: '50ch',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Os nodos necesitan ter os campos
              {' '}<code style={{
                color: 'var(--gaia-accent)',
                fontFamily: 'var(--gaia-font-mono)',
                background: 'var(--gaia-accent-bg)',
                padding: '1px 6px',
                borderRadius: 3
              }}>autor</code>{' '}
              e{' '}
              <code style={{
                color: 'var(--gaia-accent)',
                fontFamily: 'var(--gaia-font-mono)',
                background: 'var(--gaia-accent-bg)',
                padding: '1px 6px',
                borderRadius: 3
              }}>centro</code>
              {' '}cubertos para aparecer aquí.
            </div>
          </div>
        )}

        {/* ───── LISTA DE CENTROS ───── */}
        {!cargando && centros.map((c, i) => (
          <TarxetaCentro
            key={c.centro}
            centro={c}
            posicion={i}
            maxPuntos={maxPuntos}
          />
        ))}

      </div>
    </div>
  )
}

export default RankingCentros