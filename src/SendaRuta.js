// ─────────────────────────────────────────────────────────
// src/SendaRuta.js — A SENDA (portada-neno dunha ruta)
//
// Fase 2 do plan EXPERIENCIA_NENO: pinta o "world-map" do boceto:
// paradas sobre unha senda, feitas ✓ / actual pulsando / futuras 🔒,
// con Lúa acompañando e un só botón dominante.
//
// Dúas capas:
//   <SendaVisual>  — presentacional puro (stops+indice → SVG).
//                    Reutilizable na futura portada diaria.
//   <SendaRuta>    — wrapper con datos: fetch journey + progreso
//                    (endpoints da Fase 1) e render completo.
//
// Uso:
//   <SendaRuta journeyId="galicia_no_prato" idioma="gl"
//              onEntrar={(indice) => ...abrir PercorridoRuta nese paso...}
//              onPechar={() => ...} />
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react'
import { useUser } from './contexts/UserContext'
import { API } from './config/api'

// ── INICIO: senda_visual (presentacional) ───────────────
export function SendaVisual({ stops, indice, completada = false, onTocarPaso, idioma = 'gl', popActual = false }) {
  const n = stops.length
  // Xeometría: paradas repartidas nunha curva suave (zig-zag orgánico)
  const ancho = Math.max(560, 90 + n * 120)
  const alto  = 240
  const puntos = useMemo(() => stops.map((s, i) => ({
    x: 70 + (i * (ancho - 140)) / Math.max(1, n - 1),
    y: 150 + (i % 2 === 0 ? 30 : -30) * (i === 0 ? 0.5 : 1),
  })), [stops, ancho, n])

  if (n === 0) return null

  const camiño = puntos.map((p, i) => i === 0
    ? `M ${p.x} ${p.y}`
    : `C ${(puntos[i-1].x + p.x) / 2} ${puntos[i-1].y}, ${(puntos[i-1].x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`
  ).join(' ')

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <style>{`
        @keyframes sendaPulso {
          0%, 100% { r: 22; opacity: 0.25; }
          50%      { r: 30; opacity: 0.1; }
        }
      `}</style>
      <svg viewBox={`0 0 ${ancho} ${alto}`} style={{ width: ancho, height: alto, display: 'block' }}>
        {/* A senda: tramo andado sólido, tramo por andar punteado */}
        <path d={camiño} fill="none" stroke="#2a3a5c" strokeWidth="3"
              strokeDasharray="1 10" strokeLinecap="round" />
        {indice > 0 && (
          <path d={puntos.slice(0, Math.min(indice + 1, n)).map((p, i) => i === 0
            ? `M ${p.x} ${p.y}`
            : `C ${(puntos[i-1].x + p.x) / 2} ${puntos[i-1].y}, ${(puntos[i-1].x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`
          ).join(' ')} fill="none" stroke="#5dd4a8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        )}

        {puntos.map((p, i) => {
          const stop  = stops[i]
          const label = stop.nodo?.[`label_${idioma}`] || stop.nodo?.label_gl || stop.nodo?.id || `Paso ${i + 1}`
          const feito   = completada || i < indice
          const actual  = !completada && i === indice
          const tocable = feito || actual

          return (
            <g key={stop.nodo?.id || i}
               style={{ cursor: tocable ? 'pointer' : 'default' }}
               onClick={() => tocable && onTocarPaso && onTocarPaso(i)}>

              {actual && (
                <circle cx={p.x} cy={p.y} fill="#e8a547">
                  <animate attributeName="r" values="22;30;22" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0.08;0.25" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}

            <circle cx={p.x} cy={p.y} r={actual ? 20 : 15}
                      fill={feito ? '#5dd4a8' : actual ? '#e8a547' : '#1b2742'}
                      stroke={feito ? 'none' : actual ? 'none' : '#5d6c8f'}
                      strokeWidth="1.5">
                {actual && popActual && (
                  <animate attributeName="r" values="4;26;20" dur="0.7s" repeatCount="1" />
                )}
              </circle>

              {feito && (
                <path d={`M ${p.x - 6} ${p.y} l 4 4 l 8 -9`} stroke="#04342c"
                      strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {actual && (
                <path d={`M ${p.x} ${p.y - 8} l 2.4 5 l 5.6 0.8 l -4 3.9 l 1 5.6 l -5 -2.7 l -5 2.7 l 1 -5.6 l -4 -3.9 l 5.6 -0.8 Z`}
                      fill="#412402" />
              )}
              {!feito && !actual && (
                <g stroke="#8fa3c8" strokeWidth="1.4" fill="none">
                  <rect x={p.x - 5} y={p.y - 3} width="10" height="8" rx="1.5" />
                  <path d={`M ${p.x - 3} ${p.y - 3} v -2.5 a 3 3 0 0 1 6 0 v 2.5`} />
                </g>
              )}

              <text x={p.x} y={p.y + (actual ? 40 : 34)} textAnchor="middle"
                    fill={feito ? '#5dd4a8' : actual ? '#e8a547' : '#8fa3c8'}
                    fontSize={actual ? 14 : 12} fontWeight={actual ? 600 : 400}
                    style={{ fontFamily: 'inherit' }}>
                {label.length > 18 ? label.slice(0, 17) + '…' : label}
              </text>
            </g>
          )
        })}

        {/* Meta: cofre/estrela final */}
        {(() => {
          const p = puntos[n - 1]
          return completada ? (
            <text x={p.x + 34} y={puntos[n-1].y + 5} fontSize="20">🌟</text>
          ) : null
        })()}
      </svg>
    </div>
  )
}
// ── FIN: senda_visual ───────────────────────────────────

// ── INICIO: senda_ruta (wrapper con datos) ──────────────
export default function SendaRuta({ journeyId, idioma = 'gl', onEntrar, onPechar, popActual = false }) {
  const { authHeaders, usuario } = useUser()
  const [ruta,     setRuta]     = useState(null)
  const [stops,    setStops]    = useState([])
  const [indice,   setIndice]   = useState(0)
  const [completada, setCompletada] = useState(false)
  const [erro,     setErro]     = useState(null)

  useEffect(() => {
    let vivo = true
    Promise.all([
      fetch(`${API}/journeys/${journeyId}`, { headers: authHeaders() }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json()
      }),
      fetch(`${API}/journeys/${journeyId}/progreso`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : { indice: 0, completada: false })
        .catch(() => ({ indice: 0, completada: false }))
    ]).then(([j, p]) => {
      if (!vivo) return
      const stopsOrdenados = (j.stops || []).filter(s => s.nodo).sort((a, b) => (a.order || 0) - (b.order || 0))
      setRuta(j)
      setStops(stopsOrdenados)
      setIndice(Math.min(p.indice || 0, Math.max(0, stopsOrdenados.length - 1)))
      setCompletada(p.completada === true)
    }).catch(e => vivo && setErro(e.message))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  if (erro)  return <div style={{ padding: 24, color: '#f87171' }}>Non se puido cargar a senda: {erro}</div>
  if (!ruta) return <div style={{ padding: 24, color: '#9bb3ff' }}>Debuxando a senda…</div>

  const nome      = usuario?.nome ? usuario.nome.split(' ')[0] : ''
  const empezada  = indice > 0 || completada
  const fraseLua  = completada
    ? `Camiño completo${nome ? ', ' + nome : ''}! Podes repasar calquera parada.`
    : empezada
      ? `Continúa onde o deixaches${nome ? ', ' + nome : ''} — toca a estrela que brilla.`
      : `Todo camiño empeza nun primeiro paso${nome ? ', ' + nome : ''}. Toca a estrela!`
  const labelRuta = ruta[`label_${idioma}`] || ruta.label?.[idioma] || ruta.label_gl || ruta.label?.gl || journeyId

  return (
    <div style={{
      background: '#0a1020', borderRadius: 16, padding: '26px 28px',
      maxWidth: 780, margin: '0 auto', color: '#f5f7ff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 600 }}>
          {ruta.icono || '📚'} {labelRuta}
        </h2>
        {onPechar && (
          <button onClick={onPechar} aria-label="Pechar"
                  style={{ background: 'none', border: 'none', color: '#8fa3c8', fontSize: 20, cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      {/* Lúa + bocadillo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 6px' }}>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <path d="M 17 4 a 13 13 0 1 0 0 26 a 10 13 0 1 1 0 -26 Z" fill="#e8f0ff" />
          <circle cx="14.5" cy="15" r="1.3" fill="#0a1020" />
          <path d="M 11.5 20 q 3.5 3 7 0" stroke="#0a1020" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{
          background: '#101a30', border: '1px solid #2a3a5c', borderRadius: 10,
          padding: '8px 14px', fontSize: 13.5, color: '#c9d6ef'
        }}>
          {fraseLua}
        </div>
      </div>

    <SendaVisual stops={stops} indice={indice} completada={completada}
                   onTocarPaso={(i) => onEntrar && onEntrar(i)} idioma={idioma}
                   popActual={popActual} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <button
          onClick={() => onEntrar && onEntrar(completada ? 0 : indice)}
          style={{
            background: '#e8a547', color: '#412402', border: 'none',
            borderRadius: 22, padding: '11px 34px', fontSize: 15,
            fontWeight: 600, cursor: 'pointer'
          }}>
          {completada ? 'Volver percorrer' : empezada ? 'Continuar o camiño' : 'Comezar o camiño'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11.5, color: '#8fa3c8' }}>
        {completada ? `${stops.length} de ${stops.length} paradas · camiño completo 🌟`
                    : `Parada ${Math.min(indice + 1, stops.length)} de ${stops.length}`}
      </div>
    </div>
  )
}
// ── FIN: senda_ruta ─────────────────────────────────────
