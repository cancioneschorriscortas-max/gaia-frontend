// FONTE DE VERDADE das rutas de SECUNDARIA (5ª entrega): "A abella, por dentro".
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
  a_abella: { gl: 'Unha colmea ten 40.000 obreiras e cada unha sae a buscar néctar só as últimas 3 semanas dunha vida de 6. Que fracción da colmea anda fóra nun día? Explica por que a danza en forma de oito precisa o Sol como referencia e que lle pasaría a unha maceira se non houbese polinizadores.',
              es: 'Una colmena tiene 40.000 obreras y cada una sale a buscar néctar solo las últimas 3 semanas de una vida de 6. ¿Qué fracción de la colmena anda fuera en un día? Explica por qué la danza en forma de ocho necesita el Sol como referencia y qué le pasaría a un manzano si no hubiese polinizadores.',
              en: 'A hive has 40,000 workers and each forages only during the last 3 weeks of a 6-week life. What fraction of the hive is out on a given day? Explain why the figure-of-eight dance needs the Sun as a reference and what would happen to an apple tree with no pollinators.' },
  a_colmea: { gl: 'O néctar leva un 70 % de auga e o mel un 17 %. Cantos quilos de néctar fan falta para un quilo de mel, se a auga que sobra se evapora? Explica que fan as abellas para evaporala e por que a actividade de auga do mel (0,6) impide que fermente.',
              es: 'El néctar lleva un 70 % de agua y la miel un 17 %. ¿Cuántos kilos de néctar hacen falta para un kilo de miel, si el agua que sobra se evapora? Explica qué hacen las abejas para evaporarla y por qué la actividad de agua de la miel (0,6) impide que fermente.',
              en: 'Nectar is 70% water and honey 17%. How many kilos of nectar are needed for one kilo of honey, if the surplus water evaporates? Explain what the bees do to evaporate it and why honey\'s water activity (0.6) stops it fermenting.' },
  o_apicultor: { gl: 'O apicultor colle só o mel que sobra: unha colmea galega fai 15–30 kg ao ano e precisa uns 15 kg para pasar o inverno. Cantos quilos pode vender nun ano bo e cantos nun malo? Razoa por que non se pode quentar o mel por riba de 45 °C e para que serve o afumador.',
                 es: 'El apicultor coge solo la miel que sobra: una colmena gallega hace 15–30 kg al año y necesita unos 15 kg para pasar el invierno. ¿Cuántos kilos puede vender en un año bueno y cuántos en uno malo? Razona por qué no se puede calentar la miel por encima de 45 °C y para qué sirve el ahumador.',
                 en: 'The beekeeper takes only the surplus: a Galician hive makes 15–30 kg a year and needs about 15 kg to get through winter. How many kilos can be sold in a good year and in a bad one? Argue why honey must not be heated above 45 °C and what the smoker is for.' },
  o_mel: { gl: 'Unha abella fai unha culleradiña (uns 5 g) de mel en toda a súa vida. Cantas vidas de abella hai nun tarro de 500 g? Explica con actividade de auga e pH por que o mel non estraga, por que cristaliza e por que iso non é sinal de que estea malo.',
           es: 'Una abeja hace una cucharadita (unos 5 g) de miel en toda su vida. ¿Cuántas vidas de abeja hay en un tarro de 500 g? Explica con actividad de agua y pH por qué la miel no se estropea, por qué cristaliza y por qué eso no es señal de que esté mala.',
           en: 'A bee makes one teaspoon (about 5 g) of honey in its whole life. How many bee lives are in a 500 g jar? Using water activity and pH, explain why honey does not spoil, why it crystallises and why that is not a sign it has gone bad.' },
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
  { nodos: ['a_abella', 'a_colmea', 'o_apicultor', 'o_mel'],
    journey: { label_gl: 'A abella, por dentro', label_es: 'La abeja, por dentro', label_en: 'The bee, from the inside',
      description_gl: 'A colmea como sociedade, a química do mel, o oficio con números e o único alimento que non estraga: as abellas con ciencia.', description_es: 'La colmena como sociedad, la química de la miel, el oficio con números y el único alimento que no se estropea: las abejas con ciencia.', description_en: 'The hive as a society, the chemistry of honey, the trade with numbers and the only food that never spoils: bees with science.',
      modulo: 'Natureza', icono: '🍯' } },
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
