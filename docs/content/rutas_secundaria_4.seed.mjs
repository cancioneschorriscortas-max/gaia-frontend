// FONTE DE VERDADE das rutas de SECUNDARIA (4ª entrega): "A industria, por dentro" (peixe e papel).
// Reutilizan os nodos existentes; engaden reto_secondary (pregunta aberta) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const RETOS_SEC = {
  o_barco: { gl: 'Un barco de cerco pesca 20 toneladas de sardiña nunha noite e a cota anual do barco son 300 toneladas. Cantas noites así pode saír ao ano? Razoa por que existen as cotas e que pasaría cun banco de sardiña se ninguén as puxese.',
             es: 'Un barco de cerco pesca 20 toneladas de sardina en una noche y la cuota anual del barco son 300 toneladas. ¿Cuántas noches así puede salir al año? Razona por qué existen las cuotas y qué pasaría con un banco de sardina si nadie las pusiese.',
             en: 'A purse seiner catches 20 tonnes of sardine in one night and the boat\'s annual quota is 300 tonnes. How many such nights can it go out per year? Argue why quotas exist and what would happen to a sardine shoal if nobody set them.' },
  a_lonxa: { gl: 'Na poxa á baixa o prezo baixa 10 céntimos cada segundo desde 5 €/kg. Un comprador quere pagar como moito 3,20 €/kg. En que segundo debería parar o reloxo, e por que arrisca se agarda ata entón? Explica que información leva a etiqueta da caixa e para que serve a trazabilidade.',
             es: 'En la subasta a la baja el precio baja 10 céntimos cada segundo desde 5 €/kg. Un comprador quiere pagar como mucho 3,20 €/kg. ¿En qué segundo debería parar el reloj, y por qué arriesga si espera hasta entonces? Explica qué información lleva la etiqueta de la caja y para qué sirve la trazabilidad.',
             en: 'In the descending auction the price drops 10 cents every second from €5/kg. A buyer wants to pay at most €3.20/kg. At which second should they stop the clock, and why do they take a risk by waiting that long? Explain what information the box label carries and what traceability is for.' },
  a_pasta_de_papel: { gl: 'Unha tonelada de pasta leva 2,5 m³ de madeira e un eucalipto de 12 anos dá uns 0,25 m³. Cantos eucaliptos van nunha tonelada de pasta? Explica que é a lignina, por que hai que quitala e por que a fábrica queima o licor negro en vez de tiralo.',
                      es: 'Una tonelada de pasta lleva 2,5 m³ de madera y un eucalipto de 12 años da unos 0,25 m³. ¿Cuántos eucaliptos van en una tonelada de pasta? Explica qué es la lignina, por qué hay que quitarla y por qué la fábrica quema el licor negro en vez de tirarlo.',
                      en: 'One tonne of pulp takes 2.5 m³ of wood and a 12-year-old eucalyptus yields about 0.25 m³. How many eucalyptus trees go into a tonne of pulp? Explain what lignin is, why it must be removed and why the mill burns the black liquor instead of dumping it.' },
  a_maquina_de_papel: { gl: 'A pasta entra na máquina co 99 % de auga e sae co 5 %. Por cada quilo de papel seco, cantos litros de auga hai que quitar? Explica por que un A4 mide 210 × 297 mm e non un número redondo, e cal é a vantaxe de que todos os tamaños A garden a mesma proporción.',
                        es: 'La pasta entra en la máquina con el 99 % de agua y sale con el 5 %. Por cada kilo de papel seco, ¿cuántos litros de agua hay que quitar? Explica por qué un A4 mide 210 × 297 mm y no un número redondo, y cuál es la ventaja de que todos los tamaños A guarden la misma proporción.',
                        en: 'Pulp enters the machine at 99% water and leaves at 5%. For every kilo of dry paper, how many litres of water must be removed? Explain why an A4 sheet measures 210 × 297 mm rather than a round number, and what the advantage is of all A sizes keeping the same proportion.' },
}
for (const [id, reto] of Object.entries(RETOS_SEC)) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) { console.log('GET', id, g.status); continue }
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
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  console.log('reto secundaria', id, p.status)
}
const RUTAS = [
  { nodos: ['o_barco', 'a_lonxa', 'a_pasta_de_papel', 'a_maquina_de_papel'],
    journey: { label_gl: 'A industria, por dentro', label_es: 'La industria, por dentro', label_en: 'Industry, from the inside',
      description_gl: 'Cotas e artes de pesca, a poxa como mercado, química da pasta e a máquina máis longa da fábrica: dúas industrias galegas con números.', description_es: 'Cuotas y artes de pesca, la subasta como mercado, química de la pasta y la máquina más larga de la fábrica: dos industrias gallegas con números.', description_en: 'Quotas and fishing methods, the auction as a market, pulp chemistry and the longest machine in the mill: two Galician industries with numbers.',
      modulo: 'Oficios', icono: '🏭' } },
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
