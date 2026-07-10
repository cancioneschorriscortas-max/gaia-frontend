// ─────────────────────────────────────────────────────────
// src/hooks/useTiposRelacion.js
//
// FONTE ÚNICA dos tipos de relación no frontend (§10.1 Fase A).
// Consome GET /relacions/tipos do backend (que serve TIPOS_RELACION_VALIDOS
// + NOMES_RELACIONS con traducións gl/es/en e nomes inversos).
//
// Uso:
//   const { tipos, cargando, nome } = useTiposRelacion()
//   tipos                  → [{ id, gl, es, en, gl_inv, es_inv, en_inv }, ...]
//   nome('PERTENCE_A','gl')          → 'Pertence a'
//   nome('PERTENCE_A','gl',true)     → 'Contén'   (inverso)
//
// Caché a nivel de módulo: un só fetch por sesión, compartido por todos
// os compoñentes que usen o hook.
//
// REGRA DE OURO: ningún compoñente debe volver ter unha lista local de
// tipos de relación. Se o backend engade un tipo, aquí aparece só.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { API } from '../config/api'

// Fallback de emerxencia (só se o backend non responde): os 12 canónicos.
// NON é a fonte de verdade — é o paracaídas para que a UI non quede baleira.
const FALLBACK = [
  'PERTENCE_A', 'PARTE_DE', 'E_UN', 'INSTANCIA_DE', 'TRANSFORMA', 'PRODUCE',
  'USA', 'RELACIONADO_CON', 'SIMILAR_A', 'INSPIRADO_EN', 'ANTES_DE', 'DESPOIS_DE',
].map(id => ({ id, gl: id, es: id, en: id, gl_inv: id, es_inv: id, en_inv: id }))

// ── Caché de módulo: unha promesa compartida ──────────
let cachePromise = null

function cargarTipos() {
  if (!cachePromise) {
    cachePromise = fetch(`${API}/relacions/tipos`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => (Array.isArray(d.tipos) && d.tipos.length ? d.tipos : FALLBACK))
      .catch(err => {
        console.warn('[useTiposRelacion] Backend non dispoñible, usando fallback:', err.message)
        cachePromise = null       // permitir reintento en próxima montaxe
        return FALLBACK
      })
  }
  return cachePromise
}

export function useTiposRelacion() {
  const [tipos, setTipos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vivo = true
    cargarTipos().then(t => { if (vivo) { setTipos(t); setCargando(false) } })
    return () => { vivo = false }
  }, [])

  /** Nome localizado dun tipo. inverso=true → nome inverso ("Contén"). */
  const nome = (id, idioma = 'gl', inverso = false) => {
    const t = tipos.find(x => x.id === id)
    if (!t) return id
    return t[`${idioma}${inverso ? '_inv' : ''}`] || t[idioma] || t.gl || id
  }

  return { tipos, cargando, nome }
}

export default useTiposRelacion
