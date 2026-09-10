// FONTE DE VERDADE das rutas de SECUNDARIA (15ª entrega): "O aceite, por dentro".
// Reutilizan os nodos da ruta do aceite; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  a_oliveira: { gl: 'Unha oliveira adulta dá uns 30 kg de olivas ao ano. Cantos quilos de olivas colle unha leira de Quiroga con 80 oliveiras? Se fan falta 5 kg de olivas por cada litro de aceite, cantos litros saen desa leira? Explica por que a oliveira non se dá na Galicia atlántica e si nos vales de Quiroga e Valdeorras: di que clima precisa a árbore e que papel xogan as serras.',
                es: 'Un olivo adulto da unos 30 kg de aceitunas al año. ¿Cuántos kilos de aceitunas recoge una finca de Quiroga con 80 olivos? Si hacen falta 5 kg de aceitunas por cada litro de aceite, ¿cuántos litros salen de esa finca? Explica por qué el olivo no se da en la Galicia atlántica y sí en los valles de Quiroga y Valdeorras: di qué clima necesita el árbol y qué papel juegan las sierras.',
                en: 'A mature olive tree yields about 30 kg of olives a year. How many kilos of olives does a grove in Quiroga with 80 trees pick? If it takes 5 kg of olives for each litre of oil, how many litres come from that grove? Explain why the olive tree does not thrive in Atlantic Galicia but does in the valleys of Quiroga and Valdeorras: say what climate the tree needs and what role the mountains play.' },
  a_almazara: { gl: 'Nunha almazara entran 1.000 kg de olivas cun rendemento do 18 % en peso. Cantos quilos de aceite saen? Se a densidade do aceite é de 0,92 kg por litro, cantos litros son? Explica que quere dicir «extracción en frío» e por que se bate a pasta por debaixo de 27 °C, que separa o decánter e segundo que propiedade o fai, e que condición de acidez ten que cumprir un aceite para ser virxe extra.',
                es: 'En una almazara entran 1.000 kg de aceitunas con un rendimiento del 18 % en peso. ¿Cuántos kilos de aceite salen? Si la densidad del aceite es de 0,92 kg por litro, ¿cuántos litros son? Explica qué quiere decir «extracción en frío» y por qué se bate la pasta por debajo de 27 °C, qué separa el decánter y según qué propiedad lo hace, y qué condición de acidez tiene que cumplir un aceite para ser virgen extra.',
                en: 'An olive mill takes in 1,000 kg of olives with a yield of 18% by weight. How many kilos of oil come out? If the density of the oil is 0.92 kg per litre, how many litres is that? Explain what "cold extraction" means and why the paste is malaxed below 27 °C, what the decanter separates and by which property it does so, and what acidity condition an oil must meet to be extra virgin.' },
  o_aceite: { gl: 'Unha botella dun litro de aceite contén 0,92 kg de aceite. Se o botas nun recipiente con 1 litro de auga (1 kg), cal dos dous líquidos queda enriba e por que? Calcula a densidade media da mestura: masa total entre volume total, en kg por litro. Explica por que o ácido oleico, monoinsaturado, fai que o aceite sexa líquido mentres as graxas saturadas son sólidas, e que lle pasa ao aceite cando se oxida e se pon rancio.',
              es: 'Una botella de un litro de aceite contiene 0,92 kg de aceite. Si lo echas en un recipiente con 1 litro de agua (1 kg), ¿cuál de los dos líquidos queda encima y por qué? Calcula la densidad media de la mezcla: masa total entre volumen total, en kg por litro. Explica por qué el ácido oleico, monoinsaturado, hace que el aceite sea líquido mientras las grasas saturadas son sólidas, y qué le pasa al aceite cuando se oxida y se pone rancio.',
              en: 'A one-litre bottle of olive oil holds 0.92 kg of oil. If you pour it into a container with 1 litre of water (1 kg), which of the two liquids ends up on top and why? Work out the average density of the mixture: total mass divided by total volume, in kg per litre. Explain why oleic acid, being monounsaturated, makes the oil liquid while saturated fats are solid, and what happens to the oil when it oxidises and turns rancid.' },
  o_prato_de_aceite: { gl: 'Unha familia gasta 2 litros de aceite ao mes en fritir. Cantos litros gasta ao ano? Se cada litro de aceite usado que vai polo vertedoiro contamina 1.000 litros de auga, cantos litros de auga contaminaría esa familia nun ano se non reciclase nada? Explica que é a dieta mediterránea e por que a recoñeceu a UNESCO en 2010, que dano lle fai o aceite usado á auga e en que se transforma cando se recolle no contedor.',
                       es: 'Una familia gasta 2 litros de aceite al mes en freír. ¿Cuántos litros gasta al año? Si cada litro de aceite usado que va por el fregadero contamina 1.000 litros de agua, ¿cuántos litros de agua contaminaría esa familia en un año si no reciclase nada? Explica qué es la dieta mediterránea y por qué la reconoció la UNESCO en 2010, qué daño le hace el aceite usado al agua y en qué se transforma cuando se recoge en el contenedor.',
                       en: 'A family uses 2 litres of olive oil a month for frying. How many litres does it use a year? If every litre of used oil poured down the sink pollutes 1,000 litres of water, how many litres of water would that family pollute in a year if it recycled nothing? Explain what the Mediterranean diet is and why UNESCO recognised it in 2010, what harm used oil does to water and what it is turned into when collected in the recycling container.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  a_oliveira: "80 oliveiras × 30 kg = 2.400 kg de olivas. A 5 kg por litro: 2.400 / 5 = 480 L de aceite. Aceptar 2.400 kg e 480 L exactos (crédito parcial se acerta os quilos pero erra a división, ou se usa 2,4 t sen converter). Concepto: a oliveira é de clima mediterráneo (veráns secos e calorosos, invernos suaves, folla perenne); a Galicia atlántica ten chuvia repartida todo o ano e ceo cuberto a miúdo, así que non lle vai. En Quiroga e Valdeorras os vales encaixados do sueste están protexidos polas serras, que frean as borrascas do Atlántico, e o verán é seco e quente. Valorar mencionar que a árbore aguanta a seca (raíces fondas, follas pequenas e coriáceas) pero teme a xeada forte.",
  a_almazara: "1.000 kg × 0,18 = 180 kg de aceite. Litros = masa / densidade = 180 / 0,92 ≈ 195,7 L (aceptar 195–196 L; crédito parcial se dá 180 kg e logo multiplica por 0,92 en vez de dividir, dando 165,6 L). Concepto: extracción en frío é bater a pasta (20–40 minutos) por debaixo de 27 °C: con máis calor sae máis aceite pero pérdense aromas e antioxidantes. O decánter é unha centrífuga horizontal que separa a pasta segundo a densidade en aceite, auga de vexetación e bagazo (ou alperujo se vai coa auga). Para ser virxe extra o aceite ten como máximo un 0,8 % de ácido oleico libre e ningún defecto de sabor; o virxe pode chegar ao 2 %. Nin calor nin disolventes: é zume de froita.",
  o_aceite: "O aceite (0,92 kg/L) é menos denso ca a auga (1 kg/L), así que queda enriba e non se mestura. Densidade media: masa total 0,92 + 1 = 1,92 kg; volume total 1 + 1 = 2 L; 1,92 / 2 = 0,96 kg/L (aceptar 0,96; crédito parcial se acerta cal flota pero non calcula ou suma masas sen dividir polo volume). Concepto: o ácido oleico (uns 70 % do aceite) é monoinsaturado, ten un dobre enlace que dobra a cadea, e as cadeas dobradas non se empaquetan ben: por iso é líquido a temperatura ambiente. As graxas saturadas (manteiga, unto) teñen cadeas rectas que se apertan e forman un sólido. Oxidación: o osíxeno do aire, a luz e a calor rompen as cadeas insaturadas e forman aldehidos, o cheiro a rancio; gárdase escuro, fresco e pechado.",
  o_prato_de_aceite: "2 L/mes × 12 meses = 24 L de aceite ao ano. 24 L × 1.000 L de auga por litro = 24.000 L de auga contaminada (aceptar 24.000; crédito parcial se acerta os 24 L anuais pero erra o produto). Concepto: a dieta mediterránea é a alimentación con aceite de oliva como graxa principal, verduras, legumes, cereais, froita, peixe e pouca carne vermella; a UNESCO inscribiuna en 2010 como patrimonio cultural inmaterial da humanidade. O aceite usado botado polo vertedoiro forma unha película sobre a auga que impide que se osixene, atasca as tubaxes e encarece a depuración. Recollido en botella pechada e levado ao contedor ou punto limpo, transfórmase en biodiésel, combustible para autobuses e camións.",
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
  { nodos: ['a_oliveira', 'a_almazara', 'o_aceite', 'o_prato_de_aceite'],
    journey: { label_gl: 'O aceite, por dentro', label_es: 'El aceite, por dentro', label_en: 'Olive oil, from the inside',
      description_gl: 'Quilos de olivas por leira e litros por quilo, o rendemento da almazara, a densidade que fai flotar o aceite e a auga que estraga un litro tirado: o aceite con números.', description_es: 'Kilos de aceitunas por finca y litros por kilo, el rendimiento de la almazara, la densidad que hace flotar el aceite y el agua que estropea un litro tirado: el aceite con números.', description_en: 'Kilos of olives per grove and litres per kilo, the mill yield, the density that makes oil float and the water one poured-away litre spoils: olive oil with numbers.',
      modulo: 'Galicia', icono: '🫒' } },
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
