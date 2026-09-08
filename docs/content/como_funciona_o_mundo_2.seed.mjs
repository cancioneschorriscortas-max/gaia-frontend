// FONTE DE VERDADE do contido "como funciona o mundo" (2ª entrega): A viaxe do lixo ♻️ e Por que sobe e baixa o mar 🌊.
// Executable contra un backend local cun login de profesor (le CRED do scratchpad da sesión; cambia CRED para reutilizalo).
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))

async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }
  return { status: r.status, data: d }
}
const login = await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })
if (login.status !== 200) { console.error('login', login.data); process.exit(1) }
const TOKEN = login.data.token
const N = (id, labels, primary, secondary, reto) => ({ id, labels, primary, secondary, reto })

// ───────────────────────── RUTA 4: A VIAXE DO LIXO ─────────────────────────
const LIXO = [
  N('o_lixo', { gl: 'O lixo', es: 'La basura', en: 'Rubbish' },
    { gl: 'Cada día tiramos cousas: a casca da laranxa, a botella baleira, o papel do bocadillo. Todo iso é o lixo. Non desaparece cando pechas o cubo: alguén o recolle e vai a algún sitio. Se o mesturamos todo, é un problema. Se o separamos, moito do lixo pode volver ser útil. Empeza no [[contedor|o_contedor]].',
      es: 'Cada día tiramos cosas: la piel de la naranja, la botella vacía, el papel del bocadillo. Todo eso es la basura. No desaparece cuando cierras el cubo: alguien la recoge y va a algún sitio. Si lo mezclamos todo, es un problema. Si lo separamos, mucha de la basura puede volver a ser útil. Empieza en el [[contenedor|o_contedor]].',
      en: 'Every day we throw things away: the orange peel, the empty bottle, the sandwich wrapper. All of that is rubbish. It does not disappear when you close the bin: someone collects it and it goes somewhere. If we mix it all, it is a problem. If we separate it, much of it can be useful again. It starts at the [[recycling bin|o_contedor]].' },
    { gl: 'Unha persoa en Galicia produce arredor dun quilo de lixo ao día. O que non se recicla acaba nun vertedoiro, un monte enorme de lixo tapado con terra, ou queimado nunha incineradora. Canto menos tiremos, menos hai que esconder.',
      es: 'Una persona en Galicia produce alrededor de un kilo de basura al día. Lo que no se recicla acaba en un vertedero, un monte enorme de basura tapado con tierra, o quemado en una incineradora. Cuanto menos tiremos, menos hay que esconder.',
      en: 'A person in Galicia produces about a kilo of rubbish a day. What is not recycled ends up in a landfill, a huge mound of rubbish covered with soil, or burned in an incinerator. The less we throw away, the less there is to hide.' },
    { gl: 'Que pasa co lixo cando pechas o cubo?\na) desaparece\nb) alguén o recolle e vai a algún sitio\nc) vólvese terra ao momento',
      es: '¿Qué pasa con la basura cuando cierras el cubo?\na) desaparece\nb) alguien la recoge y va a algún sitio\nc) se vuelve tierra al momento',
      en: 'What happens to rubbish when you close the bin?\na) it disappears\nb) someone collects it and it goes somewhere\nc) it turns into soil at once' }),
  N('o_contedor', { gl: 'O contedor', es: 'El contenedor', en: 'The recycling bin' },
    { gl: 'Os contedores teñen cores para non mesturar: amarelo para envases de plástico e latas, azul para papel e cartón, verde para vidro, marrón para restos de comida. Separar ben é o primeiro traballo, e faino cada familia na casa. Un camión de cada cor recolle o seu contedor e lévao á [[planta de reciclaxe|a_reciclaxe]].',
      es: 'Los contenedores tienen colores para no mezclar: amarillo para envases de plástico y latas, azul para papel y cartón, verde para vidrio, marrón para restos de comida. Separar bien es el primer trabajo, y lo hace cada familia en casa. Un camión de cada color recoge su contenedor y lo lleva a la [[planta de reciclaje|a_reciclaxe]].',
      en: 'Bins have colours so nothing gets mixed: yellow for plastic packaging and cans, blue for paper and cardboard, green for glass, brown for food scraps. Sorting well is the first job, and every family does it at home. A lorry for each colour collects its bin and takes it to the [[recycling plant|a_reciclaxe]].' },
    { gl: 'Se botas un iogur no contedor azul, estraga o papel de todo o contedor: o lixo mal separado ás veces xa non se pode reciclar. O contedor marrón é o máis novo: os restos de comida convértense en compost, un abono para as hortas.',
      es: 'Si echas un yogur en el contenedor azul, estropea el papel de todo el contenedor: la basura mal separada a veces ya no se puede reciclar. El contenedor marrón es el más nuevo: los restos de comida se convierten en compost, un abono para las huertas.',
      en: 'If you drop a yoghurt into the blue bin, it spoils the paper of the whole bin: badly sorted rubbish sometimes cannot be recycled at all. The brown bin is the newest: food scraps become compost, a fertiliser for vegetable gardens.' },
    { gl: 'Onde vai a botella de plástico baleira?\na) ao contedor amarelo\nb) ao contedor azul\nc) ao contedor verde',
      es: '¿Dónde va la botella de plástico vacía?\na) al contenedor amarillo\nb) al contenedor azul\nc) al contenedor verde',
      en: 'Where does the empty plastic bottle go?\na) the yellow bin\nb) the blue bin\nc) the green bin' }),
  N('a_reciclaxe', { gl: 'A planta de reciclaxe', es: 'La planta de reciclaje', en: 'The recycling plant' },
    { gl: 'Na planta de reciclaxe todo pasa por unha cinta que se move. Uns imáns levan as latas de ferro. Un sopro de aire aparta os plásticos lixeiros. Máquinas e persoas separan o que queda por tipos. Despois tritúrase todo en anacos pequenos, lávase e fúndese. Do que era lixo sae material novo para facer un [[obxecto novo|o_obxecto_novo]].',
      es: 'En la planta de reciclaje todo pasa por una cinta que se mueve. Unos imanes se llevan las latas de hierro. Un soplo de aire aparta los plásticos ligeros. Máquinas y personas separan lo que queda por tipos. Después se tritura todo en trozos pequeños, se lava y se funde. De lo que era basura sale material nuevo para hacer un [[objeto nuevo|o_obxecto_novo]].',
      en: 'At the recycling plant everything goes along a moving belt. Magnets pick up the iron cans. A puff of air pushes the light plastics aside. Machines and people sort what is left by type. Then it is all shredded into small pieces, washed and melted. Out of what was rubbish comes new material to make a [[new object|o_obxecto_novo]].' },
    { gl: 'O vidro pódese reciclar infinitas veces sen perder calidade: unha botella verde pode ser outra botella verde para sempre. O plástico non: cada vez que se recicla queda un pouco peor, por iso o mellor plástico é o que non se usa.',
      es: 'El vidrio se puede reciclar infinitas veces sin perder calidad: una botella verde puede ser otra botella verde para siempre. El plástico no: cada vez que se recicla queda un poco peor, por eso el mejor plástico es el que no se usa.',
      en: 'Glass can be recycled endlessly without losing quality: a green bottle can be another green bottle forever. Plastic cannot: each time it is recycled it gets a little worse, which is why the best plastic is the one never used.' },
    { gl: 'Que fai o imán na planta de reciclaxe?\na) apartar as latas de ferro\nb) lavar o plástico\nc) tirar o papel',
      es: '¿Qué hace el imán en la planta de reciclaje?\na) apartar las latas de hierro\nb) lavar el plástico\nc) tirar el papel',
      en: 'What does the magnet do at the recycling plant?\na) pick out the iron cans\nb) wash the plastic\nc) throw away the paper' }),
  N('o_obxecto_novo', { gl: 'O obxecto novo', es: 'El objeto nuevo', en: 'The new object' },
    { gl: 'Con seis botellas de plástico recicladas faise unha camiseta. Con latas vellas, a chapa dunha bicicleta. Con papel usado, o caderno da escola. O obxecto novo non parece lixo, pero xa o foi. E cando se rompa ou se acabe, volverá ser [[lixo|o_lixo]]: a roda non para. Por iso a mellor regra son tres: reducir, reutilizar e reciclar.',
      es: 'Con seis botellas de plástico recicladas se hace una camiseta. Con latas viejas, la chapa de una bicicleta. Con papel usado, el cuaderno de la escuela. El objeto nuevo no parece basura, pero ya lo fue. Y cuando se rompa o se acabe, volverá a ser [[basura|o_lixo]]: la rueda no para. Por eso la mejor regla son tres: reducir, reutilizar y reciclar.',
      en: 'Six recycled plastic bottles make one T-shirt. Old cans become the metal of a bicycle. Used paper becomes the school notebook. The new object does not look like rubbish, but it once was. And when it breaks or runs out, it will be [[rubbish|o_lixo]] again: the wheel never stops. That is why the best rule is three: reduce, reuse and recycle.' },
    { gl: 'A orde importa: primeiro reducir (comprar menos cousas de usar e tirar), despois reutilizar (a botella que se enche outra vez, a roupa que pasa a un irmán) e só ao final reciclar. Reciclar gasta enerxía e auga; non producir lixo non gasta nada.',
      es: 'El orden importa: primero reducir (comprar menos cosas de usar y tirar), después reutilizar (la botella que se llena otra vez, la ropa que pasa a un hermano) y solo al final reciclar. Reciclar gasta energía y agua; no producir basura no gasta nada.',
      en: 'The order matters: first reduce (buy fewer throwaway things), then reuse (the bottle refilled, the clothes passed to a sibling) and only at the end recycle. Recycling uses energy and water; not making rubbish uses nothing.' },
    { gl: 'Cal é a mellor das tres erres?\na) reciclar\nb) reducir\nc) as tres son iguais',
      es: '¿Cuál es la mejor de las tres erres?\na) reciclar\nb) reducir\nc) las tres son iguales',
      en: 'Which is the best of the three Rs?\na) recycle\nb) reduce\nc) all three are the same' }),
]
const REL_LIXO = [
  ['o_lixo', 'ANTES_DE', 'o_contedor', 'high', { gl: 'O lixo sepárase primeiro no contedor', es: 'La basura se separa primero en el contenedor', en: 'Rubbish is first sorted at the bin' }],
  ['o_contedor', 'ANTES_DE', 'a_reciclaxe', 'high', { gl: 'Do contedor vai á planta de reciclaxe', es: 'Del contenedor va a la planta de reciclaje', en: 'From the bin it goes to the recycling plant' }],
  ['a_reciclaxe', 'ANTES_DE', 'o_obxecto_novo', 'high', { gl: 'Da planta sae o material do obxecto novo', es: 'De la planta sale el material del objeto nuevo', en: 'The plant produces the material for the new object' }],
  ['a_reciclaxe', 'USA', 'o_lixo', 'high', { gl: 'A planta traballa co lixo ben separado', es: 'La planta trabaja con la basura bien separada', en: 'The plant works with well-sorted rubbish' }],
  ['a_reciclaxe', 'PRODUCE', 'o_obxecto_novo', 'high', { gl: 'A reciclaxe produce obxectos novos', es: 'El reciclaje produce objetos nuevos', en: 'Recycling produces new objects' }],
  ['o_obxecto_novo', 'RELACIONADO_CON', 'o_lixo', 'medium', { gl: 'O obxecto novo volverá ser lixo: a roda non para', es: 'El objeto nuevo volverá a ser basura: la rueda no para', en: 'The new object will be rubbish again: the wheel never stops' }],
  ['o_lixo', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'O lixo é un problema da natureza de Galicia', es: 'La basura es un problema de la naturaleza de Galicia', en: 'Rubbish is a problem for Galician nature' }],
  ['o_contedor', 'PERTENCE_A', 'natureza_galicia', 'low', { gl: 'Separar o lixo coida a natureza', es: 'Separar la basura cuida la naturaleza', en: 'Sorting rubbish looks after nature' }],
  ['a_reciclaxe', 'PERTENCE_A', 'oficios_industriais', 'medium', { gl: 'A planta de reciclaxe é un traballo industrial', es: 'La planta de reciclaje es un trabajo industrial', en: 'The recycling plant is industrial work' }],
  ['o_obxecto_novo', 'PERTENCE_A', 'natureza_galicia', 'low', { gl: 'Reducir e reciclar coidan a natureza', es: 'Reducir y reciclar cuidan la naturaleza', en: 'Reducing and recycling look after nature' }],
]

