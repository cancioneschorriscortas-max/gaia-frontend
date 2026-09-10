// Rolda 56: (1) os nodos que son parada dunha ruta publicada e foron escritos para as rutas ("GAIA — como funciona o
// mundo") pasan de draft a validated, para distinguilos no mapa dos borradores vellos; (2) reto de experto de o_xeo
// sen a ambigüidade ("canto a 10 °C se alguén deixa a caixa ao sol dúas horas").
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token
const RETO_XEO = {
  gl: 'Con Q10 = 2, calcula cantos días dura un peixe a 0 °C se dura 1 día a 20 °C, e cantos a 10 °C. Se alguén deixa a caixa dúas horas ao sol a 30 °C, cantas horas de vida útil a 10 °C consome ese descoido? Explica por que un salmón conxelado amodo na casa solta auga ao desconxelar e un ultraconxelado a bordo non.',
  es: 'Con Q10 = 2, calcula cuántos días dura un pescado a 0 °C si dura 1 día a 20 °C, y cuántos a 10 °C. Si alguien deja la caja dos horas al sol a 30 °C, ¿cuántas horas de vida útil a 10 °C consume ese descuido? Explica por qué un salmón congelado despacio en casa suelta agua al descongelar y uno ultracongelado a bordo no.',
  en: 'With Q10 = 2, work out how many days a fish lasts at 0 °C if it lasts 1 day at 20 °C, and how many at 10 °C. If someone leaves the box in the sun at 30 °C for two hours, how many hours of shelf life at 10 °C does that slip use up? Explain why a salmon frozen slowly at home leaks water when thawed and one blast-frozen on board does not.',
}
const SOL_XEO = 'Cifras: 20 → 0 °C son dous saltos de 10 °C: 1 × 2 × 2 = 4 días a 0 °C. A 10 °C, 2 días (48 h). Cada hora a 30 °C gasta o que 4 horas a 10 °C (dous saltos de Q10 = 2): 2 h × 4 = 8 horas de vida útil consumidas (aceptable dicir que quedan 40 h ≈ 1,7 días). Concepto: conxelar amodo forma cristais de xeo grandes que rompen as membranas das células e ao desconxelar sae líquido (perda por goteo); a ultraconxelación a bordo (−40 °C) forma cristais minúsculos que non rompen nada.'
async function actualizar(id, cambios) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) return console.log('GET', id, g.status)
  const n = g.data
  const body = { type: n.type, status: cambios.status || n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
  for (const l of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${l}`] = n.labels?.[l] || ''
    for (const niv of ['primary', 'secondary', 'expert']) { body[`text_${niv}_${l}`] = n.content?.[niv]?.[l] || ''; body[`reto_${niv}_${l}`] = n.retos?.[niv]?.[l] || '' }
    if (cambios.reto_expert?.[l]) body[`reto_expert_${l}`] = cambios.reto_expert[l]
  }
  if (cambios.solucion_expert) body.solucion_expert = cambios.solucion_expert
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  return p.status
}
// (2) o reto do xeo
console.log('o_xeo reto experto', await actualizar('o_xeo', { reto_expert: RETO_XEO, solucion_expert: SOL_XEO }))
// (1) validar os nodos das rutas
const js = (await j('GET', '/journeys')).data.journeys
const ids = new Set()
for (const r of js) { const f = (await j('GET', '/journeys/' + r.id)).data; for (const s of f.stops || []) ids.add((s.nodo && typeof s.nodo === 'object') ? s.nodo.id : (s.nodo || s.id)) }
let validados = 0, xa = 0, outros = 0
for (const id of ids) {
  const n = (await j('GET', '/nodo/' + encodeURIComponent(id))).data
  if (!n || !n.labels) continue
  if (n.status === 'validated') { xa++; continue }
  if (!/GAIA/.test(n.autor || '')) { outros++; continue }   // só os escritos para as rutas; os do dono quedan como están
  if (await actualizar(id, { status: 'validated' }) === 200) validados++
}
console.log('paradas de rutas:', ids.size, '| validados agora:', validados, '| xa validados:', xa, '| doutros autores (sen tocar):', outros)
