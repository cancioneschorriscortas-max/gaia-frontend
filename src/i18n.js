// ── INICIO: textos_por_clave ─────────────────────────
// Estrutura por clave — imposible engadir sen todos os idiomas
const TEXTOS = {

  // ── navegacion ──────────────────────────────────────
  explorar:        { gl: 'Explorar',      es: 'Explorar',      en: 'Explore'       },
  constructor:     { gl: 'Constructor',   es: 'Constructor',   en: 'Constructor'   },
  relacions:       { gl: 'Relacións',     es: 'Relaciones',    en: 'Relations'     },
  editor:          { gl: 'Editor',        es: 'Editor',        en: 'Editor'        },
  editorRel:       { gl: 'Ed. Relacións', es: 'Ed. Relaciones',en: 'Ed. Relations' },
  rutas:           { gl: 'Rutas',         es: 'Rutas',         en: 'Routes'        },
  editorRutas:     { gl: 'Ed. Rutas',     es: 'Ed. Rutas',     en: 'Ed. Routes'    },
  mapa:            { gl: 'Mapa',          es: 'Mapa',          en: 'Map'           },
  configMapa:      { gl: '⚙ Mapa',        es: '⚙ Mapa',        en: '⚙ Map'         },
  importar:        { gl: 'Import',        es: 'Import',        en: 'Import'        },
  tabela:          { gl: 'Táboa',         es: 'Tabla',         en: 'Table'         },
  validacion:      { gl: 'Validación',    es: 'Validación',    en: 'Validation'    },

  // ── modo ────────────────────────────────────────────
  modoEditorUsuario: { gl: 'Modo Editor → Usuario', es: 'Modo Editor → Usuario', en: 'Editor → User mode' },
  modoEditor:        { gl: '⚙ Editor',              es: '⚙ Editor',              en: '⚙ Editor'           },

  // ── niveis contido ───────────────────────────────────
  nivel:      { gl: 'NIVEL',    es: 'NIVEL',  en: 'LEVEL'   },
  primaria:   { gl: 'Primaria', es: 'Primaria',en: 'Primary' },
  secundaria: { gl: 'Secund.',  es: 'Secund.', en: 'Second.' },
  experto:    { gl: 'Experto',  es: 'Experto', en: 'Expert'  },

  nivelPrimaria:   { gl: 'PRIMARIA',   es: 'PRIMARIA',   en: 'PRIMARY'   },
  nivelSecundaria: { gl: 'SECUNDARIA', es: 'SECUNDARIA', en: 'SECONDARY' },
  nivelExperto:    { gl: 'EXPERTO',    es: 'EXPERTO',    en: 'EXPERT'    },

  // ── idioma ───────────────────────────────────────────
  idioma:         { gl: 'IDIOMA',                              es: 'IDIOMA',                            en: 'LANGUAGE'                              },
  engadirIdioma:  { gl: '+ Engadir idioma',                    es: '+ Añadir idioma',                   en: '+ Add language'                        },
  codigoIdioma:   { gl: 'Código do idioma (ex: pt, fr, de):', es: 'Código del idioma (ej: pt, fr, de):',en: 'Language code (e.g.: pt, fr, de):'     },
  idiomaInvalido: { gl: 'Código inválido. Usa 2-3 letras minúsculas', es: 'Código inválido. Usa 2-3 letras minúsculas', en: 'Invalid code. Use 2-3 lowercase letters' },
  idiomaExiste:   { gl: 'O idioma "{0}" xa existe',            es: 'El idioma "{0}" ya existe',         en: 'Language "{0}" already exists'         },
  idiomaEngadido: { gl: 'Idioma "{0}" engadido correctamente', es: 'Idioma "{0}" añadido correctamente',en: 'Language "{0}" added successfully'     },

  // ── mapa ─────────────────────────────────────────────
  volverGaia:       { gl: '✦ GAIA',                  es: '✦ GAIA',                   en: '✦ GAIA'                    },
  verTodo:          { gl: '⊞',                        es: '⊞',                        en: '⊞'                         },
  buscarUniverso:   { gl: 'Buscar no universo...',    es: 'Buscar en el universo...', en: 'Search the universe...'    },
  cargandoUniverso: { gl: 'Cargando universo...',     es: 'Cargando universo...',     en: 'Loading universe...'       },

  // ── panel nodo ───────────────────────────────────────
  seleccionaNodo:      { gl: 'Selecciona un nodo para ver o seu contido', es: 'Selecciona un nodo para ver su contenido', en: 'Select a node to see its content' },
  relacionsTitle:      { gl: 'RELACIÓNS',        es: 'RELACIONES',       en: 'RELATIONS'                },
  rutasTitle:          { gl: 'RUTAS',            es: 'RUTAS',            en: 'ROUTES'                   },
  mediaTitle:          { gl: 'MEDIA',            es: 'MEDIA',            en: 'MEDIA'                    },
  rutasQueIncluenNodo: { gl: 'Rutas que inclúen este nodo', es: 'Rutas que incluyen este nodo', en: 'Routes including this node' },

  // ── constructor nodo ─────────────────────────────────
  constructorTitulo:  { gl: 'Constructor de Nodos',    es: 'Constructor de Nodos',    en: 'Node Constructor'      },
  nomeObrigatorio:    { gl: 'Nome en {0} *',           es: 'Nombre en {0} *',         en: 'Name in {0} *'         },
  nome:               { gl: 'Nome en {0}',             es: 'Nombre en {0}',           en: 'Name in {0}'           },
  tipoNodo:           { gl: 'Tipo de nodo',            es: 'Tipo de nodo',            en: 'Node type'             },
  nivelLabel:         { gl: 'Nivel',                   es: 'Nivel',                   en: 'Level'                 },
  statusLabel:        { gl: 'Status',                  es: 'Estado',                  en: 'Status'                },
  relevancia:         { gl: 'Relevancia',              es: 'Relevancia',              en: 'Relevance'             },
  textosExplicativos: { gl: 'Textos explicativos',     es: 'Textos explicativos',     en: 'Explanatory texts'     },
  explicacionBasica:  { gl: 'Explicación básica...',   es: 'Explicación básica...',   en: 'Basic explanation...'  },
  explicacionEstu:    { gl: 'Explicación para estudantes...', es: 'Explicación para estudiantes...', en: 'Explanation for students...' },
  explicacionTecnica: { gl: 'Explicación técnica...',  es: 'Explicación técnica...',  en: 'Technical explanation...' },
  mediaOpcional:      { gl: 'Media (opcional)',        es: 'Media (opcional)',        en: 'Media (optional)'      },
  descripcionMedio:   { gl: 'Descrición do medio en galego', es: 'Descripción del medio en gallego', en: 'Media description in Galician' },
  crearNodo:          { gl: 'Crear Nodo',              es: 'Crear Nodo',              en: 'Create Node'           },
  autorLabel:         { gl: 'Autor/a',                 es: 'Autor/a',                 en: 'Author'                },

  // ── tipos nodo ───────────────────────────────────────
  concepto:     { gl: 'Concepto',         es: 'Concepto',         en: 'Concept'          },
  proceso:      { gl: 'Proceso / Nebulosa',es: 'Proceso / Nebulosa',en: 'Process / Nebula'},
  sistema:      { gl: 'Sistema',          es: 'Sistema',          en: 'System'           },
  galaxia:      { gl: 'Galaxia',          es: 'Galaxia',          en: 'Galaxy'           },
  constelacion: { gl: 'Constelación',     es: 'Constelación',     en: 'Constellation'    },

  // ── status ───────────────────────────────────────────
  draft:     { gl: 'Draft',      es: 'Borrador', en: 'Draft'      },
  validado:  { gl: 'Validado',   es: 'Validado', en: 'Validated'  },
  deprecado: { gl: 'Deprecado',  es: 'Deprecado',en: 'Deprecated' },

  // ── relevancia ───────────────────────────────────────
  alta:  { gl: 'Alta',  es: 'Alta',  en: 'High'   },
  media: { gl: 'Media', es: 'Media', en: 'Medium' },
  baixa: { gl: 'Baixa', es: 'Baja',  en: 'Low'    },

  // ── editor nodo ──────────────────────────────────────
  editorTitulo:        { gl: 'Editor de Nodo',               es: 'Editor de Nodo',              en: 'Node Editor'               },
  buscarNodo:          { gl: 'Buscar nodo para editar',       es: 'Buscar nodo para editar',     en: 'Search node to edit'       },
  escribeNome:         { gl: 'Escribe o nome ou id...',       es: 'Escribe el nombre o id...',   en: 'Write the name or id...'   },
  senResultados:       { gl: 'Sen resultados',                es: 'Sin resultados',              en: 'No results'                },
  cargando:            { gl: 'Cargando...',                   es: 'Cargando...',                 en: 'Loading...'                },
  buscaNodoEditar:     { gl: 'Busca un nodo para editalo.',   es: 'Busca un nodo para editarlo.',en: 'Search a node to edit it.' },
  gardarCambios:       { gl: 'Gardar cambios',                es: 'Guardar cambios',             en: 'Save changes'              },
  mediaActual:         { gl: 'Media actual',                  es: 'Media actual',                en: 'Current media'             },
  senMedia:            { gl: 'Sen media',                     es: 'Sin media',                   en: 'No media'                  },
  engadirMedia:        { gl: '+ Engadir media',               es: '+ Añadir media',              en: '+ Add media'               },
  borrar:              { gl: 'Borrar',                        es: 'Borrar',                      en: 'Delete'                    },
  borrarNodo:          { gl: 'Borrar nodo',                   es: 'Borrar nodo',                 en: 'Delete node'               },
  confirmarBorrar:     { gl: 'Confirmar borrado',             es: 'Confirmar borrado',           en: 'Confirm deletion'          },
  cancelar:            { gl: 'Cancelar',                      es: 'Cancelar',                    en: 'Cancel'                    },
  borrando:            { gl: 'Borrando...',                   es: 'Borrando...',                 en: 'Deleting...'               },
  nodosBorradoOk:      { gl: '✓ Nodo borrado correctamente',  es: '✓ Nodo borrado correctamente',en: '✓ Node deleted successfully'},
  avisoBorrarNodo:     { gl: 'Vas borrar o nodo',             es: 'Vas a borrar el nodo',        en: 'You are about to delete node'},
  avisoBorrarRelacions:{ gl: '⚠ Este nodo ten {0} relación{1} que tamén serán eliminadas.', es: '⚠ Este nodo tiene {0} relación{1} que también serán eliminadas.', en: '⚠ This node has {0} relation{1} that will also be deleted.' },
  accionIrreversible:  { gl: 'Esta acción non se pode desfacer.', es: 'Esta acción no se puede deshacer.', en: 'This action cannot be undone.' },

  // ── constructor relacións ────────────────────────────
  constructorRelTitulo: { gl: 'Constructor de Relacións', es: 'Constructor de Relaciones', en: 'Relation Constructor' },
  nodoOrixe:            { gl: 'Nodo orixe *',             es: 'Nodo origen *',             en: 'Source node *'        },
  nodoDestino:          { gl: 'Nodo destino *',           es: 'Nodo destino *',            en: 'Target node *'        },
  buscarNodoLabel:      { gl: 'Buscar nodo...',           es: 'Buscar nodo...',            en: 'Search node...'       },
  tipoRelacion:         { gl: 'Tipo de relación *',       es: 'Tipo de relación *',        en: 'Relation type *'      },
  contexto:             { gl: 'Contexto en {0}',          es: 'Contexto en {0}',           en: 'Context in {0}'       },
  forza:                { gl: 'Forza',                    es: 'Fuerza',                    en: 'Strength'             },
  crearRelacion:        { gl: 'Crear Relación',           es: 'Crear Relación',            en: 'Create Relation'      },

  // ── editor relacións ─────────────────────────────────
  editorRelTitulo:     { gl: 'Editor de Relacións',  es: 'Editor de Relaciones',  en: 'Relation Editor'   },
  seleccionaRelacions: { gl: 'Selecciona un nodo para ver as súas relacións', es: 'Selecciona un nodo para ver sus relaciones', en: 'Select a node to see its relations' },
  senRelacions:        { gl: 'Este nodo non ten relacións.', es: 'Este nodo no tiene relaciones.', en: 'This node has no relations.' },
  editar:              { gl: 'Editar',  es: 'Editar',  en: 'Edit'   },

  // ── constructor rutas ────────────────────────────────
  constructorRutasTitulo: { gl: 'Constructor de Rutas', es: 'Constructor de Rutas', en: 'Route Constructor' },
  pasosRuta:              { gl: 'Pasos da ruta ({0})',  es: 'Pasos de la ruta ({0})',en: 'Route steps ({0})' },
  senPasos:               { gl: 'Aínda non hai pasos. Busca nodos abaixo para engadilos.', es: 'Aún no hay pasos. Busca nodos abajo para añadirlos.', en: 'No steps yet. Search nodes below to add them.' },
  engadirPaso:            { gl: 'Engadir paso',    es: 'Añadir paso',  en: 'Add step'    },
  previewRuta:            { gl: 'Vista previa',    es: 'Vista previa', en: 'Preview'     },
  crearRuta:              { gl: 'Crear Ruta',      es: 'Crear Ruta',   en: 'Create Route'},
  tipoRuta:               { gl: 'Tipo',            es: 'Tipo',         en: 'Type'        },
  educational:            { gl: 'Educativa',       es: 'Educativa',    en: 'Educational' },
  exploration:            { gl: 'Exploratoria',    es: 'Exploratoria', en: 'Exploratory' },
  galicia:                { gl: 'Galicia',         es: 'Galicia',      en: 'Galicia'     },
  professional:           { gl: 'Profesional',     es: 'Profesional',  en: 'Professional'},

  // ── editor rutas ─────────────────────────────────────
  editorRutasTitulo: { gl: 'Rutas',             es: 'Rutas',              en: 'Routes'           },
  buscarRuta:        { gl: 'Buscar ruta...',    es: 'Buscar ruta...',     en: 'Search route...'  },
  seleccionaRuta:    { gl: 'Selecciona unha ruta para editala', es: 'Selecciona una ruta para editarla', en: 'Select a route to edit it' },
  editando:          { gl: 'Editando: {0}',     es: 'Editando: {0}',      en: 'Editing: {0}'     },
  borrarRuta:        { gl: 'Borrar ruta',       es: 'Borrar ruta',        en: 'Delete route'     },
  metadatos:         { gl: 'Metadatos',         es: 'Metadatos',          en: 'Metadata'         },
  gardarMetadatos:   { gl: 'Gardar metadatos',  es: 'Guardar metadatos',  en: 'Save metadata'    },
  pasosRutaLabel:    { gl: 'Pasos da ruta ({0})',es: 'Pasos de la ruta ({0})',en: 'Route steps ({0})'},
  gardarPasos:       { gl: 'Gardar pasos',      es: 'Guardar pasos',      en: 'Save steps'       },
  visibilidade:      { gl: 'Visibilidade',      es: 'Visibilidad',        en: 'Visibility'       },
  privada:           { gl: '🔒 Privada',         es: '🔒 Privada',          en: '🔒 Private'        },
  borrador:          { gl: '🟡 Borrador',        es: '🟡 Borrador',         en: '🟡 Draft'          },
  publica:           { gl: '🟢 Pública',         es: '🟢 Pública',          en: '🟢 Public'         },
  destacada:         { gl: '⭐ Destacada',       es: '⭐ Destacada',        en: '⭐ Featured'       },
  descricion:        { gl: 'Descrición en {0}', es: 'Descripción en {0}', en: 'Description in {0}'},

  // ── importador ───────────────────────────────────────
  importadorTitulo:   { gl: 'Importador Bulk',  es: 'Importador Bulk',  en: 'Bulk Importer'    },
  importadorDesc:     { gl: 'Pega un JSON con nodos e relacións para importar masivamente.', es: 'Pega un JSON con nodos y relaciones para importar masivamente.', en: 'Paste a JSON with nodes and relations to import massively.' },
  formatoEsperado:    { gl: 'FORMATO ESPERADO', es: 'FORMATO ESPERADO', en: 'EXPECTED FORMAT'  },
  cargarExemplo:      { gl: 'Cargar exemplo',   es: 'Cargar ejemplo',   en: 'Load example'     },
  importando:         { gl: 'Importando...',    es: 'Importando...',    en: 'Importing...'     },
  importacionOk:      { gl: '✓ Importación completada', es: '✓ Importación completada', en: '✓ Import completed' },
  importacionErro:    { gl: '✗ Erro na importación',    es: '✗ Error en la importación',en: '✗ Import error'    },
  nodosCreados:       { gl: 'nodos creados',    es: 'nodos creados',    en: 'nodes created'    },
  relacionsCreadas:   { gl: 'relacións creadas',es: 'relaciones creadas',en: 'relations created'},
  errosNodos:         { gl: 'erros nodos',      es: 'errores nodos',    en: 'node errors'      },
  errosRelacions:     { gl: 'erros relacións',  es: 'errores relaciones',en: 'relation errors'  },
  errosNodosLabel:    { gl: 'ERROS NODOS:',     es: 'ERRORES NODOS:',   en: 'NODE ERRORS:'     },
  jsonValido:         { gl: '✓ JSON válido',     es: '✓ JSON válido',     en: '✓ Valid JSON'      },

  // ── mensaxes xerais ──────────────────────────────────
  erroConexion:           { gl: '✗ Erro de conexión',              es: '✗ Error de conexión',             en: '✗ Connection error'              },
  gardadoOk:              { gl: '✓ Nodo gardado correctamente',    es: '✓ Nodo guardado correctamente',   en: '✓ Node saved successfully'       },
  creadoOk:               { gl: '✓ Nodo "{0}" creado con id: {1}', es: '✓ Nodo "{0}" creado con id: {1}', en: '✓ Node "{0}" created with id: {1}'},
  relacionCreadaOk:       { gl: '✓ Relación creada: {0} → {1}',   es: '✓ Relación creada: {0} → {1}',    en: '✓ Relation created: {0} → {1}'   },
  relacionBorradaOk:      { gl: '✓ Relación borrada',             es: '✓ Relación borrada',              en: '✓ Relation deleted'              },
  relacionActualizadaOk:  { gl: '✓ Relación actualizada',         es: '✓ Relación actualizada',          en: '✓ Relation updated'              },
  rutaCreadaOk:           { gl: '✓ Ruta "{0}" creada con id: {1}',es: '✓ Ruta "{0}" creada con id: {1}', en: '✓ Route "{0}" created with id: {1}'},
  metadatosGardados:      { gl: '✓ Metadatos gardados',           es: '✓ Metadatos guardados',           en: '✓ Metadata saved'                },
  pasosGardados:          { gl: '✓ Pasos gardados',               es: '✓ Pasos guardados',               en: '✓ Steps saved'                   },
  confirmarBorrarRuta:    { gl: 'Borrar a ruta "{0}"?',           es: '¿Borrar la ruta "{0}"?',          en: 'Delete route "{0}"?'             },
  seleccionaOrixeDestino: { gl: '✗ Selecciona orixe e destino',   es: '✗ Selecciona origen y destino',   en: '✗ Select source and target'      },
  orixeDestinoIguais:     { gl: '✗ Orixe e destino non poden ser o mesmo nodo', es: '✗ Origen y destino no pueden ser el mismo nodo', en: '✗ Source and target cannot be the same node' },
  nomeObrigatorioErro:    { gl: '✗ Nome en galego é obrigatorio', es: '✗ Nombre en gallego es obligatorio', en: '✗ Name in Galician is required' },
  senPasosErro:           { gl: '✗ A ruta necesita polo menos un paso', es: '✗ La ruta necesita al menos un paso', en: '✗ The route needs at least one step' },

  // ── auth ─────────────────────────────────────────────
  iniciarSesion:      { gl: 'Iniciar sesión',    es: 'Iniciar sesión',    en: 'Log in'           },
  rexistrarse:        { gl: 'Rexistrarse',       es: 'Registrarse',       en: 'Sign up'          },
  contrasinal:        { gl: 'Contrasinal',       es: 'Contraseña',        en: 'Password'         },
  contrasinelNovo:    { gl: 'Contrasinal (mín. 8 caracteres, maiúsculas e números)', es: 'Contraseña (mín. 8 caracteres, mayúsculas y números)', en: 'Password (min. 8 chars, uppercase and numbers)' },
  codigoProfesor:     { gl: 'Código de profesor',es: 'Código de profesor', en: 'Teacher code'    },
  cerrarSesion:       { gl: 'Pechar sesión',     es: 'Cerrar sesión',     en: 'Log out'          },
  cambiarUsuario:     { gl: 'Cambiar usuario',   es: 'Cambiar usuario',   en: 'Change user'      },
  soNome:             { gl: 'Nome (só para identificarte)', es: 'Nombre (solo para identificarte)', en: 'Name (just to identify you)' },

  // ── xp e niveis ──────────────────────────────────────
  xpTotal:        { gl: 'XP Total',          es: 'XP Total',          en: 'Total XP'          },
  nivelActual:    { gl: 'Nivel actual',       es: 'Nivel actual',      en: 'Current level'     },
  proximoNivel:   { gl: 'Próximo nivel',      es: 'Próximo nivel',     en: 'Next level'        },
  progreso:       { gl: 'Progreso',           es: 'Progreso',          en: 'Progress'          },
  meuHistorial:   { gl: 'O meu historial',    es: 'Mi historial',      en: 'My history'        },
  rankingCentros: { gl: 'Ranking de centros', es: 'Ranking de centros',en: 'School ranking'    },
  arquivoRutas:   { gl: 'Arquivo de Rutas',   es: 'Archivo de Rutas',  en: 'Routes Archive'    },
  verIntroduccion:{ gl: 'Ver introducción',   es: 'Ver introducción',  en: 'See introduction'  },
  silenciar:      { gl: 'Silenciar',          es: 'Silenciar',         en: 'Mute'              },
  activarSon:     { gl: 'Activar son',        es: 'Activar son',       en: 'Unmute'            },
  pechar:         { gl: 'Pechar',             es: 'Cerrar',            en: 'Close'             },

// ── pantalla usuario ─────────────────────────────────
  benvido:           { gl: 'Benvido a',              es: 'Bienvenido a',           en: 'Welcome to'               },
  crearConta:        { gl: 'Crear conta nova',        es: 'Crear cuenta nueva',     en: 'Create new account'       },
  xaTenConta:        { gl: 'Xa teño conta — Entrar',  es: 'Ya tengo cuenta — Entrar',en: 'I have an account — Log in'},
  entrarExplorador:  { gl: 'Entrar como Explorador (sen conta)', es: 'Entrar como Explorador (sin cuenta)', en: 'Enter as Explorer (no account)' },
  explorador:        { gl: 'Explorador',              es: 'Explorador',             en: 'Explorer'                 },
  senContaAviso:     { gl: 'Sen conta podes navegar e ler, pero non gardarás historial nin poderás enviar contido.', es: 'Sin cuenta puedes navegar y leer, pero no guardarás historial ni podrás enviar contenido.', en: 'Without an account you can browse and read, but you won\'t save history or submit content.' },
  nomeLabel:         { gl: 'NOME',                    es: 'NOMBRE',                 en: 'NAME'                     },
  centroLabel:       { gl: 'CENTRO EDUCATIVO',        es: 'CENTRO EDUCATIVO',       en: 'SCHOOL'                   },
  centroOpcional:    { gl: 'CENTRO EDUCATIVO (OPCIONAL)', es: 'CENTRO EDUCATIVO (OPCIONAL)', en: 'SCHOOL (OPTIONAL)' },
  contrasinelLabel:  { gl: 'CONTRASINAL',             es: 'CONTRASEÑA',             en: 'PASSWORD'                 },
  contrasinelRep:    { gl: 'REPETIR CONTRASINAL',     es: 'REPETIR CONTRASEÑA',     en: 'REPEAT PASSWORD'          },
  rolLabel:          { gl: 'ROL',                     es: 'ROL',                    en: 'ROLE'                     },
  rolAlumno:         { gl: '🎓 Alumno/a',             es: '🎓 Alumno/a',            en: '🎓 Student'               },
  rolProfesor:       { gl: '📚 Profesor/a',           es: '📚 Profesor/a',          en: '📚 Teacher'               },
  codigoProfesorLabel:{ gl: 'CÓDIGO DE PROFESOR',     es: 'CÓDIGO DE PROFESOR',     en: 'TEACHER CODE'             },
  codigoProfesorPlaceholder: { gl: 'Código proporcionado polo centro...', es: 'Código proporcionado por el centro...', en: 'Code provided by your school...' },
  creandoConta:      { gl: 'Creando conta...',        es: 'Creando cuenta...',      en: 'Creating account...'      },
  entrando:          { gl: 'Entrando...',             es: 'Entrando...',            en: 'Logging in...'            },
  volver:            { gl: '← Volver',                es: '← Volver',               en: '← Back'                   },
  buscarCentro:      { gl: 'Buscar centro...',        es: 'Buscar centro...',       en: 'Search school...'         },
  seleccionarIdioma: { gl: 'IDIOMA',                  es: 'IDIOMA',                 en: 'LANGUAGE'                 },

  // ── requisitos contrasinal ───────────────────────────
  contrasinelReq:      { gl: 'Requisitos do contrasinal:', es: 'Requisitos de la contraseña:', en: 'Password requirements:' },
  contrasinelReq1:     { gl: '✓ Mínimo 8 caracteres',     es: '✓ Mínimo 8 caracteres',        en: '✓ Minimum 8 characters' },
  contrasinelReq2:     { gl: '✓ Polo menos unha maiúscula',es: '✓ Al menos una mayúscula',     en: '✓ At least one uppercase' },
  contrasinelReq3:     { gl: '✓ Polo menos unha minúscula',es: '✓ Al menos una minúscula',     en: '✓ At least one lowercase' },
  contrasinelReq4:     { gl: '✓ Polo menos un número',    es: '✓ Al menos un número',         en: '✓ At least one number'  },
  contrasinaisCoinciden:{ gl: '✓ Contrasinais coinciden', es: '✓ Contraseñas coinciden',      en: '✓ Passwords match'      },
  contrasinaisNonCoinciden:{ gl: 'Os contrasinais non coinciden', es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
}
// ── FIN: textos_por_clave ────────────────────────────

// ── INICIO: helper_t ─────────────────────────────────
export function t(idioma, clave, ...args) {
  const entrada = TEXTOS[clave]
  if (!entrada) {
    // En desenvolvemento avisa de claves que faltan
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Clave non atopada: "${clave}"`)
    }
    return clave
  }
  let texto = entrada[idioma] || entrada.gl || clave
  args.forEach((arg, i) => {
    texto = texto.replace(`{${i}}`, arg)
  })
  return texto
}
// ── FIN: helper_t ────────────────────────────────────

export default TEXTOS