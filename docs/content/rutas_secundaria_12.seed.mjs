// FONTE DE VERDADE das rutas de SECUNDARIA (12ª entrega): "O reloxo, por dentro".
// Reutilizan os nodos da ruta "Como funciona un reloxo"; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  a_sombra: { gl: 'A Terra xira 360° en 24 horas. Cantos graos xira nunha hora e cantos minutos tarda en xirar un grao? Un pau vertical de 1 m proxecta, ao mediodía solar, unha sombra de 0,35 m en xuño e de 2,5 m en decembro: cantas veces máis longa é a sombra de inverno? Explica cara a onde apunta a sombra máis curta do día e por que en Galicia o mediodía solar non é ás 12, senón arredor das 13:30 ou das 14:30.',
              es: 'La Tierra gira 360° en 24 horas. ¿Cuántos grados gira en una hora y cuántos minutos tarda en girar un grado? Un palo vertical de 1 m proyecta, al mediodía solar, una sombra de 0,35 m en junio y de 2,5 m en diciembre: ¿cuántas veces más larga es la sombra de invierno? Explica hacia dónde apunta la sombra más corta del día y por qué en Galicia el mediodía solar no es a las 12, sino alrededor de las 13:30 o las 14:30.',
              en: 'The Earth turns 360° in 24 hours. How many degrees does it turn in one hour, and how many minutes does it take to turn one degree? A vertical 1 m stick casts, at solar noon, a shadow of 0.35 m in June and 2.5 m in December: how many times longer is the winter shadow? Explain where the shortest shadow of the day points and why in Galicia solar noon is not at 12 but around 13:30 or 14:30.' },
  o_pendulo: { gl: 'O período dun péndulo vai coa raíz cadrada da súa lonxitude. Se un péndulo de 1 m tarda 2 s en ir e volver, canto tarda un de 4 m? E un de 0,25 m? Un reloxo de campanario atrasa 2 s cada día: cantos segundos atrasa nun ano de 365 días, e cantos minutos son? Explica que fai o escape en cada vaivén e por que un péndulo de ferro se atrasa nun día de calor.',
               es: 'El período de un péndulo va con la raíz cuadrada de su longitud. Si un péndulo de 1 m tarda 2 s en ir y volver, ¿cuánto tarda uno de 4 m? ¿Y uno de 0,25 m? Un reloj de campanario atrasa 2 s cada día: ¿cuántos segundos atrasa en un año de 365 días, y cuántos minutos son? Explica qué hace el escape en cada vaivén y por qué un péndulo de hierro se atrasa en un día de calor.',
               en: 'The period of a pendulum goes with the square root of its length. If a 1 m pendulum takes 2 s to go and come back, how long does a 4 m one take? And a 0.25 m one? A bell-tower clock loses 2 s every day: how many seconds does it lose in a 365-day year, and how many minutes is that? Explain what the escapement does on each swing and why an iron pendulum runs slow on a hot day.' },
  o_cuarzo: { gl: 'O cristal de cuarzo dun reloxo de pulso vibra 32.768 veces por segundo. Cantas vibracións fai nun minuto e cantas nunha hora? Un reloxo de cuarzo atrasa 15 s ao mes: cantos segundos e cantos minutos atrasa nun ano de 12 meses? Explica por que se elixiu xusto a cifra 32.768 e que fai con ela o contador do chip, e que é o efecto piezoeléctrico que mantén o cristal vibrando.',
              es: 'El cristal de cuarzo de un reloj de pulsera vibra 32.768 veces por segundo. ¿Cuántas vibraciones hace en un minuto y cuántas en una hora? Un reloj de cuarzo atrasa 15 s al mes: ¿cuántos segundos y cuántos minutos atrasa en un año de 12 meses? Explica por qué se eligió justo la cifra 32.768 y qué hace con ella el contador del chip, y qué es el efecto piezoeléctrico que mantiene el cristal vibrando.',
              en: 'The quartz crystal in a wristwatch vibrates 32,768 times per second. How many vibrations does it make in a minute, and how many in an hour? A quartz watch loses 15 s a month: how many seconds and how many minutes does it lose in a 12-month year? Explain why exactly the number 32,768 was chosen and what the counter in the chip does with it, and what the piezoelectric effect that keeps the crystal vibrating is.' },
  o_fuso_horario: { gl: 'A Terra xira 360° en 24 horas: cada fuso horario teórico ten 15°. A Coruña está a uns 8,4° de lonxitude oeste e Tokio a uns 139,7° leste. Cantos graos de lonxitude os separan? Cantas horas de diferenza solar son (graos entre 15)? E cantos minutos, a 4 minutos por grao? Explica por que España vai co fuso de Berlín en vez do de Lisboa e que efecto ten iso no solpor galego de xuño.',
                    es: 'La Tierra gira 360° en 24 horas: cada huso horario teórico tiene 15°. A Coruña está a unos 8,4° de longitud oeste y Tokio a unos 139,7° este. ¿Cuántos grados de longitud los separan? ¿Cuántas horas de diferencia solar son (grados entre 15)? ¿Y cuántos minutos, a 4 minutos por grado? Explica por qué España va con el huso de Berlín en vez del de Lisboa y qué efecto tiene eso en la puesta de sol gallega de junio.',
                    en: 'The Earth turns 360° in 24 hours: each theoretical time zone spans 15°. A Coruña lies at about 8.4° longitude west and Tokyo at about 139.7° east. How many degrees of longitude separate them? How many hours of solar difference is that (degrees divided by 15)? And how many minutes, at 4 minutes per degree? Explain why Spain keeps the Berlin time zone instead of the Lisbon one and what effect that has on the Galician sunset in June.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  a_sombra: "360° / 24 h = 15° por hora. 60 min / 15° = 4 minutos por grao (equivalente: 1.440 min / 360°). Sombra: 2,5 / 0,35 ≈ 7,1 veces máis longa (acéptase entre 7 e 7,2; «unhas 7 veces» vale). Crédito parcial se dá os 15°/h pero non os 4 min/°, ou se divide ao revés (0,14) pero recoñece a proporción. Concepto: a sombra máis curta é a do mediodía solar, cando o Sol está máis alto, e apunta xusto ao norte. En Galicia o mediodía solar non é ás 12 porque a hora oficial vai adiantada (España vai co fuso de Berlín e no verán súmase outra hora): o Sol pasa polo alto arredor das 13:30 en inverno e das 14:30 en verán; a ecuación do tempo engade ata un cuarto de hora de desvío.",
  o_pendulo: "4 m: √4 = 2, así que 2 s × 2 = 4 s. 0,25 m: √0,25 = 0,5, así que 2 s × 0,5 = 1 s. Atraso: 2 s × 365 = 730 s ao ano; 730 / 60 ≈ 12,2 minutos (12 min e 10 s; acéptase «uns 12 minutos»). Crédito parcial se dá 8 s e 0,5 s (proporción directa, sen raíz) pero acerta o atraso anual. Concepto: o escape (de áncora) deixa avanzar a roda dentada só un dente por vaivén (tic, tac) e devólvelle ao péndulo un pequeno empurrón coa enerxía do peso que colga ou do resorte. Coa calor a vara dilata, o péndulo alóngase, o período crece e o reloxo atrásase; por iso se fixeron péndulos con dous metais que se compensan.",
  o_cuarzo: "32.768 × 60 = 1.966.080 vibracións por minuto; × 60 = 117.964.800 por hora (32.768 × 3.600). Atraso: 15 s × 12 = 180 s ao ano = 3 minutos. Crédito parcial se a cifra da hora sae mal por un erro de multiplicación pero o método é correcto, ou se dá só os 180 s sen pasalos a minutos. Concepto: 32.768 é 2 elevado a 15; o contador do chip divide por 2 quince veces seguidas e sae exactamente un pulso por segundo, e dividir por 2 é o máis doado para un circuíto dixital. Piezoeléctrico: se comprimes o cuarzo dá unha pequena tensión eléctrica e, se lle aplicas tensión, defórmase; o circuíto aproveita iso para mantelo vibrando na súa frecuencia natural, que depende só da forma e do tamaño da lámina (tallada coma un diapasón).",
  o_fuso_horario: "Un está ao oeste e o outro ao leste de Greenwich, así que os graos súmanse: 8,4 + 139,7 = 148,1°. Horas: 148,1 / 15 ≈ 9,87 h (acéptase entre 9,8 e 10; «case 10 horas» vale). Minutos: 148,1 × 4 ≈ 592 min, uns 9 h 52 min. Crédito parcial se resta (131,3°, ≈ 8,75 h) pero divide ben entre 15 e por 4. Concepto: polo mapa Galicia tería a hora de Londres e Lisboa, pero en 1940 o goberno de Franco adiantou os reloxos unha hora para ir coa hora de Berlín, como a Alemaña nazi, e nunca se desfixo: España vai co fuso da Europa central. Con esa hora adiantada e mais a de verán, en xuño o Sol galego pasa polo alto ás 14:30 e ponse pasadas as 22:00: o solpor máis tardío da España peninsular.",
}
for (const [id, reto] of Object.entries(RETOS_SEC)) {
  const g = await j('GET', '/nodo/' + encodeURIComponent(id)); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10, solucion_secondary: SOLUCIONS[id] || '' }
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = n.content?.primary?.[i] || ''
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = reto[i] || n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + encodeURIComponent(id), body, TOKEN)
  console.log('reto secundaria', id, p.status)
}
const RUTAS = [
  { nodos: ['a_sombra', 'o_pendulo', 'o_cuarzo', 'o_fuso_horario'],
    journey: { label_gl: 'O reloxo, por dentro', label_es: 'El reloj, por dentro', label_en: 'The clock, from the inside',
      description_gl: 'Graos por hora e sombras de inverno, a raíz cadrada do péndulo, as 32.768 vibracións do cuarzo e as horas entre A Coruña e Tokio: o reloxo con números.', description_es: 'Grados por hora y sombras de invierno, la raíz cuadrada del péndulo, las 32.768 vibraciones del cuarzo y las horas entre A Coruña y Tokio: el reloj con números.', description_en: 'Degrees per hour and winter shadows, the square root of the pendulum, the 32,768 vibrations of quartz and the hours between A Coruña and Tokyo: the clock with numbers.',
      modulo: 'Ciencia', icono: '⏰' } },
]
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'secondary', type: 'educational', visibility: 'public', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
  if (res.data?.id) {
    const body = { level: 'secondary', type: 'educational', status: 'published', visibility: 'public', modulo: r.journey.modulo, icono: r.journey.icono }
    for (const k of ['label_gl', 'label_es', 'label_en', 'description_gl', 'description_es', 'description_en']) body[k] = r.journey[k]
    const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', res.data.id, p.status)
  }
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas:', (fin.data.journeys || []).length)
