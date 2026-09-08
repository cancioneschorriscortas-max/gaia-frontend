// FONTE DE VERDADE das primeiras rutas de SECUNDARIA: reutilizan os nodos de "A viaxe da luz" e "Como arde o lume"
// (o texto "e por que?" xa existe) e engaden o reto_secondary (pregunta aberta, avalíaa Lúa) e a journey level=secondary.
// Executable contra un backend local cun login de profesor (le CRED do scratchpad; cambia CRED para reutilizalo).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

// Retos de secundaria: abertos, pensados para 12-16 anos. Lúa avalía con criterio de instituto.
const RETOS_SEC = {
  o_vento: {
    gl: 'Explica coas túas palabras por que sopra o vento. Que ten que ver o Sol?',
    es: 'Explica con tus palabras por qué sopla el viento. ¿Qué tiene que ver el Sol?',
    en: 'Explain in your own words why the wind blows. What does the Sun have to do with it?' },
  o_xerador: {
    gl: 'Un xerador convirte movemento en electricidade. Describe que hai dentro e que descubriu Faraday en 1831.',
    es: 'Un generador convierte movimiento en electricidad. Describe qué hay dentro y qué descubrió Faraday en 1831.',
    en: 'A generator turns motion into electricity. Describe what is inside it and what Faraday discovered in 1831.' },
  a_rede_electrica: {
    gl: 'Por que a electricidade viaxa en alta tensión polas torres e se lle baixa a forza antes de entrar nas casas?',
    es: '¿Por qué la electricidad viaja en alta tensión por las torres y se le baja la fuerza antes de entrar en las casas?',
    en: 'Why does electricity travel at high voltage along the pylons, and why is it stepped down before entering homes?' },
  o_enchufe: {
    gl: 'Que pasa nun circuíto cando acendes un interruptor? Usa as palabras "camiño", "pechado" e "corrente".',
    es: '¿Qué pasa en un circuito cuando enciendes un interruptor? Usa las palabras "camino", "cerrado" y "corriente".',
    en: 'What happens in a circuit when you flip a switch on? Use the words "path", "closed" and "current".' },
  a_lena: {
    gl: 'A enerxía da leña vén do Sol. Explica o camiño que fai esa enerxía desde o Sol ata a chama, paso por paso.',
    es: 'La energía de la leña viene del Sol. Explica el camino que hace esa energía desde el Sol hasta la llama, paso a paso.',
    en: 'The energy in firewood comes from the Sun. Explain the path that energy takes from the Sun to the flame, step by step.' },
  o_aire: {
    gl: 'Se só unha de cada cinco partes do aire é osíxeno, que pasa co resto cando algo arde? E por que unha candea tapada se apaga?',
    es: 'Si solo una de cada cinco partes del aire es oxígeno, ¿qué pasa con el resto cuando algo arde? ¿Y por qué una vela tapada se apaga?',
    en: 'If only one part in five of air is oxygen, what happens to the rest when something burns? And why does a covered candle go out?' },
  a_chispa: {
    gl: 'Os bombeiros falan do triángulo do lume. Explica como se apaga un incendio "rompendo" cada un dos tres lados.',
    es: 'Los bomberos hablan del triángulo del fuego. Explica cómo se apaga un incendio "rompiendo" cada uno de los tres lados.',
    en: 'Firefighters talk about the fire triangle. Explain how a fire is put out by "breaking" each of the three sides.' },
  o_lume: {
    gl: 'Arder é unha reacción química. Que se xunta, que sae (gases, cinza, calor) e por que a chama azul é máis quente ca a amarela?',
    es: 'Arder es una reacción química. ¿Qué se junta, qué sale (gases, ceniza, calor) y por qué la llama azul es más caliente que la amarilla?',
    en: 'Burning is a chemical reaction. What combines, what comes out (gases, ash, heat), and why is a blue flame hotter than a yellow one?' },
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
  { id: 'a_luz_por_dentro', nodos: ['o_vento', 'o_xerador', 'a_rede_electrica', 'o_enchufe'],
    journey: { label_gl: 'A luz, por dentro', label_es: 'La luz, por dentro', label_en: 'Light, from the inside',
      description_gl: 'A mesma viaxe do vento ao enchufe, agora con física: Faraday, alta tensión e circuítos.', description_es: 'El mismo viaje del viento al enchufe, ahora con física: Faraday, alta tensión y circuitos.', description_en: 'The same journey from wind to socket, now with physics: Faraday, high voltage and circuits.',
      modulo: 'Ciencia', icono: '🧲' } },
  { id: 'o_lume_por_dentro', nodos: ['a_lena', 'o_aire', 'a_chispa', 'o_lume'],
    journey: { label_gl: 'O lume, por dentro', label_es: 'El fuego, por dentro', label_en: 'Fire, from the inside',
      description_gl: 'Combustión como reacción: osíxeno, enerxía do Sol gardada e o triángulo do lume a fondo.', description_es: 'Combustión como reacción: oxígeno, energía del Sol guardada y el triángulo del fuego a fondo.', description_en: 'Combustion as a reaction: oxygen, stored solar energy and the fire triangle in depth.',
      modulo: 'Ciencia', icono: '🧪' } },
]
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'secondary', type: 'educational', visibility: 'public', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
  const id = res.data?.id || r.id
  const body = { level: 'secondary', type: 'educational', status: 'published', visibility: 'public', modulo: r.journey.modulo, icono: r.journey.icono }
  for (const k of ['label_gl', 'label_es', 'label_en', 'description_gl', 'description_es', 'description_en']) body[k] = r.journey[k]
  const p = await j('PUT', '/journeys/' + id, body, TOKEN); console.log('  publicada', id, p.status)
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas:', (fin.data.journeys || []).map(x => x.id + (x.level === 'secondary' ? '(S)' : '')).join(', '))
