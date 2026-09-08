// FONTE DE VERDADE da terceira ruta de nivel EXPERTO: "A auga, a fondo" 💧🎓 (nodos da auga con text_expert + reto_expert).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const EXPERT = {
  a_chuvia: {
    texto: {
      gl: 'A chuvia é o ciclo da auga visto de preto. O Sol evapora auga do mar (fan falta 2.257 kJ por cada quilo, a calor latente), o vapor sobe, arrefría uns 6,5 °C por cada quilómetro e condensa sobre núcleos microscópicos (sal, po, pole) formando pingas de 0,01 mm. Só cando chocan e medran ata 0,5–5 mm pesan dabondo para caer. Galicia é chuviosa porque as frontes atlánticas chegan cargadas de humidade e o relevo obrígaas a subir e arrefriar: chuvia orográfica. Santiago recolle uns 1.800 mm ao ano; Ourense, protexida polas serras, arredor de 800. Un milímetro de chuvia é un litro por metro cadrado.',
      es: 'La lluvia es el ciclo del agua visto de cerca. El Sol evapora agua del mar (hacen falta 2.257 kJ por cada kilo, el calor latente), el vapor sube, se enfría unos 6,5 °C por cada kilómetro y condensa sobre núcleos microscópicos (sal, polvo, polen) formando gotas de 0,01 mm. Solo cuando chocan y crecen hasta 0,5–5 mm pesan lo bastante para caer. Galicia es lluviosa porque los frentes atlánticos llegan cargados de humedad y el relieve les obliga a subir y enfriarse: lluvia orográfica. Santiago recoge unos 1.800 mm al año; Ourense, protegida por las sierras, alrededor de 800. Un milímetro de lluvia es un litro por metro cuadrado.',
      en: 'Rain is the water cycle seen up close. The Sun evaporates seawater (it takes 2,257 kJ per kilo, the latent heat), the vapour rises, cools about 6.5 °C per kilometre and condenses on microscopic nuclei (salt, dust, pollen) into 0.01 mm droplets. Only when they collide and grow to 0.5–5 mm are they heavy enough to fall. Galicia is rainy because Atlantic fronts arrive loaded with moisture and the relief forces them to rise and cool: orographic rain. Santiago collects about 1,800 mm a year; Ourense, sheltered by the ranges, around 800. One millimetre of rain is one litre per square metre.' },
    reto: {
      gl: 'Un tellado de 100 m² en Santiago recibe uns 1.800 mm ao ano. Calcula cantos litros son e cantos días de consumo dunha familia de catro (uns 130 L por persoa e día) cubriría un depósito que os gardase todos. Explica logo por que en Ourense chove menos da metade estando a 100 km.',
      es: 'Un tejado de 100 m² en Santiago recibe unos 1.800 mm al año. Calcula cuántos litros son y cuántos días de consumo de una familia de cuatro (unos 130 L por persona y día) cubriría un depósito que los guardase todos. Explica luego por qué en Ourense llueve menos de la mitad estando a 100 km.',
      en: 'A 100 m² roof in Santiago receives about 1,800 mm a year. Work out how many litres that is and how many days of use for a family of four (about 130 L per person per day) a tank storing all of it would cover. Then explain why Ourense gets less than half the rain while only 100 km away.' } },
  o_rio: {
    texto: {
      gl: 'Un río é o desaugadoiro dunha bacía: todo o que chove nesa superficie e non evapora nin se infiltra acaba nel. O balance hidrolóxico é P = ET + escorrentía + infiltración. O caudal mídese en m³/s e calcúlase como sección por velocidade (Q = A·v): o Miño leva de media uns 340 m³/s na desembocadura, o Ulla arredor de 80. Entre chuvias o río non seca porque os acuíferos devolven auga aos poucos (caudal base). A auga arrastra sedimentos, escava meandros e, cando a bacía perde bosque, corre máis rápido e leva o solo: por iso as riadas son peores tras un incendio.',
      es: 'Un río es el desagüe de una cuenca: todo lo que llueve en esa superficie y no evapora ni se infiltra acaba en él. El balance hidrológico es P = ET + escorrentía + infiltración. El caudal se mide en m³/s y se calcula como sección por velocidad (Q = A·v): el Miño lleva de media unos 340 m³/s en la desembocadura, el Ulla alrededor de 80. Entre lluvias el río no se seca porque los acuíferos devuelven agua poco a poco (caudal base). El agua arrastra sedimentos, excava meandros y, cuando la cuenca pierde bosque, corre más rápido y se lleva el suelo: por eso las riadas son peores tras un incendio.',
      en: 'A river is the drain of a catchment: everything that rains on that area and neither evaporates nor infiltrates ends up in it. The water balance is P = ET + runoff + infiltration. Discharge is measured in m³/s and computed as cross-section times velocity (Q = A·v): the Miño carries on average about 340 m³/s at its mouth, the Ulla around 80. Between rains the river does not dry up because aquifers return water slowly (baseflow). Water carries sediment, carves meanders and, when the catchment loses forest, runs faster and takes the soil with it: that is why floods are worse after a wildfire.' },
    reto: {
      gl: 'Un regato ten 3 m de ancho, 0,5 m de fondo e a auga vai a 0,4 m/s. Calcula o caudal en m³/s e en litros por segundo, e explica por que ao día seguinte dunha treboada o caudal sobe moito máis nunha bacía queimada ca nunha con bosque.',
      es: 'Un arroyo tiene 3 m de ancho, 0,5 m de fondo y el agua va a 0,4 m/s. Calcula el caudal en m³/s y en litros por segundo, y explica por qué al día siguiente de una tormenta el caudal sube mucho más en una cuenca quemada que en una con bosque.',
      en: 'A stream is 3 m wide, 0.5 m deep and the water flows at 0.4 m/s. Work out the discharge in m³/s and in litres per second, and explain why the day after a storm the flow rises far more in a burnt catchment than in a forested one.' } },
  a_depuradora: {
    texto: {
      gl: 'Hai dúas fábricas de auga e non se deben confundir. A ETAP (potabilizadora) colle auga do río ou do encoro e fai que se poida beber: coagulación con sulfato de aluminio para que a terra fina se xunte en flóculos, decantación, filtrado en area e desinfección con cloro (déixanse 0,2–1 mg/L de cloro libre para que a auga chegue protexida á billa; a turbidez debe quedar por baixo de 1 NTU). A EDAR (depuradora) fai o contrario: limpa a auga xa usada antes de devolvela ao río. Reixas e desareador, decantación primaria e, o núcleo, o reactor biolóxico: bacterias aerobias que comen a materia orgánica (mídese como DBO₅) con aire insuflado; logo un decantador secundario separa o lodo. Non fai auga potable: fai auga que o río pode aceptar.',
      es: 'Hay dos fábricas de agua y no se deben confundir. La ETAP (potabilizadora) coge agua del río o del embalse y hace que se pueda beber: coagulación con sulfato de aluminio para que la tierra fina se junte en flóculos, decantación, filtrado en arena y desinfección con cloro (se dejan 0,2–1 mg/L de cloro libre para que el agua llegue protegida al grifo; la turbidez debe quedar por debajo de 1 NTU). La EDAR (depuradora) hace lo contrario: limpia el agua ya usada antes de devolverla al río. Rejas y desarenador, decantación primaria y, el núcleo, el reactor biológico: bacterias aerobias que comen la materia orgánica (medida como DBO₅) con aire insuflado; luego un decantador secundario separa el lodo. No hace agua potable: hace agua que el río puede aceptar.',
      en: 'There are two water factories and they must not be confused. The drinking-water plant takes water from the river or reservoir and makes it drinkable: coagulation with aluminium sulphate so fine soil clumps into flocs, settling, sand filtration and chlorine disinfection (0.2–1 mg/L of free chlorine is left so the water reaches the tap protected; turbidity must stay below 1 NTU). The sewage treatment plant does the opposite: it cleans used water before returning it to the river. Screens and grit removal, primary settling and, at the core, the biological reactor: aerobic bacteria eating organic matter (measured as BOD₅) with air blown in; then a secondary clarifier separates the sludge. It does not make drinking water: it makes water the river can accept.' },
    reto: {
      gl: 'Explica a diferenza entre ETAP e EDAR cun esquema de entrada e saída de cada unha. Razoa que pasaría nunha vila se a ETAP deixase de clorar durante unha semana, e que pasaría no río se a EDAR parase os sopradores de aire do reactor biolóxico.',
      es: 'Explica la diferencia entre ETAP y EDAR con un esquema de entrada y salida de cada una. Razona qué pasaría en un pueblo si la ETAP dejase de clorar durante una semana, y qué pasaría en el río si la EDAR parase los sopladores de aire del reactor biológico.',
      en: 'Explain the difference between a drinking-water plant and a sewage plant with an input/output sketch of each. Reason what would happen in a town if the drinking-water plant stopped chlorinating for a week, and what would happen to the river if the sewage plant switched off the air blowers of its biological reactor.' } },
  a_billa: {
    texto: {
      gl: 'A auga sae da billa porque está a presión. Cada 10 m de altura de auga son aproximadamente 1 bar (98 kPa): por iso os depósitos están nos altos e as torres de auga existen. A rede leva entre 2 e 5 bar; por riba diso rompen tubaxes, por baixo non sobe aos pisos altos e fan falta grupos de presión. En España cada persoa gasta uns 130 L ao día na casa (a ducha e a cisterna levan a metade), e as redes perden de media un 20–25 % por fugas antes de chegar a ningunha billa. A auga da billa é o alimento máis controlado que hai: analízase a diario, mentres que unha botella de plástico custa entre 500 e 1.000 veces máis por litro.',
      es: 'El agua sale del grifo porque está a presión. Cada 10 m de altura de agua son aproximadamente 1 bar (98 kPa): por eso los depósitos están en los altos y las torres de agua existen. La red lleva entre 2 y 5 bar; por encima revientan tuberías, por debajo no sube a los pisos altos y hacen falta grupos de presión. En España cada persona gasta unos 130 L al día en casa (la ducha y la cisterna se llevan la mitad), y las redes pierden de media un 20–25 % por fugas antes de llegar a ningún grifo. El agua del grifo es el alimento más controlado que hay: se analiza a diario, mientras que una botella de plástico cuesta entre 500 y 1.000 veces más por litro.',
      en: 'Water comes out of the tap because it is under pressure. Every 10 m of water height is roughly 1 bar (98 kPa): that is why reservoirs sit on high ground and water towers exist. The network runs at 2 to 5 bar; above that pipes burst, below it water does not reach upper floors and booster pumps are needed. In Spain each person uses about 130 L a day at home (the shower and the toilet take half), and networks lose on average 20–25% to leaks before reaching any tap. Tap water is the most controlled food there is: it is tested daily, while a plastic bottle costs 500 to 1,000 times more per litre.' },
    reto: {
      gl: 'Un depósito está 35 m por riba dunha casa. Calcula a presión na billa en bar e di se chega a un sexto andar (uns 18 m máis arriba) con 1,5 bar de sobra. Logo calcula os litros que gasta ao mes unha familia de catro e cantos máis hai que meter na rede se as fugas son do 25 %.',
      es: 'Un depósito está 35 m por encima de una casa. Calcula la presión en el grifo en bar y di si llega a un sexto piso (unos 18 m más arriba) con 1,5 bar de sobra. Luego calcula los litros que gasta al mes una familia de cuatro y cuántos más hay que meter en la red si las fugas son del 25 %.',
      en: 'A reservoir sits 35 m above a house. Work out the tap pressure in bar and say whether it reaches a sixth floor (about 18 m higher) with 1.5 bar to spare. Then work out the litres a family of four uses per month and how many more must be put into the network if leaks are 25%.' } },
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
const journey = { label_gl: 'A auga, a fondo', label_es: 'El agua, a fondo', label_en: 'Water, in depth',
  description_gl: 'Calor latente, bacías e caudais, ETAP fronte a EDAR e a presión da rede: a auga para quen quere os números.',
  description_es: 'Calor latente, cuencas y caudales, ETAP frente a EDAR y la presión de la red: el agua para quien quiere los números.',
  description_en: 'Latent heat, catchments and discharge, drinking-water versus sewage plants and network pressure: water for those who want the numbers.',
  modulo: 'Ciencia', icono: '💧' }
const stops = ['a_chuvia', 'o_rio', 'a_depuradora', 'a_billa'].map((n, i) => ({ nodo: n, order: i + 1 }))
const res = await j('POST', '/journeys', { ...journey, level: 'expert', type: 'educational', visibility: 'public', stops }, TOKEN)
console.log('journey', res.status, res.data?.id || res.data?.error)
if (res.data?.id) {
  const p = await j('PUT', '/journeys/' + res.data.id, { ...journey, level: 'expert', type: 'educational', status: 'published', visibility: 'public' }, TOKEN); console.log('  publicada', p.status)
}
