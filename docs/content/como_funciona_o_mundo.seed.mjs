// FONTE DE VERDADE do contido "como funciona o mundo" (3 rutas × 4 nodos) e dos portais do pan.
// Executable contra un backend local co usuario de proba (le as credenciais do scratchpad da sesión;
// para reutilizalo, cambia CRED por un login de profesor). Ver docs/architecture/INFORME_S6_FLUXO_NENO.md.
// Contido "como funciona o mundo": 3 rutas × 4 nodos (gl/es/en, portais, retos, relacións, journeys)
// + marca os portais nos 4 nodos do pan. Só BD LOCAL. Idempotente (salta o que xa existe).
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

const N = (id, labels, primary, secondary, reto, extra = {}) => ({ id, labels, primary, secondary, reto, ...extra })

// ───────────────────────── RUTA 1: A VIAXE DA AUGA ─────────────────────────
const AUGA = [
  N('a_chuvia', { gl: 'A chuvia', es: 'La lluvia', en: 'Rain' },
    { gl: 'En Galicia chove moito, e iso é un tesouro. As nubes son millóns de pingas pequeniñas que flotan no aire. Cando se xuntan e pesan de máis, caen: chove. A auga que cae empapa a terra, enche as fontes e corre cara ao [[río|o_rio]]. Sen chuvia non habería bosques verdes nin auga na billa.',
      es: 'En Galicia llueve mucho, y eso es un tesoro. Las nubes son millones de gotas pequeñitas que flotan en el aire. Cuando se juntan y pesan demasiado, caen: llueve. El agua que cae empapa la tierra, llena las fuentes y corre hacia el [[río|o_rio]]. Sin lluvia no habría bosques verdes ni agua en el grifo.',
      en: 'In Galicia it rains a lot, and that is a treasure. Clouds are millions of tiny droplets floating in the air. When they join together and get too heavy, they fall: it rains. The water soaks the ground, fills the springs and runs towards the [[river|o_rio]]. Without rain there would be no green forests and no water in the tap.' },
    { gl: 'A auga do mar evapórase co sol, sobe como vapor invisible e arrefría alá arriba ata volverse nube. Este ir e vir chámase ciclo da auga e non para nunca. A mesma auga que bebes puido caer como chuvia hai mil anos.',
      es: 'El agua del mar se evapora con el sol, sube como vapor invisible y se enfría allá arriba hasta volverse nube. Este ir y venir se llama ciclo del agua y no para nunca. La misma agua que bebes pudo caer como lluvia hace mil años.',
      en: 'Sea water evaporates in the sun, rises as invisible vapour and cools up high until it becomes a cloud. This coming and going is called the water cycle and it never stops. The water you drink may have fallen as rain a thousand years ago.' },
    { gl: 'De que están feitas as nubes?\na) de fume\nb) de millóns de pingas de auga pequeniñas\nc) de algodón',
      es: '¿De qué están hechas las nubes?\na) de humo\nb) de millones de gotas de agua pequeñitas\nc) de algodón',
      en: 'What are clouds made of?\na) smoke\nb) millions of tiny water droplets\nc) cotton' }),
  N('o_rio', { gl: 'O río', es: 'El río', en: 'The river' },
    { gl: 'O río recolle a auga da chuvia e lévaa montaña abaixo, cara ao mar. Polo camiño xunta regatos, rodea pedras e move as moas dos muíños. Nel viven troitas, ras e libélulas. Parte desa auga gárdase nun encoro e, antes de chegar ás casas, pasa por unha [[depuradora|a_depuradora]].',
      es: 'El río recoge el agua de la lluvia y la lleva montaña abajo, hacia el mar. Por el camino junta arroyos, rodea piedras y mueve las muelas de los molinos. En él viven truchas, ranas y libélulas. Parte de esa agua se guarda en un embalse y, antes de llegar a las casas, pasa por una [[depuradora|a_depuradora]].',
      en: 'The river gathers the rainwater and carries it down the mountain towards the sea. On the way it joins streams, flows around rocks and turns the millstones. Trout, frogs and dragonflies live in it. Part of that water is stored in a reservoir and, before it reaches our homes, it goes through a [[treatment plant|a_depuradora]].' },
    { gl: 'O Miño é o río máis longo de Galicia: nace en Lugo e chega ao mar entre A Guarda e Portugal. Os ríos moven tanta forza que se usan para facer electricidade nos encoros. Por iso hai que coidalos limpos: a auga que ensuciamos volve a nós.',
      es: 'El Miño es el río más largo de Galicia: nace en Lugo y llega al mar entre A Guarda y Portugal. Los ríos mueven tanta fuerza que se usan para hacer electricidad en los embalses. Por eso hay que cuidarlos limpios: el agua que ensuciamos vuelve a nosotros.',
      en: 'The Miño is the longest river in Galicia: it rises in Lugo and reaches the sea between A Guarda and Portugal. Rivers carry so much force that they are used to make electricity at dams. That is why we must keep them clean: the water we dirty comes back to us.' },
    { gl: 'Cara a onde leva o río a auga?\na) cara ao mar\nb) cara ás nubes\nc) cara ao alto da montaña',
      es: '¿Hacia dónde lleva el río el agua?\na) hacia el mar\nb) hacia las nubes\nc) hacia lo alto de la montaña',
      en: 'Where does the river carry the water?\na) to the sea\nb) to the clouds\nc) to the top of the mountain' }),
  N('a_depuradora', { gl: 'A depuradora', es: 'La depuradora', en: 'The water treatment plant' },
    { gl: 'A auga do río non se pode beber tal cal: leva terra, follas e bichiños moi pequenos. Na depuradora pasa por peneiras, repousa en grandes tanques e recibe un chisco de cloro para matar os microbios. Cando sae, está limpa e segura. Entón viaxa por tubos escondidos baixo as rúas ata a túa [[billa|a_billa]].',
      es: 'El agua del río no se puede beber tal cual: lleva tierra, hojas y bichitos muy pequeños. En la depuradora pasa por filtros, reposa en grandes tanques y recibe un poco de cloro para matar los microbios. Cuando sale, está limpia y segura. Entonces viaja por tubos escondidos bajo las calles hasta tu [[grifo|a_billa]].',
      en: 'River water cannot be drunk as it is: it carries soil, leaves and very tiny creatures. At the treatment plant it goes through filters, rests in big tanks and gets a little chlorine to kill the germs. When it leaves, it is clean and safe. Then it travels through pipes hidden under the streets to your [[tap|a_billa]].' },
    { gl: 'Hai dúas depuradoras distintas: a que limpa a auga ANTES de bebela (potabilizadora) e a que limpa a auga sucia que sae das casas antes de devolvela ao río. As dúas fan falla. Sen a segunda, os ríos e as praias encheríanse de porcallada.',
      es: 'Hay dos depuradoras distintas: la que limpia el agua ANTES de beberla (potabilizadora) y la que limpia el agua sucia que sale de las casas antes de devolverla al río. Las dos hacen falta. Sin la segunda, los ríos y las playas se llenarían de porquería.',
      en: 'There are two different plants: the one that cleans water BEFORE we drink it, and the one that cleans the dirty water leaving our homes before returning it to the river. Both are needed. Without the second one, rivers and beaches would fill with filth.' },
    { gl: 'Por que a auga do río pasa pola depuradora antes de chegar á casa?\na) para que estea máis fría\nb) para limpala de terra e microbios\nc) para que teña burbullas',
      es: '¿Por qué el agua del río pasa por la depuradora antes de llegar a casa?\na) para que esté más fría\nb) para limpiarla de tierra y microbios\nc) para que tenga burbujas',
      en: 'Why does river water go through the treatment plant before reaching home?\na) to make it colder\nb) to clean out soil and germs\nc) to give it bubbles' }),
  N('a_billa', { gl: 'A billa', es: 'El grifo', en: 'The tap' },
    { gl: 'Abres a billa e sae auga. Parece maxia, pero é unha viaxe longa: foi nube, chuvia, río e pasou pola depuradora. Por iso non se debe deixar correr sen máis. Cando pechas a billa mentres lavas os dentes, aforras auga que custou moito traer. E a que baixa polo desaugadoiro volve empezar o ciclo: outra vez cara á [[chuvia|a_chuvia]].',
      es: 'Abres el grifo y sale agua. Parece magia, pero es un viaje largo: fue nube, lluvia, río y pasó por la depuradora. Por eso no se debe dejar correr sin más. Cuando cierras el grifo mientras te lavas los dientes, ahorras agua que costó mucho traer. Y la que baja por el desagüe vuelve a empezar el ciclo: otra vez hacia la [[lluvia|a_chuvia]].',
      en: 'You turn the tap and water comes out. It looks like magic, but it is a long journey: it was a cloud, rain, a river, and it went through the treatment plant. That is why we should not let it run for nothing. When you close the tap while brushing your teeth, you save water that took a lot to bring. And the water going down the drain starts the cycle again: back towards the [[rain|a_chuvia]].' },
    { gl: 'Unha persoa en Galicia usa arredor de 130 litros de auga ao día: para beber, cociñar, lavarse e limpar. Unha ducha de cinco minutos gasta uns 50 litros. En moitos lugares do mundo hai nenos que camiñan horas para conseguir un só cubo.',
      es: 'Una persona en Galicia usa alrededor de 130 litros de agua al día: para beber, cocinar, lavarse y limpiar. Una ducha de cinco minutos gasta unos 50 litros. En muchos lugares del mundo hay niños que caminan horas para conseguir un solo cubo.',
      en: 'A person in Galicia uses around 130 litres of water a day: to drink, cook, wash and clean. A five-minute shower uses about 50 litres. In many places in the world, children walk for hours to get a single bucket.' },
    { gl: 'Que pasa coa auga que baixa polo desaugadoiro?\na) desaparece para sempre\nb) volve ao ciclo da auga\nc) queda gardada na casa',
      es: '¿Qué pasa con el agua que baja por el desagüe?\na) desaparece para siempre\nb) vuelve al ciclo del agua\nc) se queda guardada en casa',
      en: 'What happens to the water that goes down the drain?\na) it disappears forever\nb) it goes back into the water cycle\nc) it stays stored in the house' }),
]
const REL_AUGA = [
  ['a_chuvia', 'PRODUCE', 'o_rio', 'high', { gl: 'A chuvia alimenta os ríos', es: 'La lluvia alimenta los ríos', en: 'Rain feeds the rivers' }],
  ['a_depuradora', 'USA', 'o_rio', 'high', { gl: 'A depuradora colle a auga do río para limpala', es: 'La depuradora coge el agua del río para limpiarla', en: 'The treatment plant takes river water to clean it' }],
  ['a_depuradora', 'PRODUCE', 'a_billa', 'high', { gl: 'Da depuradora sae a auga limpa que chega ás billas', es: 'De la depuradora sale el agua limpia que llega a los grifos', en: 'Clean water leaves the plant and reaches the taps' }],
  ['a_billa', 'RELACIONADO_CON', 'a_chuvia', 'medium', { gl: 'A auga que se vai pola billa volve ao ciclo da auga', es: 'El agua que se va por el grifo vuelve al ciclo del agua', en: 'Water leaving the tap returns to the water cycle' }],
  ['a_chuvia', 'ANTES_DE', 'o_rio', 'high', { gl: 'Primeiro chove, despois o río leva a auga', es: 'Primero llueve, después el río lleva el agua', en: 'First it rains, then the river carries the water' }],
  ['o_rio', 'ANTES_DE', 'a_depuradora', 'high', { gl: 'A auga do río pasa despois pola depuradora', es: 'El agua del río pasa después por la depuradora', en: 'River water then goes through the treatment plant' }],
  ['a_depuradora', 'ANTES_DE', 'a_billa', 'high', { gl: 'Só despois de limpala chega á billa', es: 'Solo después de limpiarla llega al grifo', en: 'Only after cleaning does it reach the tap' }],
  ['a_chuvia', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'A chuvia é parte da natureza de Galicia', es: 'La lluvia es parte de la naturaleza de Galicia', en: 'Rain is part of Galician nature' }],
  ['o_rio', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'Os ríos son parte da natureza de Galicia', es: 'Los ríos son parte de la naturaleza de Galicia', en: 'Rivers are part of Galician nature' }],
  ['a_depuradora', 'PERTENCE_A', 'natureza_galicia', 'low', { gl: 'A depuradora coida a auga da natureza', es: 'La depuradora cuida el agua de la naturaleza', en: 'The treatment plant looks after nature\'s water' }],
  ['a_billa', 'PERTENCE_A', 'natureza_galicia', 'low', { gl: 'A auga da billa vén da natureza', es: 'El agua del grifo viene de la naturaleza', en: 'Tap water comes from nature' }],
]

