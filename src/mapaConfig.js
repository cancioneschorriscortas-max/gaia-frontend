// ── INICIO: config_mapa ──────────────────────────────
// ESTILO FLAT (dirección de arte "bocetos experiencia neno")
// Cambios vs. cosmos anterior: fondo #0a1020, paleta plana
// (dourado/verde/azul/rosa), glow a 0, bloom 3D a 0,
// relacións máis visibles e sen partículas.
// O resto (tamaños, lod, forzas, efectos, selección) INTACTO.
const MAPA_CONFIG = {

  fondo: '#0a1020',

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
  // Cor do planeta/nodo — paleta boceto
  cor: {
    origin:        '#e8f0ff',
    galaxy:        '#e8a547',
    constellation: '#9bb3ff',
    system:        '#c4b5fd',
    concept:       '#5dd4a8',
    process:       '#ff9fb8'
  },
  // ── FIN: config_nodos_cor ────────────────────────

  // ── INICIO: config_labels_cor ────────────────────
  // Cor do texto/label de cada tipo de nodo
 label: {
  origin:        '#f5f7ff',
  galaxy:        '#f5f7ff',
  constellation: '#f5f7ff',
  system:        '#f5f7ff',
  concept:       '#f5f7ff',
  process:       '#f5f7ff'
},
  // ── FIN: config_labels_cor ───────────────────────

  glow: {
    activo:      true,
    intensidade: 0
  },

  relacions: {
    grosor: {
      high:   2.5,
      medium: 1.2,
      low:    0.4
    },
    opacidade:             0.12,
    particulas:            false,
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
  bloom_strength:  0,
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