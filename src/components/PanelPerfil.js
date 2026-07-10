import { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { useUI }   from '../contexts/UIContext'
import { ROLES, getRolById } from '../roles'
import { getLabelDoCurso } from '../cursos'
import { t } from '../i18n'
import { API } from '../config/api';

// ═══════════════════════════════════════════════════════════
// PanelPerfil — Panel lateral deslizante co perfil do usuario
// ═══════════════════════════════════════════════════════════
// Reescrito v1.2. Engadida sección Oberón (resultado do test
// vocacional) entre o bloque XP e o botón cambiar camiño.
//
// Dúas vistas:
//   - perfil      → foto + info + nivel/XP + Oberón + botóns
//   - cambiarRol  → cards compactas de rol + profesións expandibles
//
// API pública INTACTA: idioma, onPechar
//
// NOVO en v1.2:
//   - Carga GET /test/meu ao abrir
//   - Bloque Oberón con radar SVG + top 5 profesións
//   - Botón "Refacer test" (pecha este panel, abre PanelOberonTest)
//   - Estado vacío con CTA se o usuario non fixo o test aínda
// ═══════════════════════════════════════════════════════════


// ── INICIO: iconos_svg ───────────────────────────────
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
const IconoEdificio = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" />
    <path d="M9 21V11h6v10" />
    <path d="M12 4L3 8h18z" />
  </svg>
)
const IconoLibroAberto = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
const IconoProfesor = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)
const IconoAlumno = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
  </svg>
)
const IconoLogout = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const IconoEstrela = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoPersoa = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconoFlechaDerecha = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoRadar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)
const IconoRefacer = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

// ── INICIO: helpers ──────────────────────────────────
const esProfesor = (u) => u?.rol === 'profesor'

const numeroSeguro = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
// ── FIN: helpers ─────────────────────────────────────

// ── INICIO: categorias_xp ────────────────────────────
const CATEGORIAS_XP = [
  { clave: 'exploracion', label: 'Exploración', cor: 'var(--gaia-constellation)', corFB: '#5dd4a8' },
  { clave: 'conexion',    label: 'Conexión',    cor: 'var(--gaia-system)',        corFB: '#7dd3fc' },
  { clave: 'comprension', label: 'Comprensión', cor: 'var(--gaia-concept)',       corFB: '#9bb3ff' }
]
// ── FIN: categorias_xp ───────────────────────────────

// ── INICIO: skills_canonicas (orde fixa para o radar) ─
// Mesma orde que en skills_canonicas.js, agrupadas por categoría
// para que o radar teña forma consistente
const SKILLS_ORDE = [
  'empatía', 'comunicación', 'liderazgo',
  'análisis', 'resolución_de_problemas', 'creatividad',
  'memoria', 'planificación', 'atención',
  'precisión', 'coordinación', 'resistencia_física'
]

const SKILLS_LABEL = {
  empatía:                 'Empatí',
  comunicación:            'Comuni',
  liderazgo:               'Lidera',
  análisis:                'Anális',
  resolución_de_problemas: 'Resolu',
  creatividad:             'Creati',
  memoria:                 'Memori',
  planificación:           'Planif',
  atención:                'Atenci',
  precisión:               'Precis',
  coordinación:            'Coordi',
  resistencia_física:      'Resist'
}
// ── FIN: skills_canonicas ────────────────────────────

// ── INICIO: cor_afinidade ─────────────────────────────
const corPorAfinidade = (pct) => {
  if (pct >= 75) return 'var(--gaia-success)'
  if (pct >= 55) return 'var(--gaia-accent)'
  if (pct >= 35) return 'var(--gaia-system)'
  return 'var(--gaia-text-tertiary)'
}
// ── FIN: cor_afinidade ───────────────────────────────


