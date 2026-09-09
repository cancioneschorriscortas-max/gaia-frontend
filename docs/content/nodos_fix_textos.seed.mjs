// Arranxos de texto en nodos xa cargados (rolda 38). Reexecutable: substitúe frases nos textos existentes.
// - o_intestino (secundaria): a superficie do intestino non é "unha pista de tenis" (30–40 m², Helander & Fändriks 2014)
// - o_cable_submarino (secundaria): retirada a afirmación non verificada de que os cables saen do mar en Sada
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const CAMBIOS = {
  o_intestino: { secondary: {
    gl: ['As pregas do intestino chámanse vilosidades; estiradas, cubrirían unha pista de tenis.', 'As pregas do intestino chámanse vilosidades; estiradas, cubrirían uns 30 metros cadrados, o chan dun cuarto grande (ata 2014 os libros dicían "unha pista de tenis", e medíuse mellor).'],
    es: ['Los pliegues del intestino se llaman vellosidades; estiradas, cubrirían una pista de tenis.', 'Los pliegues del intestino se llaman vellosidades; estiradas, cubrirían unos 30 metros cuadrados, el suelo de una habitación grande (hasta 2014 los libros decían "una pista de tenis", y se midió mejor).'],
    en: ['The folds of the intestine are called villi; stretched out, they would cover a tennis court.', 'The folds of the intestine are called villi; stretched out, they would cover about 30 square metres, the floor of a large room (until 2014 textbooks said "a tennis court", and then it was measured properly).'] } },
  o_cable_submarino: { secondary: {
    gl: ['En Galicia hai cables que saen do mar en Sada.', 'Cando chegan á costa, entran en terra por unha estación de amarre e seguen por cables normais ata a túa antena.'],
    es: ['En Galicia hay cables que salen del mar en Sada.', 'Cuando llegan a la costa, entran en tierra por una estación de amarre y siguen por cables normales hasta tu antena.'],
    en: ['In Galicia, cables come ashore at Sada.', 'When they reach the coast, they come ashore at a landing station and continue over ordinary cables to your antenna.'] } },
}
for (const [id, capas] of Object.entries(CAMBIOS)) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
  let tocados = 0
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    for (const capa of ['primary', 'secondary', 'expert']) {
      let txt = n.content?.[capa]?.[i] || ''
      const cambio = capas[capa]?.[i]
      if (cambio && txt.includes(cambio[0])) { txt = txt.replace(cambio[0], cambio[1]); tocados++ }
      body[`text_${capa}_${i}`] = txt
      body[`reto_${capa}_${i}`] = n.retos?.[capa]?.[i] || ''
    }
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  console.log(id, p.status, 'frases substituídas:', tocados)
}
