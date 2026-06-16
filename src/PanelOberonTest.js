import { useState, useEffect, useRef } from 'react'
import { useUser } from './contexts/UserContext'
import { t }       from './i18n'

// ═══════════════════════════════════════════════════════════
// PanelOberonTest — Test vocacional de Oberón
// ═══════════════════════════════════════════════════════════
//
// API pública: { idioma, onPechar, onResultadoGardado? }
//
// Fluxo:
//   1. Pantalla intro (que é Oberón, canto tarda)
//   2. Preguntas (35) cunha por unha con barra de progreso
//   3. Resultado: radar das 12 skills + top 5 profesións
//   4. Garda automaticamente no perfil do usuario
//
// Endpoint: POST /test/calcular  → top profesións
//           POST /test/gardar    → garda resultado
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'


// ── INICIO: preguntas (multilingue) ──────────────────
// 25 preguntas con escenarios concretos. Cada resposta ten un mapa
// de impacto en skills.
//
// NOTA: Reusamos as preguntas xa probadas do test v3, traducidas a gl/en.
// Mantéñense os mesmos pesos que xa funcionaron.

const PREGUNTAS = [
  {
    pregunta: {
      gl: "Estás nunha reunión e notas que unha persoa do grupo parece incómoda. Que fas?",
      es: "Estás en una reunión y notas que una persona del grupo parece incómoda. ¿Qué haces?",
      en: "You're in a meeting and notice someone seems uncomfortable. What do you do?"
    },
    respuestas: [
      {
        texto: {
          gl: "Trato de entender que lle pasa e adapto a miña forma de falar.",
          es: "Intento entender qué le ocurre y adapto mi forma de hablar.",
          en: "I try to understand what's wrong and adapt how I speak."
        },
        impacto: { empatía: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Manteño o foco no obxectivo da reunión.",
          es: "Me mantengo centrado en el objetivo de la reunión.",
          en: "I stay focused on the meeting's goal."
        },
        impacto: { planificación: 1, atención: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que revisar un documento con moitos detalles pequenos baixo presión de tempo.",
      es: "Tienes que revisar un documento con muchos detalles pequeños bajo presión de tiempo.",
      en: "You must review a detailed document under time pressure."
    },
    respuestas: [
      {
        texto: {
          gl: "Vou liña por liña sen saltar nada.",
          es: "Voy línea por línea sin saltarme nada.",
          en: "I go line by line, not skipping anything."
        },
        impacto: { precisión: 2, atención: 1 }
      },
      {
        texto: {
          gl: "Busco primeiro os puntos máis críticos e logo o resto.",
          es: "Busco primero los puntos más críticos y luego el resto.",
          en: "I check critical points first, then the rest."
        },
        impacto: { análisis: 2, planificación: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Un amigo cóntache un problema complexo e emocional.",
      es: "Un amigo te cuenta un problema complejo y emocional.",
      en: "A friend tells you a complex emotional problem."
    },
    respuestas: [
      {
        texto: {
          gl: "Escoito activamente e fago preguntas para entender mellor.",
          es: "Escucho activamente y hago preguntas para comprender mejor.",
          en: "I listen actively and ask questions to understand better."
        },
        impacto: { empatía: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Tento ofrecer solucións prácticas rapidamente.",
          es: "Intento ofrecer soluciones prácticas rápidamente.",
          en: "I try to offer practical solutions quickly."
        },
        impacto: { resolución_de_problemas: 2, análisis: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que montar un moble seguindo instrucións visuais.",
      es: "Debes montar un mueble siguiendo instrucciones visuales.",
      en: "You must assemble furniture following visual instructions."
    },
    respuestas: [
      {
        texto: {
          gl: "Sigo cada paso tal como aparece.",
          es: "Sigo cada paso tal como aparece.",
          en: "I follow each step as shown."
        },
        impacto: { precisión: 2, coordinación: 1 }
      },
      {
        texto: {
          gl: "Busco unha forma máis rápida de montalo sen perder estabilidade.",
          es: "Busco una forma más rápida de montarlo sin perder estabilidad.",
          en: "I look for a faster way to assemble it without losing stability."
        },
        impacto: { creatividad: 1, resolución_de_problemas: 2 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Asígnante a organización dun pequeno evento con varias tarefas simultáneas.",
      es: "Te asignan organizar un pequeño evento con varias tareas simultáneas.",
      en: "You're assigned to organize a small event with multiple simultaneous tasks."
    },
    respuestas: [
      {
        texto: {
          gl: "Fago unha lista e ordeno as tarefas por prioridade.",
          es: "Hago una lista y ordeno las tareas por prioridad.",
          en: "I make a list and order tasks by priority."
        },
        impacto: { planificación: 2, atención: 1 }
      },
      {
        texto: {
          gl: "Empezo polo que me parece máis urxente no momento.",
          es: "Empiezo por lo que me parece más urgente en el momento.",
          en: "I start with whatever seems most urgent at the moment."
        },
        impacto: { resolución_de_problemas: 1, análisis: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Estás aprendendo algo novo e non entendes un concepto.",
      es: "Estás aprendiendo algo nuevo y no entiendes un concepto.",
      en: "You're learning something new and don't understand a concept."
    },
    respuestas: [
      {
        texto: {
          gl: "Busco exemplos ou analoxías para comprendelo mellor.",
          es: "Busco ejemplos o analogías para comprenderlo mejor.",
          en: "I look for examples or analogies to understand better."
        },
        impacto: { creatividad: 1, análisis: 2 }
      },
      {
        texto: {
          gl: "Repito a explicación varias veces ata memorizala.",
          es: "Repito la explicación varias veces hasta memorizarla.",
          en: "I repeat the explanation until I memorize it."
        },
        impacto: { atención: 2, precisión: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Nun proxecto en grupo, o equipo non se pon de acordo.",
      es: "En un proyecto grupal, el equipo no se pone de acuerdo.",
      en: "In a group project, the team can't agree."
    },
    respuestas: [
      {
        texto: {
          gl: "Trato de mediar para que todos se escoiten.",
          es: "Intento mediar para que todos se escuchen.",
          en: "I try to mediate so everyone listens."
        },
        impacto: { empatía: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Propoño un método para avaliar opcións obxectivamente.",
          es: "Propongo un método para evaluar opciones objetivamente.",
          en: "I propose a method to evaluate options objectively."
        },
        impacto: { análisis: 2, resolución_de_problemas: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que clasificar obxectos segundo criterios cambiantes.",
      es: "Debes clasificar objetos según criterios cambiantes.",
      en: "You must classify objects with changing criteria."
    },
    respuestas: [
      {
        texto: {
          gl: "Creo un sistema flexible que poida adaptarse.",
          es: "Creo un sistema flexible que pueda adaptarse.",
          en: "I create a flexible system that can adapt."
        },
        impacto: { creatividad: 1, planificación: 2 }
      },
      {
        texto: {
          gl: "Axústome aos criterios novos sen cuestionalos.",
          es: "Me ajusto a los criterios nuevos sin cuestionarlos.",
          en: "I adapt to new criteria without questioning them."
        },
        impacto: { atención: 2, precisión: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Pídente explicar un tema complexo a alguén sen coñecementos previos.",
      es: "Te piden explicar un tema complejo a alguien sin conocimientos previos.",
      en: "You're asked to explain something complex to a beginner."
    },
    respuestas: [
      {
        texto: {
          gl: "Simplifico a linguaxe e uso exemplos cotiáns.",
          es: "Simplifico el lenguaje y uso ejemplos cotidianos.",
          en: "I simplify language and use everyday examples."
        },
        impacto: { comunicación: 2, empatía: 1 }
      },
      {
        texto: {
          gl: "Vou ao detalle técnico para que entenda a base real.",
          es: "Voy al detalle técnico para que entienda la base real.",
          en: "I go into technical detail so they understand the real basis."
        },
        impacto: { análisis: 2, precisión: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que resolver un crebacabezas con pezas moi semellantes.",
      es: "Tienes que resolver un rompecabezas con piezas muy similares.",
      en: "You must solve a puzzle with very similar pieces."
    },
    respuestas: [
      {
        texto: {
          gl: "Fíxome en pequenos detalles para distinguilas.",
          es: "Me fijo en pequeños detalles para diferenciarlas.",
          en: "I focus on small details to tell them apart."
        },
        impacto: { precisión: 2, atención: 1 }
      },
      {
        texto: {
          gl: "Busco patróns xerais antes de entrar en detalles.",
          es: "Busco patrones generales antes de entrar en detalles.",
          en: "I look for general patterns before details."
        },
        impacto: { análisis: 2, creatividad: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Durante unha camiñada longa, o grupo empeza a cansar.",
      es: "Durante una caminata larga, el grupo empieza a cansarse.",
      en: "During a long hike, the group starts getting tired."
    },
    respuestas: [
      {
        texto: {
          gl: "Manteño o ritmo e animo aos demais.",
          es: "Mantengo el ritmo y animo a los demás.",
          en: "I keep the pace and encourage the others."
        },
        impacto: { resistencia_física: 2, comunicación: 1, liderazgo: 1 }
      },
      {
        texto: {
          gl: "Propoño pausas estratéxicas para optimizar enerxía.",
          es: "Propongo pausas estratégicas para optimizar energía.",
          en: "I suggest strategic breaks to save energy."
        },
        impacto: { planificación: 2, empatía: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que improvisar unha solución porque falta unha ferramenta clave.",
      es: "Debes improvisar una solución porque falta una herramienta clave.",
      en: "You must improvise because a key tool is missing."
    },
    respuestas: [
      {
        texto: {
          gl: "Busco obxectos alternativos que poidan servir.",
          es: "Busco objetos alternativos que puedan servir.",
          en: "I look for alternative objects that could work."
        },
        impacto: { creatividad: 2, resolución_de_problemas: 1 }
      },
      {
        texto: {
          gl: "Replantexo a tarefa para evitar depender desa ferramenta.",
          es: "Replanteo la tarea para evitar depender de esa herramienta.",
          en: "I rethink the task to avoid depending on that tool."
        },
        impacto: { análisis: 2, planificación: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Atópaste cun erro inesperado nun sistema que usas a diario.",
      es: "Te encuentras con un error inesperado en un sistema que usas a diario.",
      en: "You hit an unexpected error in a system you use daily."
    },
    respuestas: [
      {
        texto: {
          gl: "Probo varias solucións ata que algo funcione.",
          es: "Pruebo varias soluciones hasta que algo funcione.",
          en: "I try several fixes until something works."
        },
        impacto: { resolución_de_problemas: 2, creatividad: 1 }
      },
      {
        texto: {
          gl: "Analizo a orixe do erro antes de actuar.",
          es: "Analizo el origen del error antes de actuar.",
          en: "I analyze the root cause before acting."
        },
        impacto: { análisis: 2, precisión: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Alguén interrómpete mentres realizas unha tarefa delicada.",
      es: "Alguien te interrumpe mientras realizas una tarea delicada.",
      en: "Someone interrupts you during a delicate task."
    },
    respuestas: [
      {
        texto: {
          gl: "Pido un momento para terminar sen perder precisión.",
          es: "Pido un momento para terminar sin perder precisión.",
          en: "I ask for a moment to finish without losing accuracy."
        },
        impacto: { precisión: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Cambio de foco e retomo logo a tarefa.",
          es: "Cambio de foco y retomo luego la tarea.",
          en: "I switch focus and resume the task later."
        },
        impacto: { atención: 1, planificación: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que memorizar unha secuencia de movementos.",
      es: "Debes memorizar una secuencia de movimientos.",
      en: "You must memorize a sequence of movements."
    },
    respuestas: [
      {
        texto: {
          gl: "Practico repetidamente ata automatizala.",
          es: "Practico repetidamente hasta automatizarla.",
          en: "I practice repeatedly until it's automatic."
        },
        impacto: { coordinación: 2, atención: 1, memoria: 2 }
      },
      {
        texto: {
          gl: "Divido a secuencia en partes lóxicas.",
          es: "Divido la secuencia en partes lógicas.",
          en: "I break the sequence into logical parts."
        },
        impacto: { análisis: 2, planificación: 1, memoria: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que presentar unha idea ante un grupo diverso.",
      es: "Tienes que presentar una idea ante un grupo diverso.",
      en: "You must present an idea to a diverse group."
    },
    respuestas: [
      {
        texto: {
          gl: "Adapto o meu discurso segundo as reaccións do público.",
          es: "Adapto mi discurso según las reacciones del público.",
          en: "I adapt my speech based on audience reactions."
        },
        impacto: { comunicación: 2, empatía: 1, liderazgo: 1 }
      },
      {
        texto: {
          gl: "Cíñome ao guión preparado previamente.",
          es: "Me ciño al guion preparado previamente.",
          en: "I stick to the script I prepared."
        },
        impacto: { planificación: 2, precisión: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Pídente xerar ideas novas en pouco tempo.",
      es: "Te piden generar ideas nuevas en poco tiempo.",
      en: "You're asked to generate new ideas quickly."
    },
    respuestas: [
      {
        texto: {
          gl: "Propoño moitas ideas sen xulgalas ao principio.",
          es: "Propongo muchas ideas sin juzgarlas al principio.",
          en: "I propose many ideas without judging them at first."
        },
        impacto: { creatividad: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Analizo primeiro o obxectivo para xerar ideas máis precisas.",
          es: "Analizo primero el objetivo para generar ideas más precisas.",
          en: "I analyze the goal first to generate more focused ideas."
        },
        impacto: { análisis: 2, planificación: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que cargar e mover material pesado durante varias horas.",
      es: "Tienes que cargar y mover material pesado durante varias horas.",
      en: "You must carry and move heavy material for hours."
    },
    respuestas: [
      {
        texto: {
          gl: "Manteño un ritmo estable e aguanto sen parar.",
          es: "Mantengo un ritmo estable y aguanto sin parar.",
          en: "I keep a steady pace and don't stop."
        },
        impacto: { resistencia_física: 2, coordinación: 1 }
      },
      {
        texto: {
          gl: "Organizo o traballo para que sexa máis eficiente.",
          es: "Organizo el trabajo para que sea más eficiente.",
          en: "I organize the work to be more efficient."
        },
        impacto: { planificación: 2, análisis: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que manipular ferramentas pequenas con moita precisión.",
      es: "Debes manipular herramientas pequeñas con mucha precisión.",
      en: "You must handle small tools with great precision."
    },
    respuestas: [
      {
        texto: {
          gl: "Vou amodo e controlo cada movemento das mans.",
          es: "Voy despacio y controlo cada movimiento de mis manos.",
          en: "I work slowly, controlling every hand movement."
        },
        impacto: { coordinación: 2, precisión: 2 }
      },
      {
        texto: {
          gl: "Busco a mellor postura e técnica antes de empezar.",
          es: "Busco la mejor postura y técnica antes de empezar.",
          en: "I find the best posture and technique first."
        },
        impacto: { planificación: 1, atención: 2 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Estás nunha actividade ao aire libre que esixe esforzo físico todo o día.",
      es: "Estás en una actividad al aire libre que exige esfuerzo físico todo el día.",
      en: "You're in an outdoor activity demanding all-day physical effort."
    },
    respuestas: [
      {
        texto: {
          gl: "Adáptome ao cansazo e sigo adiante.",
          es: "Me adapto al cansancio y sigo adelante.",
          en: "I adapt to fatigue and keep going."
        },
        impacto: { resistencia_física: 2, atención: 1 }
      },
      {
        texto: {
          gl: "Calculo os descansos e doso a enerxía.",
          es: "Calculo los descansos y dosifico la energía.",
          en: "I plan breaks and pace myself."
        },
        impacto: { planificación: 2, resistencia_física: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que reparar algo roto sen manual de instrucións.",
      es: "Tienes que reparar algo que se ha roto, sin manual de instrucciones.",
      en: "You must fix something broken with no manual."
    },
    respuestas: [
      {
        texto: {
          gl: "Desmóntoo pouco a pouco para ver como funciona por dentro.",
          es: "Lo desmonto poco a poco para ver cómo funciona por dentro.",
          en: "I disassemble it bit by bit to see how it works."
        },
        impacto: { coordinación: 2, resolución_de_problemas: 2 }
      },
      {
        texto: {
          gl: "Probo solucións rápidas ata que algo funcione.",
          es: "Pruebo soluciones rápidas hasta que algo funcione.",
          en: "I try quick fixes until something works."
        },
        impacto: { creatividad: 2, resolución_de_problemas: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Nun traballo manual delicado, como te comportas?",
      es: "En un trabajo manual delicado, ¿cómo te comportas?",
      en: "In delicate manual work, how do you behave?"
    },
    respuestas: [
      {
        texto: {
          gl: "Sigo os pasos con coidado, sen saltar nada.",
          es: "Sigo los pasos con cuidado, sin saltarme nada.",
          en: "I follow steps carefully, skipping nothing."
        },
        impacto: { precisión: 2, atención: 2 }
      },
      {
        texto: {
          gl: "Manteño a calma e vou axustando segundo o que vai pasando.",
          es: "Mantengo la calma y voy ajustando según lo que va pasando.",
          en: "I stay calm and adjust as things happen."
        },
        impacto: { coordinación: 2, resistencia_física: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Pídente axudar a alguén que está aprendendo algo por primeira vez.",
      es: "Te piden ayudar a alguien que está aprendiendo algo por primera vez.",
      en: "You're asked to help a first-time learner."
    },
    respuestas: [
      {
        texto: {
          gl: "Explícollo paso a paso con paciencia.",
          es: "Le explico paso a paso con paciencia.",
          en: "I explain step by step patiently."
        },
        impacto: { empatía: 2, comunicación: 1 }
      },
      {
        texto: {
          gl: "Déixoo experimentar e corrixir erros.",
          es: "Le dejo experimentar y corregir errores.",
          en: "I let them experiment and learn from mistakes."
        },
        impacto: { resolución_de_problemas: 1, creatividad: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Un grupo necesita alguén que tome decisións rápidas baixo presión.",
      es: "Un grupo necesita alguien que tome decisiones rápidas bajo presión.",
      en: "A group needs someone to make fast decisions under pressure."
    },
    respuestas: [
      {
        texto: {
          gl: "Asumo o papel e decido segundo a información dispoñible.",
          es: "Asumo el rol y decido según la información disponible.",
          en: "I take the role and decide with available info."
        },
        impacto: { liderazgo: 3, resolución_de_problemas: 1 }
      },
      {
        texto: {
          gl: "Prefiro que outra persoa decida e eu apoio.",
          es: "Prefiero que otra persona decida y yo apoyo.",
          en: "I'd rather someone else decide and I support."
        },
        impacto: { empatía: 1, comunicación: 1 }
      }
    ]
  },
  {
    pregunta: {
      gl: "Tes que recordar moitos datos para un exame ou proba.",
      es: "Debes recordar muchos datos para un examen o prueba.",
      en: "You must remember lots of data for a test."
    },
    respuestas: [
      {
        texto: {
          gl: "Repito os datos varias veces ata fixalos.",
          es: "Repito los datos varias veces hasta fijarlos.",
          en: "I repeat the data many times until it sticks."
        },
        impacto: { memoria: 2, atención: 2 }
      },
      {
        texto: {
          gl: "Creo conexións ou regras para lembralas mellor.",
          es: "Creo conexiones o reglas para recordarlas mejor.",
          en: "I create connections or rules to remember better."
        },
        impacto: { memoria: 2, creatividad: 1, análisis: 1 }
      }
    ]
  }
]
// ── FIN: preguntas ───────────────────────────────────


// ── INICIO: iconos_svg ───────────────────────────────
const IconoX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoFlecha = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────


function PanelOberonTest({ idioma = 'gl', onPechar }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [fase, setFase]               = useState('intro')   // intro | preguntas | resultado
  const [indicePregunta, setIndice]   = useState(0)
  const [respostas, setRespostas]     = useState({})        // { 0: {empatía: 2, ...}, 1: {...} }
  const [resultado, setResultado]     = useState(null)
  const [calculando, setCalculando]   = useState(false)
  const [erro, setErro]               = useState(null)
  // ── FIN: estados ─────────────────────────────────────

  const total       = PREGUNTAS.length
  const progreso    = Math.round(((indicePregunta + 1) / total) * 100)
  const respondidas = Object.keys(respostas).length

  // ── INICIO: helpers ──────────────────────────────────
  const seleccionarResposta = (indiceResposta) => {
    const impacto = PREGUNTAS[indicePregunta].respuestas[indiceResposta].impacto
    const novas = { ...respostas, [indicePregunta]: impacto }
    setRespostas(novas)
    // Avanzar tras un pequeno delay para que se vexa a selección
    setTimeout(() => {
      if (indicePregunta < total - 1) {
        setIndice(indicePregunta + 1)
      } else {
        calcularResultado(novas)
      }
    }, 250)
  }

  const saltarPregunta = () => {
    if (indicePregunta < total - 1) {
      setIndice(indicePregunta + 1)
    } else {
      calcularResultado(respostas)
    }
  }
  // ── FIN: helpers ─────────────────────────────────────


  // ── INICIO: calcular_resultado ────────────────────────
  const calcularResultado = async (resp) => {
    setCalculando(true)
    setErro(null)
    try {
      // Sumar perfil
      const perfil = {}
      Object.values(resp).forEach(impacto => {
        Object.entries(impacto).forEach(([skill, valor]) => {
          perfil[skill] = (perfil[skill] || 0) + valor
        })
      })

      // Chamar backend
      const res = await fetch(`${API}/test/calcular`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, top: 5 })
      })
      if (!res.ok) throw new Error(`Erro do servidor (${res.status})`)
      const data = await res.json()

      // Gardar no perfil do usuario
      const topMin = data.top.map(p => ({ id: p.id, afinidade: p.afinidade }))
      await fetch(`${API}/test/gardar`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, top: topMin })
      })

      setResultado({ perfil, top: data.top, todas: data.todas })
      setFase('resultado')
    } catch (e) {
      console.error('[OberonTest] Erro calculando:', e)
      setErro(e.message || 'Erro ao calcular')
    } finally {
      setCalculando(false)
    }
  }
  // ── FIN: calcular_resultado ──────────────────────────


  // ── INICIO: estilos_compartidos ──────────────────────
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(3, 6, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
  }
  const tarxeta = {
    width: '100%', maxWidth: 640,
    maxHeight: '90vh',
    background: 'var(--gaia-cosmos-900)',
    border: '1px solid var(--gaia-cosmos-400)',
    borderRadius: 16,
    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden'
  }
  const cabeceira = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 28px',
    borderBottom: '1px solid var(--gaia-cosmos-400)',
    flexShrink: 0
  }
  const corpo = {
    flex: 1, overflowY: 'auto', padding: 28
  }
  const btnPechar = {
    background: 'transparent',
    border: '1px solid var(--gaia-cosmos-400)',
    color: 'var(--gaia-text-tertiary)',
    borderRadius: '50%', width: 32, height: 32,
    cursor: 'pointer',
    display: 'grid', placeItems: 'center'
  }
  // ── FIN: estilos_compartidos ─────────────────────────


  // ── INICIO: render_intro ──────────────────────────────
  const renderIntro = () => (
    <>
      <div style={cabeceira}>
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--gaia-accent)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700
          }}>
            Oberón
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 24,
            color: 'var(--gaia-text-primary)',
            margin: '4px 0 0',
            fontWeight: 700,
            letterSpacing: '-0.01em'
          }}>
            {idioma === 'gl' ? 'Test vocacional' : idioma === 'es' ? 'Test vocacional' : 'Vocational test'}
          </h2>
        </div>
        <button onClick={onPechar} style={btnPechar}><IconoX /></button>
      </div>

      <div style={corpo}>
        <p style={{
          fontSize: 15, lineHeight: 1.7,
          color: 'var(--gaia-text-secondary)',
          marginTop: 0
        }}>
          {idioma === 'gl' && (
            <>Este test axúdache a descubrir as túas habilidades dominantes
            e que profesións encaixan mellor co teu perfil. Son <strong>{total} preguntas</strong> sobre
            como reaccionas en situacións cotiás. Tarda uns <strong>5-7 minutos</strong>.</>
          )}
          {idioma === 'es' && (
            <>Este test te ayuda a descubrir tus habilidades dominantes
            y qué profesiones encajan mejor con tu perfil. Son <strong>{total} preguntas</strong> sobre
            cómo reaccionas en situaciones cotidianas. Tarda unos <strong>5-7 minutos</strong>.</>
          )}
          {idioma === 'en' && (
            <>This test helps you discover your dominant skills
            and which professions fit your profile. It's <strong>{total} questions</strong> about
            how you react in everyday situations. Takes about <strong>5-7 minutes</strong>.</>
          )}
        </p>

        <div style={{
          padding: 16, marginTop: 20,
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--gaia-text-tertiary)',
          lineHeight: 1.6
        }}>
          {idioma === 'gl' && '⚠️ Non hai respostas correctas ou incorrectas. Responde o que máis se pareza a ti. Se non te identificas con ningunha, podes saltar a pregunta.'}
          {idioma === 'es' && '⚠️ No hay respuestas correctas o incorrectas. Responde lo que más se parezca a ti. Si no te identificas con ninguna, puedes saltar la pregunta.'}
          {idioma === 'en' && '⚠️ No right or wrong answers. Pick what feels closest to you. If neither fits, skip the question.'}
        </div>

        <button
          onClick={() => setFase('preguntas')}
          style={{
            marginTop: 28,
            width: '100%',
            padding: 14,
            background: 'var(--gaia-accent)',
            color: 'var(--gaia-cosmos-900)',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 0 20px rgba(232, 165, 71, 0.25)'
          }}>
          {idioma === 'gl' ? 'Empezar' : idioma === 'es' ? 'Empezar' : 'Start'}
          <IconoFlecha />
        </button>
      </div>
    </>
  )
  // ── FIN: render_intro ────────────────────────────────


  // ── INICIO: render_preguntas ──────────────────────────
  const renderPreguntas = () => {
    const p = PREGUNTAS[indicePregunta]
    const respostaActual = respostas[indicePregunta]

    return (
      <>
        <div style={cabeceira}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              {indicePregunta + 1} / {total} · {progreso}%
            </div>
            <div style={{
              height: 4,
              background: 'var(--gaia-cosmos-700)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progreso}%`,
                background: 'var(--gaia-accent)',
                borderRadius: 2,
                transition: 'width 300ms ease',
                boxShadow: '0 0 8px var(--gaia-accent)'
              }} />
            </div>
          </div>
          <button onClick={onPechar} style={{ ...btnPechar, marginLeft: 16 }}>
            <IconoX />
          </button>
        </div>

        <div style={corpo}>
          <h3 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22,
            color: 'var(--gaia-text-primary)',
            lineHeight: 1.4,
            margin: '0 0 24px',
            fontWeight: 600
          }}>
            {p.pregunta[idioma] || p.pregunta.gl}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.respuestas.map((r, i) => {
              const seleccionado = respostaActual && JSON.stringify(respostaActual) === JSON.stringify(r.impacto)
              return (
                <button key={i}
                  onClick={() => seleccionarResposta(i)}
                  style={{
                    padding: '16px 18px',
                    textAlign: 'left',
                    background: seleccionado ? 'var(--gaia-accent-bg)' : 'var(--gaia-cosmos-800)',
                    border: `1px solid ${seleccionado ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
                    borderRadius: 10,
                    color: 'var(--gaia-text-primary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    cursor: 'pointer',
                    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
                    transition: 'all 150ms ease',
                    display: 'flex', alignItems: 'flex-start', gap: 12
                  }}
                  onMouseEnter={e => {
                    if (!seleccionado) e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  }}
                  onMouseLeave={e => {
                    if (!seleccionado) e.currentTarget.style.background = 'var(--gaia-cosmos-800)'
                  }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${seleccionado ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
                    background: seleccionado ? 'var(--gaia-accent)' : 'transparent',
                    flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    color: 'var(--gaia-cosmos-900)'
                  }}>
                    {seleccionado && <IconoCheck size={12} />}
                  </span>
                  <span>{r.texto[idioma] || r.texto.gl}</span>
                </button>
              )
            })}
          </div>

          <button onClick={saltarPregunta}
            style={{
              marginTop: 16,
              padding: '10px 14px',
              background: 'transparent',
              color: 'var(--gaia-text-tertiary)',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
              fontStyle: 'italic'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gaia-text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gaia-text-tertiary)'}>
            {idioma === 'gl' ? 'Non sei / depende →' : idioma === 'es' ? 'No sé / depende →' : "Don't know / depends →"}
          </button>
        </div>
      </>
    )
  }
  // ── FIN: render_preguntas ────────────────────────────


  // ── INICIO: render_resultado ──────────────────────────
  const renderResultado = () => {
    const top = resultado?.top || []
    const perfil = resultado?.perfil || {}

    // Top 3 skills dominantes
    const skillsOrdenadas = Object.entries(perfil)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k.replace(/_/g, ' '))

    const colorPorAfinidade = (pct) => {
      if (pct >= 75) return 'var(--gaia-success)'
      if (pct >= 55) return 'var(--gaia-accent)'
      if (pct >= 35) return 'var(--gaia-system)'
      return 'var(--gaia-text-tertiary)'
    }

    return (
      <>
        <div style={cabeceira}>
          <div>
            <div style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--gaia-accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Oberón · {idioma === 'gl' ? 'Resultado' : idioma === 'es' ? 'Resultado' : 'Result'}
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22,
              color: 'var(--gaia-text-primary)',
              margin: '4px 0 0',
              fontWeight: 700
            }}>
              {idioma === 'gl' ? 'O teu perfil' : idioma === 'es' ? 'Tu perfil' : 'Your profile'}
            </h2>
          </div>
          <button onClick={onPechar} style={btnPechar}><IconoX /></button>
        </div>

        <div style={corpo}>
          <p style={{
            fontSize: 14,
            color: 'var(--gaia-text-secondary)',
            lineHeight: 1.6,
            marginTop: 0
          }}>
            {idioma === 'gl' && <>As túas habilidades máis fortes son <strong style={{ color: 'var(--gaia-accent)' }}>{skillsOrdenadas.join(', ')}</strong>.</>}
            {idioma === 'es' && <>Tus habilidades más fuertes son <strong style={{ color: 'var(--gaia-accent)' }}>{skillsOrdenadas.join(', ')}</strong>.</>}
            {idioma === 'en' && <>Your strongest skills are <strong style={{ color: 'var(--gaia-accent)' }}>{skillsOrdenadas.join(', ')}</strong>.</>}
          </p>

          <div style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '24px 0 12px',
            fontWeight: 600
          }}>
            {idioma === 'gl' ? 'Top 5 profesións afíns' : idioma === 'es' ? 'Top 5 profesiones afines' : 'Top 5 matching professions'}
          </div>

          {top.map(p => (
            <div key={p.id} style={{
              padding: '14px 16px',
              marginBottom: 8,
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <span style={{ fontSize: 28 }}>{p.icono}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--gaia-text-primary)'
                }}>
                  {p.label}
                </div>
                <div style={{
                  height: 4,
                  background: 'var(--gaia-cosmos-700)',
                  borderRadius: 2,
                  marginTop: 6,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${p.afinidade}%`,
                    background: colorPorAfinidade(p.afinidade),
                    borderRadius: 2,
                    transition: 'width 600ms ease'
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700,
                color: colorPorAfinidade(p.afinidade),
                fontFamily: "'JetBrains Mono', monospace",
                minWidth: 50, textAlign: 'right'
              }}>
                {p.afinidade}%
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 24,
            padding: 14,
            background: 'var(--gaia-success-bg)',
            border: '1px solid var(--gaia-success-border)',
            borderRadius: 10,
            fontSize: 12,
            color: 'var(--gaia-success)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <IconoCheck size={14} />
            {idioma === 'gl' && 'Resultado gardado no teu perfil'}
            {idioma === 'es' && 'Resultado guardado en tu perfil'}
            {idioma === 'en' && 'Result saved to your profile'}
          </div>

          <button onClick={onPechar}
            style={{
              marginTop: 20,
              width: '100%',
              padding: 12,
              background: 'var(--gaia-cosmos-700)',
              color: 'var(--gaia-text-primary)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
            }}>
            {idioma === 'gl' ? 'Pechar' : idioma === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </>
    )
  }
  // ── FIN: render_resultado ────────────────────────────


  // ── INICIO: render_calculando ─────────────────────────
  const renderCalculando = () => (
    <>
      <div style={cabeceira}>
        <div style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--gaia-accent)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          Oberón
        </div>
        <button onClick={onPechar} style={btnPechar}><IconoX /></button>
      </div>
      <div style={{ ...corpo, textAlign: 'center', padding: '60px 28px' }}>
        <div style={{
          fontSize: 14,
          color: 'var(--gaia-accent)',
          fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
        }}>
          {idioma === 'gl' ? 'Calculando o teu perfil...' : idioma === 'es' ? 'Calculando tu perfil...' : 'Calculating your profile...'}
        </div>
        {erro && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'var(--gaia-danger-bg)',
            border: '1px solid var(--gaia-danger-border)',
            color: 'var(--gaia-danger)',
            borderRadius: 8,
            fontSize: 12
          }}>
            {erro}
          </div>
        )}
      </div>
    </>
  )
  // ── FIN: render_calculando ───────────────────────────


  return (
    <div style={overlay}>
      <div style={tarxeta}>
        {fase === 'intro'      && renderIntro()}
        {fase === 'preguntas'  && !calculando && renderPreguntas()}
        {(calculando || (fase === 'preguntas' && !respostas[indicePregunta] && erro)) && renderCalculando()}
        {fase === 'resultado'  && renderResultado()}
      </div>
    </div>
  )
}

export default PanelOberonTest
