// FONTE DE VERDADE da primeira ruta de nivel EXPERTO: "A luz, a fondo" 🎓 (nodos da luz con text_expert + reto_expert).
// Público: bacharelato, FP e adultos curiosos. Executable contra un backend local cun login de profesor.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const EXPERT = {
  o_vento: {
    texto: {
      gl: 'O vento é a resposta da atmosfera ás diferenzas de presión: o aire flúe das altas presións ás baixas, e a rotación da Terra (forza de Coriolis) desvíao ata que sopra case paralelo ás isóbaras. A potencia dun aeroxerador escala co cubo da velocidade do vento (P ∝ ρ·A·v³): duplicar o vento multiplica por oito a enerxía, por iso a elección do emprazamento e a altura da torre importan máis ca o tamaño da máquina. O límite de Betz fixa en 59,3 % a fracción máxima de enerxía cinética que unha turbina pode extraer do fluxo.',
      es: 'El viento es la respuesta de la atmósfera a las diferencias de presión: el aire fluye de las altas presiones a las bajas, y la rotación de la Tierra (fuerza de Coriolis) lo desvía hasta que sopla casi paralelo a las isobaras. La potencia de un aerogenerador escala con el cubo de la velocidad del viento (P ∝ ρ·A·v³): duplicar el viento multiplica por ocho la energía, por eso la elección del emplazamiento y la altura de la torre importan más que el tamaño de la máquina. El límite de Betz fija en el 59,3 % la fracción máxima de energía cinética que una turbina puede extraer del flujo.',
      en: 'Wind is the atmosphere\'s response to pressure differences: air flows from high to low pressure, and the Earth\'s rotation (Coriolis force) deflects it until it blows almost parallel to the isobars. A wind turbine\'s power scales with the cube of wind speed (P ∝ ρ·A·v³): doubling the wind multiplies the energy by eight, which is why siting and tower height matter more than machine size. The Betz limit caps at 59.3% the fraction of kinetic energy a turbine can extract from the flow.' },
    reto: {
      gl: 'Un parque eólico ten turbinas de 100 m de diámetro de rotor. Se o vento medio pasa de 6 a 8 m/s ao subir a torre 40 m, estima cantas veces aumenta a potencia dispoñible e explica por que ningunha turbina pode aproveitar máis do 59 % dela.',
      es: 'Un parque eólico tiene turbinas de 100 m de diámetro de rotor. Si el viento medio pasa de 6 a 8 m/s al subir la torre 40 m, estima cuántas veces aumenta la potencia disponible y explica por qué ninguna turbina puede aprovechar más del 59 % de ella.',
      en: 'A wind farm has turbines with a 100 m rotor diameter. If the mean wind rises from 6 to 8 m/s when the tower is raised 40 m, estimate how many times the available power increases and explain why no turbine can harvest more than 59% of it.' } },
  o_xerador: {
    texto: {
      gl: 'A lei de Faraday di que a forza electromotriz inducida nunha espira é igual á variación do fluxo magnético que a atravesa (ε = −dΦ/dt); o signo negativo é a lei de Lenz, a corrente inducida opónse ao cambio que a crea. Nun alternador trifásico o rotor (imáns permanentes ou electroimán) xira dentro de tres bobinados desfasados 120°, producindo tres sinusoides. Os aeroxeradores modernos usan xeradores síncronos de imáns permanentes ou asíncronos dobremente alimentados, e un convertidor electrónico adapta a frecuencia variable do rotor aos 50 Hz da rede.',
      es: 'La ley de Faraday dice que la fuerza electromotriz inducida en una espira es igual a la variación del flujo magnético que la atraviesa (ε = −dΦ/dt); el signo negativo es la ley de Lenz: la corriente inducida se opone al cambio que la crea. En un alternador trifásico el rotor (imanes permanentes o electroimán) gira dentro de tres bobinados desfasados 120°, produciendo tres sinusoides. Los aerogeneradores modernos usan generadores síncronos de imanes permanentes o asíncronos doblemente alimentados, y un convertidor electrónico adapta la frecuencia variable del rotor a los 50 Hz de la red.',
      en: 'Faraday\'s law states that the electromotive force induced in a loop equals the rate of change of the magnetic flux through it (ε = −dΦ/dt); the minus sign is Lenz\'s law: the induced current opposes the change that creates it. In a three-phase alternator the rotor (permanent magnets or an electromagnet) spins inside three windings offset by 120°, producing three sinusoids. Modern wind turbines use permanent-magnet synchronous or doubly-fed induction generators, and a power converter adapts the rotor\'s variable frequency to the grid\'s 50 Hz.' },
    reto: {
      gl: 'Explica, coa lei de Faraday e a lei de Lenz, por que custa máis facer xirar un xerador cando está conectado a unha carga que cando xira en baleiro. De onde sae a enerxía eléctrica?',
      es: 'Explica, con la ley de Faraday y la ley de Lenz, por qué cuesta más hacer girar un generador cuando está conectado a una carga que cuando gira en vacío. ¿De dónde sale la energía eléctrica?',
      en: 'Using Faraday\'s and Lenz\'s laws, explain why a generator is harder to turn when connected to a load than when spinning unloaded. Where does the electrical energy come from?' } },
  a_rede_electrica: {
    texto: {
      gl: 'As perdas por efecto Joule nunha liña son P = I²R: para transportar a mesma potencia (P = V·I) con menos corrente, elévase a tensión ata 220 ou 400 kV nas liñas de transporte, e báixase por etapas en subestacións e centros de transformación ata os 230 V domésticos. A rede é síncrona: todos os xeradores de Europa continental xiran acompasados a 50 Hz, e calquera desequilibrio entre xeración e consumo móvese esa frecuencia, que é o sinal que usan os operadores (en España, Red Eléctrica) para regular en tempo real. A alta penetración de eólica e solar, sen inercia mecánica, é o gran reto técnico actual.',
      es: 'Las pérdidas por efecto Joule en una línea son P = I²R: para transportar la misma potencia (P = V·I) con menos corriente, se eleva la tensión hasta 220 o 400 kV en las líneas de transporte, y se baja por etapas en subestaciones y centros de transformación hasta los 230 V domésticos. La red es síncrona: todos los generadores de Europa continental giran acompasados a 50 Hz, y cualquier desequilibrio entre generación y consumo mueve esa frecuencia, que es la señal que usan los operadores (en España, Red Eléctrica) para regular en tiempo real. La alta penetración de eólica y solar, sin inercia mecánica, es el gran reto técnico actual.',
      en: 'Joule losses in a line are P = I²R: to carry the same power (P = V·I) with less current, voltage is stepped up to 220 or 400 kV on transmission lines, and stepped down through substations and transformers to the 230 V at home. The grid is synchronous: every generator in continental Europe spins in step at 50 Hz, and any imbalance between generation and demand shifts that frequency, which is the signal operators (in Spain, Red Eléctrica) use to regulate in real time. High penetration of wind and solar, with no mechanical inertia, is today\'s big technical challenge.' },
    reto: {
      gl: 'Unha liña transporta 100 MW. Compara as perdas Joule se o fai a 20 kV ou a 400 kV (mesma resistencia). Despois explica que lle pasa á frecuencia da rede se de repente se desconecta unha central grande.',
      es: 'Una línea transporta 100 MW. Compara las pérdidas Joule si lo hace a 20 kV o a 400 kV (misma resistencia). Después explica qué le pasa a la frecuencia de la red si de repente se desconecta una central grande.',
      en: 'A line carries 100 MW. Compare the Joule losses at 20 kV versus 400 kV (same resistance). Then explain what happens to the grid frequency if a large power station suddenly disconnects.' } },
  o_enchufe: {
    texto: {
      gl: 'A instalación doméstica é un circuíto en paralelo a 230 V e 50 Hz: cada aparello recibe a mesma tensión e consome a corrente que lle corresponde (I = P/V). O cadro de protección leva o interruptor xeral, os magnetotérmicos (cortan por sobrecarga ou curtocircuíto) e o diferencial, que compara a corrente que entra pola fase coa que volve polo neutro e dispara se a diferenza supera 30 mA, sinal de que a corrente se está escapando, quizais por unha persoa. A toma de terra dá a esa fuga un camiño de baixa resistencia. Un enchufe Schuko leva fase, neutro e terra; a polaridade non importa en corrente alterna.',
      es: 'La instalación doméstica es un circuito en paralelo a 230 V y 50 Hz: cada aparato recibe la misma tensión y consume la corriente que le corresponde (I = P/V). El cuadro de protección lleva el interruptor general, los magnetotérmicos (cortan por sobrecarga o cortocircuito) y el diferencial, que compara la corriente que entra por la fase con la que vuelve por el neutro y dispara si la diferencia supera 30 mA, señal de que la corriente se está escapando, quizá por una persona. La toma de tierra da a esa fuga un camino de baja resistencia. Un enchufe Schuko lleva fase, neutro y tierra; la polaridad no importa en corriente alterna.',
      en: 'A home installation is a parallel circuit at 230 V and 50 Hz: every appliance gets the same voltage and draws its own current (I = P/V). The consumer unit holds the main switch, the circuit breakers (which trip on overload or short circuit) and the residual-current device, which compares the current entering through the live wire with the current returning through neutral and trips if the difference exceeds 30 mA, a sign that current is leaking, perhaps through a person. The earth connection gives that leak a low-resistance path. A Schuko socket carries live, neutral and earth; polarity does not matter with alternating current.' },
    reto: {
      gl: 'Un secador de 2.000 W e un radiador de 1.500 W están no mesmo circuíto de 16 A a 230 V. Calcula se salta o magnetotérmico e explica por que o diferencial protexe as persoas mesmo cando o magnetotérmico non salta.',
      es: 'Un secador de 2.000 W y un radiador de 1.500 W están en el mismo circuito de 16 A a 230 V. Calcula si salta el magnetotérmico y explica por qué el diferencial protege a las personas incluso cuando el magnetotérmico no salta.',
      en: 'A 2,000 W hair dryer and a 1,500 W heater share a 16 A circuit at 230 V. Work out whether the breaker trips and explain why the residual-current device protects people even when the breaker does not trip.' } },
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
const journey = { label_gl: 'A luz, a fondo', label_es: 'La luz, a fondo', label_en: 'Light, in depth',
  description_gl: 'Coriolis, lei de Faraday, perdas I²R e o cadro eléctrico da casa: a viaxe da luz para quen quere as ecuacións.',
  description_es: 'Coriolis, ley de Faraday, pérdidas I²R y el cuadro eléctrico de casa: el viaje de la luz para quien quiere las ecuaciones.',
  description_en: 'Coriolis, Faraday\'s law, I²R losses and the home consumer unit: the journey of light for those who want the equations.',
  modulo: 'Ciencia', icono: '🎓' }
const stops = ['o_vento', 'o_xerador', 'a_rede_electrica', 'o_enchufe'].map((n, i) => ({ nodo: n, order: i + 1 }))
const res = await j('POST', '/journeys', { ...journey, level: 'expert', type: 'educational', visibility: 'public', stops }, TOKEN)
console.log('journey', res.status, res.data?.id || res.data?.error)
if (res.data?.id) {
  const body = { ...journey, level: 'expert', type: 'educational', status: 'published', visibility: 'public' }
  const p = await j('PUT', '/journeys/' + res.data.id, body, TOKEN); console.log('  publicada', p.status)
}
