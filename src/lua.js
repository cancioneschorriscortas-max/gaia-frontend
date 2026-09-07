// ─────────────────────────────────────────────────────────
// src/lua.js — selector do banco de frases de Lúa (v1, SEN IA)
//
//   fraseLua({ idioma, hora, evento, ruta, nome, nodo, anterior })
//
// Regras:
//   1. Só candidatas cuxo `cando` cadre ENTEIRO co contexto.
//   2. Gaña a máis específica (máis condicións).
//   3. Entre empatadas, rótase polo día do ano (mesma frase todo o día,
//      distinta mañá): determinista, sen sorpresas nin repeticións seguidas.
//   4. "{, nome}" só se interpola se hai nome; se non, desaparece limpo.
// ─────────────────────────────────────────────────────────
import banco from './data/frasesLua.json'

function cadra(cando, ctx) {
  for (const [k, v] of Object.entries(cando)) {
    if (k === 'hora') {
      const h = ctx.hora ?? new Date().getHours()
      if (!(h >= v[0] && h < v[1])) return false
    } else if (v === true) {
      if (!ctx[k]) return false
    } else if (ctx[k] !== v) {
      return false
    }
  }
  return true
}

function diaDoAno(d = new Date()) {
  const inicio = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d - inicio) / 86400000)
}

export function fraseLua(ctx = {}) {
  const idioma = ctx.idioma || 'gl'
  const candidatas = banco.frases.filter(f => cadra(f.cando, ctx))
  if (candidatas.length === 0) return ''
  const maxEsp = Math.max(...candidatas.map(f => Object.keys(f.cando).length))
  const mellores = candidatas.filter(f => Object.keys(f.cando).length === maxEsp)
  const f = mellores[diaDoAno() % mellores.length]
  let texto = f[idioma] || f.gl || ''
  texto = texto.replace(/\{, nome\}/g, ctx.nome ? `, ${ctx.nome}` : '')
  for (const k of ['nome', 'nodo', 'anterior', 'ruta', 'n', 'total']) {
    texto = texto.replace(new RegExp(`\\{${k}\\}`, 'g'), ctx[k] ?? '')
  }
  return texto
}

export default fraseLua
