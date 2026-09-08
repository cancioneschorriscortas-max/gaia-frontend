// FONTE DE VERDADE do contido "como funciona o mundo" (8ª entrega): A viaxe do peixe á mesa 🐟.
// Executable contra un backend local cun login de profesor (le CRED do scratchpad da sesión; cambia CRED para reutilizalo).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const login = await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })
if (login.status !== 200) { console.error('login', login.data); process.exit(1) }
const TOKEN = login.data.token
const N = (id, labels, primary, secondary, reto) => ({ id, labels, primary, secondary, reto })

// ───────────────────────── RUTA 17: A VIAXE DO PEIXE Á MESA ─────────────────────────
const PEIXE = [
  N('o_barco', { gl: 'O barco', es: 'El barco', en: 'The boat' },
    { gl: 'De noite, cando ti dormes, os barcos saen do porto. Os pequenos volven pola mañá; os grandes pasan días no mar. O [[mariñeiro|marineiro]] bota as redes ou os aparellos e agarda: o peixe non se ve, hai que saber onde está. Cando sobe a rede, o peixe cae na cuberta a montóns, prateado e vivo. Métese enseguida en caixas con xeo, porque o peixe empeza a estragarse en canto morre. En Galicia hai máis barcos de pesca ca en calquera outro sitio de España.',
      es: 'De noche, cuando tú duermes, los barcos salen del puerto. Los pequeños vuelven por la mañana; los grandes pasan días en el mar. El [[marinero|marineiro]] echa las redes o los aparejos y espera: el pez no se ve, hay que saber dónde está. Cuando sube la red, el pescado cae en la cubierta a montones, plateado y vivo. Se mete enseguida en cajas con hielo, porque el pescado empieza a estropearse en cuanto muere. En Galicia hay más barcos de pesca que en cualquier otro sitio de España.',
      en: 'At night, while you sleep, the boats leave the harbour. The small ones return in the morning; the big ones spend days at sea. The [[fisherman|marineiro]] casts the nets or the lines and waits: fish cannot be seen, you have to know where they are. When the net comes up, the fish pour onto the deck, silver and alive. They go straight into boxes with ice, because fish starts to spoil as soon as it dies. Galicia has more fishing boats than anywhere else in Spain.' },
    { gl: 'A frota galega ten arredor de 4.000 barcos, case a metade da española. Os de baixura pescan preto da costa e volven no día: sardiña, xurelo, polbo, nécora. Os de altura van ao Gran Sol, fronte a Irlanda, e os conxeladores a Terranova ou ás Malvinas durante meses. Cada arte é distinta: o cerco rodea o banco cunha rede, o arrastre leva a rede polo fondo, o palangre son quilómetros de liña con anzois, as nasas son trampas para o polbo. Todos levan GPS, sonda que "ve" o peixe co eco e caixa azul que di ás autoridades onde están. Hai cotas: cada barco só pode pescar unha cantidade ao ano de cada especie, para que o mar non quede baleiro.',
      es: 'La flota gallega tiene alrededor de 4.000 barcos, casi la mitad de la española. Los de bajura pescan cerca de la costa y vuelven en el día: sardina, jurel, pulpo, nécora. Los de altura van al Gran Sol, frente a Irlanda, y los congeladores a Terranova o a las Malvinas durante meses. Cada arte es distinta: el cerco rodea el banco con una red, el arrastre lleva la red por el fondo, el palangre son kilómetros de línea con anzuelos, las nasas son trampas para el pulpo. Todos llevan GPS, sonda que "ve" el pez con el eco y caja azul que dice a las autoridades dónde están. Hay cuotas: cada barco solo puede pescar una cantidad al año de cada especie, para que el mar no se quede vacío.',
      en: 'The Galician fleet has around 4,000 boats, almost half of Spain\'s. Inshore boats fish near the coast and return the same day: sardine, horse mackerel, octopus, crab. Offshore boats go to the Grand Sole off Ireland, and freezer trawlers to Newfoundland or the Falklands for months. Each method is different: purse seine surrounds the shoal with a net, trawling drags the net along the bottom, longline is kilometres of line with hooks, pots are traps for octopus. All carry GPS, an echo sounder that "sees" fish with sound and a blue box that tells the authorities where they are. There are quotas: each boat may only catch a set amount of each species a year, so the sea does not run empty.' },
    { gl: 'Por que se mete o peixe en xeo nada máis pescalo?\na) porque empeza a estragarse en canto morre\nb) para que pese máis\nc) para que non escape',
      es: '¿Por qué se mete el pescado en hielo nada más pescarlo?\na) porque empieza a estropearse en cuanto muere\nb) para que pese más\nc) para que no escape',
      en: 'Why is fish put on ice as soon as it is caught?\na) because it starts to spoil as soon as it dies\nb) to make it heavier\nc) so it cannot escape' }),
  N('a_lonxa', { gl: 'A lonxa', es: 'La lonja', en: 'The fish market' },
    { gl: 'O barco chega ao porto e o peixe vai directo á lonxa: unha nave grande e fría xunto ao peirao. Alí véndese por primeira vez, e véndese ao revés do que pensas: a poxa empeza cun prezo alto que vai baixando, e o primeiro que berra "meu!" ou preme o botón leva a caixa. Chámase poxa á baixa. Os compradores son peixeiros, restaurantes e camioneiros que levan o peixe a Madrid. Todo pasa nunha hora, ás veces de madrugada, porque o peixe non pode agardar.',
      es: 'El barco llega al puerto y el pescado va directo a la lonja: una nave grande y fría junto al muelle. Allí se vende por primera vez, y se vende al revés de lo que piensas: la subasta empieza con un precio alto que va bajando, y el primero que grita "¡mío!" o pulsa el botón se lleva la caja. Se llama subasta a la baja. Los compradores son pescaderos, restaurantes y camioneros que llevan el pescado a Madrid. Todo pasa en una hora, a veces de madrugada, porque el pescado no puede esperar.',
      en: 'The boat reaches the harbour and the fish goes straight to the fish market: a big cold hall by the quay. There it is sold for the first time, and sold the opposite way you would think: the auction starts at a high price that keeps dropping, and the first to shout "mine!" or press the button takes the box. It is called a descending auction. The buyers are fishmongers, restaurants and lorry drivers who take the fish to Madrid. It all happens in an hour, sometimes before dawn, because fish cannot wait.' },
    { gl: 'A poxa á baixa (ou "holandesa") é rápida e evita que os compradores se poñan de acordo para baixar o prezo: quen agarda de máis, queda sen a caixa. Nas lonxas grandes, coma Vigo, Burela ou A Coruña, o prezo baixa nun reloxo dixital e cada comprador ten un mando. Cada caixa leva unha etiqueta co nome da especie, a arte de pesca, a zona (FAO 27 é o Atlántico nordeste) e o barco: é a trazabilidade, e chega ata a peixaría. A lonxa cobra unha porcentaxe e a confraría de pescadores, que a xestiona, decide horarios e regras. Vigo é o porto de peixe fresco máis grande de Europa. Só un 10 % do que se pesca queda na comarca: o resto vai en camión frigorífico a toda España.',
      es: 'La subasta a la baja (u "holandesa") es rápida y evita que los compradores se pongan de acuerdo para bajar el precio: quien espera de más, se queda sin la caja. En las lonjas grandes, como Vigo, Burela o A Coruña, el precio baja en un reloj digital y cada comprador tiene un mando. Cada caja lleva una etiqueta con el nombre de la especie, el arte de pesca, la zona (FAO 27 es el Atlántico nordeste) y el barco: es la trazabilidad, y llega hasta la pescadería. La lonja cobra un porcentaje y la cofradía de pescadores, que la gestiona, decide horarios y reglas. Vigo es el puerto de pescado fresco más grande de Europa. Solo un 10 % de lo que se pesca se queda en la comarca: el resto va en camión frigorífico a toda España.',
      en: 'The descending (or "Dutch") auction is fast and stops buyers colluding to lower the price: whoever waits too long loses the box. In big markets such as Vigo, Burela or A Coruña the price drops on a digital clock and each buyer has a remote. Every box carries a label with the species, the fishing method, the area (FAO 27 is the north-east Atlantic) and the boat: that is traceability, and it reaches the fishmonger. The market charges a percentage and the fishermen\'s guild that runs it sets hours and rules. Vigo is the largest fresh-fish port in Europe. Only 10% of the catch stays in the area: the rest goes by refrigerated lorry across Spain.' },
    { gl: 'Como funciona a poxa da lonxa?\na) o prezo empeza alto e baixa; o primeiro que para leva a caixa\nb) o prezo empeza baixo e sobe ata que ninguén dá máis\nc) cada caixa ten un prezo fixo',
      es: '¿Cómo funciona la subasta de la lonja?\na) el precio empieza alto y baja; el primero que para se lleva la caja\nb) el precio empieza bajo y sube hasta que nadie da más\nc) cada caja tiene un precio fijo',
      en: 'How does the fish market auction work?\na) the price starts high and drops; the first to stop it takes the box\nb) the price starts low and rises until nobody bids more\nc) each box has a fixed price' }),
  N('o_xeo', { gl: 'O xeo', es: 'El hielo', en: 'The ice' },
    { gl: 'Desde que sae da auga ata que chega á túa mesa, o peixe non pode quentar nin un minuto. Por iso viaxa sempre en xeo: no barco, na lonxa, no camión e no mostrador. O frío fai que os bichiños que estragan a comida vaian moi amodo. A esa cadea de frío que non se pode romper chámanlle cadea de frío. Se o peixe cheira mal, é que alguén a rompeu. Un peixe fresco ten os ollos brillantes, as galadas vermellas e a carne dura: é o segredo das peixeiras para saber se é do día.',
      es: 'Desde que sale del agua hasta que llega a tu mesa, el pescado no puede calentarse ni un minuto. Por eso viaja siempre en hielo: en el barco, en la lonja, en el camión y en el mostrador. El frío hace que los bichitos que estropean la comida vayan muy despacio. A esa cadena de frío que no se puede romper la llaman cadena de frío. Si el pescado huele mal, es que alguien la rompió. Un pescado fresco tiene los ojos brillantes, las agallas rojas y la carne dura: es el secreto de las pescaderas para saber si es del día.',
      en: 'From the moment it leaves the water until it reaches your table, fish must not warm up for a minute. That is why it always travels on ice: on the boat, at the market, in the lorry and on the counter. Cold makes the tiny bugs that spoil food work very slowly. That chain of cold that must never break is called the cold chain. If fish smells bad, someone broke it. Fresh fish has bright eyes, red gills and firm flesh: that is the fishmongers\' secret for telling if it is today\'s.' },
    { gl: 'O peixe estrágase por dúas vías: bacterias e encimas propios. A 0 °C, temperatura do xeo fundente, a sardiña aguanta uns 4–6 días; a 10 °C, apenas un. Por cada 5 °C que sobe a temperatura, a velocidade de deterioración dóbrase, máis ou menos. O cheiro "a peixe" vén da trimetilamina, que producen as bacterias; o peixe recén pescado cheira a mar, non a peixe. O xeo en escamas funciona mellor ca a auga fría porque ao fundir absorbe moita calor (334 kJ por kg) sen subir de 0 °C. A conxelación a −20 °C para as bacterias de vez, e a ultraconxelación a bordo (−40 °C en horas) conserva mellor a textura ca conxelar na casa. Un anisakis morre a −20 °C durante 24 horas ou cociñando por riba de 60 °C.',
      es: 'El pescado se estropea por dos vías: bacterias y enzimas propias. A 0 °C, temperatura del hielo fundente, la sardina aguanta unos 4–6 días; a 10 °C, apenas uno. Por cada 5 °C que sube la temperatura, la velocidad de deterioro se dobla, más o menos. El olor "a pescado" viene de la trimetilamina, que producen las bacterias; el pescado recién pescado huele a mar, no a pescado. El hielo en escamas funciona mejor que el agua fría porque al fundir absorbe mucho calor (334 kJ por kg) sin subir de 0 °C. La congelación a −20 °C para las bacterias del todo, y la ultracongelación a bordo (−40 °C en horas) conserva mejor la textura que congelar en casa. Un anisakis muere a −20 °C durante 24 horas o cocinando por encima de 60 °C.',
      en: 'Fish spoils in two ways: bacteria and its own enzymes. At 0 °C, the temperature of melting ice, sardine keeps for 4–6 days; at 10 °C, barely one. For every 5 °C rise, the rate of spoilage roughly doubles. The "fishy" smell comes from trimethylamine, produced by bacteria; freshly caught fish smells of the sea, not of fish. Flake ice works better than cold water because as it melts it absorbs a lot of heat (334 kJ per kg) without rising above 0 °C. Freezing at −20 °C stops bacteria altogether, and blast freezing on board (−40 °C within hours) keeps texture better than home freezing. Anisakis dies at −20 °C for 24 hours or when cooked above 60 °C.' },
    { gl: 'Como sabes se un peixe é fresco?\na) ollos brillantes, galadas vermellas e carne dura\nb) porque é grande\nc) porque cheira moito a peixe',
      es: '¿Cómo sabes si un pescado es fresco?\na) ojos brillantes, agallas rojas y carne dura\nb) porque es grande\nc) porque huele mucho a pescado',
      en: 'How do you know a fish is fresh?\na) bright eyes, red gills and firm flesh\nb) because it is big\nc) because it smells strongly of fish' }),
  N('a_peixaria', { gl: 'A peixaría', es: 'La pescadería', en: 'The fishmonger' },
    { gl: 'Na praza de abastos, a peixeira ten o peixe posto sobre xeo, coma un cadro: sardiñas en fila, unha pescada enteira, polbo. Ela sabe de que barco vén cada un, porque a caixa da lonxa leva unha etiqueta. Cando alguén pide, límpao coa navalla: quita as escamas, as tripas e a espiña, e envólveo en papel. Á noite, na cociña, con aceite e sal, o peixe que onte nadaba no mar está no teu prato. Do barco á mesa pasaron un día e catro pares de mans.',
      es: 'En la plaza de abastos, la pescadera tiene el pescado puesto sobre hielo, como un cuadro: sardinas en fila, una merluza entera, pulpo. Ella sabe de qué barco viene cada uno, porque la caja de la lonja lleva una etiqueta. Cuando alguien pide, lo limpia con el cuchillo: quita las escamas, las tripas y la espina, y lo envuelve en papel. Por la noche, en la cocina, con aceite y sal, el pescado que ayer nadaba en el mar está en tu plato. Del barco a la mesa pasaron un día y cuatro pares de manos.',
      en: 'At the market hall, the fishmonger has the fish laid on ice like a painting: sardines in a row, a whole hake, octopus. She knows which boat each one came from, because the market box carries a label. When someone orders, she cleans it with the knife: removes the scales, the guts and the bone, and wraps it in paper. At night, in the kitchen, with oil and salt, the fish that swam in the sea yesterday is on your plate. From boat to table it took one day and four pairs of hands.' },
    { gl: 'A etiqueta obrigatoria da peixaría di o nome comercial e científico (pescada, Merluccius merluccius), se é salvaxe ou de acuicultura, a zona de captura e a arte, e se foi conxelado. Case a metade do peixe que se come no mundo xa é de acuicultura: en Galicia, o mexillón das bateas das rías (250.000 toneladas ao ano, o primeiro produtor de Europa) e o rodaballo de tanques. Os españois comen uns 20 kg de peixe por persoa e ano, dos máis altos de Europa, e as prazas de abastos galegas conservan a venda directa que noutros sitios se perdeu. O peixe azul (sardiña, xurelo, xarda) leva omega-3; o branco (pescada, bacallau) é magro. Comer peixe pequeno e de tempada é o máis barato e o máis sostible.',
      es: 'La etiqueta obligatoria de la pescadería dice el nombre comercial y científico (merluza, Merluccius merluccius), si es salvaje o de acuicultura, la zona de captura y el arte, y si fue congelado. Casi la mitad del pescado que se come en el mundo ya es de acuicultura: en Galicia, el mejillón de las bateas de las rías (250.000 toneladas al año, el primer productor de Europa) y el rodaballo de tanques. Los españoles comen unos 20 kg de pescado por persona y año, de los más altos de Europa, y las plazas de abastos gallegas conservan la venta directa que en otros sitios se perdió. El pescado azul (sardina, jurel, caballa) lleva omega-3; el blanco (merluza, bacalao) es magro. Comer pescado pequeño y de temporada es lo más barato y lo más sostenible.',
      en: 'The compulsory fishmonger label gives the commercial and scientific name (hake, Merluccius merluccius), whether wild or farmed, the catch area and method, and whether it was frozen. Almost half the fish eaten in the world is now farmed: in Galicia, mussels from the raft farms in the rías (250,000 tonnes a year, the largest producer in Europe) and turbot from tanks. Spaniards eat about 20 kg of fish per person a year, among the highest in Europe, and Galician market halls keep the direct sale that was lost elsewhere. Oily fish (sardine, horse mackerel, mackerel) carries omega-3; white fish (hake, cod) is lean. Eating small, seasonal fish is the cheapest and the most sustainable.' },
    { gl: 'Como sabe a peixeira de que barco vén o peixe?\na) pola etiqueta da caixa da lonxa\nb) pola cor do peixe\nc) non o sabe',
      es: '¿Cómo sabe la pescadera de qué barco viene el pescado?\na) por la etiqueta de la caja de la lonja\nb) por el color del pescado\nc) no lo sabe',
      en: 'How does the fishmonger know which boat the fish came from?\na) from the label on the market box\nb) from the colour of the fish\nc) she does not know' }),
]
const REL_PEIXE = [
  ['o_barco', 'ANTES_DE', 'a_lonxa', 'high', { gl: 'Do barco o peixe vai á lonxa', es: 'Del barco el pescado va a la lonja', en: 'From the boat the fish goes to the market' }],
  ['a_lonxa', 'ANTES_DE', 'o_xeo', 'high', { gl: 'Da lonxa sae en xeo no camión', es: 'De la lonja sale en hielo en el camión', en: 'From the market it leaves on ice in the lorry' }],
  ['o_xeo', 'ANTES_DE', 'a_peixaria', 'high', { gl: 'A cadea de frío chega ata o mostrador', es: 'La cadena de frío llega hasta el mostrador', en: 'The cold chain reaches the counter' }],
  ['o_barco', 'RELACIONADO_CON', 'marineiro', 'high', { gl: 'O mariñeiro é quen vai no barco', es: 'El marinero es quien va en el barco', en: 'The fisherman is the one on the boat' }],
  ['o_barco', 'RELACIONADO_CON', 'o_marisqueo', 'medium', { gl: 'Pescar e mariscar son dous xeitos de vivir do mar', es: 'Pescar y mariscar son dos maneras de vivir del mar', en: 'Fishing and shellfishing are two ways of living from the sea' }],
  ['a_peixaria', 'RELACIONADO_CON', 'a_conserva', 'medium', { gl: 'O que non se vende fresco vai á conserva', es: 'Lo que no se vende fresco va a la conserva', en: 'What is not sold fresh goes to the cannery' }],
  ['o_xeo', 'RELACIONADO_CON', 'o_sal', 'low', { gl: 'Antes do xeo, o peixe conservábase con sal', es: 'Antes del hielo, el pescado se conservaba con sal', en: 'Before ice, fish was preserved with salt' }],
  ['o_barco', 'PERTENCE_A', 'oficios_mar', 'high', { gl: 'A pesca é o oficio do mar', es: 'La pesca es el oficio del mar', en: 'Fishing is the trade of the sea' }],
  ['a_lonxa', 'PERTENCE_A', 'oficios_mar', 'medium', { gl: 'A lonxa é a praza do mar', es: 'La lonja es la plaza del mar', en: 'The fish market is the sea\'s marketplace' }],
  ['o_xeo', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'A cadea de frío é ciencia dos alimentos', es: 'La cadena de frío es ciencia de los alimentos', en: 'The cold chain is food science' }],
  ['a_peixaria', 'PERTENCE_A', 'gastronomia_galicia', 'medium', { gl: 'O peixe é a base da cociña galega', es: 'El pescado es la base de la cocina gallega', en: 'Fish is the basis of Galician cooking' }],
]

