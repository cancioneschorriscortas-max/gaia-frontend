// ─────────────────────────────────────────────────────────
// src/portais.js — PORTAIS no texto (Regra 6 de GAIA)
//
// Sintaxe no texto dun nodo:   ...levalos a [[moer|a_farina]]. E ao...
//   [[texto visible|id_do_nodo_destino]]
//   [[texto visible]]  → destino = slug do propio texto (raro; mellor explícito)
//
// Aquí hai dúas cousas:
//   parsePortais(texto)  → [{ texto }, { texto, nodo }, ...]   (puro, testable)
//   limparPortais(texto) → o texto sen marcas (para resumos, buscas, títulos)
//   <TextoConPortais>    → render: cada portal é un botón inline con ↗
//
// Por que é un botón e non un <a>: non hai URL; o portal abre o nodo
// destino DENTRO da experiencia (un desvío na ruta, o visor no mapa).
// ─────────────────────────────────────────────────────────

const RE_PORTAL = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g

export function parsePortais(texto) {
  const out = []
  if (!texto) return out
  let ultimo = 0
  for (const m of String(texto).matchAll(RE_PORTAL)) {
    if (m.index > ultimo) out.push({ texto: texto.slice(ultimo, m.index) })
    const visible = m[1].trim()
    const nodo = (m[2] || visible).trim().toLowerCase().replace(/\s+/g, '_')
    out.push({ texto: visible, nodo })
    ultimo = m.index + m[0].length
  }
  if (ultimo < texto.length) out.push({ texto: texto.slice(ultimo) })
  return out
}

export function limparPortais(texto) {
  return String(texto || '').replace(RE_PORTAL, (_, visible) => visible.trim())
}

export function tenPortais(texto) {
  return RE_PORTAL.test(String(texto || '')) && !(RE_PORTAL.lastIndex = 0)
}

export function destinosPortais(texto) {
  return parsePortais(texto).filter(s => s.nodo).map(s => s.nodo)
}

// ── INICIO: TextoConPortais ─────────────────────────────
// `onPortal(nodoId, textoVisible)` — se non se pasa, os portais píntanse
// pero non fan nada (modo só-lectura, p.ex. nunha vista previa).
// `cor` — cor do portal; por defecto o azul de "info/portais" da paleta.
export function TextoConPortais({ texto, onPortal, cor = '#9bb3ff', visitados, idioma = 'gl', style }) {
  const partes = parsePortais(texto)
  return (
    <span style={style}>
      {partes.map((p, i) => p.nodo ? (
        <button
          key={i}
          type="button"
          onClick={onPortal ? () => onPortal(p.nodo, p.texto) : undefined}
          aria-label={`${p.texto} ↗`}
          title={p.nodo}
          style={{
            background: 'none', border: 'none', padding: 0, margin: 0,
            font: 'inherit', color: cor, cursor: onPortal ? 'pointer' : 'default',
            textDecoration: 'underline', textDecorationStyle: 'dotted',
            textUnderlineOffset: 3, fontWeight: 600,
            opacity: visitados && visitados.has(p.nodo) ? 0.75 : 1
          }}>
          {p.texto}<span aria-hidden="true" style={{ fontSize: '0.75em', marginLeft: 2 }}>↗</span>
        </button>
      ) : (
        <span key={i}>{p.texto}</span>
      ))}
    </span>
  )
}
// ── FIN: TextoConPortais ────────────────────────────────
