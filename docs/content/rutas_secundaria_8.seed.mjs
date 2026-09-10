// FONTE DE VERDADE das rutas de SECUNDARIA (8ª entrega): "A area, por dentro".
// Reutilizan os nodos da ruta da area; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  a_rocha: { gl: 'Unha fenda do granito énchese con 100 cm³ de auga de chuvia e nunha noite de xeada conxélase; a auga aumenta un 9 % de volume ao xear. Cantos cm³ ocupa o xeo, e cantos cm³ sobran e empurran as paredes da fenda coma unha cuña? Explica por que, dos tres minerais do granito, o cuarzo (dureza 7 na escala de Mohs, case insoluble) acaba sendo a maior parte da area das praias, e en que se converte o feldespato coa hidrólise.',
             es: 'Una grieta del granito se llena con 100 cm³ de agua de lluvia y se hiela una noche; el agua aumenta un 9 % de volumen al helarse. ¿Cuántos cm³ ocupa el hielo, y cuántos cm³ sobran y empujan las paredes de la grieta como una cuña? Explica por qué, de los tres minerales del granito, el cuarzo (dureza 7 en la escala de Mohs, casi insoluble) es la mayor parte de la arena de las playas, y en qué se convierte el feldespato con la hidrólisis.',
             en: 'A crack in the granite fills with 100 cm³ of rainwater and freezes on a frosty night; water expands by 9% in volume when it freezes. How many cm³ does the ice take up, and how many extra cm³ push against the walls of the crack like a wedge? Explain why, of the three minerals in granite, quartz (hardness 7 on the Mohs scale, almost insoluble) ends up making most of the beach sand, and what feldspar turns into through hydrolysis.' },
  o_transporte: { gl: 'Os xeólogos clasifican os sedimentos polo tamaño do gran: grava, máis de 2 mm; area, entre 2 e 0,06 mm; limo, ata 0,004 mm. Nunha mostra hai grans de 3 mm, de 0,5 mm e de 0,01 mm: clasifica cada un. Ao rematar a última glaciación, hai uns 20.000 anos, o nivel do mar subiu arredor de 120 m: cantos milímetros por ano de media? Explica que é unha ría e por que un encoro fai que as praias que alimentaba ese río vaian perdendo area.',
                  es: 'Los geólogos clasifican los sedimentos por el tamaño del grano: grava, más de 2 mm; arena, entre 2 y 0,06 mm; limo, hasta 0,004 mm. En una muestra hay granos de 3 mm, de 0,5 mm y de 0,01 mm: clasifica cada uno. Al terminar la última glaciación, hace unos 20.000 años, el nivel del mar subió alrededor de 120 m: ¿cuántos milímetros por año de media? Explica qué es una ría y por qué un embalse hace que las playas que alimentaba ese río vayan perdiendo arena.',
                  en: 'Geologists classify sediments by grain size: gravel, over 2 mm; sand, between 2 and 0.06 mm; silt, down to 0.004 mm. A sample contains grains of 3 mm, 0.5 mm and 0.01 mm: classify each one. When the last ice age ended, about 20,000 years ago, sea level rose by around 120 m: how many millimetres per year on average? Explain what a ría is and why a dam makes the beaches that river used to feed gradually lose sand.' },
  a_onda: { gl: 'Nun temporal de inverno na Costa da Morte as boias rexistran ondas de 10 m de altura; nun día de verán, ondas de 1 m. A enerxía que leva unha onda é proporcional ao cadrado da súa altura. Cantas veces máis enerxía trae a onda de temporal ca a de verán? Explica que é a deriva litoral, por que a area viaxa ao longo da costa, e que lle pasa a unha praia cando se constrúe un espigón: de que lado gaña area e de que lado a perde.',
            es: 'En un temporal de invierno, en la Costa da Morte, las boyas registran olas de 10 m; en verano, olas de 1 m. La energía que lleva una ola es proporcional al cuadrado de su altura. ¿Cuántas veces más energía trae la ola de temporal que la de verano? Explica qué es la deriva litoral, por qué la arena viaja por la costa, y qué le pasa a una playa cuando se construye un espigón: de qué lado gana arena y de qué lado la pierde.',
            en: 'In a winter storm on the Costa da Morte the buoys record waves 10 m high; on a summer day, waves of 1 m. The energy a wave carries is proportional to the square of its height. How many times more energy does the storm wave bring than the summer one? Explain what longshore drift is, why sand travels along the coast, and what happens to a beach when a groyne is built: on which side it gains sand and on which side it loses it.' },
  a_duna: { gl: 'A duna móbil de Corrubedo mide arredor de 1.000 m de longo, 200 m de ancho e 20 m de alto. Estima o volume de area que contén, coma se fose un prisma triangular (longo × ancho × alto / 2), e calcula cantos camións de 10 m³ farían falta para movela. Explica como move o vento a area por saltación e por que non se pisan as dunas: que lles pasa ás plantas que as fixan e que fai despois o vento.',
            es: 'La duna móvil de Corrubedo mide alrededor de 1.000 m de largo, 200 m de ancho y 20 m de alto. Estima el volumen de arena que contiene, como si fuera un prisma triangular (largo × ancho × alto / 2), y calcula cuántos camiones de 10 m³ harían falta para moverla. Explica cómo mueve el viento la arena por saltación y por qué no se pisan las dunas: qué les pasa a las plantas que las fijan y qué hace después el viento.',
            en: 'The moving dune at Corrubedo is about 1,000 m long, 200 m wide and 20 m high. Estimate the volume of sand it holds, treating it as a triangular prism (length × width × height / 2), and work out how many 10 m³ lorries it would take to move it. Explain how the wind moves sand by saltation and why you must not walk on dunes: what happens to the plants that fix them, and what the wind does next.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  a_rocha: "100 cm³ × 1,09 = 109 cm³ de xeo; sobran 9 cm³, que fan de cuña na fenda. Concepto: o cuarzo resiste (dureza 7, case non se disolve) e é o que queda; o feldespato convértese por hidrólise en caolinita (arxila branca).",
  o_transporte: "3 mm → grava; 0,5 mm → area; 0,01 mm → limo. 120 m = 120.000 mm / 20.000 anos = 6 mm por ano de media. Concepto: unha ría é un val fluvial afundido polo mar tras a última glaciación; un encoro retén a area no fondo e as praias que ese río alimentaba perden.",
  a_onda: "(10 / 1)² = 100 veces máis enerxía. Concepto: deriva litoral (as ondas en ángulo fan avanzar a area en zigzag pola costa); un espigón crea praia do lado de onde vén a area e come a do outro lado.",
  a_duna: "1.000 × 200 × 20 / 2 = 2.000.000 m³; 2.000.000 / 10 = 200.000 camións. Concepto: saltación (o gran despega, voa uns centímetros, cae e libera outros); pisar as dunas mata as plantas que as fixan (feo da praia) e o vento leva a area.",
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
  { nodos: ['a_rocha', 'o_transporte', 'a_onda', 'a_duna'],
    journey: { label_gl: 'A area, por dentro', label_es: 'La arena, por dentro', label_en: 'Sand, from the inside',
      description_gl: 'Unha fenda que xea, o nivel do mar en milímetros por ano, a enerxía dunha onda de 10 m e o volume da duna de Corrubedo: a area con números.', description_es: 'Una grieta helada, el nivel del mar en milímetros por año, la energía de una ola de 10 m y el volumen de la duna de Corrubedo: la arena con números.', description_en: 'A freezing crack, sea level in millimetres per year, the energy of a 10 m wave and the volume of the Corrubedo dune: sand with numbers.',
      modulo: 'Natureza', icono: '🏖️' } },
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
