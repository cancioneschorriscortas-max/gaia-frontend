// FONTE DE VERDADE das rutas de SECUNDARIA (2ª entrega): auga, marea e sal "por dentro".
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
  a_chuvia: { gl: 'Describe o ciclo da auga completo, coas palabras evaporación, condensación e precipitación, e di en que punto entra a enerxía do Sol.',
              es: 'Describe el ciclo del agua completo, con las palabras evaporación, condensación y precipitación, y di en qué punto entra la energía del Sol.',
              en: 'Describe the full water cycle using the words evaporation, condensation and precipitation, and say where the Sun\'s energy enters.' },
  o_rio: { gl: 'Un encoro fai electricidade coa auga do río. Explica como, e que problema pode traer para os peixes e para as aldeas de augas abaixo.',
           es: 'Un embalse hace electricidad con el agua del río. Explica cómo, y qué problema puede traer para los peces y para las aldeas de aguas abajo.',
           en: 'A dam makes electricity from river water. Explain how, and what problems it can bring for fish and for the villages downstream.' },
  a_depuradora: { gl: 'Que diferenza hai entre unha potabilizadora e unha depuradora de augas residuais? Que pasaría cunha cidade que tivese só a primeira?',
                  es: '¿Qué diferencia hay entre una potabilizadora y una depuradora de aguas residuales? ¿Qué pasaría con una ciudad que tuviese solo la primera?',
                  en: 'What is the difference between a drinking-water plant and a sewage treatment plant? What would happen to a city that had only the first?' },
  a_billa: { gl: 'Unha persoa gasta uns 130 litros ao día. Propón tres cambios concretos na túa casa e estima cantos litros aforraría cada un.',
             es: 'Una persona gasta unos 130 litros al día. Propón tres cambios concretos en tu casa y estima cuántos litros ahorraría cada uno.',
             en: 'A person uses about 130 litres a day. Propose three concrete changes at home and estimate how many litres each would save.' },
  a_lua_astro: { gl: 'Por que a Lúa move o mar pero case non move a terra firme? Fala da gravidade e de que a auga é líquida.',
                 es: '¿Por qué la Luna mueve el mar pero casi no mueve la tierra firme? Habla de la gravedad y de que el agua es líquida.',
                 en: 'Why does the Moon move the sea but hardly the solid ground? Talk about gravity and about water being a liquid.' },
  a_marea: { gl: 'Explica por que hai dúas mareas altas ao día e non unha, e que son as mareas vivas.',
             es: 'Explica por qué hay dos mareas altas al día y no una, y qué son las mareas vivas.',
             en: 'Explain why there are two high tides a day and not one, and what spring tides are.' },
  o_marisqueo: { gl: 'As confrarías poñen topes de quilos e tamaño mínimo. Explica que pasaría sen esas regras usando a idea de "recurso renovable".',
                 es: 'Las cofradías ponen topes de kilos y tamaño mínimo. Explica qué pasaría sin esas reglas usando la idea de "recurso renovable".',
                 en: 'Guilds set kilo limits and a minimum size. Explain what would happen without those rules using the idea of a "renewable resource".' },
  a_ameixa: { gl: 'A ameixa é un filtrador. Que lle pasa se a auga da ría leva contaminación, e por que iso importa para quen a come?',
              es: 'La almeja es un filtrador. ¿Qué le pasa si el agua de la ría lleva contaminación, y por qué eso importa para quien la come?',
              en: 'The clam is a filter feeder. What happens to it if the ría water is polluted, and why does that matter for whoever eats it?' },
  o_mar_salgado: { gl: 'Por que o mar é salgado e a chuvia non? Usa as palabras disolver, evaporar e minerais.',
                   es: '¿Por qué el mar es salado y la lluvia no? Usa las palabras disolver, evaporar y minerales.',
                   en: 'Why is the sea salty and rain not? Use the words dissolve, evaporate and minerals.' },
  a_salina: { gl: 'Unha salina é un experimento de evaporación xigante. Explica que factores (sol, vento, profundidade da auga) fan que se produza máis sal e por que.',
              es: 'Una salina es un experimento de evaporación gigante. Explica qué factores (sol, viento, profundidad del agua) hacen que se produzca más sal y por qué.',
              en: 'A salt pan is a giant evaporation experiment. Explain which factors (sun, wind, water depth) produce more salt and why.' },
  o_sal: { gl: 'O sal conserva o peixe porque lle quita a auga. Explica ese proceso (osmose) e por que os microbios non sobreviven.',
           es: 'La sal conserva el pescado porque le quita el agua. Explica ese proceso (ósmosis) y por qué los microbios no sobreviven.',
           en: 'Salt preserves fish because it draws out the water. Explain that process (osmosis) and why germs cannot survive.' },
  a_conserva: { gl: 'Por que se quenta a lata pechada (esterilización) e que pasaría se quedase aire ou microbios dentro? Relaciona isto co que fixo Pasteur co leite.',
                es: '¿Por qué se calienta la lata cerrada (esterilización) y qué pasaría si quedara aire o microbios dentro? Relaciona esto con lo que hizo Pasteur con la leche.',
                en: 'Why is the sealed tin heated (sterilisation) and what would happen if air or germs stayed inside? Relate this to what Pasteur did with milk.' },
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
  { nodos: ['a_chuvia', 'o_rio', 'a_depuradora', 'a_billa'],
    journey: { label_gl: 'A auga, por dentro', label_es: 'El agua, por dentro', label_en: 'Water, from the inside',
      description_gl: 'Ciclo da auga, encoros, potabilización e canto gastamos: a mesma viaxe, con ciencia.', description_es: 'Ciclo del agua, embalses, potabilización y cuánto gastamos: el mismo viaje, con ciencia.', description_en: 'Water cycle, dams, treatment and how much we use: the same journey, with science.',
      modulo: 'Ciencia', icono: '🔬' } },
  { nodos: ['a_lua_astro', 'a_marea', 'o_marisqueo', 'a_ameixa'],
    journey: { label_gl: 'A marea, por dentro', label_es: 'La marea, por dentro', label_en: 'The tide, from the inside',
      description_gl: 'Gravidade, mareas vivas, recursos renovables e contaminación nas rías.', description_es: 'Gravedad, mareas vivas, recursos renovables y contaminación en las rías.', description_en: 'Gravity, spring tides, renewable resources and pollution in the rías.',
      modulo: 'Ciencia', icono: '🌑' } },
  { nodos: ['o_mar_salgado', 'a_salina', 'o_sal', 'a_conserva'],
    journey: { label_gl: 'O sal, por dentro', label_es: 'La sal, por dentro', label_en: 'Salt, from the inside',
      description_gl: 'Disolución, evaporación, osmose e esterilización: a química da conserva.', description_es: 'Disolución, evaporación, ósmosis y esterilización: la química de la conserva.', description_en: 'Dissolving, evaporation, osmosis and sterilisation: the chemistry of preserving.',
      modulo: 'Ciencia', icono: '⚗️' } },
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
