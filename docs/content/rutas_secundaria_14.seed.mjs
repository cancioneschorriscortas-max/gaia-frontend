// FONTE DE VERDADE das rutas de SECUNDARIA (14ª entrega): "A madeira, por dentro".
// Reutilizan os nodos da ruta da madeira; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  o_pineiro: { gl: 'Un tronco de piñeiro de 40 cm de diámetro ten 40 aneis. Cantos anos ten a árbore? O tronco pesa 400 kg seco, e a metade do peso da madeira seca é carbono: cantos quilos de carbono garda? Cantos quilos de CO2 colleu do aire para fabricalos, se o CO2 pesa 3,67 veces o carbono que leva? Explica que son a madeira temperá e a madeira serodia de cada anel, e por que un anel estreito indica un ano malo.',
               es: 'Un tronco de pino de 40 cm de diámetro tiene 40 anillos. ¿Cuántos años tiene el árbol? El tronco pesa 400 kg seco, y la mitad del peso de la madera seca es carbono: ¿cuántos kilos de carbono guarda? ¿Cuántos kilos de CO2 cogió del aire para fabricarlos, si el CO2 pesa 3,67 veces el carbono que lleva? Explica qué son la madera temprana y la madera tardía de cada anillo, y por qué un anillo estrecho indica un año malo.',
               en: 'A pine trunk 40 cm in diameter has 40 rings. How old is the tree? The trunk weighs 400 kg dry, and half the weight of dry wood is carbon: how many kilos of carbon does it hold? How many kilos of CO2 did it take from the air to build them, if CO2 weighs 3.67 times the carbon it carries? Explain what earlywood and latewood are within each ring, and why a narrow ring means a bad year.' },
  o_serradoiro: { gl: 'Un tronco verde de 600 kg chega ao serradoiro ao 55 % de humidade (a auga é o 55 % do peso). Cantos quilos son materia seca? Se esa materia seca non cambia, canto pesa a madeira ao 15 % (a materia seca é entón o 85 % do peso)? Se só a metade do tronco sae en táboa, cantos quilos de táboa seca dá? Explica a diferenza entre contracción tanxencial e radial, e por que unha táboa cortada preto da casca curva coma unha tella.',
                  es: 'Un tronco verde de 600 kg llega al aserradero al 55 % de humedad (el agua es el 55 % del peso). ¿Cuántos kilos son materia seca? Si esa materia seca no cambia, ¿cuánto pesa la madera al 15 % (la materia seca es entonces el 85 % del peso)? Si solo la mitad del tronco sale en tabla, ¿cuántos kilos de tabla seca da? Explica la diferencia entre contracción tangencial y radial, y por qué una tabla cortada cerca de la corteza se curva como una teja.',
                  en: 'A green 600 kg trunk arrives at the sawmill at 55% moisture (water is 55% of the weight). How many kilos are dry matter? If that dry matter does not change, how much does the wood weigh at 15% (dry matter is then 85% of the weight)? If only half the trunk comes out as boards, how many kilos of dry board does it give? Explain the difference between tangential and radial shrinkage, and why a board cut near the bark cups like a roof tile.' },
  o_carpinteiro: { gl: 'Un carpinteiro fai unha mesa con 4 patas de 0,75 m e un taboleiro de 1,2 × 0,8 m. Cantos metros de listón precisa para as patas? Cantos metros cadrados mide o taboleiro? Un listón de piñeiro tirado a través da veta aguanta 50 kg antes de romper; se ao longo da veta a madeira aguanta 10 veces máis, cantos quilos aguanta ao longo? Explica que significa que a madeira sexa anisotrópica e como funciona a ensamblaxe de caixa e espiga.',
                   es: 'Un carpintero hace una mesa con 4 patas de 0,75 m y un tablero de 1,2 × 0,8 m. ¿Cuántos metros de listón necesita para las patas? ¿Cuántos metros cuadrados mide el tablero? Un listón de pino tirado a través de la veta aguanta 50 kg antes de romper; si a lo largo de la veta la madera aguanta 10 veces más, ¿cuántos kilos aguanta a lo largo? Explica qué significa que la madera sea anisótropa y cómo funciona el ensamble de caja y espiga.',
                   en: 'A carpenter builds a table with 4 legs of 0.75 m and a top of 1.2 × 0.8 m. How many metres of batten does he need for the legs? How many square metres is the top? A pine batten pulled across the grain holds 50 kg before breaking; if along the grain wood holds 10 times more, how many kilos does it hold lengthwise? Explain what it means for wood to be anisotropic and how a mortise and tenon joint works.' },
  o_moble: { gl: 'O piñeiro seco pesa 500 kg/m³, e a parede das súas células, feita de celulosa e lignina, pesa 1.500 kg/m³. Cantos quilos pesa un metro cúbico de piñeiro seco? Que fracción do volume da madeira é aire (calcula 1 − 500/1.500)? Se cada metro cúbico de madeira garda arredor dunha tonelada de CO2, cantas toneladas de CO2 gardan 5 m³ de mobles? Explica por que a madeira parece quente ao tocala e por que os fungos só a podrecen se pasa do 20 % de humidade.',
             es: 'El pino seco pesa 500 kg/m³, y la pared de sus células, hecha de celulosa y lignina, pesa 1.500 kg/m³. ¿Cuántos kilos pesa un metro cúbico de pino seco? ¿Qué fracción del volumen de la madera es aire (calcula 1 − 500/1.500)? Si cada metro cúbico de madera guarda alrededor de una tonelada de CO2, ¿cuántas toneladas de CO2 guardan 5 m³ de muebles? Explica por qué la madera parece caliente al tocarla y por qué los hongos solo la pudren si pasa del 20 % de humedad.',
             en: 'Dry pine weighs 500 kg/m³, and its cell walls, made of cellulose and lignin, weigh 1,500 kg/m³. How many kilos does one cubic metre of dry pine weigh? What fraction of the wood\'s volume is air (work out 1 − 500/1,500)? If each cubic metre of wood stores around one tonne of CO2, how many tonnes of CO2 do 5 m³ of furniture store? Explain why wood feels warm to the touch and why fungi only rot it once it goes above 20% moisture.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  o_pineiro: "Idade: un anel por ano, 40 aneis = 40 anos (o diámetro non fai falta). Carbono: 400 kg × 0,5 = 200 kg. CO2: 200 × 3,67 = 734 kg (aceptable 730–735; con 44/12 exacto, 733). Crédito parcial se dá 200 kg de carbono pero non converte a CO2, ou se multiplica o CO2 polos 400 kg (1.468 kg) esquecendo a metade. Concepto: a madeira temperá é a capa de primavera, células grandes e claras; a serodia é a de verán, células pequenas e escuras; ese par claro-escuro é un anel de crecemento. Un anel estreito é un ano no que a árbore medrou pouco: seca, praga ou frío. Non hai que penalizar se chama temperá/serodia «de primavera/de verán».",
  o_serradoiro: "Materia seca: ao 55 % de humidade queda o 45 %: 600 × 0,45 = 270 kg. Ao 15 %, a materia seca é o 85 % do peso: 270 / 0,85 ≈ 318 kg (aceptable 317–318; perdeu ≈ 282 kg de auga). Táboa seca: a metade, 318 / 2 ≈ 159 kg (aceptable 158–160). Crédito parcial se calcula ben os 270 kg pero resta o 15 % en vez de dividir por 0,85 (229 kg). Concepto: ao secar, a madeira contrae case nada ao longo da veta, algo no sentido radial (do centro cara á casca) e arredor do dobre no tanxencial (seguindo os aneis). Nunha táboa cortada preto da casca, a cara de fóra contrae máis ca a de dentro, e por iso curva coma unha tella.",
  o_carpinteiro: "Patas: 4 × 0,75 m = 3 m de listón. Taboleiro: 1,2 × 0,8 = 0,96 m² («case 1 m²» só con crédito parcial). Resistencia: 50 kg × 10 = 500 kg ao longo da veta. Crédito parcial se confunde perímetro con área (4 m) ou divide en vez de multiplicar (5 kg). Concepto: a madeira está feita de células alongadas coma pallas pegadas que corren ao longo do tronco (a veta); é anisotrópica porque non se comporta igual en todas as direccións: ao longo da veta aguanta moitísimo, a través as fibras sepáranse con facilidade, e por iso racha ao longo e non a través. Caixa e espiga: un oco (caixa) nunha peza e unha lingua (espiga) na outra, encaixan apertadas sen cravos e a cola fai a xunta tan forte coma a madeira.",
  o_moble: "Un metro cúbico de piñeiro seco pesa 500 kg. Fracción de aire: 1 − 500/1.500 = 1 − 1/3 = 2/3 ≈ 67 % (aceptable 66–67 % ou «dous terzos»). CO2: 5 m³ × 1 t/m³ = 5 toneladas (5.000 kg). Crédito parcial se dá 1/3 (a fracción de parede celular) sen restar, ou se deixa o CO2 en quilos. Concepto: a madeira parece quente porque o aire pechado nas células conduce a calor centos de veces peor ca o aceiro e non rouba a calor da man; o metal si a conduce e por iso parece frío á mesma temperatura. Os fungos que podrecen a madeira precisan auga e só medran se pasa do 20 % de humidade; por iso as vigas de castiñeiro secas e a cuberto, ricas en taninos, levan séculos en pé.",
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
  { nodos: ['o_pineiro', 'o_serradoiro', 'o_carpinteiro', 'o_moble'],
    journey: { label_gl: 'A madeira, por dentro', label_es: 'La madera, por dentro', label_en: 'Wood, from the inside',
      description_gl: 'Os aneis e o carbono dun tronco, a auga que perde ao secar, os listóns dunha mesa e o aire que fai flotar un moble: a madeira con números.', description_es: 'Los anillos y el carbono de un tronco, el agua que pierde al secar, los listones de una mesa y el aire que hace flotar un mueble: la madera con números.', description_en: 'The rings and carbon of a trunk, the water it loses as it dries, the metres of batten in a table and the air that makes furniture float: wood with numbers.',
      modulo: 'Natureza', icono: '🪵' } },
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
