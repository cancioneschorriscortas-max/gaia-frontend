// ─────────────────────────────────────────────────────────
// src/ColeccionCartas.js — a colección de cartas do neno
//
// Modal por riba da portada. Cada carta é unha curiosidade ou un consello
// (data/cartas.json). As que faltan vense como siluetas coa pista de como
// conseguilas: o futuro á vista tira do neno (Dirección de arte §6).
// ─────────────────────────────────────────────────────────
import { useEffect } from 'react'
import CARTAS from './data/cartas.json'
import { t } from './i18n'

export default function ColeccionCartas({ idioma = 'gl', tidas = [], onPechar }) {
  const set = new Set(tidas)
  const total = CARTAS.cartas.length
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onPechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPechar])

  return (
    <div role="dialog" aria-modal="true" aria-label={t(idioma, 'cartasTitulo')}
      style={{ position: 'fixed', inset: 0, zIndex: 170, background: 'rgba(5, 10, 20, 0.92)', overflowY: 'auto',
               fontFamily: 'inherit', color: '#f5f7ff', padding: '24px 18px 60px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 26, flex: 1 }}>{t(idioma, 'cartasTitulo')}</h2>
          <button onClick={onPechar} aria-label={t(idioma, 'pechar')}
            style={{ background: 'none', border: 'none', color: '#8fa3c8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: '#8fa3c8', marginBottom: 22 }}>{t(idioma, 'cartasTidas', set.size, total)}</div>

        {Object.entries(CARTAS.coleccions).map(([cid, col]) => {
          const cartas = CARTAS.cartas.filter(c => c.coleccion === cid)
          if (cartas.length === 0) return null
          return (
            <section key={cid} style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: col.cor, fontWeight: 700, marginBottom: 12 }}>
                {col[idioma] || col.gl} · {cartas.filter(c => set.has(c.id)).length}/{cartas.length}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {cartas.map(c => {
                  const ten = set.has(c.id)
                  return (
                    <div key={c.id} aria-label={ten ? (c.titulo[idioma] || c.titulo.gl) : t(idioma, 'cartasOculta')}
                      style={{
                        borderRadius: 14, padding: '16px 12px 14px', textAlign: 'center', minHeight: 150,
                        background: ten ? `linear-gradient(160deg, ${col.cor}22, #0a1020)` : '#0d1320',
                        border: `1.5px ${ten ? 'solid' : 'dashed'} ${ten ? col.cor : '#2a3a5c'}`,
                        boxShadow: ten ? `0 0 22px ${col.cor}33` : 'none', opacity: ten ? 1 : 0.7
                      }}>
                      <div style={{ fontSize: 40, lineHeight: 1, filter: ten ? 'none' : 'grayscale(1) brightness(0.35)' }}>{ten ? c.emoji : '❔'}</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, fontWeight: 700, color: ten ? col.cor : '#5d6c8f', margin: '10px 0 6px' }}>
                        {ten ? (c.titulo[idioma] || c.titulo.gl) : '· · ·'}
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: ten ? '#c9d6ef' : '#5d6c8f' }}>
                        {ten ? (c.texto[idioma] || c.texto.gl) : t(idioma, c.ruta ? 'cartasComoRuta' : 'cartasComoPortal')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
