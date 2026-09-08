// FONTE DE VERDADE do contido "como funciona o mundo" (6ª entrega): De onde vén a música 🎵.
// Executable contra un backend local cun login de profesor (le CRED do scratchpad da sesión; cambia CRED para reutilizalo).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const login = await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })
if (login.status !== 200) { console.error('login', login.data); process.exit(1) }
const TOKEN = login.data.token
const N = (id, labels, primary, secondary, reto) => ({ id, labels, primary, secondary, reto })

// ───────────────────────── RUTA 15: DE ONDE VÉN A MÚSICA ─────────────────────────
const MUSICA = [
  N('a_vibracion', { gl: 'A vibración', es: 'La vibración', en: 'Vibration' },
    { gl: 'Todo son é algo que treme. Pon a man na gorxa e canta: notas como vibra. Unha corda de guitarra vai e vén tan rápido que a ves borrosa; a pel dun tambor salta cando lle dás. Ese tremor empurra o aire, e o aire empurra o aire de ao lado, coma as ondas que fai unha pedra na auga. Se a corda treme rápido, o son é agudo, coma un paxaro; se treme amodo, é grave, coma un trono. Se treme moito, soa forte; se treme pouco, soa baixiño. Sen aire non hai son: no espazo, unha explosión non se oe.',
      es: 'Todo sonido es algo que tiembla. Pon la mano en la garganta y canta: notas cómo vibra. Una cuerda de guitarra va y viene tan rápido que la ves borrosa; la piel de un tambor salta cuando le das. Ese temblor empuja el aire, y el aire empuja el aire de al lado, como las ondas que hace una piedra en el agua. Si la cuerda tiembla rápido, el sonido es agudo, como un pájaro; si tiembla despacio, es grave, como un trueno. Si tiembla mucho, suena fuerte; si tiembla poco, suena bajito. Sin aire no hay sonido: en el espacio, una explosión no se oye.',
      en: 'Every sound is something shaking. Put your hand on your throat and sing: you feel it vibrate. A guitar string goes back and forth so fast it looks blurry; a drum skin jumps when you hit it. That shaking pushes the air, and the air pushes the air next to it, like the ripples a stone makes in water. If the string shakes fast, the sound is high, like a bird; if it shakes slowly, it is low, like thunder. If it shakes a lot, it is loud; if it shakes a little, it is quiet. Without air there is no sound: in space, an explosion cannot be heard.' },
    { gl: 'O número de vibracións por segundo chámase frecuencia e mídese en hertz (Hz). O la co que afinan as orquestras vibra 440 veces por segundo. Unha corda soa máis aguda se é máis curta, máis tensa ou máis fina: por iso a guitarra ten cordas de grosores distintos e o guitarrista pisa os trastes para acurtalas. A forza do son é a amplitude, o tamaño do vaivén, e mídese en decibelios. O son viaxa polo aire a uns 340 metros por segundo: por iso ves o lóstrego antes de oír o trono, e podes contar os segundos para saber a que distancia caeu.',
      es: 'El número de vibraciones por segundo se llama frecuencia y se mide en hercios (Hz). El la con el que afinan las orquestas vibra 440 veces por segundo. Una cuerda suena más aguda si es más corta, más tensa o más fina: por eso la guitarra tiene cuerdas de grosores distintos y el guitarrista pisa los trastes para acortarlas. La fuerza del sonido es la amplitud, el tamaño del vaivén, y se mide en decibelios. El sonido viaja por el aire a unos 340 metros por segundo: por eso ves el relámpago antes de oír el trueno, y puedes contar los segundos para saber a qué distancia cayó.',
      en: 'The number of vibrations per second is called frequency and is measured in hertz (Hz). The A that orchestras tune to vibrates 440 times a second. A string sounds higher if it is shorter, tighter or thinner: that is why a guitar has strings of different thickness and the player presses the frets to shorten them. The strength of a sound is its amplitude, the size of the swing, measured in decibels. Sound travels through air at about 340 metres per second: that is why you see lightning before you hear thunder, and can count the seconds to know how far away it struck.' },
    { gl: 'Que fai unha corda de guitarra para soar máis aguda?\na) vibrar máis rápido\nb) vibrar máis amodo\nc) quedar quieta',
      es: '¿Qué hace una cuerda de guitarra para sonar más aguda?\na) vibrar más rápido\nb) vibrar más despacio\nc) quedarse quieta',
      en: 'What does a guitar string do to sound higher?\na) vibrate faster\nb) vibrate more slowly\nc) stay still' }),
  N('a_gaita', { gl: 'A gaita', es: 'La gaita', en: 'The bagpipe' },
    { gl: 'A gaita galega é unha bolsa de pel, o fol, con tres tubos. Polo soprete o gaiteiro mete aire; o fol gárdao debaixo do brazo e vaino apertando, así o son non para nin cando colle folgos. No punteiro van os buratos para os dedos: aí saen as notas. O ronco, o tubo longo que vai ao ombreiro, dá sempre a mesma nota grave por debaixo, coma un zunido. Dentro de cada tubo hai unha palleta, unha lingüeta pequena que treme co aire: iso é o que soa. Sen aire no fol, a gaita cala.',
      es: 'La gaita gallega es una bolsa de piel, el fol, con tres tubos. Por el soplete el gaitero mete aire; el fol lo guarda bajo el brazo y lo va apretando, así el sonido no para ni cuando coge aire. En el puntero van los agujeros para los dedos: ahí salen las notas. El ronco, el tubo largo que va al hombro, da siempre la misma nota grave por debajo, como un zumbido. Dentro de cada tubo hay una palleta, una lengüeta pequeña que tiembla con el aire: eso es lo que suena. Sin aire en el fol, la gaita calla.',
      en: 'The Galician bagpipe is a leather bag, the fol, with three pipes. Through the blowpipe the piper puts air in; the bag keeps it under the arm and is squeezed, so the sound does not stop even when the piper breathes. The chanter has the finger holes: that is where the notes come from. The drone, the long pipe over the shoulder, always plays the same low note underneath, like a hum. Inside each pipe is a reed, a small tongue that shakes with the air: that is what sounds. With no air in the bag, the pipe is silent.' },
    { gl: 'O punteiro leva unha palleta dobre, coma o óboe; o ronco, unha palleta simple coma o clarinete. A escala do punteiro tradicional vai dunha oitava e pouco, e por iso moitas pezas se compoñen dentro dese marco. Hai gaitas afinadas en do, en re e en si bemol segundo o tamaño. As miniaturas das Cantigas de Santa María, do século XIII, xa amosan gaitas de fol na Península. Cada aldea tiña o seu gaiteiro para as festas e as romarías, e hoxe hai bandas de gaitas e escolas municipais que a ensinan a miles de nenos e nenas. A gaita non é só galega: hai parentes en Escocia, Asturias, Bretaña ou Bulgaria, cada unha co seu son.',
      es: 'El puntero lleva una lengüeta doble, como el oboe; el ronco, una lengüeta simple como el clarinete. La escala del puntero tradicional abarca una octava y poco, y por eso muchas piezas se componen dentro de ese marco. Hay gaitas afinadas en do, en re y en si bemol según el tamaño. Las miniaturas de las Cantigas de Santa María, del siglo XIII, ya muestran gaitas de fuelle en la Península. Cada aldea tenía su gaitero para las fiestas y las romerías, y hoy hay bandas de gaitas y escuelas municipales que la enseñan a miles de niños y niñas. La gaita no es solo gallega: tiene parientes en Escocia, Asturias, Bretaña o Bulgaria, cada una con su sonido.',
      en: 'The chanter has a double reed, like the oboe; the drone a single reed, like the clarinet. The traditional chanter spans an octave and a little more, which is why many tunes are composed within that range. Bagpipes come tuned in C, D or B flat depending on size. The miniatures of the Cantigas de Santa María, from the 13th century, already show bagpipes in the Iberian Peninsula. Every village had its piper for festivals and pilgrimages, and today pipe bands and municipal schools teach it to thousands of children. The bagpipe is not only Galician: it has relatives in Scotland, Asturias, Brittany or Bulgaria, each with its own sound.' },
    { gl: 'Para que serve o fol da gaita?\na) para gardar aire e que o son non pare\nb) para facer as notas cos dedos\nc) para que pese máis',
      es: '¿Para qué sirve el fol de la gaita?\na) para guardar aire y que el sonido no pare\nb) para hacer las notas con los dedos\nc) para que pese más',
      en: 'What is the bag of the bagpipe for?\na) to store air so the sound does not stop\nb) to make the notes with the fingers\nc) to make it heavier' }),
  N('o_oido', { gl: 'O oído', es: 'El oído', en: 'The ear' },
    { gl: 'O son chega ao teu oído coma unha onda no aire e bate nunha pel finiña, o tímpano, que treme igual ca a pel dun tambor. Detrás hai tres ósos minúsculos, os máis pequenos do corpo, que pasan o tremor máis adentro, ata o caracol: un tubo enroscado cheo de líquido e de milleiros de peliños. Cando o líquido se move, os peliños abanean e mandan un aviso ao cerebro polo nervio. O cerebro é quen decide que iso é unha gaita, unha voz ou un can. Por iso, con moito ruído, os peliños cansan: hai que coidalos.',
      es: 'El sonido llega a tu oído como una onda en el aire y golpea una piel finita, el tímpano, que tiembla igual que la piel de un tambor. Detrás hay tres huesos minúsculos, los más pequeños del cuerpo, que pasan el temblor más adentro, hasta el caracol: un tubo enroscado lleno de líquido y de miles de pelitos. Cuando el líquido se mueve, los pelitos se balancean y mandan un aviso al cerebro por el nervio. El cerebro es quien decide que eso es una gaita, una voz o un perro. Por eso, con mucho ruido, los pelitos se cansan: hay que cuidarlos.',
      en: 'Sound reaches your ear as a wave in the air and hits a thin skin, the eardrum, which shakes just like a drum skin. Behind it are three tiny bones, the smallest in the body, that pass the shaking further in, to the cochlea: a coiled tube full of liquid and thousands of tiny hairs. When the liquid moves, the hairs sway and send a signal to the brain through the nerve. The brain is what decides that this is a bagpipe, a voice or a dog. That is why, with a lot of noise, the hairs get tired: they must be looked after.' },
    { gl: 'Os tres ósos chámanse martelo, bigornia e estribo, e o estribo mide uns 3 mm. As persoas oímos entre 20 e 20.000 Hz; os nenos e as nenas oen os sons máis agudos, que os adultos van perdendo. As células ciliadas do caracol, os "peliños", non se rexeneran: un son por riba de 85 decibelios durante horas, ou unha explosión, mátaas para sempre, e por iso os auriculares moi altos son un problema real. Ter dous oídos permite saber de onde vén o son: o cerebro compara a que oído chega antes, cunha diferenza de milésimas de segundo. O oído interno leva ademais os canles semicirculares, que non oen: son o sensor do equilibrio.',
      es: 'Los tres huesos se llaman martillo, yunque y estribo, y el estribo mide unos 3 mm. Las personas oímos entre 20 y 20.000 Hz; los niños y las niñas oyen los sonidos más agudos, que los adultos van perdiendo. Las células ciliadas del caracol, los "pelitos", no se regeneran: un sonido por encima de 85 decibelios durante horas, o una explosión, las mata para siempre, y por eso los auriculares muy altos son un problema real. Tener dos oídos permite saber de dónde viene el sonido: el cerebro compara a qué oído llega antes, con una diferencia de milésimas de segundo. El oído interno lleva además los canales semicirculares, que no oyen: son el sensor del equilibrio.',
      en: 'The three bones are the hammer, anvil and stirrup, and the stirrup is about 3 mm long. People hear between 20 and 20,000 Hz; children hear the highest sounds, which adults gradually lose. The hair cells of the cochlea do not regrow: a sound above 85 decibels for hours, or an explosion, kills them for good, which is why very loud headphones are a real problem. Having two ears lets you tell where a sound comes from: the brain compares which ear it reaches first, a difference of thousandths of a second. The inner ear also holds the semicircular canals, which do not hear: they are the sensor for balance.' },
    { gl: 'Que fai o tímpano cando chega un son?\na) treme coma a pel dun tambor\nb) pecha o oído\nc) fai o son máis forte',
      es: '¿Qué hace el tímpano cuando llega un sonido?\na) tiembla como la piel de un tambor\nb) cierra el oído\nc) hace el sonido más fuerte',
      en: 'What does the eardrum do when a sound arrives?\na) it shakes like a drum skin\nb) it closes the ear\nc) it makes the sound louder' }),
  N('a_gravacion', { gl: 'A gravación', es: 'La grabación', en: 'Recording' },
    { gl: 'Como cabe unha gaita dentro dun [[móbil|a_mensaxe]]? Cun micrófono: ten unha pel fina que treme co son, coma o tímpano, e converte cada tremor nunha corrente eléctrica pequeniña. O ordenador mide esa corrente moitísimas veces por segundo e garda os números. A canción é unha lista de números! Cando lle dás ao play, o altofalante fai o camiño ao revés: le os números, treme igual que tremeu a palleta da gaita e empurra o aire cara ao teu oído. Antes de existir isto, se querías oír música tiñas que ir onde estivese o músico.',
      es: '¿Cómo cabe una gaita dentro de un [[móvil|a_mensaxe]]? Con un micrófono: tiene una piel fina que tiembla con el sonido, como el tímpano, y convierte cada temblor en una corriente eléctrica pequeñita. El ordenador mide esa corriente muchísimas veces por segundo y guarda los números. ¡La canción es una lista de números! Cuando le das al play, el altavoz hace el camino al revés: lee los números, tiembla igual que tembló la lengüeta de la gaita y empuja el aire hacia tu oído. Antes de existir esto, si querías oír música tenías que ir donde estuviera el músico.',
      en: 'How does a bagpipe fit inside a [[phone|a_mensaxe]]? With a microphone: it has a thin skin that shakes with the sound, like the eardrum, and turns each shake into a tiny electric current. The computer measures that current many thousands of times a second and stores the numbers. The song is a list of numbers! When you press play, the speaker goes the other way: it reads the numbers, shakes just as the bagpipe reed shook and pushes the air towards your ear. Before this existed, if you wanted to hear music you had to go where the musician was.' },
    { gl: 'Un CD garda 44.100 medidas por segundo por cada canle, cada unha cun número de 16 bits: un minuto de música son uns 10 MB sen comprimir. O MP3 e os formatos de streaming quitan o que o oído non distingue e deixan a canción en 10 veces menos. A gravación empezou en 1877 co fonógrafo de Edison, que rabuñaba a vibración nun cilindro; despois viñeron o disco de vinilo, onde a agulla segue un suco ondulado, a cinta magnética e, en 1982, o CD. Hoxe unha canción viaxa polos mesmos cables e antenas ca unha mensaxe: cando "escoitas en liña", chégache un río de números que o móbil converte en son ao instante.',
      es: 'Un CD guarda 44.100 medidas por segundo por cada canal, cada una con un número de 16 bits: un minuto de música son unos 10 MB sin comprimir. El MP3 y los formatos de streaming quitan lo que el oído no distingue y dejan la canción en 10 veces menos. La grabación empezó en 1877 con el fonógrafo de Edison, que rayaba la vibración en un cilindro; después vinieron el disco de vinilo, donde la aguja sigue un surco ondulado, la cinta magnética y, en 1982, el CD. Hoy una canción viaja por los mismos cables y antenas que un mensaje: cuando "escuchas en línea", te llega un río de números que el móvil convierte en sonido al instante.',
      en: 'A CD stores 44,100 measurements per second per channel, each a 16-bit number: a minute of music is about 10 MB uncompressed. MP3 and streaming formats remove what the ear cannot tell apart and leave the song 10 times smaller. Recording began in 1877 with Edison\'s phonograph, which scratched the vibration onto a cylinder; then came the vinyl record, where the needle follows a wavy groove, magnetic tape and, in 1982, the CD. Today a song travels through the same cables and antennas as a message: when you "listen online", a river of numbers reaches you and the phone turns it into sound instantly.' },
    { gl: 'Que garda o ordenador cando grava unha canción?\na) unha lista de números\nb) un anaquiño de aire\nc) a corda da guitarra',
      es: '¿Qué guarda el ordenador cuando graba una canción?\na) una lista de números\nb) un trocito de aire\nc) la cuerda de la guitarra',
      en: 'What does the computer store when it records a song?\na) a list of numbers\nb) a little bit of air\nc) the guitar string' }),
]
const REL_MUSICA = [
  ['a_vibracion', 'ANTES_DE', 'a_gaita', 'high', { gl: 'A vibración é o que fai soar a gaita', es: 'La vibración es lo que hace sonar la gaita', en: 'Vibration is what makes the bagpipe sound' }],
  ['a_gaita', 'ANTES_DE', 'o_oido', 'high', { gl: 'O son da gaita viaxa polo aire ata o oído', es: 'El sonido de la gaita viaja por el aire hasta el oído', en: 'The bagpipe sound travels through the air to the ear' }],
  ['o_oido', 'ANTES_DE', 'a_gravacion', 'high', { gl: 'O micrófono é un oído artificial', es: 'El micrófono es un oído artificial', en: 'The microphone is an artificial ear' }],
  ['a_gravacion', 'RELACIONADO_CON', 'a_vibracion', 'medium', { gl: 'O altofalante volve converter os números en vibración', es: 'El altavoz vuelve a convertir los números en vibración', en: 'The speaker turns the numbers back into vibration' }],
  ['a_gravacion', 'RELACIONADO_CON', 'a_mensaxe', 'medium', { gl: 'Unha canción viaxa polos mesmos cables ca unha mensaxe', es: 'Una canción viaja por los mismos cables que un mensaje', en: 'A song travels the same cables as a message' }],
  ['a_vibracion', 'PERTENCE_A', 'fisica', 'medium', { gl: 'O son é física de ondas', es: 'El sonido es física de ondas', en: 'Sound is wave physics' }],
  ['a_gaita', 'PERTENCE_A', 'musica_galega', 'high', { gl: 'A gaita é o instrumento da música galega', es: 'La gaita es el instrumento de la música gallega', en: 'The bagpipe is the instrument of Galician music' }],
  ['o_oido', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'O oído é anatomía', es: 'El oído es anatomía', en: 'The ear is anatomy' }],
  ['a_gravacion', 'PERTENCE_A', 'electronica_dixital', 'medium', { gl: 'Gravar é converter son en números', es: 'Grabar es convertir sonido en números', en: 'Recording is turning sound into numbers' }],
]

