// FONTE DE VERDADE do contido "como funciona o mundo" (3ª entrega): Como arde o lume 🔥 e A viaxe do sal 🧂.
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

// ───────────────────────── RUTA 6: COMO ARDE O LUME ─────────────────────────
const LUME = [
  N('a_lena', { gl: 'A leña', es: 'La leña', en: 'Firewood' },
    { gl: 'A leña son anacos de árbore secos: carballo, piñeiro, eucalipto. Dentro da madeira hai enerxía gardada, a mesma que a árbore colleu do sol durante anos. Mentres está quieta no galpón, non pasa nada. Para que esa enerxía saia hai que xuntala con dúas cousas máis. A primeira é o [[aire|o_aire]].',
      es: 'La leña son trozos de árbol secos: roble, pino, eucalipto. Dentro de la madera hay energía guardada, la misma que el árbol cogió del sol durante años. Mientras está quieta en el cobertizo, no pasa nada. Para que esa energía salga hay que juntarla con dos cosas más. La primera es el [[aire|o_aire]].',
      en: 'Firewood is dry pieces of tree: oak, pine, eucalyptus. Inside the wood there is stored energy, the same energy the tree took from the sun over the years. While it sits still in the shed, nothing happens. For that energy to come out, it has to meet two more things. The first is [[air|o_aire]].' },
    { gl: 'A leña verde, acabada de cortar, non arde ben: está chea de auga e bota fume. Hai que deixala secar un ano ou dous. Nas casas galegas de antes, a lareira era o centro de todo: alí se cociñaba, se secaba a roupa e se contaban historias.',
      es: 'La leña verde, recién cortada, no arde bien: está llena de agua y echa humo. Hay que dejarla secar uno o dos años. En las casas gallegas de antes, la lareira era el centro de todo: allí se cocinaba, se secaba la ropa y se contaban historias.',
      en: 'Green wood, freshly cut, does not burn well: it is full of water and gives off smoke. It has to dry for a year or two. In old Galician houses, the hearth (lareira) was the centre of everything: cooking, drying clothes and telling stories.' },
    { gl: 'De onde vén a enerxía que hai dentro da leña?\na) do sol, que a árbore colleu durante anos\nb) do galpón onde se garda\nc) da machada que a cortou',
      es: '¿De dónde viene la energía que hay dentro de la leña?\na) del sol, que el árbol cogió durante años\nb) del cobertizo donde se guarda\nc) del hacha que la cortó',
      en: 'Where does the energy inside firewood come from?\na) from the sun, gathered by the tree over years\nb) from the shed where it is kept\nc) from the axe that cut it' }),
  N('o_aire', { gl: 'O aire', es: 'El aire', en: 'Air' },
    { gl: 'O aire non se ve, pero está cheo de cousas. Unha delas chámase osíxeno, e é o que o lume come. Sen aire, nada arde: se tapas unha candea cun vaso, apágase en poucos segundos porque gastou o osíxeno de dentro. Por iso se sopra a un lume que empeza: para darlle máis aire. Só falta a terceira cousa: a [[chispa|a_chispa]].',
      es: 'El aire no se ve, pero está lleno de cosas. Una de ellas se llama oxígeno, y es lo que el fuego come. Sin aire, nada arde: si tapas una vela con un vaso, se apaga en pocos segundos porque gastó el oxígeno de dentro. Por eso se sopla a un fuego que empieza: para darle más aire. Solo falta la tercera cosa: la [[chispa|a_chispa]].',
      en: 'Air cannot be seen, but it is full of things. One of them is called oxygen, and it is what fire eats. Without air, nothing burns: if you cover a candle with a glass, it goes out in a few seconds because it has used up the oxygen inside. That is why you blow on a fire that is just starting: to give it more air. Only the third thing is missing: the [[spark|a_chispa]].' },
    { gl: 'De cada cinco partes do aire, só unha é osíxeno; case todo o resto é nitróxeno, que non arde. Nós tamén "queimamos" comida co osíxeno que respiramos, amodo e sen chama: por iso o corpo está quente.',
      es: 'De cada cinco partes del aire, solo una es oxígeno; casi todo el resto es nitrógeno, que no arde. Nosotros también "quemamos" comida con el oxígeno que respiramos, despacio y sin llama: por eso el cuerpo está caliente.',
      en: 'Of every five parts of air, only one is oxygen; almost all the rest is nitrogen, which does not burn. We also "burn" food with the oxygen we breathe, slowly and without a flame: that is why the body is warm.' },
    { gl: 'Que pasa se tapas unha candea cun vaso?\na) arde máis forte\nb) apágase porque se acaba o osíxeno\nc) o vaso rompe',
      es: '¿Qué pasa si tapas una vela con un vaso?\na) arde más fuerte\nb) se apaga porque se acaba el oxígeno\nc) el vaso se rompe',
      en: 'What happens if you cover a candle with a glass?\na) it burns harder\nb) it goes out because the oxygen runs out\nc) the glass breaks' }),
  N('a_chispa', { gl: 'A chispa', es: 'La chispa', en: 'The spark' },
    { gl: 'Leña e aire poden estar xuntos anos sen que pase nada. Falta calor: unha chispa, un misto, o sol nunha lupa. Cando un anaquiño de madeira se quenta abondo, empeza a arder, e ese lume quenta o de ao lado, e así segue. Leña, aire e calor: quítalle unha das tres e o lume morre. Cando as tres se xuntan, nace o [[lume|o_lume]].',
      es: 'Leña y aire pueden estar juntos años sin que pase nada. Falta calor: una chispa, una cerilla, el sol en una lupa. Cuando un trocito de madera se calienta bastante, empieza a arder, y ese fuego calienta el de al lado, y así sigue. Leña, aire y calor: quítale una de las tres y el fuego muere. Cuando las tres se juntan, nace el [[fuego|o_lume]].',
      en: 'Wood and air can sit together for years and nothing happens. Heat is missing: a spark, a match, the sun through a magnifying glass. When a tiny piece of wood gets hot enough, it starts to burn, and that fire heats the piece next to it, and so on. Wood, air and heat: take one of the three away and the fire dies. When the three meet, [[fire|o_lume]] is born.' },
    { gl: 'Os bombeiros chámanlle a isto o triángulo do lume. Apagar un incendio é romper o triángulo: a auga quita a calor, a manta ou a area quitan o aire, e cortar a vexetación quita o combustible. En Galicia os incendios do monte son o maior perigo do verán.',
      es: 'Los bomberos le llaman a esto el triángulo del fuego. Apagar un incendio es romper el triángulo: el agua quita el calor, la manta o la arena quitan el aire, y cortar la vegetación quita el combustible. En Galicia los incendios del monte son el mayor peligro del verano.',
      en: 'Firefighters call this the fire triangle. Putting out a fire means breaking the triangle: water removes the heat, a blanket or sand removes the air, and clearing vegetation removes the fuel. In Galicia, wildfires are the biggest danger of the summer.' },
    { gl: 'Cales son as tres cousas que precisa o lume?\na) leña, aire e calor\nb) auga, terra e vento\nc) sol, lúa e estrelas',
      es: '¿Cuáles son las tres cosas que necesita el fuego?\na) leña, aire y calor\nb) agua, tierra y viento\nc) sol, luna y estrellas',
      en: 'What are the three things fire needs?\na) wood, air and heat\nb) water, earth and wind\nc) sun, moon and stars' }),
  N('o_lume', { gl: 'O lume', es: 'El fuego', en: 'Fire' },
    { gl: 'O lume é a madeira desfacéndose en luz e calor. A chama que ves é gas quente que brilla. Cando remata, queda a cinza: o pouco da leña que non podía arder. Coa calor do lume cócese o caldo, séquese a roupa e quéntase a casa. Pero o lume non entende de amigos: fóra do seu sitio, queima. Respectalo é a primeira regra. Todo empezou nunha [[leña|a_lena]] seca.',
      es: 'El fuego es la madera deshaciéndose en luz y calor. La llama que ves es gas caliente que brilla. Cuando termina, queda la ceniza: lo poco de la leña que no podía arder. Con el calor del fuego se cuece el caldo, se seca la ropa y se calienta la casa. Pero el fuego no entiende de amigos: fuera de su sitio, quema. Respetarlo es la primera regla. Todo empezó en una [[leña|a_lena]] seca.',
      en: 'Fire is wood coming apart into light and heat. The flame you see is hot gas glowing. When it ends, ash remains: the little bit of wood that could not burn. With the heat of fire we cook the broth, dry the clothes and warm the house. But fire has no friends: out of its place, it burns. Respecting it is the first rule. It all started with a piece of dry [[firewood|a_lena]].' },
    { gl: 'A cinza da lareira usábase para lavar a roupa (a "barrela") e para abonar a horta. A parte azul da chama é a máis quente; a amarela son partículas de carbón brillando. Un incendio pode correr máis rápido ca unha persoa: se ves lume no monte, chama ao 112 e afástate.',
      es: 'La ceniza de la lareira se usaba para lavar la ropa (la "colada") y para abonar la huerta. La parte azul de la llama es la más caliente; la amarilla son partículas de carbón brillando. Un incendio puede correr más rápido que una persona: si ves fuego en el monte, llama al 112 y aléjate.',
      en: 'Ash from the hearth was used to wash clothes and to fertilise the vegetable garden. The blue part of a flame is the hottest; the yellow is glowing particles of carbon. A wildfire can run faster than a person: if you see fire on the hills, call 112 and move away.' },
    { gl: 'Que queda cando o lume remata?\na) auga\nb) cinza\nc) máis leña',
      es: '¿Qué queda cuando el fuego termina?\na) agua\nb) ceniza\nc) más leña',
      en: 'What is left when the fire ends?\na) water\nb) ash\nc) more wood' }),
]
const REL_LUME = [
  ['a_lena', 'ANTES_DE', 'o_aire', 'high', { gl: 'Primeiro o combustible, despois o aire', es: 'Primero el combustible, después el aire', en: 'First the fuel, then the air' }],
  ['o_aire', 'ANTES_DE', 'a_chispa', 'high', { gl: 'Co aire xa só falta a calor', es: 'Con el aire ya solo falta el calor', en: 'With air, only heat is missing' }],
  ['a_chispa', 'ANTES_DE', 'o_lume', 'high', { gl: 'A chispa acende o lume', es: 'La chispa enciende el fuego', en: 'The spark lights the fire' }],
  ['o_lume', 'USA', 'a_lena', 'high', { gl: 'O lume consome a leña', es: 'El fuego consume la leña', en: 'Fire consumes the wood' }],
  ['o_lume', 'USA', 'o_aire', 'high', { gl: 'O lume come o osíxeno do aire', es: 'El fuego come el oxígeno del aire', en: 'Fire eats the oxygen in the air' }],
  ['a_chispa', 'PRODUCE', 'o_lume', 'high', { gl: 'A calor da chispa fai nacer o lume', es: 'El calor de la chispa hace nacer el fuego', en: 'The heat of the spark gives birth to fire' }],
  ['a_lena', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'A leña vén dos montes galegos', es: 'La leña viene de los montes gallegos', en: 'Firewood comes from the Galician hills' }],
  ['o_aire', 'PERTENCE_A', 'estados_materia', 'medium', { gl: 'O aire é materia en estado gasoso', es: 'El aire es materia en estado gaseoso', en: 'Air is matter in a gaseous state' }],
  ['a_chispa', 'PERTENCE_A', 'enerxia_forzas', 'medium', { gl: 'A chispa é calor: enerxía', es: 'La chispa es calor: energía', en: 'The spark is heat: energy' }],
  ['o_lume', 'PERTENCE_A', 'reaccions_transformacions', 'high', { gl: 'Arder é unha reacción química', es: 'Arder es una reacción química', en: 'Burning is a chemical reaction' }],
]

