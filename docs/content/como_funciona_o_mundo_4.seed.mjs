// FONTE DE VERDADE do contido "como funciona o mundo" (4ª entrega): Como chega a mensaxe ao móbil 📱 e A viaxe da pataca 🥔.
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

// ───────────────────────── RUTA 8: COMO CHEGA A MENSAXE AO MÓBIL ─────────────────────────
const MOVIL = [
  N('a_mensaxe', { gl: 'A mensaxe', es: 'El mensaje', en: 'The message' },
    { gl: 'Escribes "ola" e dálle a enviar. Parece que a palabra voa, pero non: o móbil convértea en números. Cada letra ten o seu número, e cada número escríbese só con uns e ceros. "Ola" son unhas poucas ducias de uns e ceros. Iso é o único que o móbil sabe mandar. E mándao sen cables, pola [[onda de radio|a_onda_de_radio]].',
      es: 'Escribes "hola" y le das a enviar. Parece que la palabra vuela, pero no: el móvil la convierte en números. Cada letra tiene su número, y cada número se escribe solo con unos y ceros. "Hola" son unas pocas docenas de unos y ceros. Eso es lo único que el móvil sabe mandar. Y lo manda sin cables, por la [[onda de radio|a_onda_de_radio]].',
      en: 'You type "hi" and press send. It looks as if the word flies, but no: the phone turns it into numbers. Every letter has its number, and every number is written only with ones and zeros. "Hi" is a few dozen ones and zeros. That is the only thing the phone knows how to send. And it sends it without wires, on a [[radio wave|a_onda_de_radio]].' },
    { gl: 'Ese código de uns e ceros chámase binario, e é o idioma de todos os ordenadores. Unha foto tamén son números: millóns de puntiños, cada un coa súa cor escrita en binario. Por iso unha foto "pesa" moito máis ca un texto.',
      es: 'Ese código de unos y ceros se llama binario, y es el idioma de todos los ordenadores. Una foto también son números: millones de puntitos, cada uno con su color escrito en binario. Por eso una foto "pesa" mucho más que un texto.',
      en: 'That code of ones and zeros is called binary, and it is the language of every computer. A photo is numbers too: millions of dots, each with its colour written in binary. That is why a photo "weighs" much more than a text.' },
    { gl: 'En que converte o móbil a túa mensaxe antes de enviala?\na) en números feitos de uns e ceros\nb) en son moi agudo\nc) en luz de cores',
      es: '¿En qué convierte el móvil tu mensaje antes de enviarlo?\na) en números hechos de unos y ceros\nb) en sonido muy agudo\nc) en luz de colores',
      en: 'What does the phone turn your message into before sending it?\na) numbers made of ones and zeros\nb) a very high sound\nc) coloured light' }),
  N('a_onda_de_radio', { gl: 'A onda de radio', es: 'La onda de radio', en: 'The radio wave' },
    { gl: 'O móbil ten dentro unha antena pequeniña que fai ondas invisibles, coma as que fai unha pedra na auga, pero no aire. Son ondas de radio: as mesmas que levan a música á radio do coche. O móbil acende e apaga a onda moi rápido para escribir nela os uns e ceros. A onda viaxa á velocidade da luz ata a [[antena|a_antena]] máis próxima.',
      es: 'El móvil tiene dentro una antena pequeñita que hace ondas invisibles, como las que hace una piedra en el agua, pero en el aire. Son ondas de radio: las mismas que llevan la música a la radio del coche. El móvil enciende y apaga la onda muy rápido para escribir en ella los unos y ceros. La onda viaja a la velocidad de la luz hasta la [[antena|a_antena]] más cercana.',
      en: 'The phone has a tiny antenna inside that makes invisible waves, like the ones a stone makes in water, but in the air. They are radio waves: the same ones that carry music to the car radio. The phone switches the wave on and off very fast to write the ones and zeros into it. The wave travels at the speed of light to the nearest [[mast|a_antena]].' },
    { gl: 'As ondas de radio, a luz que ves e os raios X son a mesma cousa con distinto tamaño de onda: chámanse ondas electromagnéticas. As de radio son enormes (dun metro ou máis) e por iso atravesan paredes; a luz é tan pequena que non pode.',
      es: 'Las ondas de radio, la luz que ves y los rayos X son la misma cosa con distinto tamaño de onda: se llaman ondas electromagnéticas. Las de radio son enormes (de un metro o más) y por eso atraviesan paredes; la luz es tan pequeña que no puede.',
      en: 'Radio waves, the light you see and X-rays are the same thing with different wave sizes: they are called electromagnetic waves. Radio waves are huge (a metre or more), which is why they pass through walls; light is so small that it cannot.' },
    { gl: 'Como escribe o móbil os uns e ceros na onda de radio?\na) acendéndoa e apagándoa moi rápido\nb) pintándoa de cores\nc) berrando máis forte',
      es: '¿Cómo escribe el móvil los unos y ceros en la onda de radio?\na) encendiéndola y apagándola muy rápido\nb) pintándola de colores\nc) gritando más fuerte',
      en: 'How does the phone write the ones and zeros into the radio wave?\na) by switching it on and off very fast\nb) by painting it colours\nc) by shouting louder' }),
  N('a_antena', { gl: 'A antena', es: 'La antena', en: 'The mast' },
    { gl: 'Nos montes e nos tellados hai antenas altas que escoitan os móbiles de arredor. Cada antena atende a súa zona, que se chama cela: por iso din "telefonía celular". A antena recolle a túa onda, volve convertela en uns e ceros e mándaos por un cable de fibra óptica, onde viaxan como chispas de luz. Se a persoa está lonxe, o camiño segue polo [[cable submarino|o_cable_submarino]].',
      es: 'En los montes y en los tejados hay antenas altas que escuchan los móviles de alrededor. Cada antena atiende su zona, que se llama celda: por eso dicen "telefonía celular". La antena recoge tu onda, la vuelve a convertir en unos y ceros y los manda por un cable de fibra óptica, donde viajan como chispas de luz. Si la persona está lejos, el camino sigue por el [[cable submarino|o_cable_submarino]].',
      en: 'On hills and rooftops there are tall masts listening to the phones around them. Each mast serves its own area, called a cell: that is why it is called "cellular" phone service. The mast picks up your wave, turns it back into ones and zeros and sends them down a fibre-optic cable, where they travel as flashes of light. If the person is far away, the path continues along the [[undersea cable|o_cable_submarino]].' },
    { gl: 'Cando vas no coche ou no tren, o móbil vai cambiando de antena sen que o notes: chámase "handover". Se non hai ningunha antena preto (no medio do monte, nunha cova), non hai cobertura e a onda non a escoita ninguén.',
      es: 'Cuando vas en el coche o en el tren, el móvil va cambiando de antena sin que lo notes: se llama "handover". Si no hay ninguna antena cerca (en medio del monte, en una cueva), no hay cobertura y la onda no la escucha nadie.',
      en: 'When you travel by car or train, the phone keeps switching masts without you noticing: it is called "handover". If there is no mast nearby (deep in the hills, in a cave), there is no coverage and nobody hears the wave.' },
    { gl: 'Por que se di "telefonía celular"?\na) porque cada antena atende unha zona chamada cela\nb) porque os móbiles teñen células\nc) porque as antenas son pequenas',
      es: '¿Por qué se dice "telefonía celular"?\na) porque cada antena atiende una zona llamada celda\nb) porque los móviles tienen células\nc) porque las antenas son pequeñas',
      en: 'Why is it called "cellular" phone service?\na) because each mast serves an area called a cell\nb) because phones have cells\nc) because masts are small' }),
  N('o_cable_submarino', { gl: 'O cable submarino', es: 'El cable submarino', en: 'The undersea cable' },
    { gl: 'Internet non vai por satélite, ou case nunca: vai por cables no fondo do mar. Son cables de fibra de vidro, finos coma un pelo e cubertos de plástico e ferro, que cruzan océanos enteiros. Pola fibra a túa mensaxe viaxa como luz. En menos dun segundo dá a volta ao mundo se fai falla, chega a outra antena, e o móbil do outro lado convérteo en letras: "ola". Todo empezou nunha [[mensaxe|a_mensaxe]].',
      es: 'Internet no va por satélite, o casi nunca: va por cables en el fondo del mar. Son cables de fibra de vidrio, finos como un pelo y cubiertos de plástico y hierro, que cruzan océanos enteros. Por la fibra tu mensaje viaja como luz. En menos de un segundo da la vuelta al mundo si hace falta, llega a otra antena, y el móvil del otro lado lo convierte en letras: "hola". Todo empezó en un [[mensaje|a_mensaxe]].',
      en: 'The internet does not go by satellite, or hardly ever: it goes through cables on the sea floor. They are glass-fibre cables, as thin as a hair and wrapped in plastic and steel, crossing whole oceans. Through the fibre your message travels as light. In less than a second it goes round the world if it needs to, reaches another mast, and the phone on the other side turns it into letters: "hi". It all started with a [[message|a_mensaxe]].' },
    { gl: 'Hai máis dun millón de quilómetros de cables submarinos no mundo. Un dos primeiros cables telegráficos entre Europa e América, en 1866, tardaba minutos en mandar unha palabra; hoxe un cable de fibra move billóns de uns e ceros por segundo. Cando chegan á costa, entran en terra por unha estación de amarre e seguen por cables normais ata a túa antena.',
      es: 'Hay más de un millón de kilómetros de cables submarinos en el mundo. Uno de los primeros cables telegráficos entre Europa y América, en 1866, tardaba minutos en mandar una palabra; hoy un cable de fibra mueve billones de unos y ceros por segundo. Cuando llegan a la costa, entran en tierra por una estación de amarre y siguen por cables normales hasta tu antena.',
      en: 'There are more than a million kilometres of undersea cables in the world. One of the first telegraph cables between Europe and America, in 1866, took minutes to send one word; today a fibre cable moves trillions of ones and zeros per second. When they reach the coast, they come ashore at a landing station and continue over ordinary cables to your antenna.' },
    { gl: 'Por onde cruza internet os océanos?\na) por cables de fibra no fondo do mar\nb) polas nubes\nc) por barcos que levan as mensaxes',
      es: '¿Por dónde cruza internet los océanos?\na) por cables de fibra en el fondo del mar\nb) por las nubes\nc) por barcos que llevan los mensajes',
      en: 'How does the internet cross the oceans?\na) through fibre cables on the sea floor\nb) through the clouds\nc) on ships carrying the messages' }),
]
const REL_MOVIL = [
  ['a_mensaxe', 'ANTES_DE', 'a_onda_de_radio', 'high', { gl: 'A mensaxe convértese en onda', es: 'El mensaje se convierte en onda', en: 'The message becomes a wave' }],
  ['a_onda_de_radio', 'ANTES_DE', 'a_antena', 'high', { gl: 'A onda chega á antena', es: 'La onda llega a la antena', en: 'The wave reaches the mast' }],
  ['a_antena', 'ANTES_DE', 'o_cable_submarino', 'high', { gl: 'Da antena segue polo cable', es: 'De la antena sigue por el cable', en: 'From the mast it continues along the cable' }],
  ['a_onda_de_radio', 'TRANSFORMA', 'a_mensaxe', 'high', { gl: 'A onda leva a mensaxe en uns e ceros', es: 'La onda lleva el mensaje en unos y ceros', en: 'The wave carries the message as ones and zeros' }],
  ['a_antena', 'USA', 'a_onda_de_radio', 'high', { gl: 'A antena escoita as ondas de radio', es: 'La antena escucha las ondas de radio', en: 'The mast listens to radio waves' }],
  ['o_cable_submarino', 'RELACIONADO_CON', 'a_mensaxe', 'medium', { gl: 'Polo cable chega a mensaxe ao outro lado', es: 'Por el cable llega el mensaje al otro lado', en: 'The message reaches the other side through the cable' }],
  ['a_mensaxe', 'PERTENCE_A', 'electronica_dixital', 'high', { gl: 'A mensaxe é información dixital', es: 'El mensaje es información digital', en: 'The message is digital information' }],
  ['a_onda_de_radio', 'PERTENCE_A', 'enerxia_forzas', 'medium', { gl: 'As ondas de radio son enerxía electromagnética', es: 'Las ondas de radio son energía electromagnética', en: 'Radio waves are electromagnetic energy' }],
  ['a_antena', 'PERTENCE_A', 'electronica_dixital', 'high', { gl: 'A antena é parte da rede dixital', es: 'La antena es parte de la red digital', en: 'The mast is part of the digital network' }],
  ['o_cable_submarino', 'PERTENCE_A', 'electronica_dixital', 'high', { gl: 'O cable submarino é a columna de internet', es: 'El cable submarino es la columna de internet', en: 'The undersea cable is the backbone of the internet' }],
]

