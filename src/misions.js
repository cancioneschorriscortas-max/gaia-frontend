// ── INICIO: misions ──────────────────────────────────
// Misión da semana (src/data/misions.json): un tema por semana, escollido
// pola semana do ano. Determinista: o mesmo tema para toda a clase e para
// o profesor, sen estado no servidor.
import MISIONS from './data/misions.json'

export function semanaDoAno(d = new Date()) {
  const ini = new Date(d.getFullYear(), 0, 1)
  return Math.floor((d - ini) / 864e5 / 7)
}

export function misionDaSemana(d = new Date()) {
  return MISIONS.misions[semanaDoAno(d) % MISIONS.misions.length]
}

export default misionDaSemana
// ── FIN: misions ─────────────────────────────────────
