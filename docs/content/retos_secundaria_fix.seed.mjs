// Retos abertos de secundaria nivelados (rolda 42): cinco retos que eran só "explica coas túas palabras"
// pasan a pedir un cálculo ou un dato que razoar, coma os das rutas novas. Reexecutable (PUT en nodos existentes).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

export const RETOS_SEC = {
  o_vento: {
    gl: 'Un aeroxerador dá 3 MW cando o vento vai a 12 m/s, e unha casa gasta de media uns 3 kW cando ten todo acendido. Cantas casas alimenta nese momento? Explica por que sopra o vento (que ten que ver o Sol) e por que o muíño non dá sempre eses 3 MW.',
    es: 'Un aerogenerador da 3 MW cuando el viento va a 12 m/s, y una casa gasta de media unos 3 kW cuando tiene todo encendido. ¿Cuántas casas alimenta en ese momento? Explica por qué sopla el viento (qué tiene que ver el Sol) y por qué el molino no da siempre esos 3 MW.',
    en: 'A wind turbine gives 3 MW when the wind is 12 m/s, and a house draws about 3 kW with everything on. How many houses does it power at that moment? Explain why the wind blows (what the Sun has to do with it) and why the turbine does not always give those 3 MW.' },
  o_xerador: {
    gl: 'Un xerador convirte movemento en electricidade. Describe que hai dentro, que descubriu Faraday en 1831 e que pasaría coa corrente se o imán deixase de xirar e quedase quieto pegado ao cable.',
    es: 'Un generador convierte movimiento en electricidad. Describe qué hay dentro, qué descubrió Faraday en 1831 y qué pasaría con la corriente si el imán dejase de girar y se quedase quieto pegado al cable.',
    en: 'A generator turns motion into electricity. Describe what is inside it, what Faraday discovered in 1831, and what would happen to the current if the magnet stopped turning and stayed still next to the wire.' },
  a_rede_electrica: {
    gl: 'A potencia é tensión por corrente (P = V·I). Para levar 400 MW, cantos amperios fan falta a 400.000 V e cantos a 230 V? Explica con ese resultado por que a electricidade viaxa en alta tensión polas torres e se lle baixa antes de entrar nas casas.',
    es: 'La potencia es tensión por corriente (P = V·I). Para llevar 400 MW, ¿cuántos amperios hacen falta a 400.000 V y cuántos a 230 V? Explica con ese resultado por qué la electricidad viaja en alta tensión por las torres y se le baja antes de entrar en las casas.',
    en: 'Power is voltage times current (P = V·I). To carry 400 MW, how many amps are needed at 400,000 V and how many at 230 V? Use that result to explain why electricity travels at high voltage along the pylons and is stepped down before entering homes.' },
  o_enchufe: {
    gl: 'Que pasa nun circuíto cando acendes un interruptor? Usa as palabras "camiño", "pechado" e "corrente". Despois explica por que o diferencial do cadro salta se se escapan 30 mA e por que iso protexe a unha persoa.',
    es: '¿Qué pasa en un circuito cuando enciendes un interruptor? Usa las palabras "camino", "cerrado" y "corriente". Después explica por qué el diferencial del cuadro salta si se escapan 30 mA y por qué eso protege a una persona.',
    en: 'What happens in a circuit when you flip a switch on? Use the words "path", "closed" and "current". Then explain why the residual-current device in the fuse box trips if 30 mA leak away, and why that protects a person.' },
  a_lua_astro: {
    gl: 'A gravidade da Lúa tira da auga e tamén da terra firme, que sobe uns 30 cm sen que o notemos. Por que a marea se ve tanto no mar e case nada en terra? Fala de que a auga é líquida e pode desprazarse, e de a que distancia está a Lúa.',
    es: 'La gravedad de la Luna tira del agua y también de la tierra firme, que sube unos 30 cm sin que lo notemos. ¿Por qué la marea se ve tanto en el mar y casi nada en tierra? Habla de que el agua es líquida y puede desplazarse, y de a qué distancia está la Luna.',
    en: 'The Moon\'s gravity pulls on the water and also on the solid ground, which rises about 30 cm without us noticing. Why is the tide so visible at sea and hardly at all on land? Talk about water being a liquid that can move, and about how far away the Moon is.' },
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  for (const [id, reto] of Object.entries(RETOS_SEC)) {
    const g = await j('GET', '/nodo/' + id); if (g.status !== 200) { console.log('GET', id, g.status); continue }
    const n = g.data
    const rel = typeof n.relevance === 'number' ? (n.relevance >= 7 ? 'high' : n.relevance >= 4 ? 'medium' : 'low') : (n.relevance || 'medium')
    const body = { type: n.type, status: n.status, relevance: rel, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
    for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
      body[`label_${i}`] = n.labels?.[i] || ''
      for (const capa of ['primary', 'secondary', 'expert']) {
        body[`text_${capa}_${i}`] = n.content?.[capa]?.[i] || ''
        body[`reto_${capa}_${i}`] = (capa === 'secondary' && reto[i]) ? reto[i] : (n.retos?.[capa]?.[i] || '')
      }
    }
    const p = await j('PUT', '/nodo/' + id, body, TOKEN)
    console.log(id, p.status)
  }
}