const RUTAS = [
  { nodos: PEIXE, rels: REL_PEIXE, journey: { label_gl: 'A viaxe do peixe á mesa', label_es: 'El viaje del pescado a la mesa', label_en: 'The journey of fish to the table',
      description_gl: 'Do barco de noite á poxa da lonxa, o xeo que non pode faltar e a peixeira que sabe de que barco vén cada sardiña.', description_es: 'Del barco de noche a la subasta de la lonja, el hielo que no puede faltar y la pescadera que sabe de qué barco viene cada sardina.', description_en: 'From the boat at night to the market auction, the ice that must never be missing and the fishmonger who knows which boat each sardine came from.',
      modulo: 'Oficios', icono: '🐟' } },
]

for (const r of RUTAS) {
  const nodos = r.nodos.map(n => ({
    id: n.id, type: 'concept', status: 'draft', relevance: 'medium', difficulty: 'primary', universo: 'gaia',
    autor: 'GAIA — como funciona o mundo', centro: '',
    label_gl: n.labels.gl, label_es: n.labels.es, label_en: n.labels.en,
    text_primary_gl: n.primary.gl, text_primary_es: n.primary.es, text_primary_en: n.primary.en,
    text_secondary_gl: n.secondary.gl, text_secondary_es: n.secondary.es, text_secondary_en: n.secondary.en,
  }))
  const relacions = r.rels.map(([source, tipo, target, strength, ctx]) => ({ source, target, tipo, strength, context_gl: ctx.gl, context_es: ctx.es, context_en: ctx.en }))
  const imp = await j('POST', '/import', { nodos, relacions }, TOKEN)
  console.log('import', r.journey.label_gl, imp.status, 'creados', imp.data.creados, 'erros', imp.data.erros, 'rels', imp.data.relacionsCreadas, 'relErros', imp.data.relacionsErros)
  if (imp.data.detalle?.erros?.length) console.log('  ', JSON.stringify(imp.data.detalle.erros).slice(0, 300))
  if (imp.data.detalle?.relacionsErros?.length) console.log('  ', JSON.stringify(imp.data.detalle.relacionsErros).slice(0, 300))
}
async function porReto(id, reto) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) return console.log('GET', id, g.status)
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: '', reto_bloqueado: false, reto_puntos: 10 }
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = n.content?.primary?.[i] || ''
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = reto?.[i] || n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  if (p.status !== 200) console.log('PUT', id, p.status, p.data)
}
for (const r of RUTAS) for (const n of r.nodos) await porReto(n.id, n.reto)
console.log('retos OK')
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n.id, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'primary', type: 'educational', visibility: 'public', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
  if (res.data?.id) {
    const body = { level: 'primary', type: 'educational', status: 'published', visibility: 'public', modulo: r.journey.modulo, icono: r.journey.icono }
    for (const k of ['label_gl', 'label_es', 'label_en', 'description_gl', 'description_es', 'description_en']) body[k] = r.journey[k]
    const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', res.data.id, p.status)
  }
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas agora:', (fin.data.journeys || []).length)