// ───────────────────────── RUTA 2: A VIAXE DA LUZ ─────────────────────────
const LUZ = [
  N('o_vento', { gl: 'O vento', es: 'El viento', en: 'The wind' },
    { gl: 'O vento é aire que se move. Nótalo na cara, move as follas e empuxa as nubes. Nos montes de Galicia hai muíños de vento xigantes, con pas brancas máis longas ca un autobús. Cando o vento as fai xirar, non moen gran: moven unha máquina escondida chamada [[xerador|o_xerador]].',
      es: 'El viento es aire que se mueve. Lo notas en la cara, mueve las hojas y empuja las nubes. En los montes de Galicia hay molinos de viento gigantes, con palas blancas más largas que un autobús. Cuando el viento las hace girar, no muelen grano: mueven una máquina escondida llamada [[generador|o_xerador]].',
      en: 'Wind is air that moves. You feel it on your face, it moves the leaves and pushes the clouds. On the hills of Galicia there are giant wind turbines, with white blades longer than a bus. When the wind makes them spin, they do not grind grain: they drive a hidden machine called a [[generator|o_xerador]].' },
    { gl: 'O vento nace porque o sol quenta a terra de xeito desigual: o aire quente sobe e o aire frío corre a ocupar o seu sitio. Galicia é unha das zonas de España con máis muíños de vento, sobre todo na Costa da Morte e nas serras de Lugo.',
      es: 'El viento nace porque el sol calienta la tierra de forma desigual: el aire caliente sube y el aire frío corre a ocupar su sitio. Galicia es una de las zonas de España con más molinos de viento, sobre todo en la Costa da Morte y en las sierras de Lugo.',
      en: 'Wind is born because the sun heats the land unevenly: warm air rises and cold air rushes in to take its place. Galicia is one of the areas of Spain with the most wind turbines, especially on the Costa da Morte and in the hills of Lugo.' },
    { gl: 'Que é o vento?\na) aire que se move\nb) auga moi fina\nc) luz do sol',
      es: '¿Qué es el viento?\na) aire que se mueve\nb) agua muy fina\nc) luz del sol',
      en: 'What is wind?\na) air that moves\nb) very fine water\nc) sunlight' }),
  N('o_xerador', { gl: 'O xerador', es: 'El generador', en: 'The generator' },
    { gl: 'Dentro do muíño hai un xerador: un imán grande que xira dentro dun rolo de fío de cobre. Cando o imán dá voltas moi rápido, empuxa algo invisible polo fío: a electricidade. Canto máis forte sopra o vento, máis electricidade sae. Esa corrente non se garda aí: envíase por cables ata a [[rede eléctrica|a_rede_electrica]].',
      es: 'Dentro del molino hay un generador: un imán grande que gira dentro de un rollo de hilo de cobre. Cuando el imán da vueltas muy rápido, empuja algo invisible por el hilo: la electricidad. Cuanto más fuerte sopla el viento, más electricidad sale. Esa corriente no se guarda ahí: se envía por cables hasta la [[red eléctrica|a_rede_electrica]].',
      en: 'Inside the turbine there is a generator: a big magnet spinning inside a coil of copper wire. When the magnet turns very fast, it pushes something invisible through the wire: electricity. The harder the wind blows, the more electricity comes out. That current is not stored there: it is sent through cables to the [[power grid|a_rede_electrica]].' },
    { gl: 'Un imán que se move preto dun cable crea corrente eléctrica: descubriuno Michael Faraday en 1831. Todos os xeradores funcionan así, tanto se os move o vento coma a auga dun encoro ou o vapor dunha central. O truco está sempre en facer xirar o imán.',
      es: 'Un imán que se mueve cerca de un cable crea corriente eléctrica: lo descubrió Michael Faraday en 1831. Todos los generadores funcionan así, tanto si los mueve el viento como el agua de un embalse o el vapor de una central. El truco está siempre en hacer girar el imán.',
      en: 'A magnet moving near a wire creates an electric current: Michael Faraday discovered it in 1831. Every generator works this way, whether it is driven by wind, by water at a dam or by steam at a power station. The trick is always to make the magnet spin.' },
    { gl: 'Que fai xirar o imán do xerador dun muíño de vento?\na) o sol\nb) o vento\nc) unha pila',
      es: '¿Qué hace girar el imán del generador de un molino de viento?\na) el sol\nb) el viento\nc) una pila',
      en: 'What makes the magnet spin in a wind turbine generator?\na) the sun\nb) the wind\nc) a battery' }),
  N('a_rede_electrica', { gl: 'A rede eléctrica', es: 'La red eléctrica', en: 'The power grid' },
    { gl: 'A rede eléctrica é unha tea de araña de cables que cruza todo o país. Sae dos muíños, dos encoros e das centrais, sobe por torres altas de ferro e baixa polas rúas ata cada casa. Viaxa case á velocidade da luz: no momento en que acendes unha lámpada, a corrente xa está alí. Remata no teu [[enchufe|o_enchufe]].',
      es: 'La red eléctrica es una tela de araña de cables que cruza todo el país. Sale de los molinos, de los embalses y de las centrales, sube por torres altas de hierro y baja por las calles hasta cada casa. Viaja casi a la velocidad de la luz: en el momento en que enciendes una lámpara, la corriente ya está allí. Termina en tu [[enchufe|o_enchufe]].',
      en: 'The power grid is a spider web of cables crossing the whole country. It leaves the turbines, the dams and the power stations, climbs tall iron towers and comes down the streets to every house. It travels almost at the speed of light: the moment you switch on a lamp, the current is already there. It ends at your [[plug socket|o_enchufe]].' },
    { gl: 'Nas torres altas a electricidade viaxa con moitísima forza (alta tensión) para non perderse polo camiño. Antes de entrar nas casas, uns aparellos chamados transformadores báixanlle a forza para que sexa segura. Por iso nunca hai que achegarse ás torres nin aos cables caídos.',
      es: 'En las torres altas la electricidad viaja con muchísima fuerza (alta tensión) para no perderse por el camino. Antes de entrar en las casas, unos aparatos llamados transformadores le bajan la fuerza para que sea segura. Por eso nunca hay que acercarse a las torres ni a los cables caídos.',
      en: 'On the tall towers electricity travels with enormous force (high voltage) so it is not lost on the way. Before entering homes, devices called transformers lower that force to make it safe. That is why you must never go near the towers or fallen cables.' },
    { gl: 'Por onde viaxa a electricidade desde os muíños ata as casas?\na) polo aire, como o vento\nb) por cables da rede eléctrica\nc) polos ríos',
      es: '¿Por dónde viaja la electricidad desde los molinos hasta las casas?\na) por el aire, como el viento\nb) por cables de la red eléctrica\nc) por los ríos',
      en: 'How does electricity travel from the turbines to the houses?\na) through the air, like wind\nb) through the cables of the grid\nc) along the rivers' }),
  N('o_enchufe', { gl: 'O enchufe', es: 'El enchufe', en: 'The plug socket' },
    { gl: 'O enchufe é a porta pola que a electricidade entra nos aparellos: a lámpada, a neveira, a consola. Detrás da parede hai cables que veñen da rede. Cando acendes algo, pechas un camiño e a corrente pasa. Cando o apagas, o camiño ábrese e para. Apagar o que non usas fai que o [[vento|o_vento]] traballe un pouco menos.',
      es: 'El enchufe es la puerta por la que la electricidad entra en los aparatos: la lámpara, la nevera, la consola. Detrás de la pared hay cables que vienen de la red. Cuando enciendes algo, cierras un camino y la corriente pasa. Cuando lo apagas, el camino se abre y para. Apagar lo que no usas hace que el [[viento|o_vento]] trabaje un poco menos.',
      en: 'The plug socket is the door through which electricity enters our devices: the lamp, the fridge, the games console. Behind the wall there are cables coming from the grid. When you switch something on, you close a path and the current flows. When you switch it off, the path opens and it stops. Switching off what you do not use makes the [[wind|o_vento]] work a little less.' },
    { gl: 'A electricidade é moi útil e moi perigosa á vez: nunca metas nada nun enchufe nin toques aparellos coas mans molladas. Na casa hai un cadro con interruptores que cortan a corrente se algo falla. Aprender a respectala é parte de entender como funciona.',
      es: 'La electricidad es muy útil y muy peligrosa a la vez: nunca metas nada en un enchufe ni toques aparatos con las manos mojadas. En casa hay un cuadro con interruptores que cortan la corriente si algo falla. Aprender a respetarla es parte de entender cómo funciona.',
      en: 'Electricity is very useful and very dangerous at the same time: never put anything into a socket and never touch devices with wet hands. At home there is a panel with switches that cut the current if something goes wrong. Learning to respect it is part of understanding how it works.' },
    { gl: 'Que hai que facer cun aparello que non estás a usar?\na) deixalo acendido por se acaso\nb) apagalo, así gástase menos electricidade\nc) meter un garfo no enchufe',
      es: '¿Qué hay que hacer con un aparato que no estás usando?\na) dejarlo encendido por si acaso\nb) apagarlo, así se gasta menos electricidad\nc) meter un tenedor en el enchufe',
      en: 'What should you do with a device you are not using?\na) leave it on just in case\nb) switch it off, so less electricity is used\nc) put a fork in the socket' }),
]
const REL_LUZ = [
  ['o_xerador', 'USA', 'o_vento', 'high', { gl: 'O xerador do muíño móvese co vento', es: 'El generador del molino se mueve con el viento', en: 'The turbine generator is driven by the wind' }],
  ['o_xerador', 'PRODUCE', 'a_rede_electrica', 'high', { gl: 'O xerador manda a electricidade á rede', es: 'El generador manda la electricidad a la red', en: 'The generator sends electricity into the grid' }],
  ['o_enchufe', 'PARTE_DE', 'a_rede_electrica', 'high', { gl: 'O enchufe é o final da rede eléctrica na casa', es: 'El enchufe es el final de la red eléctrica en casa', en: 'The socket is the end of the grid at home' }],
  ['o_vento', 'ANTES_DE', 'o_xerador', 'high', { gl: 'Primeiro sopra o vento, despois xira o xerador', es: 'Primero sopla el viento, después gira el generador', en: 'First the wind blows, then the generator spins' }],
  ['o_xerador', 'ANTES_DE', 'a_rede_electrica', 'high', { gl: 'A electricidade do xerador vai despois pola rede', es: 'La electricidad del generador va después por la red', en: 'Electricity from the generator then travels through the grid' }],
  ['a_rede_electrica', 'ANTES_DE', 'o_enchufe', 'high', { gl: 'A rede remata no enchufe', es: 'La red termina en el enchufe', en: 'The grid ends at the socket' }],
  ['o_vento', 'PERTENCE_A', 'natureza_galicia', 'medium', { gl: 'O vento é parte da natureza de Galicia', es: 'El viento es parte de la naturaleza de Galicia', en: 'Wind is part of Galician nature' }],
  ['o_vento', 'PERTENCE_A', 'enerxia_forzas', 'medium', { gl: 'O vento é unha fonte de enerxía', es: 'El viento es una fuente de energía', en: 'Wind is a source of energy' }],
  ['o_xerador', 'PERTENCE_A', 'enerxia_forzas', 'high', { gl: 'O xerador converte movemento en electricidade', es: 'El generador convierte movimiento en electricidad', en: 'The generator turns motion into electricity' }],
  ['a_rede_electrica', 'PERTENCE_A', 'enerxia_forzas', 'medium', { gl: 'A rede transporta a enerxía eléctrica', es: 'La red transporta la energía eléctrica', en: 'The grid carries electrical energy' }],
  ['o_enchufe', 'PERTENCE_A', 'enerxia_forzas', 'low', { gl: 'O enchufe entrega a enerxía aos aparellos', es: 'El enchufe entrega la energía a los aparatos', en: 'The socket delivers energy to devices' }],
]

