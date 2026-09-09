// FONTE DE VERDADE do contido "como funciona o mundo" (5ª entrega): A viaxe da comida polo corpo 🍎 e De onde vén o tempo ⛅.
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

// ───────────────────────── RUTA 10: A VIAXE DA COMIDA POLO CORPO ─────────────────────────
const CORPO = [
  N('a_boca', { gl: 'A boca', es: 'La boca', en: 'The mouth' },
    { gl: 'A viaxe empeza cun bocado de mazá. Os dentes de diante cortan, os de atrás moen. Mentres mastigas, a saliva mólla o anaco e empeza a desfacelo: por iso o pan, se o mastigas moito, sabe un pouco doce. Cando o bocado é unha papa branda, a lingua empúxao cara atrás e tragas. Baixa por un tubo ata o [[estómago|o_estomago]].',
      es: 'El viaje empieza con un bocado de manzana. Los dientes de delante cortan, los de atrás muelen. Mientras masticas, la saliva moja el trozo y empieza a deshacerlo: por eso el pan, si lo masticas mucho, sabe un poco dulce. Cuando el bocado es una papilla blanda, la lengua lo empuja hacia atrás y tragas. Baja por un tubo hasta el [[estómago|o_estomago]].',
      en: 'The journey starts with a bite of apple. The front teeth cut, the back teeth grind. While you chew, saliva wets the piece and starts breaking it down: that is why bread, if you chew it a lot, tastes a little sweet. When the bite is a soft mush, the tongue pushes it back and you swallow. It goes down a tube to the [[stomach|o_estomago]].' },
    { gl: 'Tes 20 dentes de leite e despois 32 definitivos. A saliva leva unha enzima, a amilase, que rompe o amidón do pan en azucres: por iso o sabor doce. Mastigar ben é a metade da dixestión; o estómago traballa moito menos se a comida chega desfeita.',
      es: 'Tienes 20 dientes de leche y después 32 definitivos. La saliva lleva una enzima, la amilasa, que rompe el almidón del pan en azúcares: por eso el sabor dulce. Masticar bien es la mitad de la digestión; el estómago trabaja mucho menos si la comida llega deshecha.',
      en: 'You have 20 milk teeth and then 32 adult teeth. Saliva carries an enzyme, amylase, that breaks the starch in bread into sugars: hence the sweet taste. Chewing well is half of digestion; the stomach works much less if food arrives broken down.' },
    { gl: 'Por que o pan sabe doce se o mastigas moito tempo?\na) porque a saliva empeza a desfacelo en azucres\nb) porque os dentes teñen azucre\nc) porque a lingua o quenta',
      es: '¿Por qué el pan sabe dulce si lo masticas mucho tiempo?\na) porque la saliva empieza a deshacerlo en azúcares\nb) porque los dientes tienen azúcar\nc) porque la lengua lo calienta',
      en: 'Why does bread taste sweet if you chew it for a long time?\na) because saliva starts breaking it into sugars\nb) because teeth contain sugar\nc) because the tongue warms it' }),
  N('o_estomago', { gl: 'O estómago', es: 'El estómago', en: 'The stomach' },
    { gl: 'O estómago é unha bolsa con músculos. Cando chega a comida, apértase e afrouxa unha e outra vez, coma unha man amasando, e bota un líquido ácido moi forte que desfai a carne e o pan. Ese ácido queimaría a pel, pero o estómago protéxese cunha capa de moco. Ao cabo dunhas horas a comida é unha sopa espesa, que pasa amodo ao [[intestino|o_intestino]].',
      es: 'El estómago es una bolsa con músculos. Cuando llega la comida, se aprieta y se afloja una y otra vez, como una mano amasando, y echa un líquido ácido muy fuerte que deshace la carne y el pan. Ese ácido quemaría la piel, pero el estómago se protege con una capa de moco. Al cabo de unas horas la comida es una sopa espesa, que pasa despacio al [[intestino|o_intestino]].',
      en: 'The stomach is a bag with muscles. When food arrives, it squeezes and relaxes over and over, like a hand kneading, and releases a very strong acid liquid that breaks down meat and bread. That acid would burn skin, but the stomach protects itself with a layer of mucus. After a few hours the food is a thick soup, which passes slowly into the [[intestine|o_intestino]].' },
    { gl: 'O ácido do estómago é ácido clorhídrico, tan forte que disolve un cravo de ferro en poucos días. As "tripas rugxindo" son os músculos do estómago e do intestino movendo aire e líquido cando están baleiros. O estómago dun adulto colle arredor dun litro.',
      es: 'El ácido del estómago es ácido clorhídrico, tan fuerte que disuelve un clavo de hierro en pocos días. Las "tripas rugiendo" son los músculos del estómago y del intestino moviendo aire y líquido cuando están vacíos. El estómago de un adulto cabe alrededor de un litro.',
      en: 'Stomach acid is hydrochloric acid, so strong it dissolves an iron nail in a few days. A "rumbling tummy" is the muscles of the stomach and intestine moving air and liquid when they are empty. An adult stomach holds about a litre.' },
    { gl: 'Por que o ácido do estómago non o queima?\na) porque o estómago se protexe cunha capa de moco\nb) porque o ácido é frío\nc) porque a comida o tapa',
      es: '¿Por qué el ácido del estómago no lo quema?\na) porque el estómago se protege con una capa de moco\nb) porque el ácido es frío\nc) porque la comida lo tapa',
      en: 'Why does stomach acid not burn the stomach?\na) because the stomach protects itself with a layer of mucus\nb) because the acid is cold\nc) because the food covers it' }),
  N('o_intestino', { gl: 'O intestino', es: 'El intestino', en: 'The intestine' },
    { gl: 'O intestino é un tubo longuísimo, de máis de seis metros, dobrado dentro da barriga. Por dentro está cheo de pregas pequeniñas, coma unha toalla: así ten moita máis superficie. É aquí onde o corpo colle o que lle vale da comida: azucres, graxas, proteínas e vitaminas pasan a través da parede do intestino e caen ao [[sangue|o_sangue]]. O que non vale segue de largo e sae polo outro extremo.',
      es: 'El intestino es un tubo larguísimo, de más de seis metros, doblado dentro de la barriga. Por dentro está lleno de pliegues pequeñitos, como una toalla: así tiene mucha más superficie. Es aquí donde el cuerpo coge lo que le vale de la comida: azúcares, grasas, proteínas y vitaminas pasan a través de la pared del intestino y caen a la [[sangre|o_sangue]]. Lo que no vale sigue de largo y sale por el otro extremo.',
      en: 'The intestine is a very long tube, more than six metres, folded inside the belly. Inside it is full of tiny folds, like a towel: that way it has much more surface. This is where the body takes what it needs from food: sugars, fats, proteins and vitamins pass through the intestine wall into the [[blood|o_sangue]]. What is not useful carries on and leaves at the other end.' },
    { gl: 'As pregas do intestino chámanse vilosidades; estiradas, cubrirían uns 30 metros cadrados, o chan dun cuarto grande (ata 2014 os libros dicían "unha pista de tenis", e medíuse mellor). No intestino viven billóns de bacterias boas que axudan a dixerir e fabrican vitaminas: é o microbioma. Comer froita, verdura e legumes é alimentalas a elas tamén.',
      es: 'Los pliegues del intestino se llaman vellosidades; estiradas, cubrirían unos 30 metros cuadrados, el suelo de una habitación grande (hasta 2014 los libros decían "una pista de tenis", y se midió mejor). En el intestino viven billones de bacterias buenas que ayudan a digerir y fabrican vitaminas: es el microbioma. Comer fruta, verdura y legumbres es alimentarlas a ellas también.',
      en: 'The folds of the intestine are called villi; stretched out, they would cover about 30 square metres, the floor of a large room (until 2014 textbooks said "a tennis court", and then it was measured properly). Trillions of good bacteria live in the intestine, helping digestion and making vitamins: the microbiome. Eating fruit, vegetables and pulses feeds them too.' },
    { gl: 'Que pasa no intestino coa parte boa da comida?\na) pasa a través da parede ao sangue\nb) queda gardada alí para sempre\nc) volve á boca',
      es: '¿Qué pasa en el intestino con la parte buena de la comida?\na) pasa a través de la pared a la sangre\nb) se queda guardada allí para siempre\nc) vuelve a la boca',
      en: 'What happens in the intestine to the good part of the food?\na) it passes through the wall into the blood\nb) it stays stored there forever\nc) it goes back to the mouth' }),
  N('o_sangue', { gl: 'O sangue', es: 'La sangre', en: 'Blood' },
    { gl: 'O sangue é o repartidor do corpo. O corazón empúrrao sen parar por tubos cada vez máis finos, ata chegar a cada dedo, a cada pelo, a cada célula. Leva os azucres da mazá a onde fai falla enerxía: ás pernas para correr, ao cerebro para pensar. Recolle o lixo (o dióxido de carbono) e lévao aos pulmóns para botalo fóra. Cando comes, non alimentas a barriga: alimentas todo o corpo. E todo empezou nun bocado na [[boca|a_boca]].',
      es: 'La sangre es el repartidor del cuerpo. El corazón la empuja sin parar por tubos cada vez más finos, hasta llegar a cada dedo, a cada pelo, a cada célula. Lleva los azúcares de la manzana a donde hace falta energía: a las piernas para correr, al cerebro para pensar. Recoge la basura (el dióxido de carbono) y la lleva a los pulmones para echarla fuera. Cuando comes, no alimentas la barriga: alimentas todo el cuerpo. Y todo empezó en un bocado en la [[boca|a_boca]].',
      en: 'Blood is the body\'s delivery service. The heart pushes it non-stop through ever thinner tubes, reaching every finger, every hair, every cell. It carries the apple\'s sugars to wherever energy is needed: the legs for running, the brain for thinking. It picks up the waste (carbon dioxide) and takes it to the lungs to breathe out. When you eat, you do not feed your belly: you feed your whole body. And it all started with a bite in the [[mouth|a_boca]].' },
    { gl: 'Un neno ten uns tres litros de sangue e o corazón dálle a volta enteira ao corpo nun minuto. Os glóbulos vermellos levan o osíxeno; os brancos loitan contra os microbios; as plaquetas tapan as feridas. Doar sangue de maior é dar un anaco de repartidor a quen o precisa.',
      es: 'Un niño tiene unos tres litros de sangre y el corazón le da la vuelta entera al cuerpo en un minuto. Los glóbulos rojos llevan el oxígeno; los blancos luchan contra los microbios; las plaquetas tapan las heridas. Donar sangre de mayor es dar un trozo de repartidor a quien lo necesita.',
      en: 'A child has about three litres of blood and the heart sends it all the way round the body in a minute. Red cells carry oxygen; white cells fight germs; platelets plug wounds. Giving blood as a grown-up is giving a piece of delivery service to someone who needs it.' },
    { gl: 'Que fai o sangue cos azucres da comida?\na) lévaos a todo o corpo, onde fai falla enerxía\nb) gárdaos na barriga\nc) bótaos fóra polos pulmóns',
      es: '¿Qué hace la sangre con los azúcares de la comida?\na) los lleva a todo el cuerpo, donde hace falta energía\nb) los guarda en la barriga\nc) los echa fuera por los pulmones',
      en: 'What does blood do with the sugars from food?\na) carries them to the whole body, wherever energy is needed\nb) stores them in the belly\nc) breathes them out through the lungs' }),
]
const REL_CORPO = [
  ['a_boca', 'ANTES_DE', 'o_estomago', 'high', { gl: 'Da boca a comida baixa ao estómago', es: 'De la boca la comida baja al estómago', en: 'From the mouth food goes down to the stomach' }],
  ['o_estomago', 'ANTES_DE', 'o_intestino', 'high', { gl: 'Do estómago pasa ao intestino', es: 'Del estómago pasa al intestino', en: 'From the stomach it passes to the intestine' }],
  ['o_intestino', 'ANTES_DE', 'o_sangue', 'high', { gl: 'Do intestino o alimento pasa ao sangue', es: 'Del intestino el alimento pasa a la sangre', en: 'From the intestine food passes into the blood' }],
  ['a_boca', 'TRANSFORMA', 'o_estomago', 'medium', { gl: 'A boca prepara a comida para o estómago', es: 'La boca prepara la comida para el estómago', en: 'The mouth prepares food for the stomach' }],
  ['o_intestino', 'PRODUCE', 'o_sangue', 'medium', { gl: 'O intestino manda os nutrientes ao sangue', es: 'El intestino manda los nutrientes a la sangre', en: 'The intestine sends nutrients into the blood' }],
  ['o_sangue', 'RELACIONADO_CON', 'a_boca', 'low', { gl: 'O sangue leva ao corpo o que entrou pola boca', es: 'La sangre lleva al cuerpo lo que entró por la boca', en: 'Blood carries through the body what came in through the mouth' }],
  ['a_boca', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'A dixestión é ciencia do corpo', es: 'La digestión es ciencia del cuerpo', en: 'Digestion is body science' }],
  ['o_estomago', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'O estómago é anatomía', es: 'El estómago es anatomía', en: 'The stomach is anatomy' }],
  ['o_intestino', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'O intestino é anatomía', es: 'El intestino es anatomía', en: 'The intestine is anatomy' }],
  ['o_sangue', 'PERTENCE_A', 'ciencia', 'medium', { gl: 'O sangue é bioloxía', es: 'La sangre es biología', en: 'Blood is biology' }],
  ['o_estomago', 'PERTENCE_A', 'reaccions_transformacions', 'low', { gl: 'A dixestión é química', es: 'La digestión es química', en: 'Digestion is chemistry' }],
]

