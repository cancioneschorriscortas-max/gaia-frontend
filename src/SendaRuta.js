// ─────────────────────────────────────────────────────────
// src/SendaRuta.js — A SENDA (portada-neno dunha ruta)
//
// Fase 2 do plan EXPERIENCIA_NENO: pinta o "world-map" do boceto:
// paradas sobre unha senda, feitas ✓ / actual pulsando / futuras 🔒,
// con Lúa acompañando e un só botón dominante.
//
// Dúas capas:
//   <SendaVisual>  — presentacional puro (stops+indice → SVG).
//                    Reutilizable na portada diaria.
//   <SendaRuta>    — wrapper con datos: fetch journey + progreso
//                    (endpoints da Fase 1) e render completo.
//
// A senda ten DÚAS disposicións e escolle soa segundo o ancho do
// contedor: horizontal (tablet/escritorio) e VERTICAL en móbil.
// Na horizontal escalada a 300px as etiquetas quedaban en 6px e as
// paradas en 16px: ilexibles e intocables. En vertical cada parada
// ten o seu sitio, a etiqueta vai ao lado e a senda medra cara abaixo
// (scroll natural do móbil) sen importar cantas paradas haxa.
//
// Uso:
//   <SendaRuta journeyId="galicia_no_prato" idioma="gl"
//              onEntrar={(indice) => ...abrir PercorridoRuta nese paso...}
//              onPechar={() => ...} />
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import { useUser } from './contexts/UserContext'
import { API } from './config/api'
import { t } from './i18n'

const ANCHO_VERTICAL = 480   // por debaixo disto a senda vai en vertical

// ── INICIO: curva ───────────────────────────────────────
// Camiño suave entre puntos consecutivos (cúbica con tanxentes
// horizontais ou verticais segundo a disposición).
function curva(puntos, vertical) {
  return puntos.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const q = puntos[i - 1]
    return vertical
      ? `C ${q.x} ${(q.y + p.y) / 2}, ${p.x} ${(q.y + p.y) / 2}, ${p.x} ${p.y}`
      : `C ${(q.x + p.x) / 2} ${q.y}, ${(q.x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`
  }).join(' ')
}
// ── FIN: curva ──────────────────────────────────────────