// ───────────────────────── RUTA 3: DE ONDE VÉN O LEITE ─────────────────────────
const LEITE = [
  N('a_herba', { gl: 'A herba', es: 'La hierba', en: 'Grass' },
    { gl: 'Todo empeza nun prado verde. A herba medra coa chuvia e co sol, e en Galicia hai tanta que os prados case nunca quedan marróns. Parece pouca cousa, pero a herba garda dentro a enerxía do sol. As persoas non a podemos dixerir. As [[vacas|a_vaca]] si.',
      es: 'Todo empieza en un prado verde. La hierba crece con la lluvia y con el sol, y en Galicia hay tanta que los prados casi nunca se quedan marrones. Parece poca cosa, pero la hierba guarda dentro la energía del sol. Las personas no la podemos digerir. Las [[vacas|a_vaca]] sí.',
      en: 'It all starts in a green meadow. Grass grows with rain and sun, and in Galicia there is so much that meadows hardly ever turn brown. It looks like nothing much, but grass stores the energy of the sun inside. People cannot digest it. [[Cows|a_vaca]] can.' },
    { gl: 'As plantas fabrican o seu alimento coa luz do sol, auga e aire: chámase fotosíntese. A herba é tan dura de dixerir porque ten celulosa, un material que o noso estómago non rompe. Os gandeiros tamén cortan a herba e gárdana seca (feo) ou fermentada (silo) para o inverno.',
      es: 'Las plantas fabrican su alimento con la luz del sol, agua y aire: se llama fotosíntesis. La hierba es tan dura de digerir porque tiene celulosa, un material que nuestro estómago no rompe. Los ganaderos también cortan la hierba y la guardan seca (heno) o fermentada (silo) para el invierno.',
      en: 'Plants make their own food from sunlight, water and air: it is called photosynthesis. Grass is so hard to digest because it contains cellulose, a material our stomach cannot break down. Farmers also cut grass and keep it dry (hay) or fermented (silage) for the winter.' },
    { gl: 'De onde saca a herba a enerxía para medrar?\na) da chuvia e do sol\nb) do leite\nc) das pedras',
      es: '¿De dónde saca la hierba la energía para crecer?\na) de la lluvia y del sol\nb) de la leche\nc) de las piedras',
      en: 'Where does grass get the energy to grow?\na) from rain and sun\nb) from milk\nc) from stones' }),
  N('a_vaca', { gl: 'A vaca', es: 'La vaca', en: 'The cow' },
    { gl: 'A vaca é unha fábrica de herba. Pasa o día comendo e ten catro estómagos para dixerila: mastígaa, trágaa, devólvea á boca e volve mastigala con calma. Bebe moitísima auga. Con todo iso, o seu corpo fai algo branco e morno para alimentar a súa cría: o [[leite|o_leite]].',
      es: 'La vaca es una fábrica de hierba. Pasa el día comiendo y tiene cuatro estómagos para digerirla: la mastica, la traga, la devuelve a la boca y vuelve a masticarla con calma. Bebe muchísima agua. Con todo eso, su cuerpo hace algo blanco y tibio para alimentar a su cría: la [[leche|o_leite]].',
      en: 'The cow is a grass factory. It spends the day eating and has four stomachs to digest it: it chews, swallows, brings the grass back up and chews it again calmly. It drinks a huge amount of water. With all that, its body makes something white and warm to feed its calf: [[milk|o_leite]].' },
    { gl: 'Galicia é a terra das vacas: aquí hai máis vacas de leite ca en ningún outro lugar de España. A raza rubia galega é de carne, e a frisona, branca e negra, é a que máis leite dá. Unha vaca pode dar máis de 25 litros ao día.',
      es: 'Galicia es la tierra de las vacas: aquí hay más vacas de leche que en ningún otro lugar de España. La raza rubia gallega es de carne, y la frisona, blanca y negra, es la que más leche da. Una vaca puede dar más de 25 litros al día.',
      en: 'Galicia is cow country: there are more dairy cows here than anywhere else in Spain. The rubia galega breed is raised for meat, and the black-and-white Friesian gives the most milk. A cow can give more than 25 litres a day.' },
    { gl: 'Cantos estómagos ten unha vaca?\na) un\nb) dous\nc) catro',
      es: '¿Cuántos estómagos tiene una vaca?\na) uno\nb) dos\nc) cuatro',
      en: 'How many stomachs does a cow have?\na) one\nb) two\nc) four' }),
  N('o_leite', { gl: 'O leite', es: 'La leche', en: 'Milk' },
    { gl: 'O leite sae morno da vaca, dúas veces ao día. Antes muxíase a man; agora fano máquinas suaves. Vai a un tanque frío e un camión recólleo. Na fábrica quéntase un chisco para matar microbios e métese en bricks e botellas. Con el fanse iogures, manteiga e [[queixo|o_queixo]].',
      es: 'La leche sale tibia de la vaca, dos veces al día. Antes se ordeñaba a mano; ahora lo hacen máquinas suaves. Va a un tanque frío y un camión la recoge. En la fábrica se calienta un poco para matar microbios y se mete en bricks y botellas. Con ella se hacen yogures, mantequilla y [[queso|o_queixo]].',
      en: 'Milk comes out of the cow warm, twice a day. It used to be milked by hand; now gentle machines do it. It goes into a cold tank and a lorry collects it. At the dairy it is heated a little to kill germs and put into cartons and bottles. Yoghurt, butter and [[cheese|o_queixo]] are made from it.' },
    { gl: 'O leite é sobre todo auga con graxa, proteínas e un azucre chamado lactosa. Se se deixa quieto, a graxa sobe e forma a nata. A pasteurización, que quenta o leite a uns 72 graos uns segundos, leva o nome de Louis Pasteur, que descubriu en 1864 que a calor moderada mata os microbios sen cocer o alimento.',
      es: 'La leche es sobre todo agua con grasa, proteínas y un azúcar llamado lactosa. Si se deja quieta, la grasa sube y forma la nata. La pasteurización, que calienta la leche a unos 72 grados unos segundos, lleva el nombre de Louis Pasteur, que descubrió en 1864 que el calor moderado mata los microbios sin cocer el alimento.',
      en: 'Milk is mostly water with fat, proteins and a sugar called lactose. If left still, the fat rises and forms cream. Pasteurisation, which heats milk to about 72 degrees for a few seconds, is named after Louis Pasteur, who discovered in 1864 that moderate heat kills microbes without cooking the food.' },
    { gl: 'Por que se quenta o leite na fábrica antes de envasalo?\na) para que saiba a chocolate\nb) para matar os microbios\nc) para que sexa máis branco',
      es: '¿Por qué se calienta la leche en la fábrica antes de envasarla?\na) para que sepa a chocolate\nb) para matar los microbios\nc) para que sea más blanca',
      en: 'Why is milk heated at the dairy before packing?\na) to make it taste of chocolate\nb) to kill germs\nc) to make it whiter' }),
  N('o_queixo', { gl: 'O queixo', es: 'El queso', en: 'Cheese' },
    { gl: 'Para facer queixo, o leite ten que callar: bótaselle un pouco de callo e, en pouco tempo, ponse sólido coma un flan. Córtase, escórrese o soro e ponse en moldes. Uns días despois xa é queixo. En Galicia hai queixos famosos, coma o de tetilla ou o San Simón, afumado. Todo iso saíu dun prado de [[herba|a_herba]].',
      es: 'Para hacer queso, la leche tiene que cuajar: se le echa un poco de cuajo y, en poco tiempo, se pone sólida como un flan. Se corta, se escurre el suero y se pone en moldes. Unos días después ya es queso. En Galicia hay quesos famosos, como el de tetilla o el San Simón, ahumado. Todo eso salió de un prado de [[hierba|a_herba]].',
      en: 'To make cheese, milk has to curdle: a little rennet is added and, in a short while, it sets solid like a pudding. It is cut, the whey is drained off and it goes into moulds. A few days later it is cheese. Galicia has famous cheeses, like tetilla or the smoked San Simón. All of that came from a meadow of [[grass|a_herba]].' },
    { gl: 'O queixo de tetilla ten esa forma de cono redondo porque antes callábase en cuncas. O San Simón da Costa afúmase con madeira de bidueiro. Os queixos curados poden gardarse meses sen neveira: por iso se inventaron, para non perder o leite.',
      es: 'El queso de tetilla tiene esa forma de cono redondo porque antes se cuajaba en cuencos. El San Simón da Costa se ahúma con madera de abedul. Los quesos curados pueden guardarse meses sin nevera: por eso se inventaron, para no perder la leche.',
      en: 'Tetilla cheese has its rounded cone shape because it used to be curdled in bowls. San Simón da Costa is smoked with birch wood. Aged cheeses can be kept for months without a fridge: that is why they were invented, so as not to waste milk.' },
    { gl: 'Que lle pasa ao leite cando se lle bota callo?\na) faise sólido\nb) vólvese azul\nc) evapórase',
      es: '¿Qué le pasa a la leche cuando se le echa cuajo?\na) se hace sólida\nb) se vuelve azul\nc) se evapora',
      en: 'What happens to milk when rennet is added?\na) it turns solid\nb) it turns blue\nc) it evaporates' }),
]
const REL_LEITE = [
  ['a_vaca', 'USA', 'a_herba', 'high', { gl: 'A vaca aliméntase de herba', es: 'La vaca se alimenta de hierba', en: 'The cow feeds on grass' }],
  ['a_vaca', 'PRODUCE', 'o_leite', 'high', { gl: 'A vaca produce o leite', es: 'La vaca produce la leche', en: 'The cow produces milk' }],
  ['o_leite', 'TRANSFORMA', 'o_queixo', 'high', { gl: 'Ao callar, o leite transfórmase en queixo', es: 'Al cuajar, la leche se transforma en queso', en: 'When it curdles, milk turns into cheese' }],
  ['a_herba', 'ANTES_DE', 'a_vaca', 'high', { gl: 'Primeiro a herba, despois a vaca que a come', es: 'Primero la hierba, después la vaca que la come', en: 'First the grass, then the cow that eats it' }],
  ['a_vaca', 'ANTES_DE', 'o_leite', 'high', { gl: 'Da vaca sae o leite', es: 'De la vaca sale la leche', en: 'Milk comes from the cow' }],
  ['o_leite', 'ANTES_DE', 'o_queixo', 'high', { gl: 'Do leite faise o queixo', es: 'De la leche se hace el queso', en: 'Cheese is made from milk' }],
  ['a_herba', 'PERTENCE_A', 'oficios_terra', 'medium', { gl: 'Os prados son o traballo dos gandeiros', es: 'Los prados son el trabajo de los ganaderos', en: 'Meadows are the farmers\' work' }],
  ['a_vaca', 'PERTENCE_A', 'oficios_terra', 'high', { gl: 'A gandería é un oficio da terra', es: 'La ganadería es un oficio de la tierra', en: 'Cattle farming is a trade of the land' }],
  ['o_leite', 'PERTENCE_A', 'oficios_terra', 'medium', { gl: 'O leite é o froito da gandería', es: 'La leche es el fruto de la ganadería', en: 'Milk is the fruit of cattle farming' }],
  ['o_queixo', 'PERTENCE_A', 'gastronomia_galicia', 'high', { gl: 'O queixo é parte da gastronomía galega', es: 'El queso es parte de la gastronomía gallega', en: 'Cheese is part of Galician cuisine' }],
  ['o_queixo', 'PERTENCE_A', 'oficios_terra', 'medium', { gl: 'Facer queixo é un oficio', es: 'Hacer queso es un oficio', en: 'Cheese-making is a trade' }],
]

