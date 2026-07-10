// ── TODO: filtrado_centros_por_curso ─────────────────
// Pendente implementar filtrado de centros segundo o curso seleccionado.
// A lóxica está definida — detectar tipo de centro polo prefixo do nome o facer unha lista completa se existen moitas excepcións:
// CEIP/CEP → primaria | CPI → primaria+secundaria | IES/IFP → secundaria | CIFP/CFR → fp

// ── INICIO: cursos_gaia ──────────────────────────────
// §10.1 Fase C — FONTE DE VERDADE: o backend (GET /cursos).
// Lista local = arranque/fallback. Ao cargar, sincronízase co servidor
// (mutación in place + recálculo de CURSOS_POR_ETAPA).
// API pública INTACTA: CURSOS, getNivelDoCurso, getLabelDoCurso,
// CURSOS_IDS, CURSOS_POR_ETAPA — os consumidores non cambian.
// ─────────────────────────────────────────────────────
import { API } from './config/api'

export const CURSOS = [
  // ── Primaria ────────────────────────────────────────
  { id: '5prim',    label: '5º Primaria',      nivel: 'primary',   etapa: 'Primaria'      },
  { id: '6prim',    label: '6º Primaria',      nivel: 'primary',   etapa: 'Primaria'      },
  // ── ESO ─────────────────────────────────────────────
  { id: '1eso',     label: '1º ESO',           nivel: 'primary',   etapa: 'ESO'           },
  { id: '2eso',     label: '2º ESO',           nivel: 'primary',   etapa: 'ESO'           },
  { id: '3eso',     label: '3º ESO',           nivel: 'secondary', etapa: 'ESO'           },
  { id: '4eso',     label: '4º ESO',           nivel: 'secondary', etapa: 'ESO'           },
  // ── Bacharelato ─────────────────────────────────────
  { id: '1bach',    label: '1º Bacharelato',   nivel: 'expert',    etapa: 'Bacharelato'   },
  { id: '2bach',    label: '2º Bacharelato',   nivel: 'expert',    etapa: 'Bacharelato'   },
  // ── FP ──────────────────────────────────────────────
  { id: 'fpbasica', label: 'FP Básica',        nivel: 'secondary', etapa: 'FP'            },
  { id: 'fpmedio',  label: 'FP Grao Medio',    nivel: 'expert',    etapa: 'FP'            },
  { id: 'fpsup',    label: 'FP Grao Superior', nivel: 'expert',    etapa: 'FP'            },
  // ── Outros ──────────────────────────────────────────
  { id: 'outro',    label: 'Outro',            nivel: 'primary',   etapa: 'Outro'         },
]
// ── FIN: cursos_gaia ─────────────────────────────────

// ── INICIO: helpers_cursos ───────────────────────────
export const getNivelDoCurso = (cursoId) => {
  const curso = CURSOS.find(c => c.id === cursoId)
  return curso?.nivel || 'primary'
}

export const getLabelDoCurso = (cursoId) => {
  const curso = CURSOS.find(c => c.id === cursoId)
  return curso?.label || cursoId
}

export const CURSOS_IDS = CURSOS.map(c => c.id)

// Agrupar por etapa para o selector
export const CURSOS_POR_ETAPA = CURSOS.reduce((acc, c) => {
  if (!acc[c.etapa]) acc[c.etapa] = []
  acc[c.etapa].push(c)
  return acc
}, {})
// ── FIN: helpers_cursos ─────────────────────────────────

// ── INICIO: sync_backend ─────────────────────────────
// Sincronización co backend (unha vez, ao cargar o módulo).
// Recalcula tamén CURSOS_IDS e CURSOS_POR_ETAPA in place, porque
// se construíron coa lista de arranque.
fetch(`${API}/cursos`)
  .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  .then(d => {
    if (Array.isArray(d.cursos) && d.cursos.length) {
      CURSOS.splice(0, CURSOS.length, ...d.cursos)
      CURSOS_IDS.splice(0, CURSOS_IDS.length, ...CURSOS.map(c => c.id))
      Object.keys(CURSOS_POR_ETAPA).forEach(k => delete CURSOS_POR_ETAPA[k])
      for (const c of CURSOS) {
        if (!CURSOS_POR_ETAPA[c.etapa]) CURSOS_POR_ETAPA[c.etapa] = []
        CURSOS_POR_ETAPA[c.etapa].push(c)
      }
    }
  })
  .catch(e => console.warn('[cursos] Backend non dispoñible, usando lista local:', e.message))
// ── FIN: sync_backend ────────────────────────────────
