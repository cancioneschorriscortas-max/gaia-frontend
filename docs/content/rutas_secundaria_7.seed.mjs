// FONTE DE VERDADE das rutas de SECUNDARIA (7ª entrega): "O millo, por dentro".
// Reutilizan os nodos da ruta do millo; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  o_millo: { gl: 'Unha leira de 2 hectáreas seméntase de millo forraxeiro. Se unha hectárea dá 40 toneladas de millo forraxeiro, cantas toneladas produce a leira? Cantas vacas de leite alimenta durante 200 días se cada vaca come 25 kg de ensilado ao día? Explica como se poliniza o millo polo vento, que papel ten cada barba da espiga, e por que unha espiga na que poucas barbas recibiron pole sae con ocos entre os grans.',
             es: 'Una finca de 2 hectáreas se siembra de maíz forrajero. Si una hectárea da 40 toneladas de maíz forrajero, ¿cuántas toneladas produce la finca? ¿Cuántas vacas de leche alimenta durante 200 días si cada vaca come 25 kg de ensilado al día? Explica cómo se poliniza el maíz por el viento, qué papel tiene cada barba de la mazorca, y por qué una mazorca en la que pocas barbas recibieron polen sale con huecos entre los granos.',
             en: 'A 2-hectare field is sown with forage maize. If one hectare yields 40 tonnes of forage maize, how many tonnes does the field produce? How many dairy cows does it feed for 200 days if each cow eats 25 kg of silage a day? Explain how maize is pollinated by the wind, what role each silk on the ear plays, and why an ear in which only a few silks received pollen comes out with gaps between the kernels.' },
  o_muino: { gl: 'Nun muíño de río, a moa dá 40 voltas por minuto e moe 30 kg de gran por hora. Nunha muiñada de 8 horas seguidas, cantos quilos de fariña saen e cantas voltas dá a moa en total? Explica por que unha volta do rodicio é exactamente unha volta da moa, e que transformacións de enerxía hai desde a auga retida na presa ata a fariña quente que sae de entre as pedras.',
             es: 'En un molino de río, la muela da 40 vueltas por minuto y muele 30 kg de grano por hora. En una molienda de 8 horas seguidas, ¿cuántos kilos de harina salen y cuántas vueltas da la muela en total? Explica por qué una vuelta del rodezno es exactamente una vuelta de la muela, y qué transformaciones de energía hay desde el agua retenida en la presa hasta la harina caliente que sale de entre las piedras.',
             en: 'In a river mill, the runner stone turns 40 times a minute and grinds 30 kg of grain an hour. In a milling session of 8 hours straight, how many kilos of flour come out and how many turns does the stone make in total? Explain why one turn of the water wheel is exactly one turn of the stone, and what energy transformations take place from the water held behind the weir to the warm flour coming out from between the stones.' },
  a_broa: { gl: 'Unha broa amásase con 600 g de fariña de millo e 400 g de fariña de centeo. Que fracción da fariña é de millo? Exprésaa como fracción simplificada e como porcentaxe. Cantas broas enteiras coma esa saen dun saco de 25 kg de fariña de millo, e cantos gramos de fariña sobran? Explica por que a broa non sobe coma o pan de trigo e que lle fai á masa escaldar a fariña con auga fervendo antes de amasar.',
            es: 'Una broa se amasa con 600 g de harina de maíz y 400 g de harina de centeno. ¿Qué fracción de la harina es de maíz? Exprésala como fracción simplificada y como porcentaje. ¿Cuántas broas enteras como esa salen de un saco de 25 kg de harina de maíz, y cuántos gramos de harina sobran? Explica por qué la broa no sube como el pan de trigo y qué le hace a la masa escaldar la harina con agua hirviendo antes de amasar.',
            en: 'A broa loaf is kneaded with 600 g of maize flour and 400 g of rye flour. What fraction of the flour is maize? Give it as a simplified fraction and as a percentage. How many whole loaves like that come out of a 25 kg sack of maize flour, and how many grams of flour are left over? Explain why broa does not rise like wheat bread and what scalding the flour with boiling water before kneading does to the dough.' },
  o_horreo: { gl: 'O millo entra no hórreo ao 30 % de humidade e sae ao 14 %. Nunha tonelada de millo acabado de colleitar, cantos quilos son materia seca? Se esa materia seca non cambia, canto pesa o millo cando queda ao 14 % (a materia seca é entón o 86 % do peso), e cantos quilos de auga perdeu? Explica para que serven os tornarratos e por que as paredes do hórreo teñen fendas estreitas en vez de seren macizas.',
              es: 'El maíz entra en el hórreo al 30 % de humedad y sale al 14 %. En una tonelada de maíz recién cosechado, ¿cuántos kilos son materia seca? Si esa materia seca no cambia, ¿cuánto pesa el maíz cuando queda al 14 % (la materia seca es entonces el 86 % del peso), y cuántos kilos de agua perdió? Explica para qué sirven los tornarratos y por qué las paredes del hórreo tienen rendijas estrechas en vez de ser macizas.',
              en: 'Maize goes into the hórreo at 30% moisture and comes out at 14%. In one tonne of freshly harvested maize, how many kilos are dry matter? If that dry matter does not change, how much does the maize weigh once it is at 14% (dry matter is then 86% of the weight), and how many kilos of water has it lost? Explain what the tornarratos are for and why the walls of the hórreo have narrow slits instead of being solid.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  o_millo: "2 ha × 40 t/ha = 80 t (80.000 kg). Cada vaca: 25 kg × 200 días = 5.000 kg; 80.000 / 5.000 = 16 vacas. Concepto: o pole da pendoa vai polo vento; cada barba é un estilo unido a un óvulo e só forma gran se lle baixa pole; as barbas sen pole deixan ocos na espiga.",
  o_muino: "30 kg/h × 8 h = 240 kg de fariña. 40 voltas/min × 60 × 8 = 19.200 voltas. Concepto: rodicio e moa van no mesmo eixe vertical, sen engrenaxes (unha volta = unha volta); enerxía potencial da auga na presa → cinética na caída → mecánica de rotación → traballo de moenda e calor (fariña quente).",
  a_broa: "600 / 1.000 = 3/5 = 60 % de millo. 25.000 g / 600 g = 41 broas enteiras, sobran 400 g. Concepto: sen glute a masa non retén o CO2 e non sobe; escaldar a fariña xelatiniza o amidón (60–70 °C), masa máis manexable e miga máis húmida que dura máis.",
  o_horreo: "Ao 30 % de humidade, a materia seca é o 70 %: 1.000 × 0,70 = 700 kg. Ao 14 %, a materia seca é o 86 %: 700 / 0,86 ≈ 814 kg. Auga perdida: 1.000 − 814 ≈ 186 kg. Concepto: os tornarratos (lousas voadas sobre cada pé) impiden que suban os ratos; as fendas deixan pasar o aire para secar sen mofo e non deixan pasar auga nin paxaros.",
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
  { nodos: ['o_millo', 'o_muino', 'a_broa', 'o_horreo'],
    journey: { label_gl: 'O millo, por dentro', label_es: 'El maíz, por dentro', label_en: 'Maize, from the inside',
      description_gl: 'Toneladas por hectárea e vacas por leira, as voltas dunha moa, a fracción de millo da broa e a auga que perde unha tonelada no hórreo: o millo con números.', description_es: 'Toneladas por hectárea, vacas por finca, vueltas de una muela, fracción de maíz en la broa y agua que pierde una tonelada en el hórreo: el maíz con números.', description_en: 'Tonnes per hectare and cows per field, the turns of a millstone, the maize fraction in broa and the water a tonne loses in the hórreo: maize with numbers.',
      modulo: 'Galicia', icono: '🌽' } },
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