const RUTAS = [
  { nodos: MUSICA, rels: REL_MUSICA, journey: { label_gl: 'De onde vén a música', label_es: 'De dónde viene la música', label_en: 'Where music comes from',
      description_gl: 'Dunha corda que treme ao oído e ao móbil: a vibración, a gaita, o oído e como cabe unha canción nunha lista de números.', description_es: 'De una cuerda que tiembla al oído y al móvil: la vibración, la gaita, el oído y cómo cabe una canción en una lista de números.', description_en: 'From a shaking string to the ear and the phone: vibration, the bagpipe, the ear and how a song fits in a list of numbers.',
      modulo: 'Ciencia', icono: '🎵' } },
]

for (const r of RUTAS) {
  const nodos = r.nodos.map(n => ({
    id: n.id, type: 'concept', status: 'draft', relevance: 'medium', difficulty: 'primary', universo: 'gaia',
    autor: 'GAIA — como funciona o mundo', centro: '',
    label_gl: n.labels.gl, label_es: n.labels.es, label_en: n.labels.en,
    text_primary_gl: n.primary.gl, text_primary_es: n.primary.es, text_primary_en: n.primary.en,
    text_secondary_gl: n.secondary.gl, text_secondary_es: n.secondary.es, text_secondary_en: n.secondary.en,
  }))
  const relacions = r.rels.map(([source, tipo, target, strength, ctx]) => ({ source, target, tipo, strength, context_gl: ctx.gl, context_es: ctx.es, context_en: ctx.en }))
  const imp = await j('POST', '/import', { nodos, relacions }, TOKEN)
  console.log('import', r.journey.label_gl, imp.status, 'creados', imp.data.creados, 'erros', imp.data.erros, 'rels', imp.data.relacionsCreadas, 'relErros', imp.data.relacionsErros)
  if (imp.data.detalle?.erros?.length) console.log('  ', JSON.stringify(imp.data.detalle.erros).slice(0, 300))
  if (imp.data.detalle?.relacionsErros?.length) console.log('  ', JSON.stringify(imp.data.detalle.relacionsErros).slice(0, 300))
}
async function porReto(id, reto) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) return console.log('GET', id, g.status)
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: '', reto_bloqueado: false, reto_puntos: 10 }
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = n.content?.primary?.[i] || ''
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = reto?.[i] || n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  if (p.status !== 200) console.log('PUT', id, p.status, p.data)
}
for (const r of RUTAS) for (const n of r.nodos) await porReto(n.id, n.reto)
console.log('retos OK')
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n.id, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'primary', type: 'educational', visibility: 'public', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
  if (res.data?.id) {
    const body = { level: 'primary', type: 'educational', status: 'published', visibility: 'public', modulo: r.journey.modulo, icono: r.journey.icono }
    for (const k of ['label_gl', 'label_es', 'label_en', 'description_gl', 'description_es', 'description_en']) body[k] = r.journey[k]
    const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', res.data.id, p.status)
  }
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas agora:', (fin.data.journeys || []).length)
