// ── INICIO: epocas ───────────────────────────────────
// Calendario galego de Lúa (src/data/epocas.json): vendima, magosto, San Xoán...
// Determinista e sen servidor: só mira a data. Devolve a época que cadra hoxe
// (ou null); as que cruzan o ano (Nadal) resólvense comparando "MM-DD" por tramos.
import EPOCAS from './data/epocas.json'

const mmdd = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function epocaDoAno(d = new Date()) {
  const hoxe = mmdd(d)
  return EPOCAS.epocas.find(e => e.desde <= e.ata
    ? (hoxe >= e.desde && hoxe <= e.ata)
    : (hoxe >= e.desde || hoxe <= e.ata)) || null
}

export default epocaDoAno
// ── FIN: epocas ──────────────────────────────────────
