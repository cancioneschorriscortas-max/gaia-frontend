import React, { useEffect, useState } from 'react'
import VisorMedio from './components/VisorMedio'
import { API } from './config/api';




// ═══════════════════════════════════════════════════════════
// OberonProfesionVista — v6 + iconos vectoriais nas microskills
//
// Único cambio respecto á v6 que xa funciona:
//   - Substituír emoji por SVG nas microskills (puntos pequenos)
//   - Iconos por skill canónica (12 totais)
//   - Pintan na cor da súa categoría de afinidade
// ═══════════════════════════════════════════════════════════


// ── Umbrais ──
const UMBRAL_ALTA = 70
const UMBRAL_MEDIA = 50

const AFINIDADE_DEMO = {
  'atención': 88, 'precisión': 92, 'memoria': 65,
  'comunicación': 45, 'empatía': 50, 'liderazgo': 30,
  'análisis': 60, 'resolución_de_problemas': 75,
  'creatividad': 72, 'planificación': 78,
  'coordinación': 85, 'resistencia_física': 90,
}
const calcularAfinidade = (id) => AFINIDADE_DEMO[id] ?? 50
const categoriaAfinidade = (p) => p >= UMBRAL_ALTA ? 'alta' : p >= UMBRAL_MEDIA ? 'media' : 'baixa'


// ═══════════════════════════════════════════════════════════
// ICONOS VECTORIAIS POR SKILL CANÓNICA
// ═══════════════════════════════════════════════════════════
// Render: <IconoSkill skillId="atención" size={12} color="#5dd4a8" />

const ICONOS_SKILL = {
  'atención': (
    <g>
      <circle cx="0" cy="0" r="5.5" fill="none" strokeWidth="1.4" />
      <circle cx="0" cy="0" r="2" fill="currentColor" stroke="none" />
    </g>
  ),
  'precisión': (
    <g>
      <circle cx="0" cy="0" r="5" fill="none" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="2.5" fill="none" strokeWidth="1" />
      <circle cx="0" cy="0" r="0.8" fill="currentColor" stroke="none" />
    </g>
  ),
  'memoria': (
    <g>
      <path d="M -5 -3 Q -5 -6 -2 -6 Q 0 -6 0 -3 Q 0 -6 2 -6 Q 5 -6 5 -3 Q 5 0 0 4 Q -5 0 -5 -3 Z"
        fill="currentColor" stroke="none" />
    </g>
  ),
  'comunicación': (
    <g>
      <path d="M -6 -3 L 6 -3 L 6 2 L 0 2 L -2 5 L -2 2 L -6 2 Z"
        fill="none" strokeWidth="1.3" strokeLinejoin="round" />
    </g>
  ),
  'empatía': (
    <g>
      <path d="M 0 5 Q -5 1 -5 -2 Q -5 -5 -2 -5 Q 0 -5 0 -2 Q 0 -5 2 -5 Q 5 -5 5 -2 Q 5 1 0 5 Z"
        fill="currentColor" stroke="none" />
    </g>
  ),
  'liderazgo': (
    <g>
      <path d="M 0 -6 L 1.5 -2 L 6 -2 L 2.5 1 L 4 5 L 0 2.5 L -4 5 L -2.5 1 L -6 -2 L -1.5 -2 Z"
        fill="currentColor" stroke="none" />
    </g>
  ),
  'análisis': (
    <g>
      <line x1="-5" y1="-5" x2="5" y2="5" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="-5" y1="5" x2="5" y2="-5" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="2" fill="currentColor" stroke="none" />
    </g>
  ),
  'resolución_de_problemas': (
    <g>
      <path d="M -5 0 L -2 0 M 2 0 L 5 0 M 0 -5 L 0 -2 M 0 2 L 0 5"
        strokeWidth="1.3" strokeLinecap="round" />
      <rect x="-2" y="-2" width="4" height="4" fill="currentColor" stroke="none" />
    </g>
  ),
  'creatividad': (
    <g>
      <path d="M 0 -6 L 1.2 -1.5 L 6 0 L 1.2 1.5 L 0 6 L -1.2 1.5 L -6 0 L -1.2 -1.5 Z"
        fill="currentColor" stroke="none" />
    </g>
  ),
  'planificación': (
    <g>
      <rect x="-5" y="-4" width="10" height="8" fill="none" strokeWidth="1.2" />
      <line x1="-5" y1="-1.5" x2="5" y2="-1.5" strokeWidth="0.8" />
      <line x1="-2.5" y1="-4" x2="-2.5" y2="-1.5" strokeWidth="0.8" />
      <line x1="2.5" y1="-4" x2="2.5" y2="-1.5" strokeWidth="0.8" />
    </g>
  ),
  'coordinación': (
    <g>
      <circle cx="-3.5" cy="0" r="2.5" fill="none" strokeWidth="1.2" />
      <circle cx="3.5" cy="0" r="2.5" fill="none" strokeWidth="1.2" />
      <line x1="-1.5" y1="0" x2="1.5" y2="0" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  ),
  'resistencia_física': (
    <g>
      <path d="M -5 -1 L -3 -1 L -3 -3 L 3 -3 L 3 -1 L 5 -1 L 5 1 L 3 1 L 3 3 L -3 3 L -3 1 L -5 1 Z"
        fill="currentColor" stroke="none" />
    </g>
  ),
}

// Fallback por se a skill canónica non está mapeada
const ICONO_FALLBACK = (
  <circle cx="0" cy="0" r="2.5" fill="currentColor" stroke="none" />
)

function IconoSkill({ skillId, color, size = 12 }) {
  const contido = ICONOS_SKILL[skillId] || ICONO_FALLBACK
  return (
    <svg
      viewBox="-8 -8 16 16"
      width={size}
      height={size}
      style={{ color, stroke: color, display: 'block' }}
    >
      {contido}
    </svg>
  )
}


// ═══════════════════════════════════════════════════════════
// COMPOÑENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