// ═══════════════════════════════════════════════════════════
// COMPOÑENTE RADAR SVG
// ═══════════════════════════════════════════════════════════
function RadarSkills({ perfil }) {
  const SIZE = 320
  const CENTER = SIZE / 2
  const RADIUS = 105
  const N = SKILLS_ORDE.length

  // Normalizar valores 0..1 baseado no máximo do perfil
  const valores = SKILLS_ORDE.map(s => numeroSeguro(perfil[s]))
  const maxVal = Math.max(...valores, 1)
  const normalizados = valores.map(v => v / maxVal)

  // Calcular puntos do polígono (12 vértices)
  const angulo = (i) => (Math.PI * 2 * i) / N - Math.PI / 2  // empezar arriba

  const punto = (i, factor) => {
    const a = angulo(i)
    return {
      x: CENTER + Math.cos(a) * RADIUS * factor,
      y: CENTER + Math.sin(a) * RADIUS * factor
    }
  }

  const pathPerfil = normalizados.map((v, i) => {
    const p = punto(i, v)
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }).join(' ') + ' Z'

  // Aneis de fondo (25%, 50%, 75%, 100%)
  const aneis = [0.25, 0.5, 0.75, 1].map(factor => {
    return SKILLS_ORDE.map((_, i) => {
      const p = punto(i, factor)
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ')
  })

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '12px 0'
    }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Aneis de fondo */}
        {aneis.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--gaia-cosmos-400)"
            strokeWidth={i === 3 ? 1 : 0.5}
            opacity={0.4}
          />
        ))}

        {/* Liñas radiais */}
        {SKILLS_ORDE.map((_, i) => {
          const p = punto(i, 1)
          return (
            <line
              key={i}
              x1={CENTER} y1={CENTER}
              x2={p.x} y2={p.y}
              stroke="var(--gaia-cosmos-400)"
              strokeWidth={0.5}
              opacity={0.3}
            />
          )
        })}

        {/* Polígono do perfil */}
        <path
          d={pathPerfil}
          fill="var(--gaia-accent)"
          fillOpacity="0.25"
          stroke="var(--gaia-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Puntos nos vértices */}
        {normalizados.map((v, i) => {
          const p = punto(i, v)
          return (
            <circle
              key={i}
              cx={p.x} cy={p.y}
              r={3}
              fill="var(--gaia-accent)"
              stroke="var(--gaia-cosmos-900)"
              strokeWidth={1.5}
            />
          )
        })}

        {/* Etiquetas */}
        {SKILLS_ORDE.map((skill, i) => {
          const p = punto(i, 1.18)
          // Axustar text-anchor segundo posición
          let anchor = 'middle'
          if (p.x < CENTER - 5) anchor = 'end'
          else if (p.x > CENTER + 5) anchor = 'start'
          return (
            <text
              key={skill}
              x={p.x}
              y={p.y}
              fill="var(--gaia-text-tertiary)"
              fontSize="9"
              fontFamily="var(--gaia-font-mono)"
              fontWeight="600"
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{ letterSpacing: '0.03em' }}
            >
              {SKILLS_LABEL[skill] || skill}
            </text>
          )
        })}
      </svg>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// PANEL PERFIL PRINCIPAL
