// FONTE DE VERDADE das rutas de SECUNDARIA (9ª entrega): "O voo, por dentro".
// Reutilizan os nodos da ruta "Como voa un paxaro"; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const RETOS_SEC = {
  a_pluma: { gl: 'Unha gaivota de 1 kg ten unhas 5.000 plumas, e cada pluma pesa de media 0,02 g. Canto pesan todas as plumas xuntas, en gramos, e que fracción do peso do corpo representan? Explica como os ganchiños das bárbulas manteñen pechada e tensa a lámina da pluma e que fai o paxaro cando se abre. Razoa por que o azul dunha pluma non é un pigmento: de que cor queda o po se a moes, e por que?',
             es: 'Una gaviota de 1 kg tiene unas 5.000 plumas, y cada pluma pesa de media 0,02 g. ¿Cuánto pesan todas las plumas juntas, en gramos, y qué fracción del peso del cuerpo representan? Explica cómo los ganchitos de las bárbulas mantienen cerrada y tensa la lámina de la pluma y qué hace el pájaro cuando se abre. Razona por qué el azul de una pluma no es un pigmento: ¿de qué color queda el polvo si la mueles, y por qué?',
             en: 'A 1 kg gull has about 5,000 feathers, and each feather weighs 0.02 g on average. How much do all the feathers weigh together, in grams, and what fraction of the body weight is that? Explain how the hooks on the barbules keep the vane of the feather closed and taut, and what the bird does when it comes apart. Reason out why the blue of a feather is not a pigment: what colour is the powder if you grind it, and why?' },
  as_as: { gl: 'A carga alar é o peso dividido pola superficie das ás. Unha pardela pesa 0,9 kg e ten 0,15 m² de á; un pato pesa 1,2 kg e ten 0,10 m². Calcula a carga alar de cada un en kg/m² e di cal dos dous plana mellor e por que. Explica a sustentación coa terceira lei de Newton (que lle fai a á ao aire e que lle fai o aire á á) e que fai a álula cando o paxaro voa amodo.',
           es: 'La carga alar es el peso dividido por la superficie de las alas. Una pardela pesa 0,9 kg y tiene 0,15 m² de ala; un pato pesa 1,2 kg y tiene 0,10 m². Calcula la carga alar de cada uno en kg/m² y di cuál de los dos planea mejor y por qué. Explica la sustentación con la tercera ley de Newton (qué le hace el ala al aire y qué le hace el aire al ala) y qué hace el álula cuando el pájaro vuela despacio.',
           en: 'Wing loading is weight divided by wing area. A shearwater weighs 0.9 kg and has 0.15 m² of wing; a duck weighs 1.2 kg and has 0.10 m². Work out the wing loading of each in kg/m² and say which of the two glides better and why. Explain lift using Newton\'s third law (what the wing does to the air and what the air does to the wing) and what the alula does when the bird flies slowly.' },
  o_voo: { gl: 'Un pombo bate as ás 6 veces por segundo. Cantas batidas dá nun voo de 20 minutos? O corazón dun colibrí en voo vai a 1.000 latexos por minuto: cantos latexos dá nunha hora? Explica por que a respiración dos paxaros, cos sacos aéreos, é máis eficiente ca a nosa (en que dirección pasa o aire polos pulmóns?) e por que os ósos dun paxaro son ocos pero non fráxiles.',
           es: 'Una paloma bate las alas 6 veces por segundo. ¿Cuántos batidos da en un vuelo de 20 minutos? El corazón de un colibrí en vuelo va a 1.000 latidos por minuto: ¿cuántos latidos da en una hora? Explica por qué la respiración de los pájaros, con los sacos aéreos, es más eficiente que la nuestra (¿en qué dirección pasa el aire por los pulmones?) y por qué los huesos de un pájaro son huecos pero no frágiles.',
           en: 'A pigeon flaps its wings 6 times a second. How many flaps does it make in a 20-minute flight? A hummingbird\'s heart in flight runs at 1,000 beats a minute: how many beats does it make in an hour? Explain why bird breathing, with its air sacs, is more efficient than ours (which way does the air pass through the lungs?) and why a bird\'s bones are hollow yet not fragile.' },
  a_migracion: { gl: 'Unha andoriña percorre 10.000 km ata a África subsahariana en 40 días. Cantos quilómetros fai de media cada día? Se voa a 40 km/h, cantas horas voa ao día? Explica os tres compases que usa para orientarse (Sol, estrelas e campo magnético) e como aprende ou corrixe cada un, e razoa por que o cambio climático, ao adiantar a primavera, pode desaxustar a chegada das andoriñas dos insectos que comen.',
                 es: 'Una golondrina recorre 10.000 km hasta el África subsahariana en 40 días. ¿Cuántos kilómetros hace de media cada día? Si vuela a 40 km/h, ¿cuántas horas vuela al día? Explica las tres brújulas que usa para orientarse (Sol, estrellas y campo magnético) y cómo aprende o corrige cada una, y razona por qué el cambio climático, al adelantar la primavera, puede desajustar la llegada de las golondrinas de los insectos que comen.',
                 en: 'A swallow covers 10,000 km to sub-Saharan Africa in 40 days. How many kilometres does it fly on average each day? If it flies at 40 km/h, how many hours does it fly per day? Explain the three compasses it uses to find its way (Sun, stars and magnetic field) and how it learns or corrects each one, and reason out why climate change, by bringing spring forward, can put the swallows\' arrival out of step with the insects they eat.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  a_pluma: "5.000 × 0,02 g = 100 g; 100 / 1.000 = 1/10 (10 %). Concepto: os ganchiños das bárbulas enganchan coa barba veciña e pechan a lámina; o paxaro alísaa co bico para volver enganchalos. O azul é cor estrutural (a queratina esponxosa dispersa a luz azul); moída, o po queda pardo.",
  as_as: "Pardela: 0,9 / 0,15 = 6 kg/m². Pato: 1,2 / 0,10 = 12 kg/m². Plana mellor a pardela (carga alar baixa). Concepto: a á desvía aire cara abaixo e, pola terceira lei de Newton, o aire empurra a á cara arriba coa mesma forza; a álula ábrese a baixa velocidade para manter o fluxo pegado e evitar a perda.",
  o_voo: "6 × 60 × 20 = 7.200 batidas. 1.000 × 60 = 60.000 latexos nunha hora. Concepto: os sacos aéreos fan pasar o aire polos pulmóns nunha soa dirección, ao inspirar e ao expirar (ciclo de dúas respiracións), máis eficiente ca o noso fondo de saco; os ósos pneumatizados levan tabiques internos que os reforzan coma vigas.",
  a_migracion: "10.000 / 40 = 250 km ao día. 250 / 40 = 6,25 horas de voo ao día. Concepto: Sol corrixido polo reloxo interno, padrón de estrelas arredor da Polar aprendido no niño, campo magnético (criptocromos da retina); o cambio climático adianta as datas e desaxusta os paxaros dos insectos dos que dependen.",
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
  { nodos: ['a_pluma', 'as_as', 'o_voo', 'a_migracion'],
    journey: { label_gl: 'O voo, por dentro', label_es: 'El vuelo, por dentro', label_en: 'Flight, from the inside',
      description_gl: 'Os gramos das plumas, a carga alar dunha pardela e dun pato, as batidas dun pombo e os latexos dun colibrí, os quilómetros diarios dunha andoriña: o voo con números.', description_es: 'Los gramos de las plumas, la carga alar de una pardela y de un pato, los batidos de una paloma y los latidos de un colibrí, los kilómetros diarios de una golondrina: el vuelo con números.', description_en: 'The grams of feathers, the wing loading of a shearwater and a duck, a pigeon\'s flaps and a hummingbird\'s heartbeats, a swallow\'s daily kilometres: flight with numbers.',
      modulo: 'Natureza', icono: '🐦' } },
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