export default function OberonProfesionVista({ profesionId }) {
  const [datos, setDatos] = useState(null)
  const [erro, setErro] = useState(null)
  const [tabActiva, setTabActiva] = useState('habilidades')
  const [microskillSel, setMicroskillSel] = useState(null)

  useEffect(() => {
    if (!profesionId) {
      setErro('Falta profesionId na URL')
      return
    }
    fetch(`${API}/oberon/profesion/${profesionId}/completa`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        setDatos(d)
        if (d.microskills?.[0]) setMicroskillSel(d.microskills[0])
      })
      .catch(e => setErro(e.message))
  }, [profesionId])

  if (erro) return <ErroVista mensaxe={erro} />
  if (!datos) return <CargandoVista />

  const ROL_LABELS = {
    explorador: 'MODO EXPLORADOR', sabio: 'MODO SABIO',
    construtor: 'MODO CONSTRUTOR', coidador: 'MODO COIDADOR',
  }
  const rolLabel = ROL_LABELS[datos.rol] || `MODO ${datos.rol?.toUpperCase()}`

  const TABS = [
    { id: 'habilidades', label: 'HABILIDADES' },
    { id: 'caminho', label: 'CAMIÑO' },
    { id: 'conexions', label: 'CONEXIÓNS' },
    { id: 'historia', label: 'HISTORIA' },
    { id: 'perfil', label: 'PERFIL' },
  ]

  return (
    <div style={S.root}>
      <FontEmbed />
      <div style={S.ruido} />

      <header style={S.cabeceira}>
        <div style={S.cabeceiraEsquerda}>
          <button style={S.botonVolver} onClick={() => window.history.back()}>←</button>
          <nav style={S.breadcrumb}>
            <span style={S.crumbDestaque}>OBERÓN</span>
            <span style={S.crumbSep}>✧</span>
            <span style={S.crumb}>{rolLabel}</span>
            <span style={S.crumbSep}>✧</span>
            <span style={S.crumb}>{datos.label?.toUpperCase()}</span>
          </nav>
        </div>
        <nav style={S.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              style={{ ...S.tab, ...(t.id === tabActiva ? S.tabActiva : {}) }}
              onClick={() => setTabActiva(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div style={S.cabeceiraDereita}>
          <span style={S.luaIcono}>🦋</span>
          <span style={S.luaLabel}>LÚA</span>
        </div>
      </header>

      <main style={S.corpo}>
        <ColEsquerda datos={datos} />
        <ColCentro
          datos={datos}
          microskillSel={microskillSel}
          onSeleccionar={setMicroskillSel}
        />
        <ColDereita
          microskillSel={microskillSel}
          datos={datos}
        />
      </main>

      <footer style={S.barraInferior}>
        <button style={S.botonInferior}>← VOLVER AO MAPA</button>
        <div style={S.statsCentro}>
          <Stat label="Profesións visitadas" valor="7 / 56" />
          <StatSeparador />
          <Stat label="XP Oberón" valor="1.250" iconoCircular="XP" />
          <StatSeparador />
          <Stat label="Afinidade neste oficio" valor={`${calcularAfinidadeOficio(datos.skills)}%`} iconoCircular="❤" />
        </div>
        <button style={S.botonInferiorDestaque}>
          <span style={{ marginRight: 6 }}>★</span>
          MARCAR COMO CAMIÑO
        </button>
      </footer>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// VISTAS DE ESTADO
// ═══════════════════════════════════════════════════════════

function ErroVista({ mensaxe }) {
  return (
    <div style={S.root}>
      <FontEmbed />
      <div style={S.mensaxe}>
        <p style={S.erroLabel}>ERRO</p>
        <p>{mensaxe}</p>
      </div>
    </div>
  )
}

function CargandoVista() {
  return (
    <div style={S.root}>
      <FontEmbed />
      <div style={S.mensaxe}>
        <p style={{ opacity: 0.6, letterSpacing: 4, fontFamily: '"Cinzel", serif' }}>
          INVOCANDO A PROFESIÓN
        </p>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// COLUMNA ESQUERDA
// ═══════════════════════════════════════════════════════════

function ColEsquerda({ datos }) {
  return (
    <aside style={S.colEsquerda}>
      <CaixaDecorada>
        <Identidade datos={datos} />
      </CaixaDecorada>

      <CaixaDecorada titulo="A TÚA AFINIDADE GLOBAL">
        <RadarPersoal skills={datos.skills} />
      </CaixaDecorada>

      <CaixaDecorada titulo="COMO LER ESTE ÁRBORE">
        <LendaAfinidade />
      </CaixaDecorada>
    </aside>
  )
}

function CaixaDecorada({ titulo, children }) {
  return (
    <div style={S.caixaDecorada}>
      <span style={{ ...S.esquina, top: -1, left: -1 }}>┌</span>
      <span style={{ ...S.esquina, top: -1, right: -1 }}>┐</span>
      <span style={{ ...S.esquina, bottom: -1, left: -1 }}>└</span>
      <span style={{ ...S.esquina, bottom: -1, right: -1 }}>┘</span>
      {titulo && <p style={S.caixaTitulo}>{titulo}</p>}
      {children}
    </div>
  )
}

function Identidade({ datos }) {
  return (
    <div style={S.identidade}>
      <EscudoCoroa />
      <h1 style={S.titulo}>{datos.label?.toUpperCase()}</h1>
      <p style={S.epigrafe}>{datos.epigrafe_gl?.toUpperCase()}</p>
      <p style={S.frase}>{datos.descricion_poetica_gl}</p>
    </div>
  )
}

function EscudoCoroa() {
  return (
    <svg viewBox="0 0 100 100" style={S.escudoSvg}>
      <defs>
        <radialGradient id="escudo-fondo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a1f0a" />
          <stop offset="100%" stopColor="#15110a" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#escudo-fondo)" stroke="#e8a547" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#e8a547" strokeWidth="0.6" opacity="0.6" />
      <g transform="translate(50, 50)">
        <path
          d="M -16 8 L -14 -2 L -8 4 L -3 -8 L 0 -14 L 3 -8 L 8 4 L 14 -2 L 16 8 Z"
          fill="#e8a547" stroke="#f7c97a" strokeWidth="0.5" strokeLinejoin="round"
        />
        <circle cx="0" cy="-8" r="2" fill="rgba(255,255,255,0.95)" />
        <line x1="-16" y1="8" x2="16" y2="8" stroke="#e8a547" strokeWidth="1" />
      </g>
      <path d="M 18 60 Q 25 75 40 80" stroke="#e8a547" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M 82 60 Q 75 75 60 80" stroke="#e8a547" strokeWidth="0.8" fill="none" opacity="0.6" />
    </svg>
  )
}

function LendaAfinidade() {
  const items = [
    { cor: '#5dd4a8', label: 'Afinidade alta:', desc: 'dominas esta habilidade' },
    { cor: '#e8a547', label: 'En progreso:', desc: 'estás no camiño' },
    { cor: '#c084d4', label: 'Afinidade media:', desc: 'tes potencial' },
    { cor: '#6b7691', label: 'Afinidade baixa:', desc: 'podes mellorar' },
  ]
  return (
    <div style={S.lendaContedor}>
      {items.map((it, i) => (
        <div key={i} style={S.lendaItem}>
          <span style={{
            display: 'inline-block', width: 10, height: 10,
            borderRadius: '50%', background: it.cor,
            boxShadow: `0 0 6px ${it.cor}`, marginRight: 8,
          }} />
          <span style={S.lendaLabel}>{it.label}</span>
          <span style={S.lendaDesc}>&nbsp;{it.desc}</span>
        </div>
      ))}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// RADAR — usa iconos vectoriais nos vértices tamén
// ═══════════════════════════════════════════════════════════

function RadarPersoal({ skills }) {
  const top = (skills || []).slice(0, 6)
  const VB = 280
  const cx = VB / 2, cy = VB / 2
  const R = 75

  const puntos = top.map((s, i) => {
    const ang = -Math.PI / 2 + (i / top.length) * Math.PI * 2
    const af = calcularAfinidade(s.id)
    const r = (af / 100) * R
    return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r, label: s.label, af, ang }
  })

  const polPersoal = puntos.map(p => `${p.x},${p.y}`).join(' ')
  const ETIQ_R = R + 32

  const media = top.length
    ? Math.round(top.reduce((s, k) => s + calcularAfinidade(k.id), 0) / top.length)
    : 0

  return (
    <svg viewBox={`0 0 ${VB} ${VB + 30}`} style={S.svgRadar}>
      {[0.33, 0.66, 1].map(esc => (
        <polygon
          key={esc}
          points={top.map((_, i) => {
            const ang = -Math.PI / 2 + (i / top.length) * Math.PI * 2
            return `${cx + Math.cos(ang) * R * esc},${cy + Math.sin(ang) * R * esc}`
          }).join(' ')}
          fill="none" stroke="rgba(232,165,71,0.18)" strokeWidth="0.7"
        />
      ))}
      {top.map((_, i) => {
        const ang = -Math.PI / 2 + (i / top.length) * Math.PI * 2
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + Math.cos(ang) * R} y2={cy + Math.sin(ang) * R}
            stroke="rgba(232,165,71,0.13)" strokeWidth="0.5" />
        )
      })}
      <polygon points={polPersoal}
        fill="rgba(232,165,71,0.18)" stroke="#e8a547" strokeWidth="1.3" />
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#e8a547" />
      ))}

      <text x={cx} y={cy - 2} textAnchor="middle" style={{
        fontFamily: '"Cinzel", serif', fontSize: 22, fontWeight: 700,
        fill: '#e8a547', letterSpacing: 1,
      }}>{media}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" style={{
        fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: 9, fill: '#c0b896',
      }}>Afinidade</text>
      <text x={cx} y={cy + 24} textAnchor="middle" style={{
        fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: 9, fill: '#c0b896',
      }}>xeral</text>

      {top.map((s, i) => {
        const ang = -Math.PI / 2 + (i / top.length) * Math.PI * 2
        const lx = cx + Math.cos(ang) * ETIQ_R
        const ly = cy + Math.sin(ang) * ETIQ_R
        const af = calcularAfinidade(s.id)
        const cat = categoriaAfinidade(af)
        const cor = cat === 'alta' ? '#5dd4a8' : cat === 'media' ? '#c084d4' : '#6b7691'

        return (
          <g key={i}>
            <circle cx={lx} cy={ly - 8} r="9"
              fill="rgba(11,17,35,0.92)" stroke={cor} strokeWidth="1.2" />
            <g transform={`translate(${lx}, ${ly - 8})`} style={{ color: cor, stroke: cor }}>
              {ICONOS_SKILL[s.id] || ICONO_FALLBACK}
            </g>
            <text x={lx} y={ly + 8} textAnchor="middle" style={{
              fontFamily: '"Cinzel", serif', fontSize: 7, letterSpacing: 1, fill: '#c0b896',
            }}>{s.label?.toUpperCase()}</text>
            <text x={lx} y={ly + 19} textAnchor="middle" style={{
              fontFamily: '"Cinzel", serif', fontSize: 11, fontWeight: 600, fill: '#e8a547',
            }}>{af}%</text>
          </g>
        )
      })}
    </svg>
  )
}