const RUTAS = [
  { nodos: AUGA, rels: REL_AUGA, journey: { label_gl: 'A viaxe da auga', label_es: 'El viaje del agua', label_en: 'The journey of water',
      description_gl: 'Da nube á billa: chuvia, río, depuradora e a túa casa.', description_es: 'De la nube al grifo: lluvia, río, depuradora y tu casa.', description_en: 'From the cloud to the tap: rain, river, treatment plant and your home.',
      modulo: 'Natureza', icono: '💧' } },
  { nodos: LUZ, rels: REL_LUZ, journey: { label_gl: 'A viaxe da luz', label_es: 'El viaje de la luz', label_en: 'The journey of light',
      description_gl: 'Do vento ao enchufe: como chega a electricidade á túa lámpada.', description_es: 'Del viento al enchufe: cómo llega la electricidad a tu lámpara.', description_en: 'From the wind to the socket: how electricity reaches your lamp.',
      modulo: 'Ciencia', icono: '⚡' } },
  { nodos: LEITE, rels: REL_LEITE, journey: { label_gl: 'De onde vén o leite', label_es: 'De dónde viene la leche', label_en: 'Where milk comes from',
      description_gl: 'Do prado ao queixo: herba, vaca, leite e a mesa.', description_es: 'Del prado al queso: hierba, vaca, leche y la mesa.', description_en: 'From the meadow to the cheese: grass, cow, milk and the table.',
      modulo: 'Oficios', icono: '🐄' } },
]