// ───────────────────────── RUTA 9: A VIAXE DA PATACA ─────────────────────────
const PATACA = [
  N('a_semente_de_pataca', { gl: 'A semente de pataca', es: 'La semilla de patata', en: 'The seed potato' },
    { gl: 'A pataca non nace dunha semente pequena coma o trigo: nace doutra pataca. En marzo, cando xa non xea, córtanse patacas vellas con "ollos", que son os puntiños de onde saen os gromos. Cada anaco con ollo pode dar unha planta nova. Enterrábanse a un palmo de fondo, en filas, na [[leira|a_leira]].',
      es: 'La patata no nace de una semilla pequeña como el trigo: nace de otra patata. En marzo, cuando ya no hiela, se cortan patatas viejas con "ojos", que son los puntitos de donde salen los brotes. Cada trozo con ojo puede dar una planta nueva. Se entierran a un palmo de hondo, en filas, en la [[huerta|a_leira]].',
      en: 'The potato does not grow from a small seed like wheat: it grows from another potato. In March, once the frosts are over, old potatoes with "eyes" are cut up; the eyes are the little dots where the sprouts come out. Each piece with an eye can make a new plant. They are buried a hand deep, in rows, in the [[field|a_leira]].' },
    { gl: 'A pataca vén dos Andes, en América do Sur, e chegou a Europa hai uns 450 anos. En Galicia entrou polos mosteiros no século XVIII e salvou de moitas fames. Hoxe a pataca de Galicia ten selo propio: a máis famosa é a de Bergantiños e A Limia.',
      es: 'La patata viene de los Andes, en América del Sur, y llegó a Europa hace unos 450 años. En Galicia entró por los monasterios en el siglo XVIII y salvó de muchas hambres. Hoy la patata de Galicia tiene sello propio: la más famosa es la de Bergantiños y A Limia.',
      en: 'The potato comes from the Andes, in South America, and reached Europe about 450 years ago. It came into Galicia through the monasteries in the 18th century and saved people from many famines. Today the Galician potato has its own seal: the most famous are from Bergantiños and A Limia.' },
    { gl: 'De onde nace unha planta de pataca?\na) dunha pataca con ollos enterrada\nb) dunha semente pequeniña coma a do trigo\nc) dunha flor',
      es: '¿De dónde nace una planta de patata?\na) de una patata con ojos enterrada\nb) de una semilla pequeñita como la del trigo\nc) de una flor',
      en: 'Where does a potato plant grow from?\na) from a buried potato with eyes\nb) from a tiny seed like wheat\nc) from a flower' }),
  N('a_leira', { gl: 'A leira', es: 'La huerta', en: 'The field' },
    { gl: 'A leira é o anaco de terra onde se cultiva. Hai que labrala para que a terra quede solta, botarlle esterco e sachar as malas herbas que lle rouban a auga. A planta de pataca medra cara arriba, con follas e flores brancas ou lilas, pero o que importa pasa debaixo: nas raíces fórmanse patacas novas. Cando as follas amarelean, chega a [[colleita|a_colleita]].',
      es: 'La huerta es el trozo de tierra donde se cultiva. Hay que labrarla para que la tierra quede suelta, echarle estiércol y escardar las malas hierbas que le roban el agua. La planta de patata crece hacia arriba, con hojas y flores blancas o lilas, pero lo que importa pasa debajo: en las raíces se forman patatas nuevas. Cuando las hojas amarillean, llega la [[cosecha|a_colleita]].',
      en: 'The field is the plot of land where things are grown. It must be ploughed so the soil is loose, given manure, and weeded so the weeds do not steal the water. The potato plant grows upwards, with leaves and white or lilac flowers, but what matters happens below: new potatoes form on the roots. When the leaves turn yellow, it is time for the [[harvest|a_colleita]].' },
    { gl: 'A pataca é un tubérculo: unha parte do talo que medra baixo terra e garda comida para a planta. Por iso, se deixas unha pataca na cociña moito tempo, bótalle gromos: cre que chegou a primavera. As leiras galegas eran pequenas porque a terra se repartía entre todos os fillos.',
      es: 'La patata es un tubérculo: una parte del tallo que crece bajo tierra y guarda comida para la planta. Por eso, si dejas una patata en la cocina mucho tiempo, le salen brotes: cree que llegó la primavera. Las huertas gallegas eran pequeñas porque la tierra se repartía entre todos los hijos.',
      en: 'The potato is a tuber: a part of the stem that grows underground and stores food for the plant. That is why, if you leave a potato in the kitchen for a long time, it sprouts: it thinks spring has come. Galician fields were small because the land was divided among all the children.' },
    { gl: 'Onde se forman as patacas novas?\na) nas raíces, baixo terra\nb) nas flores\nc) nas puntas das follas',
      es: '¿Dónde se forman las patatas nuevas?\na) en las raíces, bajo tierra\nb) en las flores\nc) en las puntas de las hojas',
      en: 'Where do the new potatoes form?\na) on the roots, underground\nb) in the flowers\nc) at the tips of the leaves' }),
  N('a_colleita', { gl: 'A colleita', es: 'La cosecha', en: 'The harvest' },
    { gl: 'En setembro, cando as follas secan, é hora de apañar as patacas. Antes facíase co sacho, a man, toda a familia xunta; agora hai máquinas que levantan a terra e deixan as patacas enriba. Cada planta dá dez ou quince. Gárdanse nun sitio escuro e fresco, porque coa luz póñense verdes e non se poden comer. Unhas van ao mercado, outras van directas ao [[caldo|o_caldo]].',
      es: 'En septiembre, cuando las hojas secan, es hora de recoger las patatas. Antes se hacía con el azadón, a mano, toda la familia junta; ahora hay máquinas que levantan la tierra y dejan las patatas encima. Cada planta da diez o quince. Se guardan en un sitio oscuro y fresco, porque con la luz se ponen verdes y no se pueden comer. Unas van al mercado, otras van directas al [[caldo|o_caldo]].',
      en: 'In September, when the leaves dry, it is time to dig up the potatoes. It used to be done with a hoe, by hand, the whole family together; now machines lift the soil and leave the potatoes on top. Each plant gives ten or fifteen. They are kept somewhere dark and cool, because light turns them green and inedible. Some go to market, others go straight into the [[broth|o_caldo]].' },
    { gl: 'A pataca verde ten solanina, un veleno natural da planta: por iso non se come a parte verde nin os gromos. Galicia produce arredor de medio millón de toneladas de patacas ao ano. A Limia, en Ourense, é a comarca que máis colle.',
      es: 'La patata verde tiene solanina, un veneno natural de la planta: por eso no se come la parte verde ni los brotes. Galicia produce alrededor de medio millón de toneladas de patatas al año. A Limia, en Ourense, es la comarca que más recoge.',
      en: 'Green potato contains solanine, a natural poison of the plant: that is why the green part and the sprouts are not eaten. Galicia produces about half a million tonnes of potatoes a year. A Limia, in Ourense, is the district that harvests the most.' },
    { gl: 'Por que se gardan as patacas nun sitio escuro?\na) porque coa luz se poñen verdes e non se poden comer\nb) porque teñen medo\nc) porque na luz medran de máis',
      es: '¿Por qué se guardan las patatas en un sitio oscuro?\na) porque con la luz se ponen verdes y no se pueden comer\nb) porque tienen miedo\nc) porque en la luz crecen demasiado',
      en: 'Why are potatoes kept somewhere dark?\na) because light turns them green and inedible\nb) because they are scared\nc) because they grow too much in the light' }),
  N('o_caldo', { gl: 'O caldo', es: 'El caldo', en: 'The broth' },
    { gl: 'O caldo galego é a comida de sempre nos días de frío: patacas, grelos ou verzas, fabas, unto e un anaco de carne, todo cocendo despacio nunha pota grande. A pataca é a que lle dá corpo. Nunha cunca de caldo hai un ano enteiro de traballo: a semente en marzo, a leira no verán, a colleita en setembro. Todo empezou nunha [[pataca con ollos|a_semente_de_pataca]].',
      es: 'El caldo gallego es la comida de siempre en los días de frío: patatas, grelos o berzas, alubias, unto y un trozo de carne, todo cociendo despacio en una olla grande. La patata es la que le da cuerpo. En un cuenco de caldo hay un año entero de trabajo: la semilla en marzo, la huerta en verano, la cosecha en septiembre. Todo empezó en una [[patata con ojos|a_semente_de_pataca]].',
      en: 'Galician broth (caldo) is the food of cold days: potatoes, turnip greens or cabbage, beans, cured pork fat and a piece of meat, all simmering slowly in a big pot. The potato is what gives it body. In a bowl of broth there is a whole year of work: the seed in March, the field in summer, the harvest in September. It all started with a [[potato with eyes|a_semente_de_pataca]].' },
    { gl: 'O caldo é un prato de aproveitamento: facíase co que había na horta e cun chisco de carne para dar sabor. Cocer a pataca convirte o seu amidón, que é duro e cru, nunha pasta branda que o corpo pode dixerir. Por iso a pataca crúa non se come.',
      es: 'El caldo es un plato de aprovechamiento: se hacía con lo que había en la huerta y con una pizca de carne para dar sabor. Cocer la patata convierte su almidón, que es duro y crudo, en una pasta blanda que el cuerpo puede digerir. Por eso la patata cruda no se come.',
      en: 'Caldo is a make-do dish: it was made with whatever the garden gave and a little meat for flavour. Cooking the potato turns its starch, hard and raw, into a soft paste the body can digest. That is why raw potato is not eaten.' },
    { gl: 'Que lle dá corpo ao caldo galego?\na) a pataca\nb) o azucre\nc) o pan',
      es: '¿Qué le da cuerpo al caldo gallego?\na) la patata\nb) el azúcar\nc) el pan',
      en: 'What gives Galician broth its body?\na) the potato\nb) sugar\nc) bread' }),
]
const REL_PATACA = [
  ['a_semente_de_pataca', 'ANTES_DE', 'a_leira', 'high', { gl: 'A semente plántase na leira', es: 'La semilla se planta en la huerta', en: 'The seed is planted in the field' }],
  ['a_leira', 'ANTES_DE', 'a_colleita', 'high', { gl: 'Da leira sae a colleita', es: 'De la huerta sale la cosecha', en: 'The harvest comes from the field' }],
  ['a_colleita', 'ANTES_DE', 'o_caldo', 'high', { gl: 'As patacas colleitadas van ao caldo', es: 'Las patatas cosechadas van al caldo', en: 'Harvested potatoes go into the broth' }],
  ['a_leira', 'PRODUCE', 'a_colleita', 'high', { gl: 'A leira produce a colleita', es: 'La huerta produce la cosecha', en: 'The field produces the harvest' }],
  ['o_caldo', 'USA', 'a_colleita', 'high', { gl: 'O caldo leva as patacas da colleita', es: 'El caldo lleva las patatas de la cosecha', en: 'The broth uses the harvested potatoes' }],
  ['a_colleita', 'TRANSFORMA', 'o_caldo', 'medium', { gl: 'Ao cocer, a pataca faise caldo', es: 'Al cocer, la patata se hace caldo', en: 'When cooked, the potato becomes broth' }],
  ['a_semente_de_pataca', 'PERTENCE_A', 'oficios_terra', 'high', { gl: 'Plantar é traballo da terra', es: 'Plantar es trabajo de la tierra', en: 'Planting is work of the land' }],
  ['a_leira', 'PERTENCE_A', 'oficios_terra', 'high', { gl: 'A leira é o lugar dos oficios da terra', es: 'La huerta es el lugar de los oficios de la tierra', en: 'The field is where land trades happen' }],
  ['a_colleita', 'PERTENCE_A', 'oficios_terra', 'high', { gl: 'Colleitar é oficio da terra', es: 'Cosechar es oficio de la tierra', en: 'Harvesting is a land trade' }],
  ['o_caldo', 'PERTENCE_A', 'gastronomia_galicia', 'high', { gl: 'O caldo é gastronomía galega', es: 'El caldo es gastronomía gallega', en: 'Caldo is Galician cuisine' }],
]

const RUTAS = [
  { nodos: MOVIL, rels: REL_MOVIL, journey: { label_gl: 'Como chega a mensaxe ao móbil', label_es: 'Cómo llega el mensaje al móvil', label_en: 'How a message reaches a phone',
      description_gl: 'De "ola" a uns e ceros, pola onda, a antena e o cable do fondo do mar.', description_es: 'De "hola" a unos y ceros, por la onda, la antena y el cable del fondo del mar.', description_en: 'From "hi" to ones and zeros, over the wave, the mast and the cable on the sea floor.',
      modulo: 'Ciencia', icono: '📱' } },
  { nodos: PATACA, rels: REL_PATACA, journey: { label_gl: 'A viaxe da pataca', label_es: 'El viaje de la patata', label_en: 'The journey of the potato',
      description_gl: 'Da pataca con ollos ao caldo: leira, colleita e un ano de traballo.', description_es: 'De la patata con ojos al caldo: huerta, cosecha y un año de trabajo.', description_en: 'From the potato with eyes to the broth: field, harvest and a year of work.',
      modulo: 'Oficios', icono: '🥔' } },
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