// ───────────────────────── RUTA 5: POR QUE SOBE E BAIXA O MAR ─────────────────────────
const MAREA = [
  N('a_lua_astro', { gl: 'A Lúa no ceo', es: 'La Luna en el cielo', en: 'The Moon in the sky' },
    { gl: 'A Lúa é unha bóla de pedra que dá voltas arredor da Terra. Non ten luz propia: brilla porque o Sol a alumea. Aínda que está lonxe, tira de todo o que hai na Terra, coma un imán suave. A terra firme case non se move. Pero a auga do mar si: por iso existe a [[marea|a_marea]].',
      es: 'La Luna es una bola de piedra que da vueltas alrededor de la Tierra. No tiene luz propia: brilla porque el Sol la ilumina. Aunque está lejos, tira de todo lo que hay en la Tierra, como un imán suave. La tierra firme casi no se mueve. Pero el agua del mar sí: por eso existe la [[marea|a_marea]].',
      en: 'The Moon is a ball of rock going round the Earth. It has no light of its own: it shines because the Sun lights it. Although it is far away, it pulls on everything on Earth, like a gentle magnet. Solid ground hardly moves. But sea water does: that is why the [[tide|a_marea]] exists.' },
    { gl: 'A Lúa está a uns 384.000 quilómetros: en coche sen parar tardarías máis de cinco meses. Cada vez que a ves cambiar de forma (chea, minguante, nova, crecente) é porque cambia a parte alumeada polo Sol que vemos desde aquí. Un ciclo enteiro dura uns 29 días.',
      es: 'La Luna está a unos 384.000 kilómetros: en coche sin parar tardarías más de cinco meses. Cada vez que la ves cambiar de forma (llena, menguante, nueva, creciente) es porque cambia la parte iluminada por el Sol que vemos desde aquí. Un ciclo entero dura unos 29 días.',
      en: 'The Moon is about 384,000 kilometres away: driving non-stop would take more than five months. Every time you see it change shape (full, waning, new, waxing) it is because the sunlit part we see from here changes. A whole cycle lasts about 29 days.' },
    { gl: 'Por que brilla a Lúa?\na) porque ten luz propia\nb) porque a alumea o Sol\nc) porque está quente',
      es: '¿Por qué brilla la Luna?\na) porque tiene luz propia\nb) porque la ilumina el Sol\nc) porque está caliente',
      en: 'Why does the Moon shine?\na) because it has its own light\nb) because the Sun lights it\nc) because it is hot' }),
  N('a_marea', { gl: 'A marea', es: 'La marea', en: 'The tide' },
    { gl: 'Dúas veces ao día o mar sobe e dúas veces baixa. Iso é a marea. Cando a Lúa tira da auga, o mar enche e tapa a praia: marea alta. Unhas seis horas despois a auga retírase e deixa a area ao descuberto: marea baixa. Nas rías de Galicia a diferenza pode ser de máis de tres metros. Con marea baixa aparecen as mariscadoras: empeza o [[marisqueo|o_marisqueo]].',
      es: 'Dos veces al día el mar sube y dos veces baja. Eso es la marea. Cuando la Luna tira del agua, el mar llena y tapa la playa: marea alta. Unas seis horas después el agua se retira y deja la arena al descubierto: marea baja. En las rías de Galicia la diferencia puede ser de más de tres metros. Con marea baja aparecen las mariscadoras: empieza el [[marisqueo|o_marisqueo]].',
      en: 'Twice a day the sea rises and twice it falls. That is the tide. When the Moon pulls the water, the sea fills up and covers the beach: high tide. About six hours later the water draws back and leaves the sand bare: low tide. In the Galician rías the difference can be more than three metres. At low tide the shellfish gatherers appear: [[shellfish gathering|o_marisqueo]] begins.' },
    { gl: 'Cando a Lúa e o Sol tiran na mesma dirección (lúa chea e lúa nova) as mareas son máis grandes: chámanse mareas vivas. Os mariñeiros e as mariscadoras miran a táboa de mareas cada día, coma quen mira o reloxo.',
      es: 'Cuando la Luna y el Sol tiran en la misma dirección (luna llena y luna nueva) las mareas son más grandes: se llaman mareas vivas. Los marineros y las mariscadoras miran la tabla de mareas cada día, como quien mira el reloj.',
      en: 'When the Moon and the Sun pull in the same direction (full moon and new moon) the tides are bigger: they are called spring tides. Sailors and shellfish gatherers check the tide table every day, the way others check the clock.' },
    { gl: 'Cantas veces ao día sobe o mar?\na) unha\nb) dúas\nc) dez',
      es: '¿Cuántas veces al día sube el mar?\na) una\nb) dos\nc) diez',
      en: 'How many times a day does the sea rise?\na) once\nb) twice\nc) ten times' }),
  N('o_marisqueo', { gl: 'O marisqueo', es: 'El marisqueo', en: 'Shellfish gathering' },
    { gl: 'As mariscadoras traballan na area cando o mar se retira. Cun sacho e un cesto, buscan ameixas e berberechos escondidos baixo a area. Coñecen cada praia coma a palma da man e saben que só se pode coller o que xa é grande abondo. Cando a marea volve subir, rematan. O que collen vai ao mercado e de aí á túa mesa: a [[ameixa|a_ameixa]].',
      es: 'Las mariscadoras trabajan en la arena cuando el mar se retira. Con un azadón y un cesto, buscan almejas y berberechos escondidos bajo la arena. Conocen cada playa como la palma de la mano y saben que solo se puede coger lo que ya es bastante grande. Cuando la marea vuelve a subir, terminan. Lo que cogen va al mercado y de ahí a tu mesa: la [[almeja|a_ameixa]].',
      en: 'Shellfish gatherers work on the sand when the sea draws back. With a small hoe and a basket, they look for clams and cockles hidden under the sand. They know every beach like the back of their hand and know they may only take what is big enough. When the tide comes back in, they stop. What they gather goes to market and from there to your table: the [[clam|a_ameixa]].' },
    { gl: 'En Galicia hai máis de 3.000 mariscadoras, case todas mulleres, organizadas en confrarías. Teñen un carné, días de traballo e un tope de quilos, para que o marisco non se acabe. Se alguén colle de máis ou de menos tamaño, mañá non queda nada.',
      es: 'En Galicia hay más de 3.000 mariscadoras, casi todas mujeres, organizadas en cofradías. Tienen un carné, días de trabajo y un tope de kilos, para que el marisco no se acabe. Si alguien coge de más o de menos tamaño, mañana no queda nada.',
      en: 'In Galicia there are more than 3,000 shellfish gatherers, almost all women, organised in guilds. They have a licence, working days and a limit in kilos, so the shellfish never run out. If someone takes too much or too small, tomorrow there is nothing left.' },
    { gl: 'Cando poden traballar as mariscadoras?\na) con marea alta, nadando\nb) con marea baixa, na area\nc) só de noite',
      es: '¿Cuándo pueden trabajar las mariscadoras?\na) con marea alta, nadando\nb) con marea baja, en la arena\nc) solo de noche',
      en: 'When can the shellfish gatherers work?\na) at high tide, swimming\nb) at low tide, on the sand\nc) only at night' }),
  N('a_ameixa', { gl: 'A ameixa', es: 'La almeja', en: 'The clam' },
    { gl: 'A ameixa vive enterrada na area, cun corpo brando dentro de dúas cunchas. Aliméntase filtrando a auga do mar. Cando chega á cociña, ábrese coa calor e vólvese unha comida moi galega: ameixas á mariñeira. Detrás dese prato hai un ceo con Lúa, un mar que sobe e baixa e unha mariscadora que madrugou. Todo empezou coa [[Lúa|a_lua_astro]].',
      es: 'La almeja vive enterrada en la arena, con un cuerpo blando dentro de dos conchas. Se alimenta filtrando el agua del mar. Cuando llega a la cocina, se abre con el calor y se vuelve una comida muy gallega: almejas a la marinera. Detrás de ese plato hay un cielo con Luna, un mar que sube y baja y una mariscadora que madrugó. Todo empezó con la [[Luna|a_lua_astro]].',
      en: 'The clam lives buried in the sand, a soft body inside two shells. It feeds by filtering sea water. When it reaches the kitchen, it opens with the heat and becomes a very Galician dish: clams a la marinera. Behind that plate there is a sky with a Moon, a sea that rises and falls, and a gatherer who got up early. It all began with the [[Moon|a_lua_astro]].' },
    { gl: 'Nas cunchas da ameixa vense aneis, coma nos troncos das árbores: cada un é un período de crecemento. As ameixas de Carril, en Vilagarcía, son famosas en toda España. Comer marisco de tempada e de tamaño legal é a forma de que siga habendo.',
      es: 'En las conchas de la almeja se ven anillos, como en los troncos de los árboles: cada uno es un periodo de crecimiento. Las almejas de Carril, en Vilagarcía, son famosas en toda España. Comer marisco de temporada y de tamaño legal es la forma de que siga habiendo.',
      en: 'Clam shells show rings, like tree trunks: each one is a period of growth. The clams of Carril, in Vilagarcía, are famous all over Spain. Eating shellfish in season and of legal size is how we make sure there is always more.' },
    { gl: 'Como se alimenta a ameixa?\na) filtrando a auga do mar\nb) comendo area\nc) cazando peixes',
      es: '¿Cómo se alimenta la almeja?\na) filtrando el agua del mar\nb) comiendo arena\nc) cazando peces',
      en: 'How does the clam feed?\na) by filtering sea water\nb) by eating sand\nc) by hunting fish' }),
]
const REL_MAREA = [
  ['a_lua_astro', 'PRODUCE', 'a_marea', 'high', { gl: 'A Lúa causa a marea', es: 'La Luna causa la marea', en: 'The Moon causes the tide' }],
  ['a_marea', 'ANTES_DE', 'o_marisqueo', 'high', { gl: 'Coa marea baixa empeza o marisqueo', es: 'Con la marea baja empieza el marisqueo', en: 'At low tide shellfish gathering begins' }],
  ['o_marisqueo', 'PRODUCE', 'a_ameixa', 'high', { gl: 'O marisqueo trae a ameixa á mesa', es: 'El marisqueo trae la almeja a la mesa', en: 'Shellfish gathering brings the clam to the table' }],
  ['a_lua_astro', 'ANTES_DE', 'a_marea', 'high', { gl: 'Primeiro tira a Lúa, despois move o mar', es: 'Primero tira la Luna, después se mueve el mar', en: 'First the Moon pulls, then the sea moves' }],
  ['o_marisqueo', 'ANTES_DE', 'a_ameixa', 'high', { gl: 'Do marisqueo sae a ameixa', es: 'Del marisqueo sale la almeja', en: 'The clam comes from shellfish gathering' }],
  ['a_ameixa', 'RELACIONADO_CON', 'a_lua_astro', 'medium', { gl: 'Sen Lúa non habería marea nin marisqueo', es: 'Sin Luna no habría marea ni marisqueo', en: 'Without the Moon there would be no tide and no gathering' }],
  ['a_lua_astro', 'PERTENCE_A', 'fisica', 'medium', { gl: 'A Lúa e a gravidade son física', es: 'La Luna y la gravedad son física', en: 'The Moon and gravity are physics' }],
  ['a_marea', 'PERTENCE_A', 'natureza_galicia', 'high', { gl: 'As mareas marcan a costa galega', es: 'Las mareas marcan la costa gallega', en: 'Tides shape the Galician coast' }],
  ['o_marisqueo', 'PERTENCE_A', 'oficios_mar', 'high', { gl: 'O marisqueo é un oficio do mar', es: 'El marisqueo es un oficio del mar', en: 'Shellfish gathering is a trade of the sea' }],
  ['a_ameixa', 'PERTENCE_A', 'gastronomia_galicia', 'high', { gl: 'A ameixa é parte da gastronomía galega', es: 'La almeja es parte de la gastronomía gallega', en: 'The clam is part of Galician cuisine' }],
  ['a_ameixa', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'A ameixa vive nas rías', es: 'La almeja vive en las rías', en: 'The clam lives in the rías' }],
]

