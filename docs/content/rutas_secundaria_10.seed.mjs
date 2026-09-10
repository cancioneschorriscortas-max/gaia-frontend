// FONTE DE VERDADE das rutas de SECUNDARIA (10ª entrega): "O chocolate, por dentro".
// Reutilizan os nodos da ruta do chocolate; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  o_cacao: { gl: 'Un cacaoeiro dá 25 vaíñas ao ano e cada vaíña leva 40 sementes. Se cada semente seca pesa 1 g, cantos gramos de gran seco dá unha árbore ao ano? Cantas árbores fan falta para producir 1 tonelada (1.000 kg) de gran seco? Explica que é a floración cauliflora, quen poliniza as flores do cacaoeiro e por que, con tantas flores, a árbore dá tan poucas vaíñas.',
             es: 'Un cacaotero da 25 vainas al año y cada vaina lleva 40 semillas. Si cada semilla seca pesa 1 g, ¿cuántos gramos de grano seco da un árbol al año? ¿Cuántos árboles hacen falta para producir 1 tonelada (1.000 kg) de grano seco? Explica qué es la floración cauliflora, quién poliniza las flores del cacaotero y por qué, con tantas flores, el árbol da tan pocas vainas.',
             en: 'A cacao tree gives 25 pods a year and each pod holds 40 seeds. If each dry seed weighs 1 g, how many grams of dry beans does one tree give a year? How many trees are needed to produce 1 tonne (1,000 kg) of dry beans? Explain what cauliflorous flowering is, who pollinates the cacao flowers and why, with so many flowers, the tree gives so few pods.' },
  o_gran_de_cacao: { gl: 'Nunha caixa de fermentación entran 100 kg de sementes frescas de cacao ao 55 % de humidade. Cantos quilos son materia seca? Se esa materia seca non cambia e os grans secan ao sol ata o 7 % de humidade (a materia seca é entón o 93 % do peso), canto pesan ao final e cantos quilos de auga perderon? Explica que fan primeiro os lévedos e despois as bacterias acéticas no montón, e por que morre o embrión da semente.',
                     es: 'En una caja de fermentación entran 100 kg de semillas frescas de cacao al 55 % de humedad. ¿Cuántos kilos son materia seca? Si esa materia seca no cambia y los granos secan al sol hasta el 7 % de humedad (la materia seca es entonces el 93 % del peso), ¿cuánto pesan al final y cuántos kilos de agua perdieron? Explica qué hacen primero las levaduras y después las bacterias acéticas en el montón, y por qué muere el embrión de la semilla.',
                     en: 'A fermentation box takes 100 kg of fresh cocoa seeds at 55% moisture. How many kilos are dry matter? If that dry matter does not change and the beans dry in the sun down to 7% moisture (dry matter is then 93% of the weight), how much do they weigh at the end and how many kilos of water have they lost? Explain what the yeasts do first and the acetic bacteria afterwards in the heap, and why the embryo of the seed dies.' },
  a_fabrica_de_chocolate: { gl: 'Unha tableta de 100 g de chocolate negro do 70 % leva 70 g de cacao (pasta máis manteiga) e 30 g de azucre. Se a fava de cacao é un 52 % manteiga e supoñemos a mesma proporción neses 70 g, cantos gramos de manteiga de cacao hai na tableta, e que porcentaxe da tableta é manteiga? Explica que fai o conchado coa mestura e por que o temperado busca a forma V da manteiga de cacao.',
                            es: 'Una tableta de 100 g de chocolate negro del 70 % lleva 70 g de cacao (pasta más manteca) y 30 g de azúcar. Si el haba de cacao es un 52 % manteca y suponemos la misma proporción en esos 70 g, ¿cuántos gramos de manteca de cacao hay en la tableta, y qué porcentaje de la tableta es manteca? Explica qué hace el conchado con la mezcla y por qué el templado busca la forma V de la manteca de cacao.',
                            en: 'A 100 g bar of 70% dark chocolate contains 70 g of cocoa (mass plus butter) and 30 g of sugar. If the cocoa bean is 52% butter and we assume the same proportion in those 70 g, how many grams of cocoa butter are in the bar, and what percentage of the bar is butter? Explain what conching does to the mixture and why tempering aims for form V of cocoa butter.' },
  a_tableta: { gl: 'Unha tableta de 100 g de chocolate con leite leva 45 g de azucre. Cantas culleradiñas de 5 g de azucre son? A OMS recomenda non pasar de 25 g de azucre libre ao día. Cantos gramos son nun mes de 30 días, e cantas tabletas enteiras coma esa fan falta para pasar esa cantidade mensual? Explica que é o "fat bloom" dunha tableta que pasou calor e frío, e por que non é mofo.',
               es: 'Una tableta de 100 g de chocolate con leche lleva 45 g de azúcar. ¿Cuántas cucharaditas de 5 g de azúcar son? La OMS recomienda no pasar de 25 g de azúcar libre al día. ¿Cuántos gramos son en un mes de 30 días, y cuántas tabletas enteras como esa hacen falta para pasar esa cantidad mensual? Explica qué es el "fat bloom" de una tableta que pasó calor y frío, y por qué no es moho.',
               en: 'A 100 g bar of milk chocolate contains 45 g of sugar. How many 5 g teaspoons of sugar is that? The WHO recommends not exceeding 25 g of free sugar a day. How many grams is that in a 30-day month, and how many whole bars like that one are needed to exceed that monthly amount? Explain what the "fat bloom" on a bar that has gone through heat and cold is, and why it is not mould.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  o_cacao: "25 vaíñas × 40 sementes = 1.000 sementes/árbore; × 1 g = 1.000 g = 1 kg de gran seco por árbore e ano. 1 tonelada = 1.000.000 g; 1.000.000 / 1.000 = 1.000 árbores. Aceptar 1 kg ou 1.000 g; crédito parcial se acerta as sementes pero non pasa a toneladas. Concepto: floración cauliflora = as flores, minúsculas, nacen directamente no tronco e nas pólas grosas, non nas puntas das pólas; polinízanas mosquitiños do xénero Forcipomyia; só unha pequena parte das flores chega a dar froito, e cada vaíña tarda 5–6 meses en madurar. Non esixir o nome Forcipomyia; abonda 'mosquitiños/insectos moi pequenos'.",
  o_gran_de_cacao: "Ao 55 % de humidade, a materia seca é o 45 %: 100 × 0,45 = 45 kg. Ao 7 %, a materia seca é o 93 %: 45 / 0,93 ≈ 48,4 kg (aceptar 48–48,5 kg). Auga perdida: 100 − 48,4 ≈ 51,6 kg (aceptar 51–52). Crédito parcial se calcula 45 kg e logo resta o 7 % de 100 (erro típico: 93 kg). Concepto: primeiro os lévedos, sen osíxeno, converten os azucres da polpa en etanol e a polpa desfaise; ao entrar o aire, as bacterias acéticas oxidan o etanol a ácido acético, reacción que solta calor (45–50 °C); o ácido e a calor entran na semente e matan o embrión, e as enzimas da semente forman os precursores do aroma.",
  a_fabrica_de_chocolate: "70 g de cacao × 0,52 = 36,4 g de manteiga de cacao (aceptar 35–38 g). Sobre a tableta de 100 g: 36,4 %. Crédito parcial se aplica o 52 % aos 100 g (52 g) ou se acerta os gramos sen a porcentaxe. Concepto: o conchado remexe e quenta a mestura horas ou días, reduce as partículas por debaixo dunhas 20 micras (deixa de notarse area), evapora o ácido acético da fermentación e envolve cada partícula en graxa: textura suave coma a seda. Temperado: a manteiga de cacao cristaliza de varias formas; só a forma V, estable, conseguida arrefriando e volvendo quentar a 31–32 °C, dá unha tableta brillante, que rompe con estalo e non derrete nos dedos.",
  a_tableta: "45 / 5 = 9 culleradiñas. OMS: 25 g × 30 días = 750 g ao mes. 750 / 45 = 16,7: con 16 tabletas (720 g) aínda non se pasa; con 17 tabletas (765 g) si. Resposta: 17 tabletas (aceptar 'máis de 16,7', 'unhas 17'). Crédito parcial se calcula 750 g pero redondea a 16. Concepto: se a tableta pasa calor e frío alternos, parte da manteiga de cacao migra á superficie e recristaliza en cristais grandes: é o fat bloom, unha capa esbrancuxada e mate. Non é mofo (non hai ningún organismo, é só graxa da propia tableta) e pódese comer; só perdeu o brillo e a textura do temperado.",
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
  { nodos: ['o_cacao', 'o_gran_de_cacao', 'a_fabrica_de_chocolate', 'a_tableta'],
    journey: { label_gl: 'O chocolate, por dentro', label_es: 'El chocolate, por dentro', label_en: 'Chocolate, from the inside',
      description_gl: 'Mil árbores para unha tonelada, a auga que perde o gran ao secar, a manteiga escondida nunha tableta do 70 % e as culleradiñas de azucre: o chocolate con números.', description_es: 'Mil árboles para una tonelada, el agua que pierde el grano al secar, la manteca escondida en una tableta del 70 % y las cucharaditas de azúcar: el chocolate con números.', description_en: 'A thousand trees for one tonne, the water a bean loses as it dries, the butter hidden in a 70% bar and the teaspoons of sugar: chocolate with numbers.',
      modulo: 'Ciencia', icono: '🍫' } },
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
