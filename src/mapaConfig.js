// ── INICIO: config_mapa ──────────────────────────────
const MAPA_CONFIG = {

  fondo: '#03060f',

  // ── INICIO: config_nodos_tamaño ──────────────────
  tamaño: {
    origin:        30,
    galaxy:        22,
    constellation: 15,
    system:        10,
    concept:       5,
    process:       5
  },
  // ── FIN: config_nodos_tamaño ─────────────────────

  // ── INICIO: config_nodos_cor ─────────────────────
  // Cor do planeta/nodo
  cor: {
    origin:        '#faf9f5',
    galaxy:        '#d3bb71',
    constellation: '#4baa7e',
    system:        '#3b82f6',
    concept:       '#4FC3F7',
    process:       '#81C784'
  },
  // ── FIN: config_nodos_cor ────────────────────────

  // ── INICIO: config_labels_cor ────────────────────
  // Cor do texto/label de cada tipo de nodo
 label: {
  origin:        '#ffffff',
  galaxy:        '#ffffff',
  constellation: '#ffffff',
  system:        '#ffffff',
  concept:       '#ffffff',
  process:       '#ffffff'
},
  // ── FIN: config_labels_cor ───────────────────────

  glow: {
    activo:      true,
    intensidade: 14
  },

  relacions: {
    grosor: {
      high:   2.5,
      medium: 1.2,
      low:    0.4
    },
    opacidade:             0.03,
    particulas:            true,
    particulas_velocidade: 5,
    particulas_tamaño:     1.5
  },

  lod: {
    galaxy:        0,
    constellation: 1.5,
    system:        3,
    concept:       5,
    process:       5
  },

  forzas: {
    repulsion:      -671,
    distancia_link: 203,
    velocidade:     0.3
  },

  efectos: {
    blur_zoom:           true,
    blur_intensidade:    4,
    blur_duracion:       300,
    efecto_entrada_nodo: true,
    efecto_duracion:     320
  },

  rendemento: {
  warmup_ticks:    50,
  bloom_strength:  1.8,
  bloom_radius:    0.8,
  bloom_threshold: 0.1
},

  seleccion: {
    opacidade_non_conectado: 0.13,
    grosor_link_activo:      3,
    grosor_link_inactivo:    0.6
  }

}

export default MAPA_CONFIG
