// FONTE DE VERDADE das rutas de SECUNDARIA (16ª entrega): "O mapa, por dentro".
// Reutilizan os nodos da ruta "Como se fai un mapa"; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  a_escala: { gl: 'Nun mapa topográfico a escala 1:25.000, entre a túa casa e a escola hai 6 cm. Cantos metros hai na realidade? Un camiño de 3 km, cantos centímetros mide nese mapa? Se as curvas de nivel van cada 10 m e entre dous puntos cruzas 8 curvas, cantos metros de desnivel hai? Explica que conserva e que deforma a proxección de Mercator, por que Groenlandia parece tan grande coma África, e que foi a Carta Xeométrica de Galicia de Domingo Fontán.',
              es: 'En un mapa topográfico a escala 1:25.000, entre tu casa y la escuela hay 6 cm. ¿Cuántos metros hay en la realidad? Un camino de 3 km, ¿cuántos centímetros mide en ese mapa? Si las curvas de nivel van cada 10 m y entre dos puntos cruzas 8 curvas, ¿cuántos metros de desnivel hay? Explica qué conserva y qué deforma la proyección de Mercator, por qué Groenlandia parece tan grande como África, y qué fue la Carta Geométrica de Galicia de Domingo Fontán.',
              en: 'On a topographic map at 1:25,000, there are 6 cm between your house and the school. How many metres is that in real life? A 3 km path: how many centimetres does it measure on that map? If the contour lines are every 10 m and you cross 8 lines between two points, how many metres of height difference are there? Explain what the Mercator projection preserves and what it distorts, why Greenland looks as big as Africa, and what Domingo Fontán\'s Carta Xeométrica de Galicia was.' },
  o_satelite: { gl: 'Un satélite Sentinel-2 fotografía con 10 m por píxel. Cantos píxeles de longo e de ancho ocupa un campo de fútbol de 100 × 60 m, e cantos píxeles en total? Unha imaxe de 10.000 × 10.000 píxeles, cantos quilómetros de lado ten e que superficie cobre en km²? Explica como funciona a triangulación (que se mide unha soa vez e que se mide despois) e que é a fotogrametría, por que fan falta dúas fotos para medir alturas.',
                es: 'Un satélite Sentinel-2 fotografía con 10 m por píxel. ¿Cuántos píxeles de largo y de ancho ocupa un campo de fútbol de 100 × 60 m, y cuántos píxeles en total? Una imagen de 10.000 × 10.000 píxeles, ¿cuántos kilómetros de lado tiene y qué superficie cubre en km²? Explica cómo funciona la triangulación (qué se mide una sola vez y qué se mide después) y qué es la fotogrametría, por qué hacen falta dos fotos para medir alturas.',
                en: 'A Sentinel-2 satellite photographs at 10 m per pixel. How many pixels long and wide is a 100 × 60 m football pitch, and how many pixels in total? An image of 10,000 × 10,000 pixels: how many kilometres is each side and what area does it cover in km²? Explain how triangulation works (what is measured only once and what is measured afterwards) and what photogrammetry is, why two photos are needed to measure heights.' },
  o_gps: { gl: 'O sinal dun satélite GPS viaxa a 300.000 km/s. Se o satélite está a 20.000 km, canto tarda en chegar ao móbil, en segundos e en milisegundos? Se o reloxo do receptor se equivoca nunha millonésima de segundo, cantos metros de erro dá na distancia? E se non se corrixisen os 38 microsegundos diarios da relatividade, cantos quilómetros de erro se acumularían nun día? Explica por que fan falta catro satélites e non tres, e por que os reloxos dos satélites adiantan.',
           es: 'La señal de un satélite GPS viaja a 300.000 km/s. Si el satélite está a 20.000 km, ¿cuánto tarda en llegar al móvil, en segundos y en milisegundos? Si el reloj del receptor se equivoca en una millonésima de segundo, ¿cuántos metros de error da en la distancia? Y si no se corrigiesen los 38 microsegundos diarios de la relatividad, ¿cuántos kilómetros de error se acumularían en un día? Explica por qué hacen falta cuatro satélites y no tres, y por qué los relojes de los satélites se adelantan.',
           en: 'A GPS satellite\'s signal travels at 300,000 km/s. If the satellite is 20,000 km away, how long does the signal take to reach the phone, in seconds and in milliseconds? If the receiver\'s clock is off by one millionth of a second, how many metres of error is that in the distance? And if the 38 microseconds a day of relativity were not corrected, how many kilometres of error would build up in a day? Explain why four satellites are needed, not three, and why the satellites\' clocks run fast.' },
  o_mapa: { gl: 'Unha ortofoto do PNOA ten 25 cm por píxel e unha imaxe Sentinel-2 ten 10 m por píxel. Cantas veces máis fino é o píxel da ortofoto? Cantos píxeles da ortofoto caben dentro dun só píxel do satélite? Explica que son as capas dun sistema de información xeográfica e que preguntas lle permiten facer ao territorio, como se fai OpenStreetMap, e por que se di que un mapa é sempre unha decisión, cun exemplo galego sobre os nomes dos lugares.',
            es: 'Una ortofoto del PNOA tiene 25 cm por píxel y una imagen Sentinel-2 tiene 10 m por píxel. ¿Cuántas veces más fino es el píxel de la ortofoto? ¿Cuántos píxeles de la ortofoto caben dentro de un solo píxel del satélite? Explica qué son las capas de un sistema de información geográfica y qué preguntas le permiten hacer al territorio, cómo se hace OpenStreetMap, y por qué se dice que un mapa es siempre una decisión, con un ejemplo gallego sobre los nombres de los lugares.',
            en: 'A PNOA orthophoto has 25 cm per pixel and a Sentinel-2 image has 10 m per pixel. How many times finer is the orthophoto pixel? How many orthophoto pixels fit inside a single satellite pixel? Explain what the layers of a geographic information system are and what questions they let you ask the territory, how OpenStreetMap is made, and why it is said that a map is always a decision, with a Galician example about place names.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  a_escala: "6 cm × 25.000 = 150.000 cm = 1.500 m (1,5 km). 3 km = 300.000 cm; 300.000 / 25.000 = 12 cm no mapa. 8 curvas × 10 m de equidistancia = 80 m de desnivel (aceptable 70–90 m se razoa que os extremos quedan entre curvas). Crédito parcial se deixa 150.000 cm sen pasar a metros ou se erra só unha das tres contas. Concepto: a Terra é case unha esfera e o papel é plano; toda proxección deforma algo. Mercator (1569) conserva os ángulos, ideal para navegar, pero estira as latitudes altas: Groenlandia parece tan grande coma África, que é unhas 14 veces maior. Fontán, matemático de Portas, fixo o primeiro mapa científico de Galicia, a Carta Xeométrica, medida sobre o terreo entre 1817 e 1834 e impresa en París en 1845 a escala 1:100.000.",
  o_satelite: "100 / 10 = 10 píxeles de longo; 60 / 10 = 6 de ancho; 10 × 6 = 60 píxeles en total. 10.000 píxeles × 10 m = 100.000 m = 100 km de lado; 100 × 100 = 10.000 km². Crédito parcial se dá o lado (100 km) pero non a superficie, ou se suma en vez de multiplicar. Concepto: na triangulación mídese con precisión unha soa distancia, a base (Fontán, preto de Lugo, 1817), e desde os seus extremos os ángulos a un terceiro punto co teodolito; a trigonometría dá o triángulo enteiro e cada lado é base do seguinte (vértices xeodésicos). Fotogrametría: dúas fotos aéreas do mesmo terreo desde dous puntos dan, coma os dous ollos, unha imaxe con relevo da que se mide a altura; a ortofoto é esa foto corrixida a escala uniforme.",
  o_gps: "20.000 km / 300.000 km/s = 0,0667 s ≈ 67 ms (aceptable 0,066–0,067 s; 66–67 ms; 1/15 s). Erro de 1 µs: 300.000 km/s × 0,000001 s = 0,3 km = 300 m. 38 µs × 300 m = 11.400 m ≈ 11 km ao día (aceptable 10–12 km; coincide cos «uns 10 km» do texto). Crédito parcial se acerta os segundos pero erra os milisegundos, ou se dá 300 m sen chegar aos 38 µs. Concepto: con tres distancias a puntos coñecidos a posición queda fixada (trilateración), pero o reloxo do móbil non é atómico: fai falta un cuarto satélite para corrixir o erro de tempo. Relatividade: un reloxo que se move rápido atrasa e un lonxe da gravidade adianta; nos satélites GPS gaña o segundo efecto, 38 microsegundos ao día; sen corrixilo, o erro medraría uns 10 km diarios.",
  o_mapa: "10 m = 1.000 cm; 1.000 / 25 = 40 veces máis fino (en cada lado). Nun píxel do satélite caben 40 × 40 = 1.600 píxeles da ortofoto. Crédito parcial se dá 40 pero non eleva ao cadrado (responde 40 ou 80). Concepto: un mapa dixital é unha base de datos xeográfica (obxectos con coordenadas e atributos). Os sistemas de información xeográfica (SIX) superpoñen capas (relevo, usos do solo, poboación, incendios) e permiten preguntarlle ao territorio: casas a menos de 500 m dun río, ruta máis curta. OpenStreetMap (2004) é un mapa libre feito por voluntarios sobre ortofotos ou con GPS; úsano aplicacións, ONG e emerxencias. Ningún mapa é neutral: elixe proxección, o que inclúe e o que cala, fronteiras e nomes; en Galicia a toponimia oficial é a galega desde a Lei de normalización lingüística de 1983 (A Coruña, Ourense, Fisterra).",
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
  { nodos: ['a_escala', 'o_satelite', 'o_gps', 'o_mapa'],
    journey: { label_gl: 'O mapa, por dentro', label_es: 'El mapa, por dentro', label_en: 'The map, from the inside',
      description_gl: 'Centímetros que son quilómetros, píxeles que son campos de fútbol, milisegundos que son distancias e unha ortofoto fronte a un satélite: o mapa con números.', description_es: 'Centímetros que son kilómetros, píxeles que son campos de fútbol, milisegundos que son distancias y una ortofoto frente a un satélite: el mapa con números.', description_en: 'Centimetres that are kilometres, pixels that are football pitches, milliseconds that are distances and an orthophoto against a satellite: the map with numbers.',
      modulo: 'Ciencia', icono: '🧭' } },
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
