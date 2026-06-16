// ── INICIO: roles_gaia ───────────────────────────────
export const ROLES = [
  {
    id:          'explorador',
    label:       'Explorador',
    descripcion: 'Descubro, me adapto e sobrevivo.',
    cor:         '#6ee7b7',
    icono:       '🧭',
    image_m:     '/assets/rol-explorador-m.png',
    image_f:     '/assets/rol-explorador-f.png',
    habilidades: ['Físico', 'Estratexia', 'Supervivencia'],
    iconosHab:   ['🏃', '🗺️', '🌿'],
    bloques: [
      {
        id:         'medio_natural',
        label:      'Medio Natural',
        cor:        '#6ee7b7',
        profesions: [
          { id: 'tecnico_forestal',       label: 'Técnico/a Forestal',              icono: '🌿' },
          { id: 'axente_medioambiental',  label: 'Axente Medioambiental',           icono: '🌱' },
          { id: 'especialista_incendios', label: 'Especialista en Incendios',       icono: '🔥' },
          { id: 'tecnico_marino',         label: 'Técnico/a de Recursos Mariños',   icono: '🌊' },
          { id: 'acuicultura',            label: 'Traballador/a de Acuicultura',    icono: '🐟' },
        ]
      },
      {
        id:         'territorio',
        label:      'Territorio e Medición',
        cor:        '#fbbf24',
        profesions: [
          { id: 'topografo',      label: 'Topógrafo/a',              icono: '🧭' },
          { id: 'cartografia',    label: 'Técnico/a en Cartografía', icono: '🗺️' },
          { id: 'tecnico_gis',    label: 'Técnico/a GIS',            icono: '📍' },
          { id: 'obra_civil',     label: 'Técnico/a de Obra Civil',  icono: '🏗️' },
        ]
      },
      {
        id:         'emerxencias',
        label:      'Emerxencias',
        cor:        '#f87171',
        profesions: [
          { id: 'tecnico_sanitario', label: 'Técnico/a en Emerxencias Sanitarias', icono: '🚑' },
          { id: 'bombeiro',          label: 'Bombeiro/a',                           icono: '🚒' },
          { id: 'rescate_maritimo',  label: 'Rescate Marítimo',                    icono: '🛟' },
          { id: 'rescate_montanha',  label: 'Rescate de Montaña',                  icono: '⛰️' },
        ]
      },
      {
        id:         'oficios_tecnicos',
        label:      'Oficios Técnicos',
        cor:        '#a78bfa',
        profesions: [
          { id: 'electricista',      label: 'Electricista',          icono: '⚡' },
          { id: 'mantemento',        label: 'Técnico/a Mantemento',  icono: '🔧' },
          { id: 'operario_industrial',label: 'Operario/a Industrial', icono: '🏭' },
          { id: 'mecanico_agricola', label: 'Mecánico/a Agrícola',   icono: '🚜' },
        ]
      },
    ]
  },
  {
    id:          'sabio',
    label:       'Sabio',
    descripcion: 'Comprendo, explico e conecto ideas.',
    cor:         '#93c5fd',
    icono:       '📚',
    image_m:     '/assets/rol-sabio-m.png',
    image_f:     '/assets/rol-sabio-f.png',
    habilidades: ['Científico', 'Linguísta', 'Historiador'],
    iconosHab:   ['🔬', '📝', '🏛️'],
    bloques: [
      {
        id:         'educacion',
        label:      'Educación e Coñecemento',
        cor:        '#6ee7b7',
        profesions: [
          { id: 'profesor',          label: 'Profesor/a',              icono: '👨‍🏫' },
          { id: 'investigador',      label: 'Investigador/a',          icono: '📚' },
          { id: 'psicologo_edu',     label: 'Psicólogo/a Educativo',   icono: '🧠' },
        ]
      },
      {
        id:         'lingua_cultura',
        label:      'Lingua e Cultura',
        cor:        '#fbbf24',
        profesions: [
          { id: 'escritor',       label: 'Escritor/a',        icono: '📝' },
          { id: 'tradutor',       label: 'Tradutor/a',        icono: '🌍' },
          { id: 'filologo',       label: 'Filólogo/a',        icono: '📖' },
          { id: 'xestor_cultural',label: 'Xestor/a Cultural', icono: '🎭' },
        ]
      },
      {
        id:         'ciencia',
        label:      'Ciencia',
        cor:        '#f87171',
        profesions: [
          { id: 'quimico',   label: 'Químico/a',  icono: '🧪' },
          { id: 'biologo',   label: 'Biólogo/a',  icono: '🔬' },
          { id: 'fisico',    label: 'Físico/a',   icono: '⚛️' },
        ]
      },
      {
        id:         'analise_social',
        label:      'Análise Social',
        cor:        '#a78bfa',
        profesions: [
          { id: 'sociologo',   label: 'Sociólogo/a',  icono: '📊' },
          { id: 'historiador', label: 'Historiador/a', icono: '🏛️' },
          { id: 'xurista',     label: 'Xurista',       icono: '⚖️' },
        ]
      },
    ]
  },
  {
    id:          'construtor',
    label:       'Construtor',
    descripcion: 'Fago, construo e transformo.',
    cor:         '#c4b5fd',
    icono:       '🛠️',
    image_m:     '/assets/rol-construtor-m.png',
    image_f:     '/assets/rol-construtor-f.png',
    habilidades: ['Tecnólogo', 'Artesán', 'Creador'],
    iconosHab:   ['💻', '🪵', '🎨'],
    bloques: [
      {
        id:         'tecnoloxia',
        label:      'Tecnoloxía',
        cor:        '#6ee7b7',
        profesions: [
          { id: 'programador',      label: 'Programador/a',          icono: '💻' },
          { id: 'robotica',         label: 'Técnico/a en Robótica',  icono: '🤖' },
          { id: 'admin_sistemas',   label: 'Administrador/a Sistemas',icono: '🌐' },
        ]
      },
      {
        id:         'enxenaria',
        label:      'Enxeñaría',
        cor:        '#fbbf24',
        profesions: [
          { id: 'enx_industrial', label: 'Enxeñeiro/a Industrial', icono: '⚙️' },
          { id: 'enx_civil',      label: 'Enxeñeiro/a Civil',      icono: '🏗️' },
        ]
      },
      {
        id:         'artes_deseño',
        label:      'Artes e Deseño',
        cor:        '#f87171',
        profesions: [
          { id: 'deseñador',    label: 'Deseñador/a Gráfico',    icono: '🎨' },
          { id: 'arquitecto',   label: 'Arquitecto/a',           icono: '🏛️' },
          { id: 'audiovisual',  label: 'Creador/a Audiovisual',  icono: '🎬' },
        ]
      },
      {
        id:         'produción',
        label:      'Produción',
        cor:        '#a78bfa',
        profesions: [
          { id: 'carpinteiro', label: 'Carpinteiro/a', icono: '🪵' },
          { id: 'artesano',    label: 'Artesán/á',     icono: '🧵' },
          { id: 'panadeiro',   label: 'Panadeiro/a',   icono: '🍞' },
        ]
      },
    ]
  },
  {
    id:          'coidador',
    label:       'Coidador',
    descripcion: 'Acompaño, coido e protexo.',
    cor:         '#fda4af',
    icono:       '💗',
    image_m:     '/assets/rol-coidador-m.png',
    image_f:     '/assets/rol-coidador-f.png',
    habilidades: ['Empatía', 'Acompañamento', 'Coidado'],
    iconosHab:   ['💞', '🤝', '🩺'],
    bloques: [
      {
        id:         'sanidade_asistencial',
        label:      'Sanidade Asistencial',
        cor:        '#6ee7b7',
        profesions: [
          { id: 'enfermeiro',         label: 'Enfermeiro/a',              icono: '🩺' },
          { id: 'auxiliar_enfermeria',label: 'Auxiliar de Enfermaría',    icono: '💊' },
          { id: 'farmaceutico',       label: 'Farmacéutico/a',            icono: '💉' },
          { id: 'xeriatra_aux',       label: 'Auxiliar Xerontolóxico',    icono: '👵' },
        ]
      },
      {
        id:         'educacion_infantil',
        label:      'Educación Infantil',
        cor:        '#fbbf24',
        profesions: [
          { id: 'educador_infantil',  label: 'Educador/a Infantil',       icono: '🧒' },
          { id: 'monitor_tempo_libre',label: 'Monitor/a Tempo Libre',     icono: '🎈' },
          { id: 'logopeda',           label: 'Logopeda',                  icono: '🗣️' },
          { id: 'pedagogo',           label: 'Pedagogo/a',                icono: '📋' },
        ]
      },
      {
        id:         'accion_social',
        label:      'Acción Social',
        cor:        '#f87171',
        profesions: [
          { id: 'traballador_social', label: 'Traballador/a Social',         icono: '🤝' },
          { id: 'educador_social',    label: 'Educador/a Social',            icono: '🌟' },
          { id: 'mediador_intercultural', label: 'Mediador/a Intercultural', icono: '🌐' },
        ]
      },
      {
        id:         'atencion_persoal',
        label:      'Atención Persoal',
        cor:        '#a78bfa',
        profesions: [
          { id: 'fisioterapeuta',     label: 'Fisioterapeuta',          icono: '💆' },
          { id: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional', icono: '🧘' },
          { id: 'nutricionista',      label: 'Nutricionista',           icono: '🥗' },
          { id: 'psicologo_clinico',  label: 'Psicólogo/a Clínico',     icono: '🧠' },
        ]
      },
    ]
  },
]
// ── FIN: roles_gaia ──────────────────────────────────

// ── INICIO: helpers_roles ────────────────────────────
export const getRolById = (id) =>
  ROLES.find(r => r.id === id) || null

export const getBloqueById = (rolId, bloqueId) => {
  const rol = getRolById(rolId)
  return rol?.bloques.find(b => b.id === bloqueId) || null
}

export const getProfesionById = (rolId, profesionId) => {
  const rol = getRolById(rolId)
  for (const bloque of rol?.bloques || []) {
    const prof = bloque.profesions.find(p => p.id === profesionId)
    if (prof) return { ...prof, bloque: bloque.id, rol: rolId }
  }
  return null
}

export const ROLES_IDS     = ROLES.map(r => r.id)
export const PROFESIONS_IDS = ROLES.flatMap(r =>
  r.bloques.flatMap(b => b.profesions.map(p => p.id))
)
// ── FIN: helpers_roles ───────────────────────────────