// ── INICIO: senda_visual (presentacional) ───────────────
export function SendaVisual({ stops, indice, completada = false, onTocarPaso, onTocarPechada, idioma = 'gl', popActual = false }) {
  const n = stops.length
  const ref = useRef(null)
  const [vertical, setVertical] = useState(false)

  // Mide o contedor e decide a disposición. ResizeObserver para que
  // xirar o móbil ou redimensionar a ventá cambie a senda ao vivo.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setVertical(el.clientWidth > 0 && el.clientWidth < ANCHO_VERTICAL)
    medir()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Xeometría. Horizontal: zig-zag lixeiro ao longo do ancho.
  // Vertical: as paradas alternan esquerda/dereita e baixan 92px cada unha.
  const ancho = vertical ? 320 : Math.max(560, 90 + n * 120)
  const alto  = vertical ? 60 + Math.max(0, n - 1) * 92 + 40 : 240
  const puntos = useMemo(() => stops.map((s, i) => vertical
    ? { x: i % 2 === 0 ? 96 : 224, y: 48 + i * 92 }
    : { x: 70 + (i * (ancho - 140)) / Math.max(1, n - 1),
        y: 150 + (i % 2 === 0 ? 30 : -30) * (i === 0 ? 0.5 : 1) }
  ), [stops, ancho, n, vertical])

  if (n === 0) return null

  const tramoAndado = indice > 0 ? curva(puntos.slice(0, Math.min(indice + 1, n)), vertical) : null

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="xMidYMid meet"
           style={{ width: '100%', height: 'auto', display: 'block', maxWidth: vertical ? 360 : 'none', margin: '0 auto' }}
           role="list">
        {/* A senda: tramo andado sólido, tramo por andar punteado */}
        <path d={curva(puntos, vertical)} fill="none" stroke="#2a3a5c" strokeWidth="3"
              strokeDasharray="1 10" strokeLinecap="round" />
        {tramoAndado && (
          <path d={tramoAndado} fill="none" stroke="#5dd4a8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        )}

        {puntos.map((p, i) => {
          const stop  = stops[i]
          const label = stop.nodo?.[`label_${idioma}`] || stop.nodo?.label_gl || stop.nodo?.id || t(idioma, 'sendaPaso', i + 1)
          const feito   = completada || i < indice
          const actual  = !completada && i === indice
          const tocable = feito || actual
          const estado  = t(idioma, feito ? 'sendaParadaFeita' : actual ? 'sendaParadaActual' : 'sendaParadaPechada')
          const activar = () => tocable ? (onTocarPaso && onTocarPaso(i)) : (onTocarPechada && onTocarPechada(i))

          // Etiqueta: debaixo na horizontal; ao lado (fóra da senda) na vertical.
          const esquerda = vertical && p.x > 160
          const lx = vertical ? (esquerda ? p.x - 34 : p.x + 34) : p.x
          const ly = vertical ? p.y + 5 : p.y + (actual ? 40 : 34)
          const anchor = vertical ? (esquerda ? 'end' : 'start') : 'middle'
          const maxChars = vertical ? 16 : 18

          return (
            <g key={stop.nodo?.id || i}
               role="listitem"
               tabIndex={0}
               aria-label={`${t(idioma, 'sendaParadaAria', i + 1, label)} · ${estado}`}
               style={{ cursor: tocable ? 'pointer' : 'not-allowed', outline: 'none' }}
               onClick={activar}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activar() } }}>

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

              <text x={lx} y={ly} textAnchor={anchor}
                    fill={feito ? '#5dd4a8' : actual ? '#e8a547' : '#8fa3c8'}
                    fontSize={vertical ? (actual ? 16 : 14) : (actual ? 14 : 12)}
                    fontWeight={actual ? 600 : 400}
                    style={{ fontFamily: 'inherit' }}>
                {label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label}
              </text>
            </g>
          )
        })}

        {/* Meta: estrela final */}
        {completada && (() => {
          const p = puntos[n - 1]
          return vertical
            ? <text x={p.x} y={p.y + 40} textAnchor="middle" fontSize="20">🌟</text>
            : <text x={p.x + 34} y={p.y + 5} fontSize="20">🌟</text>
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
  const [aviso,    setAviso]    = useState(null)   // Lúa avisa cando se toca unha parada pechada

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
      if (stopsOrdenados.length === 0) { setErro('sen-pasos'); return }
      setRuta(j)
      setStops(stopsOrdenados)
      setIndice(Math.min(p.indice || 0, Math.max(0, stopsOrdenados.length - 1)))
      setCompletada(p.completada === true)
    }).catch(e => vivo && setErro(e.message))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 3000)
    return () => clearTimeout(id)
  }, [aviso])

  const botonPechar = onPechar && (
    <button onClick={onPechar} aria-label={t(idioma, 'pechar')}
            style={{ background: 'none', border: 'none', color: '#8fa3c8', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>
      ✕
    </button>
  )

  if (erro) {
    return (
      <div role="alert" style={{ padding: 24, maxWidth: 520, margin: '0 auto', textAlign: 'center', color: '#c9d6ef' }}>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{t(idioma, 'sendaErro')}</div>
        {onPechar && (
          <button onClick={onPechar}
            style={{ background: '#e8a547', color: '#412402', border: 'none', borderRadius: 22,
                     padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t(idioma, 'percorridoVolver')}
          </button>
        )}
      </div>
    )
  }
  if (!ruta) return <div style={{ padding: 24, color: '#9bb3ff', textAlign: 'center' }}>{t(idioma, 'sendaDebuxando')}</div>

  const nome      = usuario?.nome ? usuario.nome.split(' ')[0] : ''
  const empezada  = indice > 0 || completada
  const fraseBase = completada ? 'sendaCompleta' : empezada ? 'sendaContinua' : 'sendaEmpeza'
  const fraseLua  = aviso
    ? t(idioma, 'sendaPechadaAviso')
    : (nome ? t(idioma, fraseBase + 'Nome', nome) : t(idioma, fraseBase))
  const labelRuta = ruta[`label_${idioma}`] || ruta.label?.[idioma] || ruta.label_gl || ruta.label?.gl || journeyId

  return (
    <div style={{
      background: '#0a1020', borderRadius: 16, padding: '22px 20px 26px',
      maxWidth: 780, margin: '0 auto', color: '#f5f7ff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 600, minWidth: 0 }}>
          {ruta.icono || '📚'} {labelRuta}
        </h2>
        {botonPechar}
      </div>

      {/* Lúa + bocadillo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 6px' }}>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M 17 4 a 13 13 0 1 0 0 26 a 10 13 0 1 1 0 -26 Z" fill="#e8f0ff" />
          <circle cx="14.5" cy="15" r="1.3" fill="#0a1020" />
          <path d="M 11.5 20 q 3.5 3 7 0" stroke="#0a1020" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <div role="status" aria-live="polite" style={{
          background: aviso ? '#2a2214' : '#101a30', border: `1px solid ${aviso ? '#e8a547' : '#2a3a5c'}`, borderRadius: 10,
          padding: '8px 14px', fontSize: 13.5, color: '#c9d6ef', transition: 'background 200ms, border-color 200ms'
        }}>
          {fraseLua}
        </div>
      </div>

      <SendaVisual stops={stops} indice={indice} completada={completada}
                   onTocarPaso={(i) => onEntrar && onEntrar(i)}
                   onTocarPechada={() => setAviso(true)}
                   idioma={idioma} popActual={popActual} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <button
          onClick={() => onEntrar && onEntrar(completada ? 0 : indice)}
          style={{
            background: '#e8a547', color: '#412402', border: 'none',
            borderRadius: 22, padding: '11px 34px', fontSize: 15,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
          }}>
          {t(idioma, completada ? 'portadaVolverPercorrer' : empezada ? 'sendaContinuar' : 'sendaComezar')}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11.5, color: '#8fa3c8' }}>
        {completada ? t(idioma, 'sendaParadasCompleto', stops.length, stops.length)
                    : t(idioma, 'portadaParadaDe', Math.min(indice + 1, stops.length), stops.length)}
      </div>
    </div>
  )
}
// ── FIN: senda_ruta ─────────────────────────────────────