// ───────────────────────── RUTA 7: A VIAXE DO SAL ─────────────────────────
const SAL = [
  N('o_mar_salgado', { gl: 'O mar salgado', es: 'El mar salado', en: 'The salty sea' },
    { gl: 'Se algunha vez tragaches auga na praia, xa o sabes: o mar é salgado. Durante millóns de anos os ríos foron arrastrando ata o mar un chisco de sal das rochas, e o mar gardouno todo. Nun litro de auga de mar hai unhas seis culleradas de sal disolto. Non se ve, pero está. Para sacalo só fai falla sol e paciencia: a [[salina|a_salina]].',
      es: 'Si alguna vez tragaste agua en la playa, ya lo sabes: el mar es salado. Durante millones de años los ríos fueron arrastrando hasta el mar una pizca de sal de las rocas, y el mar lo guardó todo. En un litro de agua de mar hay unas seis cucharadas de sal disuelta. No se ve, pero está. Para sacarla solo hace falta sol y paciencia: la [[salina|a_salina]].',
      en: 'If you ever swallowed water at the beach, you already know: the sea is salty. For millions of years rivers carried a pinch of salt from the rocks down to the sea, and the sea kept it all. In one litre of sea water there are about six spoonfuls of dissolved salt. You cannot see it, but it is there. To get it out you only need sun and patience: the [[salt pan|a_salina]].' },
    { gl: 'Cando a auga do mar se evapora e sobe ás nubes, o sal queda: por iso a chuvia é doce. Os peixes de mar teñen trucos para non deshidratarse coa auga salgada. E o mar Morto é tan salgado que unha persoa flota nel sen nadar.',
      es: 'Cuando el agua del mar se evapora y sube a las nubes, la sal se queda: por eso la lluvia es dulce. Los peces de mar tienen trucos para no deshidratarse con el agua salada. Y el mar Muerto es tan salado que una persona flota en él sin nadar.',
      en: 'When sea water evaporates and rises to the clouds, the salt stays behind: that is why rain is fresh. Sea fish have tricks to avoid drying out in salt water. And the Dead Sea is so salty that a person floats in it without swimming.' },
    { gl: 'Por que a chuvia non é salgada se vén do mar?\na) porque o sal queda no mar cando a auga se evapora\nb) porque as nubes teñen azucre\nc) porque a chuvia vén dos ríos',
      es: '¿Por qué la lluvia no es salada si viene del mar?\na) porque la sal se queda en el mar cuando el agua se evapora\nb) porque las nubes tienen azúcar\nc) porque la lluvia viene de los ríos',
      en: 'Why is rain not salty if it comes from the sea?\na) because the salt stays in the sea when the water evaporates\nb) because clouds contain sugar\nc) because rain comes from rivers' }),
  N('a_salina', { gl: 'A salina', es: 'La salina', en: 'The salt pan' },
    { gl: 'Unha salina son piscinas pouco fondas onde se deixa entrar a auga do mar. O sol vai evaporando a auga, día tras día, e o sal queda no fondo formando unha costra branca. Despois recóllese con anciños e amontóase en pirámides. Antes en Galicia había salinas, como as de Vigo dos tempos dos romanos. Do montón sae o [[sal|o_sal]].',
      es: 'Una salina son piscinas poco hondas donde se deja entrar el agua del mar. El sol va evaporando el agua, día tras día, y la sal se queda en el fondo formando una costra blanca. Después se recoge con rastrillos y se amontona en pirámides. Antes en Galicia había salinas, como las de Vigo de los tiempos de los romanos. Del montón sale la [[sal|o_sal]].',
      en: 'A salt pan is a set of shallow pools where sea water is let in. The sun evaporates the water, day after day, and the salt stays on the bottom as a white crust. Then it is raked up and piled into pyramids. Galicia once had salt pans, like the Roman ones in Vigo. From the pile comes the [[salt|o_sal]].' },
    { gl: 'En Vigo, no barrio de O Areal, atopáronse os restos dunha salina romana de hai 2.000 anos: os romanos xa salgaban aquí o peixe. Hoxe o sal que comemos vén sobre todo de salinas de Cádiz, Alacante ou de minas de sal baixo terra.',
      es: 'En Vigo, en el barrio de O Areal, se encontraron los restos de una salina romana de hace 2.000 años: los romanos ya salaban aquí el pescado. Hoy la sal que comemos viene sobre todo de salinas de Cádiz, Alicante o de minas de sal bajo tierra.',
      en: 'In Vigo, in the O Areal district, the remains of a 2,000-year-old Roman salt pan were found: the Romans already salted fish here. Today the salt we eat comes mostly from salt pans in Cádiz or Alicante, or from salt mines underground.' },
    { gl: 'Que fai que a auga da salina desapareza e quede o sal?\na) o sol, que a evapora\nb) unha bomba que a saca\nc) os peixes, que a beben',
      es: '¿Qué hace que el agua de la salina desaparezca y quede la sal?\na) el sol, que la evapora\nb) una bomba que la saca\nc) los peces, que se la beben',
      en: 'What makes the water in the salt pan disappear and leave the salt?\na) the sun, which evaporates it\nb) a pump that removes it\nc) the fish, which drink it' }),
  N('o_sal', { gl: 'O sal', es: 'La sal', en: 'Salt' },
    { gl: 'O sal é un mineral: cristais pequenos e cadrados, se os miras cunha lupa. Dá sabor á comida, pero durante miles de anos fixo algo máis importante: gardar os alimentos. O sal chúchalle a auga ás cousas, e sen auga os microbios non poden vivir. Así, un peixe salgado dura meses en vez de días. Ese truco é o que fai posible a [[conserva|a_conserva]].',
      es: 'La sal es un mineral: cristales pequeños y cuadrados, si los miras con una lupa. Da sabor a la comida, pero durante miles de años hizo algo más importante: guardar los alimentos. La sal le chupa el agua a las cosas, y sin agua los microbios no pueden vivir. Así, un pescado salado dura meses en vez de días. Ese truco es lo que hace posible la [[conserva|a_conserva]].',
      en: 'Salt is a mineral: tiny square crystals, if you look through a magnifying glass. It flavours food, but for thousands of years it did something more important: it preserved food. Salt sucks the water out of things, and without water germs cannot live. So a salted fish lasts months instead of days. That trick is what makes [[tinned food|a_conserva]] possible.' },
    { gl: 'A palabra "salario" vén de "sal": tan valioso era que os romanos lle deron ese nome ao soldo, aínda que non está claro que pagasen en sal. O corpo precisa un pouco de sal para funcionar, pero demasiado fai dano: os médicos recomendan menos de unha cullerada pequena ao día.',
      es: 'La palabra "salario" viene de "sal": tan valiosa era que los romanos le dieron ese nombre al sueldo, aunque no está claro que pagasen en sal. El cuerpo necesita un poco de sal para funcionar, pero demasiada hace daño: los médicos recomiendan menos de una cucharada pequeña al día.',
      en: 'The word "salary" comes from "salt": it was so valuable that the Romans named wages after it, although it is not clear they actually paid in salt. The body needs a little salt to work, but too much does harm: doctors recommend less than one small spoonful a day.' },
    { gl: 'Por que o peixe salgado dura moito máis?\na) porque o sal lle quita a auga e os microbios non poden vivir\nb) porque o sal o fai máis pesado\nc) porque o sal lle dá cor',
      es: '¿Por qué el pescado salado dura mucho más?\na) porque la sal le quita el agua y los microbios no pueden vivir\nb) porque la sal lo hace más pesado\nc) porque la sal le da color',
      en: 'Why does salted fish last so much longer?\na) because salt removes the water and germs cannot live\nb) because salt makes it heavier\nc) because salt gives it colour' }),
  N('a_conserva', { gl: 'A conserva', es: 'La conserva', en: 'Tinned food' },
    { gl: 'Unha lata de mexillóns ou de sardiñas é mar gardado. Na fábrica de conservas límpase o peixe, cócese, métese na lata con aceite e un pouco de sal, péchase e quéntase para matar calquera microbio. Así aguanta anos. Galicia é a terra das conservas: aquí péchanse máis latas de peixe ca en ningún outro lugar de Europa. E todo grazas a un [[mar salgado|o_mar_salgado]].',
      es: 'Una lata de mejillones o de sardinas es mar guardado. En la fábrica de conservas se limpia el pescado, se cuece, se mete en la lata con aceite y un poco de sal, se cierra y se calienta para matar cualquier microbio. Así aguanta años. Galicia es la tierra de las conservas: aquí se cierran más latas de pescado que en ningún otro lugar de Europa. Y todo gracias a un [[mar salado|o_mar_salgado]].',
      en: 'A tin of mussels or sardines is the sea, kept. At the cannery the fish is cleaned, cooked, put into the tin with oil and a little salt, sealed and heated to kill any germs. That way it lasts for years. Galicia is the land of tinned fish: more tins of fish are sealed here than anywhere else in Europe. And all thanks to a [[salty sea|o_mar_salgado]].' },
    { gl: 'As primeiras fábricas de conservas de Galicia abríronse hai máis de 150 anos, moitas creadas por familias vidas de Cataluña. Nelas traballaron sobre todo mulleres. Hoxe hai máis de 60 conserveiras galegas e as súas latas véndense en medio mundo.',
      es: 'Las primeras fábricas de conservas de Galicia se abrieron hace más de 150 años, muchas creadas por familias venidas de Cataluña. En ellas trabajaron sobre todo mujeres. Hoy hay más de 60 conserveras gallegas y sus latas se venden en medio mundo.',
      en: 'The first canneries in Galicia opened more than 150 years ago, many founded by families from Catalonia. Mostly women worked in them. Today there are more than 60 Galician canneries and their tins are sold around half the world.' },
    { gl: 'Por que se quenta a lata despois de pechala?\na) para que saiba mellor\nb) para matar os microbios e que dure anos\nc) para que a lata brille',
      es: '¿Por qué se calienta la lata después de cerrarla?\na) para que sepa mejor\nb) para matar los microbios y que dure años\nc) para que la lata brille',
      en: 'Why is the tin heated after sealing?\na) to make it taste better\nb) to kill germs so it lasts for years\nc) to make the tin shine' }),
]
const REL_SAL = [
  ['o_mar_salgado', 'ANTES_DE', 'a_salina', 'high', { gl: 'A auga do mar entra na salina', es: 'El agua del mar entra en la salina', en: 'Sea water enters the salt pan' }],
  ['a_salina', 'ANTES_DE', 'o_sal', 'high', { gl: 'Da salina sae o sal', es: 'De la salina sale la sal', en: 'Salt comes out of the salt pan' }],
  ['o_sal', 'ANTES_DE', 'a_conserva', 'high', { gl: 'Co sal faise a conserva', es: 'Con la sal se hace la conserva', en: 'Salt makes preserving possible' }],
  ['a_salina', 'USA', 'o_mar_salgado', 'high', { gl: 'A salina traballa coa auga do mar', es: 'La salina trabaja con el agua del mar', en: 'The salt pan works with sea water' }],
  ['a_salina', 'PRODUCE', 'o_sal', 'high', { gl: 'A salina produce sal', es: 'La salina produce sal', en: 'The salt pan produces salt' }],
  ['a_conserva', 'USA', 'o_sal', 'high', { gl: 'A conserva leva sal para durar', es: 'La conserva lleva sal para durar', en: 'Tinned food uses salt to last' }],
  ['a_conserva', 'RELACIONADO_CON', 'o_mar_salgado', 'medium', { gl: 'A conserva é mar gardado', es: 'La conserva es mar guardado', en: 'Tinned food is the sea, kept' }],
  ['o_mar_salgado', 'PERTENCE_A', 'natureza_galicia', 'high', { gl: 'O mar é a natureza de Galicia', es: 'El mar es la naturaleza de Galicia', en: 'The sea is Galician nature' }],
  ['a_salina', 'PERTENCE_A', 'oficios_mar', 'medium', { gl: 'A salina foi un oficio do mar', es: 'La salina fue un oficio del mar', en: 'The salt pan was a trade of the sea' }],
  ['o_sal', 'PERTENCE_A', 'quimica_minerais_constellation', 'medium', { gl: 'O sal é un mineral', es: 'La sal es un mineral', en: 'Salt is a mineral' }],
  ['a_conserva', 'PERTENCE_A', 'oficios_industriais', 'high', { gl: 'A conserveira é industria galega', es: 'La conservera es industria gallega', en: 'The cannery is Galician industry' }],
  ['a_conserva', 'PERTENCE_A', 'gastronomia_galicia', 'medium', { gl: 'As conservas son gastronomía galega', es: 'Las conservas son gastronomía gallega', en: 'Tinned fish is Galician cuisine' }],
]

const RUTAS = [
  { nodos: LUME, rels: REL_LUME, journey: { label_gl: 'Como arde o lume', label_es: 'Cómo arde el fuego', label_en: 'How fire burns',
      description_gl: 'Leña, aire e calor: o triángulo do lume, da lareira ao incendio.', description_es: 'Leña, aire y calor: el triángulo del fuego, de la lareira al incendio.', description_en: 'Wood, air and heat: the fire triangle, from the hearth to the wildfire.',
      modulo: 'Ciencia', icono: '🔥' } },
  { nodos: SAL, rels: REL_SAL, journey: { label_gl: 'A viaxe do sal', label_es: 'El viaje de la sal', label_en: 'The journey of salt',
      description_gl: 'Do mar á lata: salina, sal e as conserveiras galegas.', description_es: 'Del mar a la lata: salina, sal y las conserveras gallegas.', description_en: 'From the sea to the tin: salt pan, salt and the Galician canneries.',
      modulo: 'Oficios', icono: '🧂' } },
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
    const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', p.status)
  }
}
const fin = await j('GET', '/journeys'); console.log('journeys públicas agora:', (fin.data.journeys || []).map(x => x.id).join(', '))
