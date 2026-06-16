// ── i18n de GAIA ─────────────────────────────────────
// Os textos viven en locales/<idioma>.json (un ficheiro por idioma).
//
// ▸ ENGADIR UN IDIOMA NOVO (ex: francés):
//     1. Copia locales/gl.json → locales/fr.json e traduce os valores.
//     2. Engade 2 liñas aquí: o import e a entrada en LOCALES (marcadas con ⬇).
//   Nada máis. As ~230 chamadas a t(...) seguen igual.
//
// A función t(idioma, clave, ...args) NON cambiou: mesma sinatura e comportamento.
// ─────────────────────────────────────────────────────
import gl from './locales/gl.json'   // ⬇ idiomas
import es from './locales/es.json'
import en from './locales/en.json'

const LOCALES = { gl, es, en }       // ⬇ rexistra aquí o idioma novo
const IDIOMAS = Object.keys(LOCALES)
const FALLBACK = 'gl'

// ── INICIO: helper_t ─────────────────────────────────
export function t(idioma, clave, ...args) {
  const existe = IDIOMAS.some(l => LOCALES[l][clave] !== undefined)
  if (!existe) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Clave non atopada: "${clave}"`)
    }
    return clave
  }
  let texto = (LOCALES[idioma] && LOCALES[idioma][clave]) || LOCALES[FALLBACK][clave] || clave
  args.forEach((arg, i) => {
    texto = texto.replace(`{${i}}`, arg)
  })
  return texto
}
// ── FIN: helper_t ────────────────────────────────────

export const IDIOMAS_DISPONIBLES = IDIOMAS
export default LOCALES
