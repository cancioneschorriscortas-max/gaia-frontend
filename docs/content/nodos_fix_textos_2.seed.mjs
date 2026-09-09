// Arranxos de texto en nodos xa cargados (rolda 39). Reexecutable: substitúe frases nos textos existentes.
// - o_sal: "pagábanlles en sal" é un mito (a etimoloxía de "salario" si vén de sal)
// - o_leite: a pasteurización leva o nome de Pasteur (1864); o método HTST actual é posterior
// - a_lonxa: "só un 10 % queda na comarca" non ten fonte → "a maior parte vai a toda España"
// - a_conserva (experto): "naceu en 1836" sen fonte firme → "a mediados do século XIX"
// - o_tear: museos do tear sen verificar → "museos etnográficos gardan teares antigos"
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

export const CAMBIOS = {
  o_sal: { secondary: {
    gl: ['A palabra "salario" vén do sal: aos soldados romanos pagábanlles unha parte en sal, tan valioso era.', 'A palabra "salario" vén de "sal": tan valioso era que os romanos lle deron ese nome ao soldo, aínda que non está claro que pagasen en sal.'],
    es: ['La palabra "salario" viene de la sal: a los soldados romanos les pagaban una parte en sal, tan valiosa era.', 'La palabra "salario" viene de "sal": tan valiosa era que los romanos le dieron ese nombre al sueldo, aunque no está claro que pagasen en sal.'],
    en: ['The word "salary" comes from salt: Roman soldiers were paid partly in salt, so valuable was it.', 'The word "salary" comes from "salt": it was so valuable that the Romans named wages after it, although it is not clear they actually paid in salt.'] } },
  o_leite: { secondary: {
    gl: ['A pasteurización, que quenta o leite a uns 72 graos uns segundos, inventouna Louis Pasteur para que non nos puxese enfermos.', 'A pasteurización, que quenta o leite a uns 72 graos uns segundos, leva o nome de Louis Pasteur, que descubriu en 1864 que a calor moderada mata os microbios sen cocer o alimento.'],
    es: ['La pasteurización, que calienta la leche a unos 72 grados unos segundos, la inventó Louis Pasteur para que no nos pusiera enfermos.', 'La pasteurización, que calienta la leche a unos 72 grados unos segundos, lleva el nombre de Louis Pasteur, que descubrió en 1864 que el calor moderado mata los microbios sin cocer el alimento.'],
    en: ['Pasteurisation, which heats milk to about 72 degrees for a few seconds, was invented by Louis Pasteur so it would not make us ill.', 'Pasteurisation, which heats milk to about 72 degrees for a few seconds, is named after Louis Pasteur, who discovered in 1864 that moderate heat kills microbes without cooking the food.'] } },
  a_lonxa: { secondary: {
    gl: ['Só un 10 % do que se pesca queda na comarca: o resto vai en camión frigorífico a toda España.', 'A maior parte do que se pesca sae o mesmo día en camión frigorífico a toda España.'],
    es: ['Solo un 10 % de lo que se pesca se queda en la comarca: el resto va en camión frigorífico a toda España.', 'La mayor parte de lo que se pesca sale el mismo día en camión frigorífico a toda España.'],
    en: ['Only 10% of the catch stays in the area: the rest goes by refrigerated lorry across Spain.', 'Most of the catch leaves the same day by refrigerated lorry for the whole of Spain.'] } },
  a_conserva: { expert: {
    gl: ["A conserveira galega naceu en 1836 e hoxe fai", "A conserveira galega naceu a mediados do século XIX e hoxe fai"],
    es: ["La conservera gallega nació en 1836 y hoy hace", "La conservera gallega nació a mediados del siglo XIX y hoy hace"],
    en: ["The Galician canning industry was born in 1836 and today makes", "The Galician canning industry was born in the mid-19th century and today makes"] } },
  o_tear: { secondary: {
    gl: ['e o Museo do Tear de Allariz ou o de Vilardevós gardan a memoria do oficio.', 'e os museos etnográficos gardan teares antigos coa memoria do oficio.'],
    es: ['y museos del telar guardan la memoria del oficio.', 'y los museos etnográficos guardan telares antiguos con la memoria del oficio.'],
    en: ['and loom museums keep the memory of the trade.', 'and ethnographic museums keep old looms with the memory of the trade.'] } },
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
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
}