const RUTAS = [
  { nodos: LIXO, rels: REL_LIXO, journey: { label_gl: 'A viaxe do lixo', label_es: 'El viaje de la basura', label_en: 'The journey of rubbish',
      description_gl: 'Do cubo ao obxecto novo: contedor, planta de reciclaxe e a roda que non para.', description_es: 'Del cubo al objeto nuevo: contenedor, planta de reciclaje y la rueda que no para.', description_en: 'From the bin to a new object: recycling bin, recycling plant and the wheel that never stops.',
      modulo: 'Natureza', icono: '♻️' } },
  { nodos: MAREA, rels: REL_MAREA, journey: { label_gl: 'Por que sobe e baixa o mar', label_es: 'Por qué sube y baja el mar', label_en: 'Why the sea rises and falls',
      description_gl: 'Da Lúa á ameixa: a marea, as mariscadoras e a mesa.', description_es: 'De la Luna a la almeja: la marea, las mariscadoras y la mesa.', description_en: 'From the Moon to the clam: the tide, the shellfish gatherers and the table.',
      modulo: 'Natureza', icono: '🌊' } },
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
const ex = await j('GET', '/journeys', null, TOKEN); const ids = new Set((ex.data.journeys || []).map(x => x.id))
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n.id, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'primary', type: 'educational', visibility: 'public', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
  if (res.data?.id) {
    // publicada desde o primeiro día (o catálogo do neno só ve published+public)
    const body = { level: 'primary', type: 'educational', status: 'published', visibility: 'public', modulo: r.journey.modulo, icono: r.journey.icono }
    for (const k of ['label_gl', 'label_es', 'label_en', 'description_gl', 'description_es', 'description_en']) body[k] = r.journey[k]
    const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', p.status)
  }
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas agora:', (fin.data.journeys || []).map(x => x.id).join(', '))
