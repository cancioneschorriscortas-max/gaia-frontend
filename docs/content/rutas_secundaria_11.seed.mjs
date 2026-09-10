// FONTE DE VERDADE das rutas de SECUNDARIA (11ª entrega): "O vidro, por dentro".
// Reutilizan os nodos da ruta do vidro; engaden reto_secondary (cálculo + concepto) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token || CRED.token   // CRED.token: reserva se o login está limitado por intentos

const RETOS_SEC = {
  o_vidro: { gl: 'Unha mestura de 100 kg para vidro sódico-cálcico leva un 70 % de area (sílice), un 15 % de sosa e un 15 % de cal. Cantos quilos de cada materia prima fan falta? Explica por que se engade sosa se o cuarzo puro tamén funde, para que serve a cal, e por que o vidro é transparente aínda que está feito dos mesmos átomos ca unha rocha opaca.',
             es: 'Una mezcla de 100 kg para vidrio sódico-cálcico lleva un 70 % de arena (sílice), un 15 % de sosa y un 15 % de cal. ¿Cuántos kilos de cada materia prima hacen falta? Explica por qué se añade sosa si el cuarzo puro también funde, para qué sirve la cal, y por qué el vidrio es transparente aunque está hecho de los mismos átomos que una roca opaca.',
             en: 'A 100 kg batch for soda-lime glass contains 70% sand (silica), 15% soda and 15% lime. How many kilos of each raw material are needed? Explain why soda is added if pure quartz also melts, what the lime is for, and why glass is transparent even though it is made of the same atoms as an opaque rock.' },
  o_forno_de_vidro: { gl: 'Un forno de vidro acéndese a 20 °C e ten que chegar aos 1.500 °C de fusión. Se sobe 100 °C cada hora, cantas horas tarda? Despois, no recocido, as pezas baixan de 550 °C a 50 °C a razón de 50 °C por hora: cantas horas dura? Explica que tensións aparecen se o vidro arrefría de golpe e por que o vidro temperado do móbil se fabrica xusto ao contrario do recocido.',
             es: 'Un horno de vidrio se enciende a 20 °C y tiene que llegar a los 1.500 °C de fusión. Si sube 100 °C cada hora, ¿cuántas horas tarda? Después, en el recocido, las piezas bajan de 550 °C a 50 °C a razón de 50 °C por hora: ¿cuántas horas dura? Explica qué tensiones aparecen si el vidrio se enfría de golpe y por qué el vidrio templado del móvil se fabrica justo al contrario del recocido.',
             en: 'A glass furnace is lit at 20 °C and has to reach the melting temperature of 1,500 °C. If it rises 100 °C every hour, how many hours does it take? Then, during annealing, the pieces go from 550 °C down to 50 °C at 50 °C per hour: how many hours does that take? Explain what stresses appear if glass cools suddenly and why the tempered glass in a phone is made in exactly the opposite way to annealing.' },
  o_vidreiro: { gl: 'Unha máquina automática fai 400 botellas por minuto. Cantas botellas fai nunha hora, e cantas nun turno de 8 horas? Un vidreiro a man, coa cana, fai 60 pezas ao día: cantos días de traballo precisaría para igualar o que a máquina fai nunha soa hora? Explica por que a invención da cana de soprar cambiou quen podía ter vidro, e que ten o borosilicato para non estalar cos cambios bruscos de temperatura.',
             es: 'Una máquina automática hace 400 botellas por minuto. ¿Cuántas botellas hace en una hora, y cuántas en un turno de 8 horas? Un vidriero a mano, con la caña, hace 60 piezas al día: ¿cuántos días de trabajo necesitaría para igualar lo que la máquina hace en una sola hora? Explica por qué la invención de la caña de soplar cambió quién podía tener vidrio, y qué tiene el borosilicato para no estallar con los cambios bruscos de temperatura.',
             en: 'An automatic machine makes 400 bottles a minute. How many bottles does it make in an hour, and how many in an 8-hour shift? A glassblower working by hand with the blowpipe makes 60 pieces a day: how many working days would he need to match what the machine makes in a single hour? Explain why the invention of the blowpipe changed who could own glass, and what borosilicate has that stops it shattering with sudden changes in temperature.' },
  a_botella: { gl: 'Nun forno de botellas, cada 10 % de casco na mestura aforra un 2,5 % de enerxía. Se a mestura leva un 60 % de casco, que porcentaxe de enerxía se aforra? Unha botella de 400 g recíclase 20 veces; se cada quilo de vidro novo precisa 0,7 kg de area e outras materias primas, cantos quilos de materia prima nova se evitan en total? Explica por que as fiestras, os espellos e as pantallas dos móbiles non van ao contedor verde.',
             es: 'En un horno de botellas, cada 10 % de casco en la mezcla ahorra un 2,5 % de energía. Si la mezcla lleva un 60 % de casco, ¿qué porcentaje de energía se ahorra? Una botella de 400 g se recicla 20 veces; si cada kilo de vidrio nuevo necesita 0,7 kg de arena y otras materias primas, ¿cuántos kilos de materia prima nueva se evitan en total? Explica por qué las ventanas, los espejos y las pantallas de los móviles no van al contenedor verde.',
             en: 'In a bottle furnace, every 10% of cullet in the batch saves 2.5% of energy. If the batch contains 60% cullet, what percentage of energy is saved? A 400 g bottle is recycled 20 times; if every kilo of new glass needs 0.7 kg of sand and other raw materials, how many kilos of new raw material are avoided in total? Explain why windows, mirrors and phone screens do not go in the green container.' },
}
// Solucións de referencia (gl) que le o avaliador antes de puntuar (n.solucion_secondary).
const SOLUCIONS = {
  o_vidro: "100 kg × 0,70 = 70 kg de area (sílice); 100 × 0,15 = 15 kg de sosa; 100 × 0,15 = 15 kg de cal (suman 100 kg). Crédito parcial se acerta dúas das tres cifras. Concepto: o cuarzo puro funde a uns 1.700 °C; a sosa (carbonato sódico) baixa a temperatura de fusión ata uns 1.000–1.500 °C e aforra enerxía. Pero o vidro só de sílice e sosa disólvese na auga: a cal (carbonato cálcico) dálle estabilidade química. É transparente porque é sílice amorfa, sen cristais nin grans que dispersen a luz, e os seus electróns non teñen niveis de enerxía que absorban a luz visible, así que os fotóns atravésano. Aceptar 'sen orde cristalina' como equivalente de amorfo.",
  o_forno_de_vidro: "Subida: 1.500 − 20 = 1.480 °C; 1.480 / 100 = 14,8 horas (aceptar 14,8 h, '14 h e 48 min' ou 'case 15 horas'). Recocido: 550 − 50 = 500 °C; 500 / 50 = 10 horas. Crédito parcial se esquece restar os 20 °C iniciais (15 h) pero razoa ben. Concepto: o vidro é mal condutor da calor; se arrefría rápido, a superficie solidifica antes ca o interior e quedan tensións que o fan estalar sen avisar; o recocido (manter arredor de 500–550 °C e baixar amodo durante horas) elimínaas. O vidro temperado quéntase e arrefríase de golpe con chorros de aire a propósito, para que a superficie quede comprimida: resiste moito máis e, cando rompe, faino en anacos pequenos e romos.",
  o_vidreiro: "400 × 60 = 24.000 botellas nunha hora; 24.000 × 8 = 192.000 nun turno de 8 horas. Vidreiro: 24.000 / 60 = 400 días de traballo para igualar unha hora da máquina. Crédito parcial se calcula ben a hora e erra o turno, ou se divide as 192.000 do turno (3.200 días) cun razoamento correcto. Concepto: antes da cana (século I a.C., costa de Siria e Palestina) o vidro modelábase arredor dun núcleo de arxila ou vertíase en moldes e cada peza era un luxo; co sopro un vidreiro facía ducias de vasos ao día e o vidro chegou ás mesas comúns. O borosilicato leva boro no canto de parte da sosa e dilata arredor de tres veces menos ca o vidro común; por iso non estala cos cambios bruscos de temperatura.",
  a_botella: "60 % de casco son 6 tramos de 10 %: 6 × 2,5 = 15 % de enerxía aforrada. Botella: 400 g = 0,4 kg; 0,4 × 20 = 8 kg de vidro reciclado en total; 8 × 0,7 = 5,6 kg de materia prima nova evitada (aceptar 5,6 kg ou 5.600 g). Crédito parcial se dá os 8 kg sen aplicar o 0,7, ou se confunde gramos e quilos cun razoamento correcto. Concepto: o vidro de fiestra, os espellos, a cerámica e as pantallas dos móbiles teñen composición e punto de fusión distintos do vidro sódico-cálcico das botellas e estragan o lote enteiro do forno. Ademais, o casco funde antes ca a area, a sosa e a cal, e evita o CO2 que soltan os carbonatos ao descompoñerse.",
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
  { nodos: ['o_vidro', 'o_forno_de_vidro', 'o_vidreiro', 'a_botella'],
    journey: { label_gl: 'O vidro, por dentro', label_es: 'El vidrio, por dentro', label_en: 'Glass, from the inside',
      description_gl: 'Setenta quilos de area en cen, catorce horas de subida do forno, catrocentas botellas por minuto e o casco que aforra enerxía: o vidro con números.', description_es: 'Setenta kilos de arena en cien, catorce horas de subida del horno, cuatrocientas botellas por minuto y el casco que ahorra energía: el vidrio con números.', description_en: 'Seventy kilos of sand in a hundred, fourteen hours to heat the furnace, four hundred bottles a minute and the cullet that saves energy: glass with numbers.',
      modulo: 'Ciencia', icono: '🫙' } },
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