// ═══════════════════════════════════════════════════════════
function PanelPerfil({ idioma = 'gl', onPechar }) {

  const {
    usuario, xp, nivel: nivelUsuario,
    rolPersonaxe, actualizarRolPersonaxe, logout, authHeaders
  } = useUser()

  const { abrirPanel } = useUI()

  const [vista,        setVista]        = useState('perfil') // perfil | cambiarRol
  const [rolTmp,       setRolTmp]       = useState(rolPersonaxe || '')
  const [bloqueAberto, setBloqueAberto] = useState(null)
  const [cargando,     setCargando]     = useState(false)

  // ── INICIO: estado_oberon ────────────────────────────
  const [testData,    setTestData]    = useState(null)
  const [cargandoTest, setCargandoTest] = useState(true)
  const [profesionsData, setProfesionsData] = useState({})  // {id: {label, icono, ...}}
  // ── FIN: estado_oberon ───────────────────────────────

  const xenero     = usuario?.xenero || 'm'
  const rolData    = getRolById(rolPersonaxe)
  const cursoLabel = getLabelDoCurso(usuario?.curso)
  const rolTmpData = getRolById(rolTmp)

  const corNivel = nivelUsuario?.cor || 'var(--gaia-accent)'
  const corNivelFB = nivelUsuario?.cor || '#e8a547'

  // ── INICIO: tecla_escape ─────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onPechar()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onPechar])
  // ── FIN: tecla_escape ────────────────────────────────

  // ── INICIO: cargar_test ──────────────────────────────
  // Só carga se é alumno (non profesor, non explorador)
  useEffect(() => {
    if (esProfesor(usuario) || usuario?.explorador) {
      setCargandoTest(false)
      return
    }
    fetch(`${API}/test/meu`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : { test: null })
      .then(d => {
        setTestData(d.test)
        // Se hai test, cargar info das profesións do top
        if (d.test?.top?.length > 0) {
          const ids = d.test.top.map(p => p.id).join(',')
          // Cargar todas as profesións dunha vez
          return fetch(`${API}/profesions`)
            .then(r => r.json())
            .then(pd => {
              const map = {}
              pd.profesions.forEach(p => { map[p.id] = p })
              setProfesionsData(map)
            })
        }
      })
      .catch(e => {
        console.error('[PanelPerfil] Erro cargando test:', e)
      })
      .finally(() => setCargandoTest(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── FIN: cargar_test ─────────────────────────────────

  // ── INICIO: gardar_rol ───────────────────────────────
  const gardarRol = async (profesionId = '', bloqueId = '') => {
    setCargando(true)
    await actualizarRolPersonaxe(rolTmp, bloqueId, profesionId)
    setCargando(false)
    setVista('perfil')
  }
  // ── FIN: gardar_rol ──────────────────────────────────

  // ── INICIO: refacer_test ─────────────────────────────
  const refacerTest = () => {
    onPechar()                  // pecha este panel
    setTimeout(() => {
      abrirPanel('oberonTest')  // abre o test
    }, 350)                     // agarda á animación de saída
  }
  // ── FIN: refacer_test ────────────────────────────────

  // ═══ ESTILOS BASE ════════════════════════════════════
  const chipStyle = (cor, fondo, borde) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 12px',
    fontSize: 11,
    fontFamily: 'var(--gaia-font-body)',
    fontWeight: 500,
    borderRadius: 9999,
    color: cor,
    background: fondo,
    border: `1px solid ${borde}`,
    letterSpacing: '0.025em'
  })

  // ── INICIO: render_seccion_oberon ────────────────────
  const renderSeccionOberon = () => {
    // Non mostrar para profesores ou exploradores
    if (esProfesor(usuario) || usuario?.explorador) return null

    // Mentres carga
    if (cargandoTest) {
      return (
        <div style={{
          padding: 18,
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 12,
          marginBottom: 18,
          textAlign: 'center',
          color: 'var(--gaia-text-tertiary)',
          fontSize: 12,
          fontFamily: 'var(--gaia-font-mono)'
        }}>
          Cargando perfil Oberón...
        </div>
      )
    }

    // Sen test feito → CTA
    if (!testData) {
      return (
        <div style={{
          padding: 18,
          background: 'var(--gaia-cosmos-800)',
          border: '1px dashed var(--gaia-accent-border)',
          borderRadius: 12,
          marginBottom: 18,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <IconoRadar size={12} />
            Oberón
          </div>
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            lineHeight: 1.5,
            marginBottom: 14
          }}>
            Descubre as túas habilidades dominantes e que profesións encaixan
            mellor co teu perfil.
          </div>
          <button
            onClick={refacerTest}
            style={{
              padding: '10px 18px',
              background: 'var(--gaia-accent)',
              color: 'var(--gaia-cosmos-900)',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 16px rgba(232, 165, 71, 0.25)'
            }}>
            Facer test
            <IconoFlechaDerecha />
          </button>
        </div>
      )
    }

    // Test feito → mostrar radar + top 5
    const top5 = testData.top || []
    const perfil = testData.perfil || {}

    // Top 3 skills dominantes
    const skillsOrdenadas = Object.entries(perfil)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => SKILLS_LABEL[k] || k.replace(/_/g, ' '))

    return (
      <div style={{
        padding: 18,
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 12,
        marginBottom: 18
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <IconoRadar size={12} />
            Oberón
          </div>
          <button
            onClick={refacerTest}
            title="Refacer test"
            style={{
              background: 'transparent',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-tertiary)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.05em',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-text-primary)'
              e.currentTarget.style.borderColor = 'var(--gaia-accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            }}>
            <IconoRefacer size={10} />
            Refacer
          </button>
        </div>

        {/* Habilidades dominantes */}
        <div style={{
          fontSize: 12,
          fontFamily: 'var(--gaia-font-body)',
          color: 'var(--gaia-text-secondary)',
          marginBottom: 14,
          lineHeight: 1.5
        }}>
          Habilidades dominantes:{' '}
          <strong style={{ color: 'var(--gaia-accent)' }}>
            {skillsOrdenadas.join(', ')}
          </strong>
        </div>

        {/* Radar SVG */}
        <RadarSkills perfil={perfil} />

        {/* Top 5 profesións */}
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: 14,
          marginBottom: 10
        }}>
          Top 5 profesións
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {top5.map(p => {
            const profInfo = profesionsData[p.id] || {}
            return (
              <div key={p.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'var(--gaia-cosmos-900)',
                border: '1px solid var(--gaia-cosmos-400)',
                borderRadius: 8
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {profInfo.icono || '·'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    color: 'var(--gaia-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {profInfo.label || p.id}
                  </div>
                  <div style={{
                    height: 3,
                    background: 'var(--gaia-cosmos-700)',
                    borderRadius: 2,
                    marginTop: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${p.afinidade}%`,
                      background: corPorAfinidade(p.afinidade),
                      borderRadius: 2
                    }} />
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-mono)',
                  fontWeight: 700,
                  color: corPorAfinidade(p.afinidade),
                  minWidth: 38,
                  textAlign: 'right'
                }}>
                  {p.afinidade}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  // ── FIN: render_seccion_oberon ──────────────────────


  // ═══ PERFIL ══════════════════════════════════════════
  const renderPerfil = () => (
    <div style={{ flex: 1, overflowY: 'auto' }}>

      {/* ─── FOTO + NOME ─── */}
      <div style={{
        position: 'relative',
        height: 240,
        overflow: 'hidden',
        background: rolData ? `${rolData.cor}14` : 'var(--gaia-cosmos-800)'
      }}>
        {rolData ? (
          <img
            src={xenero === 'f' ? rolData.image_f : rolData.image_m}
            alt={rolData.label}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top',
              opacity: 0.75
            }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--gaia-cosmos-300)'
          }}>
            <IconoPersoa size={72} />
          </div>
        )}

        {/* Degradado inferior */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 30%, var(--gaia-cosmos-900) 100%)'
        }} />

        {/* Info sobre a foto */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 20,
          right: 20
        }}>
          <div style={{
            fontSize: 22,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 700,
            color: 'var(--gaia-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
          }}>
            {usuario?.nome}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {rolData && (
              <span style={chipStyle(rolData.cor, `${rolData.cor}22`, `${rolData.cor}55`)}>
                <span style={{ fontWeight: 700 }}>{rolData.icono}</span>
                {rolData.label}
              </span>
            )}
            {usuario?.profesion_personaxe && (
              <span style={chipStyle('var(--gaia-text-secondary)', 'var(--gaia-cosmos-700)', 'var(--gaia-cosmos-400)')}>
                {usuario.profesion_personaxe.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── INFO + NIVEL + OBERÓN + ACCIÓNS ─── */}
      <div style={{ padding: '22px 24px' }}>

        {/* Info básica */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 22,
          flexWrap: 'wrap'
        }}>
          {usuario?.centro && (
            <span style={chipStyle(
              'var(--gaia-text-secondary)',
              'var(--gaia-cosmos-800)',
              'var(--gaia-cosmos-400)'
            )}>
              <IconoEdificio size={11} />
              {usuario.centro}
            </span>
          )}
          {usuario?.curso && (
            <span style={chipStyle(
              'var(--gaia-system)',
              'var(--gaia-system-bg)',
              'var(--gaia-system-border)'
            )}>
              <IconoLibroAberto size={11} />
              {cursoLabel}
            </span>
          )}
          <span style={chipStyle(
            'var(--gaia-text-tertiary)',
            'var(--gaia-cosmos-800)',
            'var(--gaia-cosmos-400)'
          )}>
            {esProfesor(usuario)
              ? <><IconoProfesor size={11} /> Profesor/a</>
              : <><IconoAlumno size={11} /> Alumno/a</>
            }
          </span>
        </div>

        {/* ─── NIVEL E XP ─── */}
        <div style={{
          padding: 18,
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 12,
          marginBottom: 18
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 10,
            marginBottom: 12,
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <IconoEstrela size={10} />
                Nivel actual
              </div>
              <div style={{
                fontSize: 18,
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 700,
                color: corNivel,
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                {nivelUsuario?.titulo || 'Explorador/a'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 4
              }}>
                XP Total
              </div>
              <div style={{
                fontSize: 24,
                fontFamily: 'var(--gaia-font-display)',
                fontWeight: 900,
                color: 'var(--gaia-accent)',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                {numeroSeguro(xp.total)}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          {nivelUsuario?.xpSeguinte && (
            <>
              <div style={{
                height: 4,
                background: 'var(--gaia-cosmos-500)',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${nivelUsuario.progreso || 0}%`,
                  background: `linear-gradient(90deg, ${corNivelFB}, ${corNivelFB}88)`,
                  boxShadow: `0 0 6px ${corNivelFB}66`,
                  borderRadius: 2,
                  transition: 'width 600ms ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                letterSpacing: '0.025em'
              }}>
                <span>{nivelUsuario.titulo}</span>
                <span>
                  {numeroSeguro(nivelUsuario?.xpSeguinte) - numeroSeguro(xp.total)} XP
                  <span style={{ color: 'var(--gaia-text-disabled)' }}> para </span>
                  <span style={{ color: 'var(--gaia-text-secondary)' }}>{nivelUsuario?.tituloSeguinte}</span>
                </span>
              </div>
            </>
          )}

          {/* Desglose XP */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {CATEGORIAS_XP.map(cat => {
              const valor = numeroSeguro(xp[cat.clave])
              return (
                <div key={cat.clave} style={{
                  flex: 1,
                  padding: '10px 6px',
                  background: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: `3px solid ${cat.corFB}`,
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 16,
                    fontFamily: 'var(--gaia-font-display)',
                    fontWeight: 900,
                    color: cat.cor,
                    lineHeight: 1,
                    letterSpacing: '-0.02em'
                  }}>
                    {valor}
                  </div>
                  <div style={{
                    fontSize: 9,
                    fontFamily: 'var(--gaia-font-mono)',
                    color: 'var(--gaia-text-tertiary)',
                    marginTop: 4,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {cat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── SECCIÓN OBERÓN (NOVO) ─── */}
        {renderSeccionOberon()}

        {/* ─── CAMBIAR ROL ─── */}
        {!usuario?.explorador && !esProfesor(usuario) && (
          <button
            onClick={() => { setRolTmp(rolPersonaxe || ''); setVista('cambiarRol') }}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 10,
              background: rolData ? `${rolData.cor}18` : 'var(--gaia-cosmos-700)',
              border: `1px solid ${rolData ? rolData.cor + '55' : 'var(--gaia-cosmos-400)'}`,
              color: rolData?.cor || 'var(--gaia-text-secondary)',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              if (rolData) e.currentTarget.style.background = `${rolData.cor}28`
            }}
            onMouseLeave={e => {
              if (rolData) e.currentTarget.style.background = `${rolData.cor}18`
            }}>
            <IconoEstrela size={11} />
            {rolData ? `Cambiar camiño (${rolData.label})` : 'Escoller camiño'}
          </button>
        )}

        {/* ─── PECHAR SESIÓN ─── */}
        <button
          onClick={() => { logout(); onPechar() }}
          style={{
            width: '100%',
            padding: 12,
            background: 'transparent',
            border: '1px solid var(--gaia-danger-border)',
            color: 'var(--gaia-danger)',
            borderRadius: 10,
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-danger-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <IconoLogout />
          Pechar sesión
        </button>
      </div>
    </div>
  )

  // ═══ CAMBIAR ROL ═════════════════════════════════════
  const renderCambiarRol = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

      {/* Cabeceira */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-tertiary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 8
        }}>
          Escoller camiño
        </div>
        <p style={{
          fontSize: 13,
          fontFamily: 'var(--gaia-font-body)',
          color: 'var(--gaia-text-secondary)',
          lineHeight: 1.5,
          margin: 0
        }}>
          Podes cambiar de rol cando queiras. O teu XP mantense.
        </p>
      </div>

      {/* Cards de rol (compactas horizontais) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {ROLES.map(r => {
          const sel = rolTmp === r.id
          return (
            <div key={r.id}
              onClick={() => setRolTmp(r.id)}
              style={{
                padding: '14px 16px',
                background: sel ? `${r.cor}14` : 'var(--gaia-cosmos-800)',
                border: `1px solid ${sel ? r.cor : 'var(--gaia-cosmos-400)'}`,
                borderLeft: `3px solid ${sel ? r.cor : 'transparent'}`,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--gaia-cosmos-700)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'var(--gaia-cosmos-800)' }}>
              <img
                src={xenero === 'f' ? r.image_f : r.image_m}
                alt={r.label}
                style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  border: `2px solid ${sel ? r.cor : 'var(--gaia-cosmos-400)'}`,
                  flexShrink: 0,
                  transition: 'border 150ms ease'
                }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15,
                  fontFamily: 'var(--gaia-font-display)',
                  fontWeight: 700,
                  color: sel ? r.cor : 'var(--gaia-text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}>
                  {r.label}
                </div>
                <div style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-tertiary)',
                  marginTop: 3,
                  lineHeight: 1.4
                }}>
                  {t(idioma, r.descripcion)}
                </div>
              </div>
              {sel && (
                <div style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: r.cor,
                  color: 'var(--gaia-cosmos-900)',
                  display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 12px ${r.cor}88`
                }}>
                  <IconoCheck size={12} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ─── PROFESIÓNS DO ROL SELECCIONADO ─── */}
      {rolTmpData && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 12
          }}>
            Especialidade (opcional)
          </div>
          {rolTmpData.bloques.map(bloque => (
            <div key={bloque.id} style={{ marginBottom: 6 }}>
              <div
                onClick={() => setBloqueAberto(bloqueAberto === bloque.id ? null : bloque.id)}
                style={{
                  padding: '11px 14px',
                  background: bloqueAberto === bloque.id ? 'var(--gaia-cosmos-700)' : 'var(--gaia-cosmos-800)',
                  border: `1px solid ${bloqueAberto === bloque.id ? bloque.cor + '66' : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: bloqueAberto === bloque.id ? '8px 8px 0 0' : 8,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 200ms ease'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: bloque.cor,
                    boxShadow: `0 0 5px ${bloque.cor}88`
                  }} />
                  <span style={{
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    color: 'var(--gaia-text-primary)'
                  }}>
                    {bloque.label}
                  </span>
                </div>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={bloque.cor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transition: 'transform 200ms ease',
                    transform: bloqueAberto === bloque.id ? 'rotate(180deg)' : 'rotate(0)'
                  }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {bloqueAberto === bloque.id && (
                <div style={{
                  background: 'var(--gaia-cosmos-800)',
                  border: `1px solid ${bloque.cor}44`,
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: 4
                }}>
                  {bloque.profesions.map(prof => (
                    <div key={prof.id}
                      onClick={() => gardarRol(prof.id, bloque.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'background 150ms ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>
                        {prof.icono}
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontFamily: 'var(--gaia-font-body)',
                        fontWeight: 500,
                        color: 'var(--gaia-text-primary)',
                        flex: 1
                      }}>
                        {prof.label}
                      </span>
                      <span style={{
                        color: bloque.cor,
                        opacity: 0.7,
                        flexShrink: 0
                      }}>
                        <IconoFlechaDerecha size={11} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── BOTÓNS ─── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => setVista('perfil')}
          style={{
            flex: 1,
            padding: 12,
            background: 'transparent',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-tertiary)',
            borderRadius: 10,
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
            e.currentTarget.style.color = 'var(--gaia-text-secondary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
          }}>
          Cancelar
        </button>
        {rolTmp && rolTmp !== rolPersonaxe && (
          <button
            onClick={() => gardarRol()}
            disabled={cargando}
            style={{
              flex: 2,
              padding: 12,
              background: rolTmpData?.cor || 'var(--gaia-accent)',
              color: 'var(--gaia-cosmos-900)',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 700,
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: `0 0 24px ${rolTmpData?.cor || '#e8a547'}44`,
              transition: 'all 150ms ease'
            }}>
            {cargando
              ? 'Gardando...'
              : <>Cambiar a {rolTmpData?.label} <IconoFlechaDerecha /></>
            }
          </button>
        )}
      </div>
    </div>
  )

  // ═══ RENDERIZADO ═════════════════════════════════════
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      {/* Overlay */}
      <div
        onClick={onPechar}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)'
        }}
      />

      {/* Panel lateral */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: 'min(420px, 92vw)',
        height: '100%',
        background: 'var(--gaia-cosmos-900)',
        borderLeft: '1px solid var(--gaia-cosmos-400)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--gaia-font-body)',
        color: 'var(--gaia-text-primary)',
        boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.6)',
        animation: 'panelPerfilSlideIn 300ms ease'
      }}>

        <style>{`
          @keyframes panelPerfilSlideIn {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* ─── CABECEIRA ─── */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--gaia-cosmos-400)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'rgba(15, 23, 41, 0.5)'
        }}>
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            fontWeight: 700,
            color: 'var(--gaia-text-primary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            {vista === 'perfil' ? 'O meu perfil' : 'Cambiar camiño'}
          </div>
          <button
            onClick={onPechar}
            aria-label="Pechar"
            style={{
              background: 'transparent',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-tertiary)',
              borderRadius: '50%',
              width: 30, height: 30,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              transition: 'all 150ms ease'
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

        {vista === 'perfil'     && renderPerfil()}
        {vista === 'cambiarRol' && renderCambiarRol()}
      </div>
    </div>
  )
}

export default PanelPerfil