// ═══════════════════════════════════════════════════════════
// COLUMNA CENTRAL — imaxe acotada arriba + skill tree abaixo
// ═══════════════════════════════════════════════════════════

function ColCentro({ datos, microskillSel, onSeleccionar }) {
  return (
    <section style={S.colCentro}>
      <SkillTreeReal
        datos={datos}
        microskillSel={microskillSel}
        onSeleccionar={onSeleccionar}
      />
    </section>
  )
}

function SkillTreeReal({ datos, microskillSel, onSeleccionar }) {
  const grupos = datos.grupos || []
  const microskills = datos.microskills || []

  const clasificarGrupo = (g) => {
    const x = g.posicion?.x ?? 0.5
    const y = g.posicion?.y ?? 0.5
    if (y < 0.35) return x < 0.5 ? 'top-left' : 'top-right'
    if (y > 0.7) {
      if (x < 0.4) return 'bottom-left'
      if (x > 0.6) return 'bottom-right'
      return 'bottom-center'
    }
    return x < 0.5 ? 'top-left' : 'top-right'
  }

  const slots = { 'top-left': null, 'top-right': null, 'bottom-left': null, 'bottom-right': null, 'bottom-center': null }
  grupos.forEach(g => {
    const slot = clasificarGrupo(g)
    if (!slots[slot]) slots[slot] = g
    else {
      const libres = Object.entries(slots).filter(([_, v]) => !v).map(([k]) => k)
      if (libres.length) slots[libres[0]] = g
    }
  })

  const microsPorGrupo = {}
  microskills.forEach(m => {
    if (!microsPorGrupo[m.grupo_id]) microsPorGrupo[m.grupo_id] = []
    microsPorGrupo[m.grupo_id].push(m)
  })

  return (
    <div style={S.skillTreeContedor}>
      <div style={S.zonaImaxe}>
        {datos.imaxe_escena_url && (
          <>
            <img src={datos.imaxe_escena_url} alt={datos.label} style={S.imaxeAcotada} />
            <div style={S.imaxeViñeteAcotada} />
          </>
        )}

        {slots['top-left'] && (
          <GrupoComBranchesEsq
            grupo={slots['top-left']}
            micros={microsPorGrupo[slots['top-left'].id] || []}
            microskillSel={microskillSel}
            onSeleccionar={onSeleccionar}
          />
        )}
        {slots['top-right'] && (
          <GrupoComBranchesDer
            grupo={slots['top-right']}
            micros={microsPorGrupo[slots['top-right'].id] || []}
            microskillSel={microskillSel}
            onSeleccionar={onSeleccionar}
          />
        )}
      </div>

      <div style={S.zonaInferior}>
        <div style={S.coroaContedor}>
          <CoroaPequena />
          <p style={S.coroaLabel}>{datos.label?.toUpperCase()}</p>
        </div>

        {slots['bottom-center'] && (
          <GrupoCentroAbaixo
            grupo={slots['bottom-center']}
            micros={microsPorGrupo[slots['bottom-center'].id] || []}
            microskillSel={microskillSel}
            onSeleccionar={onSeleccionar}
          />
        )}

        {slots['bottom-left'] && (
          <GrupoComBranchesEsq
            grupo={slots['bottom-left']}
            micros={microsPorGrupo[slots['bottom-left'].id] || []}
            microskillSel={microskillSel}
            onSeleccionar={onSeleccionar}
            posicion="abaixo"
          />
        )}
        {slots['bottom-right'] && (
          <GrupoComBranchesDer
            grupo={slots['bottom-right']}
            micros={microsPorGrupo[slots['bottom-right'].id] || []}
            microskillSel={microskillSel}
            onSeleccionar={onSeleccionar}
            posicion="abaixo"
          />
        )}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// GRUPO + microskills
// ═══════════════════════════════════════════════════════════

function CabeceiraGrupo({ grupo, alineacion = 'esquerda' }) {
  return (
    <div style={{
      ...S.grupoCabeceira,
      flexDirection: alineacion === 'esquerda' ? 'row' : 'row-reverse',
      textAlign: alineacion === 'esquerda' ? 'left' : 'right',
    }}>
      <span style={{ ...S.grupoIcono, color: grupo.cor }}>
        {grupo.icono}
      </span>
      <h3 style={{ ...S.grupoTitulo, color: grupo.cor }}>
        {grupo.label_gl?.toUpperCase()}
      </h3>
    </div>
  )
}

// ── ESTE É O CAMBIO PRINCIPAL ──
// Microskill agora usa IconoSkill no canto de emoji
function MicroskillEtiqueta({ micro, grupo, microskillSel, onSeleccionar, alineacion = 'esquerda' }) {
  const af = calcularAfinidade(micro.skill_canonica_id)
  const cat = categoriaAfinidade(af)
  const seleccionada = microskillSel?.id === micro.id

  // Cor do punto depende da categoría (non da cor do grupo)
  const corPunto = cat === 'alta' ? '#5dd4a8' :
                   cat === 'media' ? '#c084d4' : '#6b7691'

  return (
    <div
      onClick={() => onSeleccionar(micro)}
      style={{
        ...S.microEtiqueta,
        flexDirection: alineacion === 'esquerda' ? 'row' : 'row-reverse',
        opacity: cat === 'alta' ? 1 : cat === 'media' ? 0.8 : 0.5,
        ...(seleccionada ? S.microEtiquetaSel : {}),
        ...(seleccionada ? { borderColor: '#e8a547' } : {}),
      }}
    >
      <div style={{
        ...S.microPunto,
        borderColor: corPunto,
        boxShadow: cat === 'alta' ? `0 0 8px ${corPunto}` : 'none',
      }}>
        <IconoSkill
          skillId={micro.skill_canonica_id}
          color={corPunto}
          size={12}
        />
      </div>
      <span style={{
        ...S.microLabel,
        color: seleccionada ? '#e8a547' : '#c0b896',
        margin: alineacion === 'esquerda' ? '0 0 0 10px' : '0 10px 0 0',
      }}>
        {micro.label_gl}
      </span>
    </div>
  )
}

function GrupoComBranchesEsq({ grupo, micros, microskillSel, onSeleccionar, posicion = 'arriba' }) {
  return (
    <div style={posicion === 'arriba' ? S.grupoTopLeft : S.grupoBottomLeft}>
      <CabeceiraGrupo grupo={grupo} alineacion="esquerda" />
      <div style={S.microsLista}>
        {micros.map(m => (
          <MicroskillEtiqueta
            key={m.id} micro={m} grupo={grupo}
            microskillSel={microskillSel} onSeleccionar={onSeleccionar}
            alineacion="esquerda"
          />
        ))}
      </div>
    </div>
  )
}

function GrupoComBranchesDer({ grupo, micros, microskillSel, onSeleccionar, posicion = 'arriba' }) {
  return (
    <div style={posicion === 'arriba' ? S.grupoTopRight : S.grupoBottomRight}>
      <CabeceiraGrupo grupo={grupo} alineacion="dereita" />
      <div style={S.microsLista}>
        {micros.map(m => (
          <MicroskillEtiqueta
            key={m.id} micro={m} grupo={grupo}
            microskillSel={microskillSel} onSeleccionar={onSeleccionar}
            alineacion="dereita"
          />
        ))}
      </div>
    </div>
  )
}

function GrupoCentroAbaixo({ grupo, micros, microskillSel, onSeleccionar }) {
  return (
    <div style={S.grupoBottomCenter}>
      <CabeceiraGrupoCentrada grupo={grupo} />
      <div style={S.microsListaCentral}>
        {micros.map(m => (
          <MicroskillEtiqueta
            key={m.id} micro={m} grupo={grupo}
            microskillSel={microskillSel} onSeleccionar={onSeleccionar}
            alineacion="esquerda"
          />
        ))}
      </div>
    </div>
  )
}

function CabeceiraGrupoCentrada({ grupo }) {
  return (
    <div style={S.grupoCabeceiraCentrada}>
      <span style={{ ...S.grupoIcono, color: grupo.cor }}>{grupo.icono}</span>
      <h3 style={{ ...S.grupoTitulo, color: grupo.cor, margin: '0 8px' }}>
        {grupo.label_gl?.toUpperCase()}
      </h3>
    </div>
  )
}

function CoroaPequena() {
  return (
    <svg viewBox="0 0 80 80" style={S.coroaSvgPequena}>
      <defs>
        <radialGradient id="halo-coroa-peq" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7c97a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8a547" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#halo-coroa-peq)" />
      <circle cx="40" cy="40" r="28" fill="rgba(15,11,5,0.95)" stroke="#e8a547" strokeWidth="2" />
      <g transform="translate(40, 40)">
        <path
          d="M -14 6 L -12 -2 L -7 4 L -3 -7 L 0 -12 L 3 -7 L 7 4 L 12 -2 L 14 6 Z"
          fill="#e8a547" stroke="#f7c97a" strokeWidth="0.5" strokeLinejoin="round"
        />
        <circle cx="0" cy="-7" r="1.5" fill="rgba(255,255,255,0.95)" />
      </g>
    </svg>
  )
}


// ═══════════════════════════════════════════════════════════
// COLUMNA DEREITA
// ═══════════════════════════════════════════════════════════

function ColDereita({ microskillSel, datos }) {
  return (
    <aside style={S.colDereita}>
      <Inspector microskillSel={microskillSel} datos={datos} />
    </aside>
  )
}

function Inspector({ microskillSel, datos }) {
  if (!microskillSel) {
    return (
      <div style={S.inspectorVacio}>
        <p style={S.inspectorTituloPlaceholder}>INSPECTOR DE HABILIDADE</p>
        <p style={S.inspectorTextoPlaceholder}>
          Selecciona unha habilidade para ver os detalles.
        </p>
      </div>
    )
  }

  const grupo = (datos.grupos || []).find(g => g.id === microskillSel.grupo_id)
  const af = calcularAfinidade(microskillSel.skill_canonica_id)
  const imaxe = microskillSel.imaxe_url || datos.imaxe_escena_url

  const niveis = [
    { num: 1, label: 'NIVEL 1', estado: 'alcanzado', desc: 'Coñeces a textura básica da masa e amasas con ritmo regular.' },
    { num: 2, label: 'NIVEL 2 (ACTUAL)', estado: 'actual', desc: 'Adáptaste á humidade do día e á farinha que tes diante.' },
    { num: 3, label: 'NIVEL 3', estado: 'bloqueado', desc: 'Lograde unha textura perfecta sen necesidade de báscula nin reloxo.' },
  ]

  return (
    <div style={S.inspector}>
      <p style={S.inspectorEpigrafe}>
        Estas habilidades son<br />o teu superpoder neste oficio
      </p>

   <div style={S.inspectorImaxeCaixa}>
        <VisorMedio
          videoUrl={microskillSel.video_url}
          imaxe={imaxe}
          alt={microskillSel.label_gl}
        />
        <div style={S.inspectorImaxeBordo} />
      </div>

      <div style={S.inspectorNomeRow}>
        <div style={{
          ...S.inspectorIconoCirculo,
          borderColor: grupo?.cor || '#e8a547',
        }}>
          <IconoSkill
            skillId={microskillSel.skill_canonica_id}
            color={grupo?.cor || '#e8a547'}
            size={18}
          />
        </div>
        <h2 style={S.inspectorNome}>{microskillSel.label_gl?.toUpperCase()}</h2>
        <span style={S.inspectorChipNivel}>NIVEL 2 DE 3</span>
      </div>

      <p style={S.inspectorDesc}>{microskillSel.que_significa_gl}</p>

      <div style={S.niveisContedor}>
        {niveis.map((n, i) => {
          const cor = n.estado === 'alcanzado' ? '#5dd4a8'
                    : n.estado === 'actual' ? '#c084d4'
                    : '#4a4a4a'
          return (
            <div key={n.num} style={S.nivelFila}>
              <div style={S.nivelEsquerda}>
                <div style={{ ...S.nivelCirculo, borderColor: cor, color: cor }}>
                  {n.estado === 'alcanzado' ? '✓' : n.num}
                </div>
                {i < niveis.length - 1 && (
                  <div style={{ ...S.nivelLineaVertical, background: cor, opacity: 0.5 }} />
                )}
              </div>
              <div style={S.nivelDereita}>
                <p style={{ ...S.nivelLabel, color: cor }}>
                  {n.label}
                  {n.estado === 'bloqueado' && <span style={{ marginLeft: 6 }}>🔒</span>}
                </p>
                <p style={S.nivelDesc}>{n.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={S.inspectorAccion}>
        <p style={S.inspectorAccionLabel}>ACCIÓN CLAVE</p>
        <div style={S.inspectorAccionFrase}>
          <span style={S.inspectorAccionComilla}>"</span>
          <span style={S.inspectorAccionTexto}>{microskillSel.accion_clave_gl}</span>
          <span style={S.inspectorAccionComilla}>"</span>
          <span style={S.inspectorAccionEspiga}>🌾</span>
        </div>
      </div>

      <div style={S.comoMedraSec}>
        <p style={S.comoMedraTitulo}>COMO MEDRA ESTA HABILIDADE</p>
        <ul style={S.comoMedraLista}>
          <li style={S.comoMedraItem}>
            <span style={S.comoMedraIcono}>💧</span>
            Practica con humidades diferentes
          </li>
          <li style={S.comoMedraItem}>
            <span style={S.comoMedraIcono}>🌾</span>
            Coñece distintas variedades de fariña
          </li>
          <li style={S.comoMedraItem}>
            <span style={S.comoMedraIcono}>✋</span>
            Traballa sen ferramentas auxiliares ocasionalmente
          </li>
        </ul>
      </div>

      <div style={S.afinBloque}>
        <p style={S.afinLabel}>A TÚA AFINIDADE NESTA HABILIDADE</p>
        <div style={S.afinBarraRow}>
          <div style={S.afinBarra}>
            <div style={{
              ...S.afinBarraFill,
              width: `${af}%`,
              background: 'linear-gradient(90deg, #e8a547, #c084d4)',
            }} />
          </div>
          <span style={S.afinValor}>{af}%</span>
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function calcularAfinidadeOficio(skills) {
  if (!skills?.length) return '—'
  const totalPeso = skills.reduce((s, k) => s + (k.peso || 0), 0)
  if (!totalPeso) return '—'
  const suma = skills.reduce((s, k) => s + calcularAfinidade(k.id) * (k.peso || 0), 0)
  return Math.round(suma / totalPeso)
}

function Stat({ label, valor, iconoCircular }) {
  return (
    <div style={S.stat}>
      <span style={S.statLabel}>{label}</span>
      <span style={S.statValor}>
        {iconoCircular && <span style={S.statIconoCirculo}>{iconoCircular}</span>}
        {valor}
      </span>
    </div>
  )
}

function StatSeparador() { return <span style={S.statSep}>·</span> }

function FontEmbed() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
    `}</style>
  )
}


// ═══════════════════════════════════════════════════════════
// ESTILOS — IDÉNTICOS Á v6
// ═══════════════════════════════════════════════════════════

const COR = {
  fondo:        '#050810',
  fondoNebula:  'radial-gradient(ellipse at 50% 30%, #0e1530 0%, #050810 70%)',
  paneis:       'rgba(8, 12, 24, 0.85)',
  paneisDarkSemi: 'rgba(8, 12, 24, 0.95)',
  panelBordo:   'rgba(220, 175, 95, 0.22)',
  panelBordoHi: 'rgba(232, 165, 71, 0.55)',
  texto:        '#e8edf5',
  textoSuave:   '#c0b896',
  textoTenue:   '#7a6f54',
  dourado:      '#e8a547',
  douradoCalido:'#f7c97a',
  douradoTenue: '#9c7a40',
  azul:         '#9bb3ff',
  ouroBrillo:   'rgba(232, 165, 71, 0.55)',
}

const S = {
  root: { minHeight: '100vh', background: COR.fondoNebula, color: COR.texto,
    fontFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  ruido: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, opacity: 0.04,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
    mixBlendMode: 'overlay' },
  mensaxe: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cinzel", serif', color: COR.dourado, minHeight: '100vh' },
  erroLabel: { color: '#ff9fb8', letterSpacing: 4, fontSize: 12 },

  cabeceira: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px',
    borderBottom: `1px solid ${COR.panelBordo}`,
    background: 'linear-gradient(180deg, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.55) 100%)',
    backdropFilter: 'blur(10px)', zIndex: 10 },
  cabeceiraEsquerda: { display: 'flex', alignItems: 'center', gap: 16, flex: '0 0 auto' },
  botonVolver: { width: 36, height: 36, borderRadius: '50%',
    border: `1px solid ${COR.panelBordoHi}`, background: 'transparent',
    color: COR.dourado, fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 12,
    fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3 },
  crumbDestaque: { color: COR.dourado, fontWeight: 600 },
  crumb: { color: COR.textoSuave },
  crumbSep: { color: COR.douradoTenue, fontSize: 10 },
  tabs: { display: 'flex', gap: 4, flex: 1, justifyContent: 'center' },
  tab: { padding: '8px 18px', background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent', color: COR.textoSuave,
    fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3,
    cursor: 'pointer', fontWeight: 500 },
  tabActiva: { color: COR.dourado, borderBottom: `2px solid ${COR.dourado}`,
    textShadow: `0 0 12px ${COR.ouroBrillo}` },
  cabeceiraDereita: { display: 'flex', alignItems: 'center', gap: 8,
    color: COR.azul, fontFamily: '"Cinzel", serif',
    fontSize: 11, letterSpacing: 3, flex: '0 0 auto' },
  luaIcono: { fontSize: 18, filter: 'drop-shadow(0 0 6px rgba(155,179,255,0.5))' },
  luaLabel: {},

  corpo: { flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 380px', overflow: 'hidden' },

  colEsquerda: { padding: '20px 16px', background: 'rgba(8,12,24,0.55)',
    borderRight: `1px solid ${COR.panelBordo}`, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 16 },

  caixaDecorada: { position: 'relative', border: `1px solid ${COR.panelBordo}`,
    background: 'rgba(8,12,24,0.65)', padding: '20px 18px' },
  esquina: { position: 'absolute', color: COR.dourado, fontSize: 18,
    fontFamily: 'monospace', lineHeight: 1, fontWeight: 700, pointerEvents: 'none' },
  caixaTitulo: { fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3,
    color: COR.dourado, margin: '0 0 14px 0', fontWeight: 500,
    textAlign: 'center', textShadow: `0 0 8px ${COR.ouroBrillo}` },

  identidade: { textAlign: 'center' },
  escudoSvg: { width: 88, height: 88, margin: '0 auto 12px', display: 'block',
    filter: 'drop-shadow(0 0 12px rgba(232,165,71,0.4))' },
  titulo: { fontFamily: '"Cinzel", serif', fontWeight: 600, fontSize: 26, margin: '0 0 6px 0',
    letterSpacing: 1.5, color: COR.texto },
  epigrafe: { color: COR.dourado, fontFamily: '"Cinzel", serif',
    fontSize: 11, letterSpacing: 2.5, margin: '0 0 16px 0', fontWeight: 500 },
  frase: { color: COR.textoSuave, fontFamily: '"Fraunces", serif',
    fontStyle: 'italic', fontSize: 13, lineHeight: 1.6, margin: 0, textAlign: 'center' },

  lendaContedor: { display: 'flex', flexDirection: 'column', gap: 8 },
  lendaItem: { display: 'flex', alignItems: 'center', fontFamily: '"Fraunces", serif', fontSize: 12 },
  lendaLabel: { color: COR.texto, fontWeight: 500 },
  lendaDesc: { color: COR.textoSuave, fontStyle: 'italic' },

  svgRadar: { width: '100%', display: 'block' },

  colCentro: { position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    background: 'rgba(5,8,16,0.4)' },
  skillTreeContedor: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
  zonaImaxe: { position: 'relative', height: '40%', minHeight: 280, margin: '20px 24px 0 24px' },
  imaxeAcotada: { width: '100%', height: '100%', objectFit: 'cover',
    objectPosition: 'center 30%', border: `1px solid ${COR.panelBordoHi}`,
    boxShadow: `0 0 30px rgba(232,165,71,0.2)` },
  imaxeViñeteAcotada: { position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,8,16,0.7) 100%)',
    pointerEvents: 'none' },

  zonaInferior: { flex: 1, position: 'relative', display: 'grid',
    gridTemplateColumns: '1fr auto 1fr', gridTemplateRows: 'auto auto',
    gridTemplateAreas: '"left center right" "bottom bottom bottom"',
    padding: '20px 24px', gap: '16px' },
  coroaContedor: { gridArea: 'center', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  coroaSvgPequena: { width: 70, height: 70, filter: `drop-shadow(0 0 16px ${COR.ouroBrillo})` },
  coroaLabel: { fontFamily: '"Cinzel", serif', fontWeight: 600,
    fontSize: 13, color: COR.dourado, letterSpacing: 4,
    marginTop: 8, textAlign: 'center', textShadow: `0 0 10px ${COR.ouroBrillo}` },

  grupoTopLeft: { position: 'absolute', top: 30, left: 30, minWidth: 170, maxWidth: 200 },
  grupoTopRight: { position: 'absolute', top: 30, right: 30, minWidth: 170, maxWidth: 200 },
  grupoBottomLeft: { gridArea: 'left', minWidth: 170, maxWidth: 220 },
  grupoBottomRight: { gridArea: 'right', minWidth: 170, maxWidth: 220, justifySelf: 'end' },
  grupoBottomCenter: { gridArea: 'bottom', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', paddingTop: 16 },

  grupoCabeceira: { display: 'flex', alignItems: 'center',
    padding: '6px 12px', border: `1px solid currentColor`,
    background: 'rgba(8,12,24,0.85)',
    boxShadow: `0 0 12px rgba(232,165,71,0.15)`,
    marginBottom: 12, gap: 8 },
  grupoCabeceiraCentrada: { display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '6px 14px', border: `1px solid currentColor`,
    background: 'rgba(8,12,24,0.85)',
    boxShadow: `0 0 12px rgba(232,165,71,0.15)`,
    marginBottom: 12, gap: 4 },
  grupoIcono: { fontSize: 16 },
  grupoTitulo: { margin: 0, fontFamily: '"Cinzel", serif',
    fontSize: 11, letterSpacing: 2, fontWeight: 600 },

  microsLista: { display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 6 },
  microsListaCentral: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, justifyContent: 'center' },

  microEtiqueta: { display: 'flex', alignItems: 'center',
    padding: '4px 6px', border: '1px solid transparent',
    cursor: 'pointer', transition: 'opacity 0.2s, border-color 0.2s' },
  microEtiquetaSel: { background: 'rgba(232,165,71,0.06)', borderColor: COR.dourado },
  // Punto agora: bordo circular cor da categoría, fondo escuro, icono dentro
  microPunto: { width: 22, height: 22, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flex: '0 0 auto',
    border: '1.4px solid currentColor',
    background: 'rgba(8,12,24,0.85)' },
  microLabel: { fontFamily: '"Fraunces", serif', fontSize: 12.5, lineHeight: 1.3 },

  colDereita: { padding: '20px 18px', background: 'rgba(8,12,24,0.55)',
    borderLeft: `1px solid ${COR.panelBordo}`, overflowY: 'auto' },
  inspectorVacio: { textAlign: 'center', padding: 32 },
  inspectorTituloPlaceholder: { fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3,
    color: COR.dourado, margin: '0 0 12px 0', fontWeight: 500 },
  inspectorTextoPlaceholder: { fontFamily: '"Fraunces", serif', fontStyle: 'italic',
    fontSize: 13, color: COR.textoTenue },

  inspector: { display: 'flex', flexDirection: 'column', gap: 18 },
  inspectorEpigrafe: { fontFamily: '"Fraunces", serif',
    fontSize: 14, color: COR.textoSuave,
    textAlign: 'center', margin: 0, lineHeight: 1.4 },
  inspectorImaxeCaixa: { position: 'relative', width: '100%', height: 160, overflow: 'hidden' },
  inspectorImaxe: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  inspectorImaxeBordo: { position: 'absolute', inset: 0, border: `1px solid ${COR.panelBordoHi}`,
    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)', pointerEvents: 'none' },

  inspectorNomeRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  inspectorIconoCirculo: { width: 36, height: 36, borderRadius: '50%',
    border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15,11,5,0.9)', flex: '0 0 auto' },
  inspectorNome: { fontFamily: '"Cinzel", serif', fontWeight: 600,
    fontSize: 17, letterSpacing: 1.5, margin: 0, color: COR.texto, flex: 1 },
  inspectorChipNivel: { fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: 2,
    color: COR.dourado, padding: '4px 8px', border: `1px solid ${COR.dourado}`,
    borderRadius: 12, fontWeight: 600 },

  inspectorDesc: { fontFamily: '"Fraunces", serif', fontSize: 13.5, lineHeight: 1.6,
    color: COR.textoSuave, margin: 0 },

  niveisContedor: { display: 'flex', flexDirection: 'column' },
  nivelFila: { display: 'flex', gap: 12, position: 'relative' },
  nivelEsquerda: { display: 'flex', flexDirection: 'column',
    alignItems: 'center', flex: '0 0 auto' },
  nivelCirculo: { width: 28, height: 28, borderRadius: '50%',
    border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15,11,5,0.9)', fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: 13,
    flex: '0 0 auto' },
  nivelLineaVertical: { width: 1.5, flex: 1, minHeight: 20, margin: '4px 0' },
  nivelDereita: { flex: 1, paddingBottom: 12 },
  nivelLabel: { fontFamily: '"Cinzel", serif', fontSize: 10, letterSpacing: 1.5,
    margin: '4px 0 4px 0', fontWeight: 600 },
  nivelDesc: { fontFamily: '"Fraunces", serif', fontSize: 12,
    color: COR.textoSuave, margin: 0, lineHeight: 1.5 },

  inspectorAccion: { borderTop: `1px solid ${COR.panelBordo}`, paddingTop: 14 },
  inspectorAccionLabel: { fontFamily: '"Cinzel", serif', fontSize: 10, letterSpacing: 2,
    color: COR.dourado, margin: '0 0 8px 0', fontWeight: 600 },
  inspectorAccionFrase: { fontFamily: '"Fraunces", serif', fontStyle: 'italic',
    fontSize: 14, color: COR.dourado, lineHeight: 1.5, textAlign: 'center', position: 'relative' },
  inspectorAccionComilla: { fontSize: 18, color: COR.dourado },
  inspectorAccionTexto: { margin: '0 4px' },
  inspectorAccionEspiga: { marginLeft: 6, opacity: 0.7 },

  comoMedraSec: { borderTop: `1px solid ${COR.panelBordo}`, paddingTop: 14 },
  comoMedraTitulo: { fontFamily: '"Cinzel", serif', fontSize: 10, letterSpacing: 2,
    color: COR.dourado, margin: '0 0 10px 0', fontWeight: 600 },
  comoMedraLista: { listStyle: 'none', padding: 0, margin: 0,
    display: 'flex', flexDirection: 'column', gap: 8 },
  comoMedraItem: { display: 'flex', alignItems: 'flex-start', gap: 10,
    fontFamily: '"Fraunces", serif', fontSize: 13,
    color: COR.textoSuave, lineHeight: 1.4 },
  comoMedraIcono: { fontSize: 14, flex: '0 0 auto', marginTop: 1 },

  afinBloque: { borderTop: `1px solid ${COR.panelBordo}`, paddingTop: 14 },
  afinLabel: { fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: 2,
    color: COR.textoTenue, margin: '0 0 8px 0' },
  afinBarraRow: { display: 'flex', alignItems: 'center', gap: 10 },
  afinBarra: { flex: 1, height: 6, background: 'rgba(220,175,95,0.08)',
    border: `1px solid ${COR.panelBordo}`, overflow: 'hidden' },
  afinBarraFill: { height: '100%', transition: 'width 0.4s' },
  afinValor: { fontFamily: '"Cinzel", serif', fontSize: 13, fontWeight: 600,
    color: COR.dourado, minWidth: 40, textAlign: 'right' },

  barraInferior: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(0deg, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.55) 100%)',
    borderTop: `1px solid ${COR.panelBordo}`, backdropFilter: 'blur(10px)' },
  botonInferior: { padding: '10px 24px', background: 'transparent',
    border: `1px solid ${COR.panelBordoHi}`, borderRadius: 24, color: COR.textoSuave,
    fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3, cursor: 'pointer', fontWeight: 500 },
  botonInferiorDestaque: { padding: '10px 24px', borderRadius: 24,
    background: 'linear-gradient(180deg, rgba(232,165,71,0.22), rgba(232,165,71,0.08))',
    border: `1px solid ${COR.dourado}`, color: COR.dourado,
    fontFamily: '"Cinzel", serif', fontSize: 11, letterSpacing: 3, cursor: 'pointer',
    boxShadow: `inset 0 0 14px ${COR.ouroBrillo}, 0 0 12px rgba(232,165,71,0.2)`, fontWeight: 600 },
  statsCentro: { display: 'flex', alignItems: 'center', gap: 16 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statLabel: { fontFamily: '"Cinzel", serif', fontSize: 9, letterSpacing: 2,
    color: COR.textoTenue, textTransform: 'uppercase' },
  statValor: { fontFamily: '"Fraunces", serif', fontSize: 16, color: COR.texto,
    display: 'flex', alignItems: 'center', gap: 8 },
  statIconoCirculo: { width: 22, height: 22, borderRadius: '50%',
    border: `1.2px solid ${COR.dourado}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, color: COR.dourado, fontWeight: 700, fontFamily: '"Cinzel", serif' },
  statSep: { color: COR.douradoTenue, fontSize: 14, margin: '0 4px' },
}