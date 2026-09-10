// FONTE DE VERDADE das rutas de SECUNDARIA (13ª entrega): "A castaña, por dentro".
// Reutilizan os nodos da ruta da castaña; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  o_castineiro: { gl: 'Un souto de 2 hectáreas ten 100 castiñeiros por hectárea e cada árbore dá 40 kg de castañas ao ano. Cantos castiñeiros hai e cantos quilos de castañas dá o souto nun ano? Se un castiñeiro vive 500 anos e empeza a dar froito aos 20, cantos anos produce castañas? Explica por que o ourizo non é o froito senón a cúpula, e que son a tinta, o chancro e a avespa do castiñeiro e como se combate esta última.',
                  es: 'Un souto de 2 hectáreas tiene 100 castaños por hectárea y cada árbol da 40 kg de castañas al año. ¿Cuántos castaños hay y cuántos kilos de castañas da el souto en un año? Si un castaño vive 500 años y empieza a dar fruto a los 20, ¿cuántos años produce castañas? Explica por qué el erizo no es el fruto sino la cúpula, y qué son la tinta, el chancro y la avispa del castaño y cómo se combate esta última.',
                  en: 'A 2-hectare chestnut wood has 100 trees per hectare and each tree gives 40 kg of chestnuts a year. How many trees are there and how many kilos of chestnuts does the wood give in a year? If a chestnut tree lives 500 years and starts bearing fruit at 20, for how many years does it produce chestnuts? Explain why the bur is not the fruit but the cupule, and what ink disease, chestnut blight and the chestnut gall wasp are, and how the wasp is fought.' },
  a_castana: { gl: 'Unha castaña fresca de 20 g é un 50 % auga, un 40 % hidratos de carbono e un 2 % graxa. Cantos gramos de cada cousa ten? Ao secala queda co 10 % de auga e a materia seca non cambia: cantos gramos de hidratos ten entón e canto pesa (a materia seca é o 90 % do peso)? Explica con física por que estoupa unha castaña asada sen picar, sabendo que o vapor ocupa 1.700 veces o volume da auga.',
               es: 'Una castaña fresca de 20 g es un 50 % agua, un 40 % hidratos de carbono y un 2 % grasa. ¿Cuántos gramos de cada cosa tiene? Al secarla queda con el 10 % de agua y la materia seca no cambia: ¿cuántos gramos de hidratos tiene entonces y cuánto pesa (la materia seca es el 90 % del peso)? Explica con física por qué explota una castaña asada sin picar, sabiendo que el vapor ocupa 1.700 veces el volumen del agua.',
               en: 'A fresh 20 g chestnut is 50% water, 40% carbohydrate and 2% fat. How many grams of each does it have? When dried it ends up at 10% water and the dry matter does not change: how many grams of carbohydrate does it have then, and how much does it weigh (dry matter is 90% of the weight)? Use physics to explain why an unscored chestnut explodes when roasted, knowing that steam takes up 1,700 times the volume of water.' },
  o_sequeiro: { gl: 'No sequeiro métense 100 kg de castañas frescas ao 50 % de auga e sécanse ata quedar ao 10 %. Cantos quilos son materia seca? Se esa materia seca non cambia, canto pesan as castañas secas (a materia seca é entón o 90 % do peso) e cantos quilos de auga perderon? Explica por que por debaixo de 0,6 de actividade de auga xa non hai mofo, que achega o fume ademais de calor e que lle fai ao verme da castaña.',
                es: 'En el sequeiro se meten 100 kg de castañas frescas al 50 % de agua y se secan hasta quedar al 10 %. ¿Cuántos kilos son materia seca? Si esa materia seca no cambia, ¿cuánto pesan las castañas secas (la materia seca es entonces el 90 % del peso) y cuántos kilos de agua perdieron? Explica por qué por debajo de 0,6 de actividad de agua ya no hay moho, qué aporta el humo además de calor y qué le hace al gusano de la castaña.',
                en: '100 kg of fresh chestnuts at 50% water go into the sequeiro and are dried down to 10%. How many kilos are dry matter? If that dry matter does not change, how much do the dried chestnuts weigh (dry matter is then 90% of the weight) and how many kilos of water have they lost? Explain why there is no mould below a water activity of 0.6, what the smoke adds besides heat, and what it does to the chestnut worm.' },
  o_magosto: { gl: 'Unha escola organiza un magosto para 120 nenos e calcula 12 castañas por cabeza. Cantas castañas fan falta? Se cada castaña pesa 15 g, cantos quilos hai que mercar? Explica entre que datas se celebra o magosto e por que caen nesas datas; que lle pasa á castaña ao asala nas brasas (amidón, azucres, Maillard e caramelización) e por que hai que picala antes de metela no lume.',
               es: 'Una escuela organiza un magosto para 120 niños y calcula 12 castañas por cabeza. ¿Cuántas castañas hacen falta? Si cada castaña pesa 15 g, ¿cuántos kilos hay que comprar? Explica entre qué fechas se celebra el magosto y por qué caen en esas fechas; qué le pasa a la castaña al asarla en las brasas (almidón, azúcares, Maillard y caramelización) y por qué hay que picarla antes de meterla en el fuego.',
               en: 'A school organises a magosto for 120 children and plans 12 chestnuts each. How many chestnuts are needed? If each chestnut weighs 15 g, how many kilos must be bought? Explain between which dates the magosto is held and why it falls on those dates; what happens to a chestnut when it is roasted on embers (starch, sugars, Maillard and caramelisation) and why it has to be scored before it goes on the fire.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  o_castineiro: "2 ha × 100 = 200 castiñeiros; 200 × 40 kg = 8.000 kg (8 t) ao ano. Anos produtivos: 500 − 20 = 480 anos. Aceptar 8.000 kg ou 8 t; crédito parcial se só chega aos 200 castiñeiros ou se responde 500 en vez de 480. Concepto: o ourizo é a cúpula que vén da flor feminina e protexe os froitos; as castañas (de unha a tres por ourizo) son os froitos. A tinta é un fungo do chan (Phytophthora) que podrece as raíces; o chancro (Cryphonectria) é un fungo da cortiza que seca as pólas; a avespa do castiñeiro (Dryocosmus kuriphilus) é un insecto asiático que fai bugallos nos gromos, e combátese soltando o parasito Torymus (loita biolóxica).",
  a_castana: "Auga: 20 × 0,50 = 10 g; hidratos: 20 × 0,40 = 8 g; graxa: 20 × 0,02 = 0,4 g. Materia seca = 20 − 10 = 10 g. Ao secar, os hidratos seguen sendo 8 g (a materia seca non cambia); peso da castaña seca = 10 / 0,90 ≈ 11,1 g (aceptar 11–11,2 g). Erro típico: 20 × 0,90 = 18 g (aplicar o 10 % ao peso fresco) ou dicir que baixan os hidratos: crédito parcial se os gramos frescos están ben. Concepto: a metade da castaña é auga; ao asar chega aos 100 °C e pasa a vapor, que ocupa 1.700 veces o volume do líquido; a pel é impermeable, a presión sobe e a castaña rebenta; o corte deixa saír o vapor.",
  o_sequeiro: "Materia seca: 100 × 0,50 = 50 kg. Ao 10 % de auga a materia seca é o 90 % do peso: 50 / 0,90 ≈ 55,6 kg (aceptar 55–56 kg). Auga perdida: 100 − 55,6 ≈ 44,4 kg (aceptar 44–45 kg). Erros típicos: 100 × 0,90 = 90 kg ou dar 50 kg como peso final; crédito parcial se a materia seca (50 kg) está ben. Concepto: a actividade de auga mide a auga dispoñible; por debaixo de 0,6 nin fungos nin insectos poden medrar (mesma lóxica ca o bacallau salgado ou o chourizo). O fume achega fenois antimicrobianos e mata as larvas do verme da castaña (Cydia splendana), que doutro xeito seguirían comendo dentro.",
  o_magosto: "120 × 12 = 1.440 castañas. 1.440 × 15 g = 21.600 g = 21,6 kg (aceptar 21,6 kg ou 22 kg redondeado). Crédito parcial se acerta as castañas pero erra a conversión de gramos a quilos. Concepto: celébrase entre o 1 de novembro (Samaín e Defuntos) e o 11 (San Martiño), porque é o tempo da colleita das castañas e do viño novo da vendima de setembro. Asar é cociñar en seco a máis de 150 °C: o amidón xelatiniza, os azucres caramelizan e as reaccións de Maillard dan cor e sabor, por iso a castaña asada é máis doce ca a crúa. Pícase porque a auga interior pasa a vapor a 100 °C e a pel impermeable non o deixa saír: sen corte estoupa.",
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
  { nodos: ['o_castineiro', 'a_castana', 'o_sequeiro', 'o_magosto'],
    journey: { label_gl: 'A castaña, por dentro', label_es: 'La castaña, por dentro', label_en: 'The chestnut, from the inside',
      description_gl: 'Quilos por souto e anos de froito, a auga que perde a castaña ao secar, o peso final no sequeiro e as castañas dun magosto: a castaña con números.', description_es: 'Kilos por souto y años de fruto, el agua que pierde la castaña al secar, el peso final del sequeiro y las castañas del magosto: la castaña con números.', description_en: 'Kilos per chestnut wood and years of fruit, the water a chestnut loses when dried, the sequeiro\'s final weight and the chestnuts for a magosto: the chestnut with numbers.',
      modulo: 'Galicia', icono: '🌰' } },
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
