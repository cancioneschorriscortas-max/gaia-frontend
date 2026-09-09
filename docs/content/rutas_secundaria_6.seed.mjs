// FONTE DE VERDADE das rutas de SECUNDARIA (6ª entrega): "A viña, por dentro".
// Reutilizan os nodos da ruta do viño; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const RETOS_SEC = {
  a_vide: { gl: 'Unha familia das Rías Baixas ten media hectárea de parra e colle 10.000 kg de uva por hectárea (a DO permite ata 12.000). Cantos quilos vendima, e cantas botellas de 75 cl saen se de cada quilo se obteñen 0,7 litros? Explica por que nun clima con 1.500 mm de chuvia ao ano se planta en parra alta e non a rentes do chan.',
            es: 'Una familia de las Rías Baixas tiene media hectárea de parra y coge 10.000 kg de uva por hectárea (la DO permite hasta 12.000). ¿Cuántos kilos vendimia, y cuántas botellas de 75 cl salen si de cada kilo se obtienen 0,7 litros? Explica por qué en un clima con 1.500 mm de lluvia al año se planta en parra alta y no a ras del suelo.',
            en: 'A family in the Rías Baixas has half a hectare of trellised vines and picks 10,000 kg of grapes per hectare (the DO allows up to 12,000). How many kilos do they harvest, and how many 75 cl bottles result if each kilo yields 0.7 litres? Explain why, in a climate with 1,500 mm of rain a year, vines are trained high on trellises rather than close to the ground.' },
  a_vendima: { gl: 'Un mosto marca 20 °Brix (20 g de azucre por cada 100 g de mosto) e un litro de mosto pesa uns 1.090 g. Cantos gramos de azucre hai nun litro, e cantos graos de alcol dará se cada 17 g/L fan un grao? Razoa que perde o viño se o viticultor agarda unha semana máis para vendimar, e que gaña.',
               es: 'Un mosto marca 20 °Brix (20 g de azúcar por cada 100 g de mosto) y un litro de mosto pesa unos 1.090 g. ¿Cuántos gramos de azúcar hay en un litro, y cuántos grados de alcohol dará si cada 17 g/L hacen un grado? Razona qué pierde el vino si el viticultor espera una semana más para vendimiar, y qué gana.',
               en: 'A must reads 20 °Brix (20 g of sugar per 100 g of must) and a litre of must weighs about 1,090 g. How many grams of sugar are in a litre, and how many degrees of alcohol will it give if every 17 g/L makes one degree? Reason out what the wine loses if the grower waits another week to harvest, and what it gains.' },
  a_adega: { gl: 'Na fermentación, cada 180 g de glicosa dan 92 g de etanol e 88 g de CO2. Un depósito de 1.000 litros de mosto con 200 g/L de azucre: cantos quilos de CO2 solta ao fermentar? O CO2 é 1,5 veces máis denso ca o aire: explica onde se acumula nunha adega, por que unha candea serve de aviso e por que os brancos se fermentan a 14–18 °C e os tintos a 25–30 °C.',
             es: 'En la fermentación, cada 180 g de glucosa dan 92 g de etanol y 88 g de CO2. Un depósito de 1.000 litros de mosto con 200 g/L de azúcar: ¿cuántos kilos de CO2 suelta al fermentar? El CO2 es 1,5 veces más denso que el aire: explica dónde se acumula en una bodega, por qué una vela sirve de aviso y por qué los blancos se fermentan a 14–18 °C y los tintos a 25–30 °C.',
             en: 'In fermentation, every 180 g of glucose gives 92 g of ethanol and 88 g of CO2. A 1,000-litre tank of must with 200 g/L of sugar: how many kilos of CO2 does it release while fermenting? CO2 is 1.5 times denser than air: explain where it collects in a winery, why a candle works as a warning, and why whites are fermented at 14–18 °C and reds at 25–30 °C.' },
  o_viño: { gl: 'Unha copa de 150 mL de viño de 12 graos (12 % de alcol en volume): cantos mL de alcol puro leva, e cantos gramos, se o etanol ten unha densidade de 0,79 g/mL? Explica que garante unha denominación de orixe e por que o cerebro adolescente, que remata de madurar aos 25 anos, é máis vulnerable ao alcol ca o dun adulto.',
            es: 'Una copa de 150 mL de vino de 12 grados (12 % de alcohol en volumen): ¿cuántos mL de alcohol puro lleva, y cuántos gramos, si el etanol tiene una densidad de 0,79 g/mL? Explica qué garantiza una denominación de origen y por qué el cerebro adolescente, que termina de madurar a los 25 años, es más vulnerable al alcohol que el de un adulto.',
            en: 'A 150 mL glass of 12-degree wine (12% alcohol by volume): how many mL of pure alcohol does it contain, and how many grams, if ethanol has a density of 0.79 g/mL? Explain what a designation of origin guarantees and why the adolescent brain, which finishes maturing at 25, is more vulnerable to alcohol than an adult\'s.' },
}
for (const [id, reto] of Object.entries(RETOS_SEC)) {
  const g = await j('GET', '/nodo/' + encodeURIComponent(id)); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
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
  { nodos: ['a_vide', 'a_vendima', 'a_adega', 'o_viño'],
    journey: { label_gl: 'A viña, por dentro', label_es: 'La viña, por dentro', label_en: 'The vineyard, from the inside',
      description_gl: 'Quilos por hectárea, graos Brix e graos de alcol, os quilos de CO2 dun depósito e o que fai o alcol nun cerebro que medra: o viño con números.', description_es: 'Kilos por hectárea, grados Brix y grados de alcohol, los kilos de CO2 de un depósito y lo que hace el alcohol en un cerebro que crece: el vino con números.', description_en: 'Kilos per hectare, Brix and alcohol degrees, the kilos of CO2 from one tank and what alcohol does to a growing brain: wine with numbers.',
      modulo: 'Galicia', icono: '🍇' } },
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