// ───────────────────────── RUTA 11: DE ONDE VÉN O TEMPO ─────────────────────────
const TEMPO = [
  N('o_sol_quenta', { gl: 'O Sol quenta', es: 'El Sol calienta', en: 'The Sun heats' },
    { gl: 'Todo o tempo que fai, o bo e o malo, empeza no Sol. O Sol quenta a terra e o mar, pero non por igual: a area da praia queima ao mediodía e a auga segue fresca. O aire quente pesa menos e sobe; o frío baixa e corre a ocupar o seu sitio. Ese ir e vir do aire é o [[vento|o_vento]]. E cando o aire sobe leva vapor de auga con el: aí empeza a [[borrasca|a_borrasca]].',
      es: 'Todo el tiempo que hace, el bueno y el malo, empieza en el Sol. El Sol calienta la tierra y el mar, pero no por igual: la arena de la playa quema al mediodía y el agua sigue fresca. El aire caliente pesa menos y sube; el frío baja y corre a ocupar su sitio. Ese ir y venir del aire es el [[viento|o_vento]]. Y cuando el aire sube lleva vapor de agua con él: ahí empieza la [[borrasca|a_borrasca]].',
      en: 'All the weather, good and bad, starts with the Sun. The Sun heats the land and the sea, but not evenly: the beach sand burns at midday while the water stays cool. Warm air weighs less and rises; cold air sinks and rushes in to take its place. That coming and going of air is the [[wind|o_vento]]. And when air rises it carries water vapour with it: that is where the [[low-pressure system|a_borrasca]] begins.' },
    { gl: 'A Terra recibe do Sol en unha hora máis enerxía da que gasta a humanidade nun ano. O mar quéntase e arrefría moito máis amodo ca a terra: por iso na costa galega os veráns son frescos e os invernos suaves, e no interior de Ourense hai máis calor e máis xeada.',
      es: 'La Tierra recibe del Sol en una hora más energía de la que gasta la humanidad en un año. El mar se calienta y se enfría mucho más despacio que la tierra: por eso en la costa gallega los veranos son frescos y los inviernos suaves, y en el interior de Ourense hay más calor y más helada.',
      en: 'The Earth receives more energy from the Sun in one hour than humanity uses in a year. The sea warms and cools much more slowly than the land: that is why on the Galician coast summers are cool and winters mild, while inland Ourense has more heat and more frost.' },
    { gl: 'Que fai o aire cando o Sol o quenta?\na) pesa menos e sobe\nb) pesa máis e afunde\nc) queda quieto',
      es: '¿Qué hace el aire cuando el Sol lo calienta?\na) pesa menos y sube\nb) pesa más y se hunde\nc) se queda quieto',
      en: 'What does air do when the Sun heats it?\na) it weighs less and rises\nb) it weighs more and sinks\nc) it stays still' }),
  N('a_borrasca', { gl: 'A borrasca', es: 'La borrasca', en: 'The low-pressure system' },
    { gl: 'Unha borrasca é un remuíño enorme de aire que sobe. Nace no Atlántico, xira e xira coma a auga ao baleirar a bañeira, e vén cara a Galicia empuxada polos ventos do oeste. Como o aire sobe, arrefría, e o vapor que leva convértese en nubes e [[chuvia|a_chuvia]]. Por iso, cando o home do tempo di "borrasca", sabemos que toca paraugas. O contrario da borrasca é o [[anticiclón|o_anticiclon]].',
      es: 'Una borrasca es un remolino enorme de aire que sube. Nace en el Atlántico, gira y gira como el agua al vaciar la bañera, y viene hacia Galicia empujada por los vientos del oeste. Como el aire sube, se enfría, y el vapor que lleva se convierte en nubes y [[lluvia|a_chuvia]]. Por eso, cuando el hombre del tiempo dice "borrasca", sabemos que toca paraguas. Lo contrario de la borrasca es el [[anticiclón|o_anticiclon]].',
      en: 'A low is a huge swirl of rising air. It is born over the Atlantic, spins and spins like water draining from a bath, and heads towards Galicia pushed by the westerly winds. As the air rises it cools, and the vapour it carries becomes clouds and [[rain|a_chuvia]]. That is why, when the weather forecaster says "low", we know it is umbrella time. The opposite of a low is the [[high|o_anticiclon]].' },
    { gl: 'As borrascas do Atlántico xiran no sentido contrario ás agullas do reloxo (no hemisferio norte). Nun mapa do tempo vense como liñas apertadas: canto máis xuntas, máis vento. As máis fortes reciben nome, coma as persoas: Filomena, Kirk, Herminia.',
      es: 'Las borrascas del Atlántico giran en sentido contrario a las agujas del reloj (en el hemisferio norte). En un mapa del tiempo se ven como líneas apretadas: cuanto más juntas, más viento. Las más fuertes reciben nombre, como las personas: Filomena, Kirk, Herminia.',
      en: 'Atlantic lows spin anticlockwise (in the northern hemisphere). On a weather map they appear as tightly packed lines: the closer the lines, the stronger the wind. The strongest ones get names, like people: Filomena, Kirk, Herminia.' },
    { gl: 'Que trae unha borrasca?\na) nubes, chuvia e vento\nb) ceo despexado e calma\nc) neve sempre',
      es: '¿Qué trae una borrasca?\na) nubes, lluvia y viento\nb) cielo despejado y calma\nc) nieve siempre',
      en: 'What does a low bring?\na) clouds, rain and wind\nb) clear sky and calm\nc) always snow' }),
  N('o_anticiclon', { gl: 'O anticiclón', es: 'El anticiclón', en: 'The high-pressure system' },
    { gl: 'Cando o aire baixa en vez de subir, temos un anticiclón. O aire que baixa quéntase e as nubes desfanse: ceo azul, sol, pouco vento. O anticiclón dos Azores é o que nos trae o bo tempo do verán. Pero no inverno ten un truco: coa noite clara a calor escapa cara arriba e ao amencer hai xeada, ou unha néboa espesa nos vales. Para saber cal dos dous vén mañá, hai que mirar o [[parte do tempo|o_parte_do_tempo]].',
      es: 'Cuando el aire baja en vez de subir, tenemos un anticiclón. El aire que baja se calienta y las nubes se deshacen: cielo azul, sol, poco viento. El anticiclón de las Azores es el que nos trae el buen tiempo del verano. Pero en invierno tiene un truco: con la noche clara el calor escapa hacia arriba y al amanecer hay helada, o una niebla espesa en los valles. Para saber cuál de los dos viene mañana, hay que mirar el [[parte del tiempo|o_parte_do_tempo]].',
      en: 'When air sinks instead of rising, we have a high. Sinking air warms up and the clouds dissolve: blue sky, sun, little wind. The Azores high is what brings us the fine summer weather. But in winter it has a trick: on a clear night the heat escapes upwards and at dawn there is frost, or a thick fog in the valleys. To know which of the two is coming tomorrow, you look at the [[weather forecast|o_parte_do_tempo]].' },
    { gl: 'A presión do aire mídese cun barómetro: sobe co anticiclón e baixa coa borrasca. Os mariñeiros de antes miraban o barómetro antes de saír: se caía rápido, viña temporal. As gaivotas que entran terra adentro tamén avisan: foxen do vento do mar.',
      es: 'La presión del aire se mide con un barómetro: sube con el anticiclón y baja con la borrasca. Los marineros de antes miraban el barómetro antes de salir: si caía rápido, venía temporal. Las gaviotas que entran tierra adentro también avisan: huyen del viento del mar.',
      en: 'Air pressure is measured with a barometer: it rises with a high and falls with a low. Sailors of old checked the barometer before setting out: if it fell fast, a storm was coming. Gulls flying inland also warn: they are fleeing the wind from the sea.' },
    { gl: 'Que tempo trae o anticiclón?\na) ceo azul e pouco vento\nb) chuvia forte\nc) treboada',
      es: '¿Qué tiempo trae el anticiclón?\na) cielo azul y poco viento\nb) lluvia fuerte\nc) tormenta',
      en: 'What weather does a high bring?\na) blue sky and little wind\nb) heavy rain\nc) a thunderstorm' }),
  N('o_parte_do_tempo', { gl: 'O parte do tempo', es: 'El parte del tiempo', en: 'The weather forecast' },
    { gl: 'Para dicir que tempo vai facer mañá, miles de estacións miden a temperatura, o vento e a presión, satélites fotografan as nubes desde o espazo e globos soben a medir o aire. Todos eses números métense nun ordenador enorme que calcula como se vai mover o aire. En Galicia faino MeteoGalicia. Non acerta sempre: o aire é caprichoso e a dous días vista xa custa. Pero é moito mellor ca mirar ao ceo. E todo empezou porque o [[Sol quenta|o_sol_quenta]].',
      es: 'Para decir qué tiempo va a hacer mañana, miles de estaciones miden la temperatura, el viento y la presión, satélites fotografían las nubes desde el espacio y globos suben a medir el aire. Todos esos números se meten en un ordenador enorme que calcula cómo se va a mover el aire. En Galicia lo hace MeteoGalicia. No acierta siempre: el aire es caprichoso y a dos días vista ya cuesta. Pero es mucho mejor que mirar al cielo. Y todo empezó porque el [[Sol calienta|o_sol_quenta]].',
      en: 'To say what the weather will be tomorrow, thousands of stations measure temperature, wind and pressure, satellites photograph the clouds from space and balloons rise to measure the air. All those numbers go into a huge computer that works out how the air will move. In Galicia it is MeteoGalicia that does it. It is not always right: air is fickle and two days ahead is already hard. But it is far better than looking at the sky. And it all started because the [[Sun heats|o_sol_quenta]].' },
    { gl: 'O primeiro parte do tempo fíxoo en 1861 Robert FitzRoy, o capitán do barco de Darwin, para avisar aos mariñeiros das tormentas. Hoxe os modelos meteorolóxicos dividen o aire en cubos de poucos quilómetros e calculan cada un: por iso fan falla superordenadores.',
      es: 'El primer parte del tiempo lo hizo en 1861 Robert FitzRoy, el capitán del barco de Darwin, para avisar a los marineros de las tormentas. Hoy los modelos meteorológicos dividen el aire en cubos de pocos kilómetros y calculan cada uno: por eso hacen falta superordenadores.',
      en: 'The first weather forecast was made in 1861 by Robert FitzRoy, the captain of Darwin\'s ship, to warn sailors of storms. Today weather models divide the air into cubes a few kilometres wide and calculate each one: that is why supercomputers are needed.' },
    { gl: 'Con que se calcula o tempo de mañá?\na) cun ordenador enorme que usa medidas de estacións, satélites e globos\nb) mirando só ao ceo\nc) preguntándolle ás gaivotas',
      es: '¿Con qué se calcula el tiempo de mañana?\na) con un ordenador enorme que usa medidas de estaciones, satélites y globos\nb) mirando solo al cielo\nc) preguntándole a las gaviotas',
      en: 'How is tomorrow\'s weather worked out?\na) with a huge computer using measurements from stations, satellites and balloons\nb) just by looking at the sky\nc) by asking the gulls' }),
]
const REL_TEMPO = [
  ['o_sol_quenta', 'ANTES_DE', 'a_borrasca', 'high', { gl: 'Do quecemento desigual nacen as borrascas', es: 'Del calentamiento desigual nacen las borrascas', en: 'Uneven heating gives birth to lows' }],
  ['a_borrasca', 'ANTES_DE', 'o_anticiclon', 'high', { gl: 'Tras a borrasca adoita vir o anticiclón', es: 'Tras la borrasca suele venir el anticiclón', en: 'After the low usually comes the high' }],
  ['o_anticiclon', 'ANTES_DE', 'o_parte_do_tempo', 'high', { gl: 'O parte do tempo di cal dos dous vén', es: 'El parte del tiempo dice cuál de los dos viene', en: 'The forecast tells which of the two is coming' }],
  ['o_sol_quenta', 'PRODUCE', 'o_vento', 'high', { gl: 'O quecemento desigual produce o vento', es: 'El calentamiento desigual produce el viento', en: 'Uneven heating produces wind' }],
  ['a_borrasca', 'PRODUCE', 'a_chuvia', 'high', { gl: 'A borrasca trae a chuvia', es: 'La borrasca trae la lluvia', en: 'The low brings the rain' }],
  ['o_parte_do_tempo', 'USA', 'a_borrasca', 'medium', { gl: 'O parte do tempo segue as borrascas', es: 'El parte del tiempo sigue las borrascas', en: 'The forecast tracks the lows' }],
  ['o_sol_quenta', 'PERTENCE_A', 'enerxia_forzas', 'medium', { gl: 'A calor do Sol é enerxía', es: 'El calor del Sol es energía', en: 'The Sun\'s heat is energy' }],
  ['a_borrasca', 'PERTENCE_A', 'natureza_galicia', 'high', { gl: 'As borrascas marcan o clima galego', es: 'Las borrascas marcan el clima gallego', en: 'Lows shape the Galician climate' }],
  ['o_anticiclon', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'O anticiclón trae o verán galego', es: 'El anticiclón trae el verano gallego', en: 'The high brings the Galician summer' }],
  ['o_parte_do_tempo', 'PERTENCE_A', 'ciencia', 'high', { gl: 'A meteoroloxía é ciencia', es: 'La meteorología es ciencia', en: 'Meteorology is science' }],
]

const RUTAS = [
  { nodos: CORPO, rels: REL_CORPO, journey: { label_gl: 'A viaxe da comida polo corpo', label_es: 'El viaje de la comida por el cuerpo', label_en: 'The journey of food through the body',
      description_gl: 'Dun bocado de mazá ao sangue: boca, estómago, intestino e o repartidor do corpo.', description_es: 'De un bocado de manzana a la sangre: boca, estómago, intestino y el repartidor del cuerpo.', description_en: 'From a bite of apple to the blood: mouth, stomach, intestine and the body\'s delivery service.',
      modulo: 'Ciencia', icono: '🍎' } },
  { nodos: TEMPO, rels: REL_TEMPO, journey: { label_gl: 'De onde vén o tempo', label_es: 'De dónde viene el tiempo', label_en: 'Where the weather comes from',
      description_gl: 'Do Sol á borrasca e ao anticiclón: por que chove en Galicia e como o adiviña MeteoGalicia.', description_es: 'Del Sol a la borrasca y al anticiclón: por qué llueve en Galicia y cómo lo adivina MeteoGalicia.', description_en: 'From the Sun to the low and the high: why it rains in Galicia and how MeteoGalicia predicts it.',
      modulo: 'Natureza', icono: '⛅' } },
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
