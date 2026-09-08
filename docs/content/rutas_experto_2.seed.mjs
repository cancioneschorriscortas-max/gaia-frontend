// FONTE DE VERDADE da segunda ruta de nivel EXPERTO: "O lume, a fondo" 🔥🎓 (nodos do lume con text_expert + reto_expert).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const EXPERT = {
  a_lena: {
    texto: {
      gl: 'A madeira é sobre todo celulosa, hemicelulosa e lignina: polímeros de carbono, hidróxeno e osíxeno fixados pola fotosíntese (6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂). O seu poder calorífico inferior rolda os 4,2 kWh/kg en seco, pero cae a menos da metade con leña verde: parte da enerxía gástase en evaporar a auga (2.257 kJ/kg). Queimar biomasa devolve á atmosfera o CO₂ que a árbore capturou; é neutro en carbono só se o bosque se repón, e emite partículas finas e monóxido se a combustión é incompleta.',
      es: 'La madera es sobre todo celulosa, hemicelulosa y lignina: polímeros de carbono, hidrógeno y oxígeno fijados por la fotosíntesis (6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂). Su poder calorífico inferior ronda los 4,2 kWh/kg en seco, pero cae a menos de la mitad con leña verde: parte de la energía se gasta en evaporar el agua (2.257 kJ/kg). Quemar biomasa devuelve a la atmósfera el CO₂ que el árbol capturó; es neutro en carbono solo si el bosque se repone, y emite partículas finas y monóxido si la combustión es incompleta.',
      en: 'Wood is mostly cellulose, hemicellulose and lignin: polymers of carbon, hydrogen and oxygen fixed by photosynthesis (6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂). Its lower heating value is about 4.2 kWh/kg when dry, but drops to less than half with green wood: part of the energy goes into evaporating water (2,257 kJ/kg). Burning biomass returns to the atmosphere the CO₂ the tree captured; it is carbon-neutral only if the forest regrows, and it emits fine particles and carbon monoxide if combustion is incomplete.' },
    reto: {
      gl: 'Calcula cantos kWh dá un quilo de leña seca fronte a un de leña verde ao 50 % de humidade (usa 4,2 kWh/kg en seco e 0,63 kWh por kg de auga evaporada) e razoa se a leña é "enerxía limpa".',
      es: 'Calcula cuántos kWh da un kilo de leña seca frente a uno de leña verde al 50 % de humedad (usa 4,2 kWh/kg en seco y 0,63 kWh por kg de agua evaporada) y razona si la leña es "energía limpia".',
      en: 'Work out how many kWh a kilo of dry firewood gives versus a kilo of green wood at 50% moisture (use 4.2 kWh/kg dry and 0.63 kWh per kg of water evaporated) and argue whether firewood is "clean energy".' } },
  o_aire: {
    texto: {
      gl: 'O aire seco é un 78 % de N₂, un 21 % de O₂ e un 1 % de argón e outros; o CO₂ é só un 0,04 %. Na combustión o osíxeno é o comburente: sen el a reacción non avanza, e por debaixo dun 16 % de O₂ a maioría das chamas apáganse. O nitróxeno non reacciona, pero absorbe calor e limita a temperatura da chama; a altas temperaturas forma NOₓ, un contaminante. Por iso os motores e as caldeiras controlan a relación aire/combustible (a estequiométrica para a madeira rolda 6 kg de aire por kg).',
      es: 'El aire seco es un 78 % de N₂, un 21 % de O₂ y un 1 % de argón y otros; el CO₂ es solo un 0,04 %. En la combustión el oxígeno es el comburente: sin él la reacción no avanza, y por debajo de un 16 % de O₂ la mayoría de las llamas se apagan. El nitrógeno no reacciona, pero absorbe calor y limita la temperatura de la llama; a altas temperaturas forma NOₓ, un contaminante. Por eso los motores y las calderas controlan la relación aire/combustible (la estequiométrica para la madera ronda 6 kg de aire por kg).',
      en: 'Dry air is 78% N₂, 21% O₂ and 1% argon and others; CO₂ is only 0.04%. In combustion oxygen is the oxidiser: without it the reaction does not proceed, and below about 16% O₂ most flames go out. Nitrogen does not react, but it absorbs heat and limits flame temperature; at high temperatures it forms NOₓ, a pollutant. That is why engines and boilers control the air/fuel ratio (the stoichiometric ratio for wood is around 6 kg of air per kg).' },
    reto: {
      gl: 'Unha candea tapada cun vaso de 250 ml apágase aos poucos segundos. Estima cantos gramos de osíxeno había dispoñibles e explica por que se apaga antes de gastalo todo.',
      es: 'Una vela tapada con un vaso de 250 ml se apaga a los pocos segundos. Estima cuántos gramos de oxígeno había disponibles y explica por qué se apaga antes de gastarlo todo.',
      en: 'A candle covered with a 250 ml glass goes out after a few seconds. Estimate how many grams of oxygen were available and explain why it goes out before using it all.' } },
  a_chispa: {
    texto: {
      gl: 'Para que un combustible arda hai que superar a súa enerxía de activación: a chispa ou o misto achegan a calor inicial que rompe os primeiros enlaces. A partir de aí a reacción é exotérmica e autosostida, sempre que a calor liberada supere a que se perde. A temperatura de ignición da madeira rolda os 300 °C; a do papel, 230 °C. O "triángulo do lume" amplíase ao tetraedro engadindo a reacción en cadea dos radicais libres: os extintores de po químico e os halóns actúan xusto aí, interrompendo a cadea sen quitar nin osíxeno nin calor.',
      es: 'Para que un combustible arda hay que superar su energía de activación: la chispa o la cerilla aportan el calor inicial que rompe los primeros enlaces. A partir de ahí la reacción es exotérmica y autosostenida, siempre que el calor liberado supere el que se pierde. La temperatura de ignición de la madera ronda los 300 °C; la del papel, 230 °C. El "triángulo del fuego" se amplía al tetraedro añadiendo la reacción en cadena de los radicales libres: los extintores de polvo químico y los halones actúan justo ahí, interrumpiendo la cadena sin quitar ni oxígeno ni calor.',
      en: 'For a fuel to burn its activation energy must be overcome: the spark or the match supplies the initial heat that breaks the first bonds. From then on the reaction is exothermic and self-sustaining, as long as the heat released exceeds the heat lost. The ignition temperature of wood is around 300 °C; paper, 230 °C. The "fire triangle" becomes a tetrahedron by adding the free-radical chain reaction: dry-powder extinguishers and halons act right there, breaking the chain without removing oxygen or heat.' },
    reto: {
      gl: 'Explica con enerxía de activación por que a leña non arde soa no galpón pero si cun misto, e por que un incendio forestal, unha vez comezado, xa non precisa ningunha chispa.',
      es: 'Explica con energía de activación por qué la leña no arde sola en el cobertizo pero sí con una cerilla, y por qué un incendio forestal, una vez empezado, ya no necesita ninguna chispa.',
      en: 'Using activation energy, explain why firewood does not burn by itself in the shed but does with a match, and why a wildfire, once started, needs no more sparks.' } },
  o_lume: {
    texto: {
      gl: 'A combustión completa da celulosa é (C₆H₁₀O₅)ₙ + 6n O₂ → 6n CO₂ + 5n H₂O + calor. A chama amarela é radiación de partículas de carbón (feluxe) a uns 1.000 °C; a azul da base é a emisión de radicais CH e C₂, máis quente e con combustión máis completa. A calor transmítese por condución (o ferro da cociña), convección (o aire quente que sobe) e radiación (a que sentes na cara desde lonxe). A cinza son os minerais que a planta colleu do solo (potasio, calcio) e por iso abona a horta. Nun incendio forestal a fronte avanza por radiación e convección, e o vento multiplica a velocidade.',
      es: 'La combustión completa de la celulosa es (C₆H₁₀O₅)ₙ + 6n O₂ → 6n CO₂ + 5n H₂O + calor. La llama amarilla es radiación de partículas de carbón (hollín) a unos 1.000 °C; la azul de la base es la emisión de radicales CH y C₂, más caliente y con combustión más completa. El calor se transmite por conducción (el hierro de la cocina), convección (el aire caliente que sube) y radiación (la que sientes en la cara desde lejos). La ceniza son los minerales que la planta cogió del suelo (potasio, calcio) y por eso abona la huerta. En un incendio forestal el frente avanza por radiación y convección, y el viento multiplica la velocidad.',
      en: 'The complete combustion of cellulose is (C₆H₁₀O₅)ₙ + 6n O₂ → 6n CO₂ + 5n H₂O + heat. The yellow flame is radiation from carbon particles (soot) at about 1,000 °C; the blue at the base is emission from CH and C₂ radicals, hotter and with more complete combustion. Heat travels by conduction (the iron of the stove), convection (the hot air rising) and radiation (what you feel on your face from afar). Ash is the minerals the plant took from the soil (potassium, calcium), which is why it fertilises the garden. In a wildfire the front advances by radiation and convection, and wind multiplies its speed.' },
    reto: {
      gl: 'Escribe a ecuación da combustión completa da celulosa e a da incompleta (con CO). Explica por que unha lareira mal ventilada pode matar sen que se vexa fume, e cal dos tres mecanismos de transmisión da calor fai que un incendio salte unha estrada.',
      es: 'Escribe la ecuación de la combustión completa de la celulosa y la de la incompleta (con CO). Explica por qué una lareira mal ventilada puede matar sin que se vea humo, y cuál de los tres mecanismos de transmisión del calor hace que un incendio salte una carretera.',
      en: 'Write the equation for the complete combustion of cellulose and for incomplete combustion (with CO). Explain why a badly ventilated hearth can kill without visible smoke, and which of the three heat-transfer mechanisms lets a wildfire jump a road.' } },
}

