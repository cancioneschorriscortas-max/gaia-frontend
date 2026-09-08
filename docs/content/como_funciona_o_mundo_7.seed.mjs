// FONTE DE VERDADE do contido "como funciona o mundo" (7ª entrega): A viaxe dunha carta 📮.
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

// ───────────────────────── RUTA 16: A VIAXE DUNHA CARTA ─────────────────────────
const CARTA = [
  N('o_sobre', { gl: 'O sobre e o selo', es: 'El sobre y el sello', en: 'The envelope and the stamp' },
    { gl: 'Escribes unha carta á avoa e métela nun sobre. Diante vai o enderezo: o nome, a rúa, o número, o código postal e a vila. Ese código de cinco cifras é o máis importante: as máquinas de Correos len primeiro os números, non o nome. Arriba á dereita pegas o selo: é o billete da carta. Pagas antes de que viaxe, e o selo di "esta carta xa ten a viaxe pagada". Sen selo, a carta non sae. Detrás pos o teu enderezo, por se non atopan a avoa e teñen que devolvela.',
      es: 'Escribes una carta a la abuela y la metes en un sobre. Delante va la dirección: el nombre, la calle, el número, el código postal y el pueblo. Ese código de cinco cifras es lo más importante: las máquinas de Correos leen primero los números, no el nombre. Arriba a la derecha pegas el sello: es el billete de la carta. Pagas antes de que viaje, y el sello dice "esta carta ya tiene el viaje pagado". Sin sello, la carta no sale. Detrás pones tu dirección, por si no encuentran a la abuela y tienen que devolverla.',
      en: 'You write a letter to grandma and put it in an envelope. On the front goes the address: the name, the street, the number, the postcode and the town. That five-digit code is the most important part: the post office machines read the numbers first, not the name. Top right you stick the stamp: it is the letter\'s ticket. You pay before it travels, and the stamp says "this letter\'s journey is already paid". Without a stamp, the letter does not leave. On the back you write your own address, in case they cannot find grandma and have to send it back.' },
    { gl: 'O primeiro selo do mundo foi o Penny Black, en Gran Bretaña en 1840: antes pagaba quen recibía a carta, e moitos rexeitábana. En España os selos chegaron en 1850. O código postal español ten cinco cifras: as dúas primeiras son a provincia (15 A Coruña, 27 Lugo, 32 Ourense, 36 Pontevedra) e as tres seguintes o reparto dentro dela; o 15001 é o centro da Coruña. Escribilo ben aforra un día de viaxe. Hoxe moitos selos son adhesivos e teñen letras (A, B) en vez de prezo, para que sigan valendo cando sobe a tarifa. Os coleccionistas de selos chámanse filatelistas, e algúns selos raros valen millóns.',
      es: 'El primer sello del mundo fue el Penny Black, en Gran Bretaña en 1840: antes pagaba quien recibía la carta, y muchos la rechazaban. En España los sellos llegaron en 1850. El código postal español tiene cinco cifras: las dos primeras son la provincia (15 A Coruña, 27 Lugo, 32 Ourense, 36 Pontevedra) y las tres siguientes el reparto dentro de ella; el 15001 es el centro de A Coruña. Escribirlo bien ahorra un día de viaje. Hoy muchos sellos son adhesivos y tienen letras (A, B) en vez de precio, para que sigan valiendo cuando sube la tarifa. Los coleccionistas de sellos se llaman filatelistas, y algunos sellos raros valen millones.',
      en: 'The first stamp in the world was the Penny Black, in Great Britain in 1840: before that the receiver paid, and many refused the letter. Stamps reached Spain in 1850. The Spanish postcode has five digits: the first two are the province (15 A Coruña, 27 Lugo, 32 Ourense, 36 Pontevedra) and the next three the delivery area within it; 15001 is the centre of A Coruña. Writing it correctly saves a day of travel. Today many stamps are self-adhesive and carry letters (A, B) instead of a price, so they stay valid when the rate goes up. Stamp collectors are called philatelists, and some rare stamps are worth millions.' },
    { gl: 'Para que serve o selo dunha carta?\na) para pagar a viaxe antes de que saia\nb) para que a carta pese máis\nc) para pechar o sobre',
      es: '¿Para qué sirve el sello de una carta?\na) para pagar el viaje antes de que salga\nb) para que la carta pese más\nc) para cerrar el sobre',
      en: 'What is the stamp on a letter for?\na) to pay for the journey before it leaves\nb) to make the letter heavier\nc) to seal the envelope' }),
  N('a_caixa_de_correos', { gl: 'A caixa de correos', es: 'El buzón', en: 'The post box' },
    { gl: 'Botas a carta pola boca da caixa de correos amarela da rúa. Alí xunta con outras cartas: postais, facturas, cartas de amor. Cada día, á hora que pon na propia caixa, vén un empregado de Correos coa chave, ábrea, garda todo nunha saca e lévaa na furgoneta á oficina. A carta xa non é túa: agora é de Correos, e Correos ten a obriga de levala. As caixas de correos son amarelas en España desde hai máis de cen anos, para velas de lonxe.',
      es: 'Echas la carta por la boca del buzón amarillo de la calle. Allí se junta con otras cartas: postales, facturas, cartas de amor. Cada día, a la hora que pone en el propio buzón, viene un empleado de Correos con la llave, lo abre, guarda todo en una saca y la lleva en la furgoneta a la oficina. La carta ya no es tuya: ahora es de Correos, y Correos tiene la obligación de llevarla. Los buzones son amarillos en España desde hace más de cien años, para verlos de lejos.',
      en: 'You drop the letter into the mouth of the yellow post box in the street. There it joins other letters: postcards, bills, love letters. Every day, at the time written on the box itself, a postal worker comes with the key, opens it, puts everything in a sack and takes it in the van to the office. The letter is no longer yours: now it belongs to the post office, which has the duty to carry it. Post boxes have been yellow in Spain for over a hundred years, so they can be seen from afar.' },
    { gl: 'Correos naceu como servizo público en 1716, cando Filipe V pasou o correo de mans privadas ao Estado; ata entón a Casa de Tassis levaba as cartas dos reis por toda Europa. Correos ten a obriga do "servizo postal universal": levar unha carta a calquera enderezo de España ao mesmo prezo, estea na Coruña ou nunha aldea de Ourense de tres casas. En Galicia iso é un reto: hai máis de 30.000 núcleos de poboación, a metade dos de toda España. Cada caixa de correos ten un número e unha hora de recollida; cando se recolle, a saca leva unha etiqueta co lugar e a hora, así a carta xa ten historia desde o primeiro minuto.',
      es: 'Correos nació como servicio público en 1716, cuando Felipe V pasó el correo de manos privadas al Estado; hasta entonces la Casa de Tassis llevaba las cartas de los reyes por toda Europa. Correos tiene la obligación del "servicio postal universal": llevar una carta a cualquier dirección de España al mismo precio, esté en A Coruña o en una aldea de Ourense de tres casas. En Galicia eso es un reto: hay más de 30.000 núcleos de población, la mitad de los de toda España. Cada buzón tiene un número y una hora de recogida; cuando se recoge, la saca lleva una etiqueta con el lugar y la hora, así la carta ya tiene historia desde el primer minuto.',
      en: 'The Spanish post became a public service in 1716, when Philip V moved the mail from private hands to the State; until then the House of Tassis carried the kings\' letters across Europe. The post office has a "universal postal service" duty: to carry a letter to any address in Spain at the same price, whether in A Coruña or in a three-house hamlet in Ourense. In Galicia that is a challenge: there are over 30,000 population centres, half of all those in Spain. Every post box has a number and a collection time; when it is emptied, the sack gets a label with the place and the time, so the letter already has a history from the first minute.' },
    { gl: 'Que pasa coa carta cando a botas na caixa de correos?\na) pasa a ser responsabilidade de Correos, que ten que levala\nb) queda alí ata que a avoa a vén buscar\nc) desaparece',
      es: '¿Qué pasa con la carta cuando la echas al buzón?\na) pasa a ser responsabilidad de Correos, que tiene que llevarla\nb) se queda allí hasta que la abuela la viene a buscar\nc) desaparece',
      en: 'What happens to the letter when you drop it in the post box?\na) it becomes the post office\'s responsibility, which must carry it\nb) it stays there until grandma comes to fetch it\nc) it disappears' }),
  N('o_centro_de_clasificacion', { gl: 'O centro de clasificación', es: 'El centro de clasificación', en: 'The sorting centre' },
    { gl: 'De noite, a saca chega a unha nave enorme chea de cintas que se moven: o centro de clasificación. As cartas pasan por unha máquina cunha cámara que le o código postal e imprime un código de barras. Segundo os números, unha comporta manda cada carta a un caixón: este vai para Lugo, este para Vigo, este para Canarias. Todo iso pasa mentres ti dormes. Ao amencer, camións e avións levan os caixóns a cada provincia, e alí outra máquina volve repartir por rúas. A carta da avoa xa está a unhas horas da súa casa.',
      es: 'De noche, la saca llega a una nave enorme llena de cintas que se mueven: el centro de clasificación. Las cartas pasan por una máquina con una cámara que lee el código postal e imprime un código de barras. Según los números, una compuerta manda cada carta a un cajón: esta va para Lugo, esta para Vigo, esta para Canarias. Todo eso pasa mientras tú duermes. Al amanecer, camiones y aviones llevan los cajones a cada provincia, y allí otra máquina vuelve a repartir por calles. La carta de la abuela ya está a unas horas de su casa.',
      en: 'At night, the sack reaches a huge warehouse full of moving belts: the sorting centre. Letters pass through a machine with a camera that reads the postcode and prints a barcode. According to the numbers, a gate sends each letter to a tray: this one to Lugo, this one to Vigo, this one to the Canary Islands. All of that happens while you sleep. At dawn, lorries and planes take the trays to each province, and there another machine sorts again by street. Grandma\'s letter is now a few hours from her house.' },
    { gl: 'As máquinas de clasificación len a letra manuscrita con recoñecemento óptico de caracteres (OCR): recoñecen o código postal no 90 % das cartas; as que non, vainas mirando unha persoa nunha pantalla e teclea o código. Unha máquina moderna clasifica arredor de 40.000 cartas por hora. Cada carta recibe un código de barras fluorescente que a acompaña ata o carteiro, e por iso se pode seguir un envío certificado polo móbil. Galicia ten centro de tratamento automatizado en Santiago; desde alí sae o correo para as catro provincias. O groso do que se move hoxe xa non son cartas senón paquetes de compras en liña: o correo cambiou de forma, non de idea.',
      es: 'Las máquinas de clasificación leen la letra manuscrita con reconocimiento óptico de caracteres (OCR): reconocen el código postal en el 90 % de las cartas; las que no, las va mirando una persona en una pantalla y teclea el código. Una máquina moderna clasifica alrededor de 40.000 cartas por hora. Cada carta recibe un código de barras fluorescente que la acompaña hasta el cartero, y por eso se puede seguir un envío certificado por el móvil. Galicia tiene centro de tratamiento automatizado en Santiago; desde allí sale el correo para las cuatro provincias. El grueso de lo que se mueve hoy ya no son cartas sino paquetes de compras en línea: el correo cambió de forma, no de idea.',
      en: 'Sorting machines read handwriting with optical character recognition (OCR): they recognise the postcode on 90% of letters; the rest are shown to a person on a screen who types the code. A modern machine sorts around 40,000 letters an hour. Each letter gets a fluorescent barcode that follows it to the postal worker, which is why a registered item can be tracked from a phone. Galicia has its automated processing centre in Santiago; from there the mail leaves for the four provinces. Most of what moves today is no longer letters but online-shopping parcels: the post changed shape, not idea.' },
    { gl: 'Que le a máquina do centro de clasificación para saber a onde vai a carta?\na) o código postal\nb) o nome da avoa\nc) a cor do sobre',
      es: '¿Qué lee la máquina del centro de clasificación para saber a dónde va la carta?\na) el código postal\nb) el nombre de la abuela\nc) el color del sobre',
      en: 'What does the sorting machine read to know where the letter goes?\na) the postcode\nb) grandma\'s name\nc) the colour of the envelope' }),
  N('o_carteiro', { gl: 'A carteira, o carteiro', es: 'La cartera, el cartero', en: 'The postal worker' },
    { gl: 'Pola mañá, na oficina da vila, a carteira ordena as súas cartas na orde exacta do seu percorrido: primeiro a rúa da igrexa, logo a praza, logo o camiño da avoa. Sae coa bolsa ao lombo, en bici ou na furgoneta amarela, e vai casa por casa. Coñece a todo o mundo: sabe quen está de viaxe e quen agarda unha carta. Mete o sobre pola ranura e segue. Dous ou tres días despois de que a escribiches, a avoa abre a carta. Pola [[mensaxe do móbil|a_mensaxe]] chegaría en segundos, pero unha carta pódese gardar nunha caixa toda a vida.',
      es: 'Por la mañana, en la oficina del pueblo, la cartera ordena sus cartas en el orden exacto de su recorrido: primero la calle de la iglesia, luego la plaza, luego el camino de la abuela. Sale con la bolsa al hombro, en bici o en la furgoneta amarilla, y va casa por casa. Conoce a todo el mundo: sabe quién está de viaje y quién espera una carta. Mete el sobre por la ranura y sigue. Dos o tres días después de que la escribiste, la abuela abre la carta. Por el [[mensaje del móvil|a_mensaxe]] llegaría en segundos, pero una carta se puede guardar en una caja toda la vida.',
      en: 'In the morning, at the village office, the postwoman sorts her letters in the exact order of her round: first Church Street, then the square, then grandma\'s lane. She sets off with the bag on her shoulder, by bike or in the yellow van, and goes house by house. She knows everyone: who is away and who is waiting for a letter. She slips the envelope through the slot and moves on. Two or three days after you wrote it, grandma opens the letter. By [[phone message|a_mensaxe]] it would arrive in seconds, but a letter can be kept in a box for a lifetime.' },
    { gl: 'En Galicia o reparto rural é un oficio á parte: as carteiras e carteiros rurais percorren decenas de quilómetros ao día por aldeas dispersas, e en moitas casas son a única visita diaria. Por iso, en sitios sen banco nin farmacia, Correos leva tamén cartos, medicamentos ou paquetes, e avisa se algo vai mal. O percorrido está pensado para non repetir rúa e afórranse pasos con "cartas ordenadas por secuencia" que a máquina xa deixa na orde do camiño. Un envío ordinario dentro de España tarda 2–3 días laborables; un certificado leva sinatura e seguimento. O oficio vén de lonxe: os correos a cabalo do Camiño Real tardaban semanas no que hoxe son dous días.',
      es: 'En Galicia el reparto rural es un oficio aparte: las carteras y carteros rurales recorren decenas de kilómetros al día por aldeas dispersas, y en muchas casas son la única visita diaria. Por eso, en sitios sin banco ni farmacia, Correos lleva también dinero, medicamentos o paquetes, y avisa si algo va mal. El recorrido está pensado para no repetir calle y se ahorran pasos con "cartas ordenadas por secuencia" que la máquina ya deja en el orden del camino. Un envío ordinario dentro de España tarda 2–3 días laborables; un certificado lleva firma y seguimiento. El oficio viene de lejos: los correos a caballo del Camino Real tardaban semanas en lo que hoy son dos días.',
      en: 'In Galicia rural delivery is a trade of its own: rural postal workers cover dozens of kilometres a day through scattered hamlets, and in many houses they are the only daily visitor. That is why, in places with no bank or pharmacy, the post also brings cash, medicines or parcels, and raises the alarm if something is wrong. The round is planned so no street is repeated, and steps are saved with "sequence-sorted" letters the machine already leaves in walking order. An ordinary item within Spain takes 2–3 working days; a registered one carries a signature and tracking. The trade goes far back: the horseback couriers of the Royal Road took weeks for what is now two days.' },
    { gl: 'Por que a carteira ordena as cartas antes de saír?\na) para seguir o seu percorrido sen volver atrás\nb) porque lle gusta ler os nomes\nc) para que pesen menos',
      es: '¿Por qué la cartera ordena las cartas antes de salir?\na) para seguir su recorrido sin volver atrás\nb) porque le gusta leer los nombres\nc) para que pesen menos',
      en: 'Why does the postwoman sort her letters before leaving?\na) to follow her round without going back\nb) because she likes reading the names\nc) so they weigh less' }),
]
const REL_CARTA = [
  ['o_sobre', 'ANTES_DE', 'a_caixa_de_correos', 'high', { gl: 'O sobre con selo vai á caixa de correos', es: 'El sobre con sello va al buzón', en: 'The stamped envelope goes to the post box' }],
  ['a_caixa_de_correos', 'ANTES_DE', 'o_centro_de_clasificacion', 'high', { gl: 'Da caixa de correos ao centro de clasificación', es: 'Del buzón al centro de clasificación', en: 'From the post box to the sorting centre' }],
  ['o_centro_de_clasificacion', 'ANTES_DE', 'o_carteiro', 'high', { gl: 'Do centro de clasificación ao reparto', es: 'Del centro de clasificación al reparto', en: 'From the sorting centre to delivery' }],
  ['o_carteiro', 'RELACIONADO_CON', 'a_mensaxe', 'medium', { gl: 'A carta tarda días; a mensaxe, segundos', es: 'La carta tarda días; el mensaje, segundos', en: 'A letter takes days; a message, seconds' }],
  ['o_centro_de_clasificacion', 'RELACIONADO_CON', 'o_sobre', 'medium', { gl: 'A máquina le o código postal do sobre', es: 'La máquina lee el código postal del sobre', en: 'The machine reads the postcode on the envelope' }],
  ['o_sobre', 'PERTENCE_A', 'humanidade', 'medium', { gl: 'Escribir cartas é comunicación humana', es: 'Escribir cartas es comunicación humana', en: 'Writing letters is human communication' }],
  ['a_caixa_de_correos', 'PERTENCE_A', 'humanidade', 'low', { gl: 'O correo é un servizo público', es: 'El correo es un servicio público', en: 'The post is a public service' }],
  ['o_centro_de_clasificacion', 'PERTENCE_A', 'tecnoloxia_maquinas', 'medium', { gl: 'A clasificación é unha máquina que le', es: 'La clasificación es una máquina que lee', en: 'Sorting is a machine that reads' }],
  ['o_carteiro', 'PERTENCE_A', 'oficios', 'high', { gl: 'Carteira e carteiro son un oficio', es: 'Cartera y cartero son un oficio', en: 'Postal worker is a trade' }],
]

const RUTAS = [
  { nodos: CARTA, rels: REL_CARTA, journey: { label_gl: 'A viaxe dunha carta', label_es: 'El viaje de una carta', label_en: 'The journey of a letter',
      description_gl: 'Do selo á man da avoa: o sobre, a caixa de correos, o centro que le códigos de noite e a carteira que coñece a todos.', description_es: 'Del sello a la mano de la abuela: el sobre, el buzón, el centro que lee códigos de noche y la cartera que conoce a todos.', description_en: 'From the stamp to grandma\'s hand: the envelope, the post box, the centre that reads codes at night and the postwoman who knows everyone.',
      modulo: 'Oficios', icono: '📮' } },
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
