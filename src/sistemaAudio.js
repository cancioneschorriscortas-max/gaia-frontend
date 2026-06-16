// ── INICIO: sistema_audio_gaia ───────────────────────
// Módulo centralizado de son para GAIA
// Sons procedurais con Web Audio API + mp3s ambient e voz
// ── FIN: sistema_audio_gaia ─────────────────────────

// ── INICIO: estado_global ────────────────────────────
let audioCtx = null
let mutado = false
let volumeGlobal = 0.7
let musicaNode = null
let musicaGanancia = null
let musicaIniciada = false
// ── FIN: estado_global ───────────────────────────────

// ── INICIO: inicializar_contexto ─────────────────────
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}
// ── FIN: inicializar_contexto ────────────────────────

// ── INICIO: helpers_oscilador ────────────────────────
function tocarTono({ frecuencia = 440, tipo = 'sine', duracion = 0.15, volume = 0.3, ataque = 0.01, decay = 0.1, pitch_fin = null }) {
  if (mutado) return
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = tipo
    osc.frequency.setValueAtTime(frecuencia, ctx.currentTime)
    if (pitch_fin) {
      osc.frequency.exponentialRampToValueAtTime(pitch_fin, ctx.currentTime + duracion)
    }

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volume * volumeGlobal, ctx.currentTime + ataque)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duracion + 0.05)
  } catch (e) {}
}
// ── FIN: helpers_oscilador ───────────────────────────

// ── INICIO: sons_nodo ────────────────────────────────
// Son de click nun nodo — varía segundo o tipo
export function sonClickNodo(tipo = 'concept') {
  if (mutado) return
  const configs = {
    origin:        { frecuencia: 528, tipo: 'sine',     duracion: 0.4, volume: 0.25, pitch_fin: 660,  ataque: 0.02 },
    galaxy:        { frecuencia: 396, tipo: 'sine',     duracion: 0.3, volume: 0.22, pitch_fin: 528,  ataque: 0.02 },
    constellation: { frecuencia: 330, tipo: 'triangle', duracion: 0.25, volume: 0.2, pitch_fin: 440,  ataque: 0.01 },
    system:        { frecuencia: 280, tipo: 'triangle', duracion: 0.2, volume: 0.18, pitch_fin: 350,  ataque: 0.01 },
    concept:       { frecuencia: 220, tipo: 'triangle', duracion: 0.18, volume: 0.15, pitch_fin: 300, ataque: 0.005 },
    process:       { frecuencia: 200, tipo: 'sawtooth', duracion: 0.15, volume: 0.12, pitch_fin: 280, ataque: 0.005 },
  }
  const cfg = configs[tipo] || configs.concept
  tocarTono(cfg)

  // Segundo tono harmónico máis suave
  setTimeout(() => {
    tocarTono({ ...cfg, frecuencia: cfg.frecuencia * 1.5, volume: cfg.volume * 0.4, duracion: cfg.duracion * 0.7 })
  }, 60)
}
// ── FIN: sons_nodo ───────────────────────────────────

// ── INICIO: son_zoom ─────────────────────────────────
// Son de zoom/navegación espacial — swoosh suave
export function sonZoom(direccion = 'in') {
  if (mutado) return
  try {
    const ctx = getCtx()

    // Noise buffer para o swoosh
    const bufferSize = ctx.sampleRate * 0.3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    // Filtro bandpass para son espacial
    const filtro = ctx.createBiquadFilter()
    filtro.type = 'bandpass'
    filtro.frequency.value = direccion === 'in' ? 800 : 400
    filtro.frequency.exponentialRampToValueAtTime(
      direccion === 'in' ? 2000 : 200,
      ctx.currentTime + 0.25
    )
    filtro.Q.value = 0.8

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08 * volumeGlobal, ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)

    source.connect(filtro)
    filtro.connect(gain)
    gain.connect(ctx.destination)
    source.start(ctx.currentTime)
  } catch (e) {}
}
// ── FIN: son_zoom ────────────────────────────────────