for (const [id, x] of Object.entries(EXPERT)) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = n.content?.primary?.[i] || ''
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = x.texto[i] || n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = x.reto[i] || n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  console.log('experto', id, p.status)
}
const journey = { label_gl: 'O lume, a fondo', label_es: 'El fuego, a fondo', label_en: 'Fire, in depth',
  description_gl: 'Poder calorífico, estequiometría, enerxía de activación e a química da chama: o lume para quen quere as ecuacións.',
  description_es: 'Poder calorífico, estequiometría, energía de activación y la química de la llama: el fuego para quien quiere las ecuaciones.',
  description_en: 'Heating value, stoichiometry, activation energy and the chemistry of the flame: fire for those who want the equations.',
  modulo: 'Ciencia', icono: '🔬' }
const stops = ['a_lena', 'o_aire', 'a_chispa', 'o_lume'].map((n, i) => ({ nodo: n, order: i + 1 }))
const res = await j('POST', '/journeys', { ...journey, level: 'expert', type: 'educational', visibility: 'public', stops }, TOKEN)
console.log('journey', res.status, res.data?.id || res.data?.error)
if (res.data?.id) {
  const p = await j('PUT', '/journeys/' + res.data.id, { ...journey, level: 'expert', type: 'educational', status: 'published', visibility: 'public' }, TOKEN); console.log('  publicada', p.status)
}
