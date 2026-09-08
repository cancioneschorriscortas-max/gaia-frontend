// FONTE DE VERDADE das rutas de SECUNDARIA (3ª entrega): o son e as mensaxes "por dentro".
// Reutilizan os nodos existentes; engaden reto_secondary (pregunta aberta) e a journey level=secondary.
import fs from 'node:fs'
const API = 'http://localhost:4000'
const CRED = JSON.parse(fs.readFileSync('C:/Users/tajes/AppData/Local/Temp/claude/D--gaia-frontend/1e097732-9e4a-4df3-ab7f-6abf56a07f8d/scratchpad/test_user.json', 'utf8'))
async function j(method, path, body, token) {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let d; try { d = JSON.parse(t) } catch { d = t }; return { status: r.status, data: d }
}
const TOKEN = (await j('POST', '/auth/login', { nome: CRED.nome, contrasinal: CRED.contrasinal })).data.token

const RETOS_SEC = {
  a_vibracion: { gl: 'Ves un lóstrego e contas 6 segundos ata o trono. A que distancia caeu? Explica por que a luz chega antes ca o son e que lle pasa á nota dunha corda de guitarra se a tensas máis.',
                 es: 'Ves un relámpago y cuentas 6 segundos hasta el trueno. ¿A qué distancia cayó? Explica por qué la luz llega antes que el sonido y qué le pasa a la nota de una cuerda de guitarra si la tensas más.',
                 en: 'You see lightning and count 6 seconds until the thunder. How far away did it strike? Explain why light arrives before sound and what happens to a guitar string\'s note if you tighten it.' },
  o_oido: { gl: 'Explica o camiño do son desde o aire ata o cerebro nomeando tímpano, ósos, caracol e nervio. Por que un concerto a 100 dB durante dúas horas pode deixar un pitido que non se cura?',
            es: 'Explica el camino del sonido desde el aire hasta el cerebro nombrando tímpano, huesos, caracol y nervio. ¿Por qué un concierto a 100 dB durante dos horas puede dejar un pitido que no se cura?',
            en: 'Explain the path of sound from the air to the brain, naming eardrum, bones, cochlea and nerve. Why can a two-hour concert at 100 dB leave a ringing that never heals?' },
  a_gravacion: { gl: 'Un CD garda 44.100 números por segundo e canle, de 16 bits cada un. Calcula cantos bytes ocupa un minuto en estéreo e explica que quita o MP3 para que caiba dez veces menos sen que o notes.',
                 es: 'Un CD guarda 44.100 números por segundo y canal, de 16 bits cada uno. Calcula cuántos bytes ocupa un minuto en estéreo y explica qué quita el MP3 para que quepa diez veces menos sin que lo notes.',
                 en: 'A CD stores 44,100 numbers per second per channel, 16 bits each. Work out how many bytes one minute of stereo takes and explain what MP3 removes so it fits ten times smaller without you noticing.' },
  a_onda_de_radio: { gl: 'A radio FM emite arredor de 100 MHz e a túa voz vibra a uns 200 Hz. Explica como pode unha onda tan rápida levar unha voz tan lenta, e por que a radio soa igual aínda que non haxa aire entre a antena e ti.',
                     es: 'La radio FM emite alrededor de 100 MHz y tu voz vibra a unos 200 Hz. Explica cómo puede una onda tan rápida llevar una voz tan lenta, y por qué la radio suena igual aunque no haya aire entre la antena y tú.',
                     en: 'FM radio broadcasts around 100 MHz and your voice vibrates at about 200 Hz. Explain how such a fast wave can carry such a slow voice, and why radio sounds the same even with no air between the antenna and you.' },
  o_sobre: { gl: 'Antes de 1840 pagaba quen recibía a carta; despois, quen a enviaba. Explica por que ese cambio fixo que se enviasen moitas máis cartas, e que ten que ver co código postal de cinco cifras.',
             es: 'Antes de 1840 pagaba quien recibía la carta; después, quien la enviaba. Explica por qué ese cambio hizo que se enviasen muchas más cartas, y qué tiene que ver con el código postal de cinco cifras.',
             en: 'Before 1840 the receiver paid for a letter; afterwards, the sender did. Explain why that change made people send far more letters, and what it has to do with the five-digit postcode.' },
  o_centro_de_clasificacion: { gl: 'Unha máquina clasifica 40.000 cartas por hora e le o 90 % dos códigos; unha persoa teclea o resto. Calcula cantas cartas por hora teclea esa persoa e razoa por que Correos non pon só persoas nin só máquinas.',
                               es: 'Una máquina clasifica 40.000 cartas por hora y lee el 90 % de los códigos; una persona teclea el resto. Calcula cuántas cartas por hora teclea esa persona y razona por qué Correos no pone solo personas ni solo máquinas.',
                               en: 'A machine sorts 40,000 letters an hour and reads 90% of the postcodes; a person types the rest. Work out how many letters an hour that person types and argue why the post uses neither only people nor only machines.' },
  a_mensaxe: { gl: 'Unha mensaxe convértese en números antes de saír do móbil. Explica que é un bit e un byte, cantos bytes ocupa "ola" e por que unha foto pesa millóns de veces máis ca esa palabra.',
               es: 'Un mensaje se convierte en números antes de salir del móvil. Explica qué es un bit y un byte, cuántos bytes ocupa "hola" y por qué una foto pesa millones de veces más que esa palabra.',
               en: 'A message turns into numbers before leaving the phone. Explain what a bit and a byte are, how many bytes "hi" takes and why a photo weighs millions of times more than that word.' },
  o_cable_submarino: { gl: 'A luz percorre a fibra a uns 200.000 km/s. Canto tarda unha mensaxe da Coruña a Nova York (uns 6.000 km de cable)? Compara ese tempo cos 2–3 días dunha carta e explica que se perde e que se gaña con cada un.',
                       es: 'La luz recorre la fibra a unos 200.000 km/s. ¿Cuánto tarda un mensaje de A Coruña a Nueva York (unos 6.000 km de cable)? Compara ese tiempo con los 2–3 días de una carta y explica qué se pierde y qué se gana con cada uno.',
                       en: 'Light travels through fibre at about 200,000 km/s. How long does a message take from A Coruña to New York (about 6,000 km of cable)? Compare that with the 2–3 days of a letter and explain what is lost and gained with each.' },
}
for (const [id, reto] of Object.entries(RETOS_SEC)) {
  const g = await j('GET', '/nodo/' + id); if (g.status !== 200) { console.log('GET', id, g.status); continue }
  const n = g.data
  const body = { type: n.type, status: n.status, relevance: n.relevance, difficulty: n.difficulty, autor: n.autor || '', centro: n.centro || '', reto_bloqueado: false, reto_puntos: n.reto_puntos || 10 }
  for (const i of n.idiomas || ['gl', 'es', 'en', 'pt']) {
    body[`label_${i}`] = n.labels?.[i] || ''
    body[`text_primary_${i}`] = n.content?.primary?.[i] || ''
    body[`text_secondary_${i}`] = n.content?.secondary?.[i] || ''
    body[`text_expert_${i}`] = n.content?.expert?.[i] || ''
    body[`reto_primary_${i}`] = n.retos?.primary?.[i] || ''
    body[`reto_secondary_${i}`] = reto[i] || n.retos?.secondary?.[i] || ''
    body[`reto_expert_${i}`] = n.retos?.expert?.[i] || ''
  }
  const p = await j('PUT', '/nodo/' + id, body, TOKEN)
  console.log('reto secundaria', id, p.status)
}
const RUTAS = [
  { nodos: ['a_vibracion', 'o_oido', 'a_gravacion', 'a_onda_de_radio'],
    journey: { label_gl: 'O son, por dentro', label_es: 'El sonido, por dentro', label_en: 'Sound, from the inside',
      description_gl: 'Frecuencia e decibelios, o oído como sensor, o son feito números e a onda de radio que o leva: a música con física.', description_es: 'Frecuencia y decibelios, el oído como sensor, el sonido hecho números y la onda de radio que lo lleva: la música con física.', description_en: 'Frequency and decibels, the ear as a sensor, sound turned into numbers and the radio wave that carries it: music with physics.',
      modulo: 'Ciencia', icono: '🔊' } },
  { nodos: ['o_sobre', 'o_centro_de_clasificacion', 'a_mensaxe', 'o_cable_submarino'],
    journey: { label_gl: 'As mensaxes, por dentro', label_es: 'Los mensajes, por dentro', label_en: 'Messages, from the inside',
      description_gl: 'Do selo de 1840 ao cable de fibra: códigos postais, máquinas que len, bits e bytes e a velocidade da luz.', description_es: 'Del sello de 1840 al cable de fibra: códigos postales, máquinas que leen, bits y bytes y la velocidad de la luz.', description_en: 'From the 1840 stamp to the fibre cable: postcodes, machines that read, bits and bytes and the speed of light.',
      modulo: 'Ciencia', icono: '📨' } },
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