// ── INICIO: son_panel ────────────────────────────────
// Son suave ao abrir/pechar panel lateral
export function sonPanel(abrindo = true) {
  if (mutado) return
  tocarTono({
    frecuencia: abrindo ? 180 : 160,
    tipo: 'sine',
    duracion: 0.2,
    volume: 0.08,
    pitch_fin: abrindo ? 220 : 140,
    ataque: 0.01
  })
}
// ── FIN: son_panel ───────────────────────────────────

// ── INICIO: son_hover ────────────────────────────────
// Son moi suave no hover dun nodo (só tipos grandes)
export function sonHover(tipo = 'concept') {
  if (mutado) return
  if (!['origin', 'galaxy', 'constellation'].includes(tipo)) return
  tocarTono({
    frecuencia: tipo === 'origin' ? 440 : tipo === 'galaxy' ? 330 : 280,
    tipo: 'sine',
    duracion: 0.08,
    volume: 0.05,
    ataque: 0.005
  })
}
// ── FIN: son_hover ───────────────────────────────────

// ── INICIO: son_xp ───────────────────────────────────
// Notificación de XP — acorde ascendente
export function sonXP(puntos = 10) {
  if (mutado) return
  const notas = puntos >= 50
    ? [523, 659, 784, 1047]  // Do Mi Sol Do — acorde maior completo
    : puntos >= 20
      ? [523, 659, 784]       // Do Mi Sol
      : [523, 659]            // Do Mi
  notas.forEach((freq, i) => {
    setTimeout(() => {
      tocarTono({ frecuencia: freq, tipo: 'sine', duracion: 0.3, volume: 0.15, ataque: 0.01, pitch_fin: freq * 1.02 })
    }, i * 80)
  })
}
// ── FIN: son_xp ──────────────────────────────────────

// ── INICIO: musica_ambient ───────────────────────────
export function iniciarMusica(url = '/assets/orbital-halo-drift.mp3') {
  if (musicaIniciada) return
  // ── INICIO: non_iniciar_durante_intro ────────────────
  if (document.getElementById('pc-canvas-estrelas')) return
  // ── FIN: non_iniciar_durante_intro ───────────────────
  musicaIniciada = true
  // ... resto igual
  try {
    const ctx = getCtx()
    musicaGanancia = ctx.createGain()
    musicaGanancia.gain.value = mutado ? 0 : 0.18 * volumeGlobal
    musicaGanancia.connect(ctx.destination)

    const audio = new Audio(url)
    audio.loop = true
    audio.crossOrigin = 'anonymous'

    musicaNode = ctx.createMediaElementSource(audio)
    musicaNode.connect(musicaGanancia)

    // Fade in suave
    musicaGanancia.gain.setValueAtTime(0, ctx.currentTime)
    musicaGanancia.gain.linearRampToValueAtTime(
      mutado ? 0 : 0.18 * volumeGlobal,
      ctx.currentTime + 3
    )

    audio.play().catch(() => {
      // Autoplay bloqueado — non pasa nada, o usuario terá que interactuar
      musicaIniciada = false
    })
  } catch (e) {
    musicaIniciada = false
  }
}

export function pararMusica() {
  if (!musicaGanancia || !audioCtx) return
  try {
    musicaGanancia.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1)
  } catch (e) {}
}
// ── FIN: musica_ambient ──────────────────────────────

// ── INICIO: control_mute ─────────────────────────────
export function toggleMute() {
  mutado = !mutado
  if (musicaGanancia && audioCtx) {
    musicaGanancia.gain.linearRampToValueAtTime(
      mutado ? 0 : 0.18 * volumeGlobal,
      audioCtx.currentTime + 0.5
    )
  }
  return mutado
}

export function setVolume(v) {
  volumeGlobal = Math.max(0, Math.min(1, v))
  if (musicaGanancia && audioCtx && !mutado) {
    musicaGanancia.gain.linearRampToValueAtTime(
      0.18 * volumeGlobal,
      audioCtx.currentTime + 0.2
    )
  }
}

export function getMutado() { return mutado }
export function getVolume() { return volumeGlobal }
// ── FIN: control_mute ───────────────────────────────
