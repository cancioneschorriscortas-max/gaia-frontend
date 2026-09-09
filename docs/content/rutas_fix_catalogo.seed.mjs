// Arranxo de coherencia do catálogo de rutas (rolda 35). Reexecutable: só fai PUT en journeys existentes.
// - galicia_no_prato e oficios_do_mar: etiquetas e descricións en es/en que faltaban; "Oficios Do Mar" → "Oficios do mar"
// - iconos repetidos entre rutas: cada ruta co seu (💧🧪🔬 estaban duplicados)
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const CAMBIOS = {
  galicia_no_prato: {
    label_gl: 'Galicia no prato', label_es: 'Galicia en el plato', label_en: 'Galicia on the plate',
    description_gl: 'Rías Baixas, albariño, polbo á feira e caldo: o que Galicia pon na mesa e de onde sae.',
    description_es: 'Rías Baixas, albariño, pulpo á feira y caldo: lo que Galicia pone en la mesa y de dónde sale.',
    description_en: 'Rías Baixas, Albariño, octopus and broth: what Galicia puts on the table and where it comes from.' },
  oficios_do_mar: {
    label_gl: 'Oficios do mar', label_es: 'Oficios del mar', label_en: 'Trades of the sea',
    description_gl: 'Mariñeiro, patrón, percebeiro, redeira, cesteiro e calafate: seis oficios que viven do mar galego.',
    description_es: 'Marinero, patrón, percebeiro, redera, cestero y calafate: seis oficios que viven del mar gallego.',
    description_en: 'Sailor, skipper, barnacle picker, net mender, basket maker and caulker: six trades that live off the Galician sea.' },
  a_auga_a_fondo:   { icono: '🚰' },
  o_lume_por_dentro: { icono: '🌡️' },
  o_lume_a_fondo:   { icono: '🕯️' },
  a_luz_a_fondo:    { icono: '💡' },
}
for (const [id, cambio] of Object.entries(CAMBIOS)) {
  const g = await j('GET', '/journeys/' + id, null, TOKEN); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const x = g.data.journey || g.data
  const body = {
    level: x.level || 'primary', type: x.type || 'educational', status: x.status || 'published', visibility: x.visibility || 'public',
    modulo: x.modulo || '', icono: x.icono || '',
    label_gl: x.label?.gl || x.label_gl || id, label_es: x.label?.es || x.label_es || '', label_en: x.label?.en || x.label_en || '',
    description_gl: x.description?.gl || x.description_gl || '', description_es: x.description?.es || x.description_es || '', description_en: x.description?.en || x.description_en || '',
    ...cambio
  }
  const p = await j('PUT', '/journeys/' + id, body, TOKEN)
  console.log(id, p.status, p.status !== 200 ? JSON.stringify(p.data).slice(0, 120) : Object.keys(cambio).join(','))
}