// ── 1. import de nodos e relacións ──
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

// ── 2. retos (PUT completo, o endpoint sobrescribe todo) ──
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

// ── 3. portais nos 4 nodos do pan (só marca palabras que xa estaban no texto) ──
const PORTAIS_PAN = {
  o_trigo:  { gl: ['levalos a moer', 'levalos a [[moer|a_farina]]'], es: ['llevarlos a moler', 'llevarlos a [[moler|a_farina]]'], en: ['taken to be milled', 'taken to be [[milled|a_farina]]'] },
  a_farina: { gl: ['con auga e terás masa', 'con auga e terás [[masa|a_masa]]'], es: ['con agua y tendrás masa', 'con agua y tendrás [[masa|a_masa]]'], en: ['you will have dough', 'you will have [[dough|a_masa]]'] },
  a_masa:   { gl: ['xa pode ir ao forno', 'xa pode ir ao [[forno|o_pan]]'], es: ['ya puede ir al horno', 'ya puede ir al [[horno|o_pan]]'], en: ['go into the oven', 'go into the [[oven|o_pan]]'] },
  o_pan:    { gl: ['Do gran do campo', 'Do [[gran|o_trigo]] do campo'], es: ['Del grano del campo', 'Del [[grano|o_trigo]] del campo'], en: ['From the grain in the field', 'From the [[grain|o_trigo]] in the field'] },
}
for (const [id, cambios] of Object.entries(PORTAIS_PAN)) {
  const g = await j('GET', '/nodo/' + id); const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: n.reto_bloqueado, reto_puntos: n.reto_puntos || 10 }
  let tocados = 0
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    let tp = n.content?.primary?.[i] || ''
    if (cambios[i] && tp.includes(cambios[i][0]) && !tp.includes('[[')) { tp = tp.replace(cambios[i][0], cambios[i][1]); tocados++ }
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = tp
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  console.log('portais', id, p.status, 'tocados', tocados)
}

// ── 4. journeys ──
const ex = await j('GET', '/journeys'); const ids = new Set((ex.data.journeys || []).map(x => x.id))
for (const r of RUTAS) {
  const stops = r.nodos.map((n, i) => ({ nodo: n.id, order: i + 1 }))
  const res = await j('POST', '/journeys', { ...r.journey, level: 'primary', type: 'educational', visibility: 'private', stops }, TOKEN)
  console.log('journey', r.journey.label_gl, res.status, res.data?.id || res.data?.error || '')
}
const fin = await j('GET', '/journeys'); console.log('journeys agora:', (fin.data.journeys || []).map(x => x.id).join(', '))
