// ── INICIO: niveis_usuario ───────────────────────────
export const NIVEIS_USUARIO = [
  { nivel: 1,  xp: 0,    titulo: 'Explorador',     cor: '#6ee7b7' },
  { nivel: 2,  xp: 100,  titulo: 'Viaxeiro',        cor: '#6ee7b7' },
  { nivel: 3,  xp: 250,  titulo: 'Cartógrafo',      cor: '#93c5fd' },
  { nivel: 4,  xp: 500,  titulo: 'Navegante',       cor: '#93c5fd' },
  { nivel: 5,  xp: 900,  titulo: 'Astrónomo',       cor: '#c4b5fd' },
  { nivel: 6,  xp: 1400, titulo: 'Gardián',         cor: '#c4b5fd' },
  { nivel: 7,  xp: 2000, titulo: 'Sabio',           cor: '#e2b96a' },
  { nivel: 8,  xp: 2800, titulo: 'Oráculo',         cor: '#e2b96a' },
  { nivel: 9,  xp: 3800, titulo: 'Arquitecto',      cor: '#ff9f7f' },
  { nivel: 10, xp: 5000, titulo: 'Gardián de GAIA', cor: '#ffffff' },
]
// ── FIN: niveis_usuario ──────────────────────────────

// ── INICIO: calcular_nivel ───────────────────────────
export const calcularNivel = (xpTotal) => {
  let nivelActual   = NIVEIS_USUARIO[0]
  let nivelSeguinte = NIVEIS_USUARIO[1]

  for (let i = NIVEIS_USUARIO.length - 1; i >= 0; i--) {
    if (xpTotal >= NIVEIS_USUARIO[i].xp) {
      nivelActual   = NIVEIS_USUARIO[i]
      nivelSeguinte = NIVEIS_USUARIO[i + 1] || null
      break
    }
  }

  return {
    ...nivelActual,
    xpTotal,
    xpSeguinte:     nivelSeguinte ? nivelSeguinte.xp    : null,
    tituloSeguinte: nivelSeguinte ? nivelSeguinte.titulo : null,
    progreso: nivelSeguinte
      ? Math.round(
          ((xpTotal - nivelActual.xp) /
           (nivelSeguinte.xp - nivelActual.xp)) * 100
        )
      : 100
  }
}
// ── FIN: calcular_nivel ──────────────────────────────

// ── INICIO: xp_por_accion ────────────────────────────
// Fonte única de verdade para cantidades de XP
// Usada por sistemaXP.js e polo backend
export const XP_ACCIONS = {
  // Exploración
  NODO_NOVO:          { tipo: 'exploracion', base: 8,  motivo: 'Nodo novo descuberto'       },
  REDESCUBRIMENTO:    { tipo: 'conexion',    base: 15, motivo: 'Redescubrimento con contexto'},

  // Cadeas de navegación
  CADEA_3:            { tipo: 'conexion',    base: 20, motivo: 'Cadea de 3 nodos'            },
  CADEA_6:            { tipo: 'conexion',    base: 35, motivo: 'Exploración profunda'        },
  CADEA_10:           { tipo: 'conexion',    base: 50, motivo: 'Explorador do coñecemento'   },

  // Retos
  RETO_PRIMARY:       { tipo: 'comprension', base: 15, motivo: 'Reto primaria completado'    },
  RETO_SECONDARY:     { tipo: 'comprension', base: 30, motivo: 'Reto secundaria completado'  },
  RETO_EXPERT:        { tipo: 'comprension', base: 60, motivo: 'Reto experto completado'     },
}
// ── FIN: xp_por_accion ───────────────────────────────