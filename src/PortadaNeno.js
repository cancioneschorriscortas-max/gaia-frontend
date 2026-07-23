// ─────────────────────────────────────────────────────────
// src/PortadaNeno.js — A PORTADA DIARIA DO NENO (boceto 5)
//
// Pantalla de inicio diaria: ensambla pezas xa existentes.
//   Zona 1 — Lúa saúda (mensaxe do día) + chip de XP/nivel.
//   Zona 2 — "O teu camiño": ruta destacada + camiños por empezar.
//   Zona 3 — tarxetas: soño (Oberón, v1 estática), cartas, explorar libre.
//
// O compoñente NON decide a navegación global: recibe callbacks.
// Todo o texto visible vai por t(idioma, clave) — cero cadeas cableadas.
//
// Uso:  <PortadaNeno idioma="gl"
//                    onAbrirRuta={(journeyId) => ...}
//                    onExplorar={() => ...} />
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useUser } from './contexts/UserContext'
import { SendaVisual } from './SendaRuta'
import { API } from './config/api'
import { t } from './i18n'

// ── INICIO: paleta ──────────────────────────────────────
const C = {
  fondo:      '#0a1020',
  tarxeta:    '#101a30',
  borde:      '#2a3a5c',
  dourado:    '#e8a547',
  douradoTxt: '#412402',
  verde:      '#5dd4a8',
  azul:       '#9bb3ff',
  rosa:       '#ff9fb8',
  lua:        '#e8f0ff',
  texto:      '#f5f7ff',
  secundario: '#8fa3c8',
}
// ── FIN: paleta ─────────────────────────────────────────

// ── INICIO: activable (a11y) ────────────────────────────
// Converte calquera div nun control real: foco co tabulador,
// activación con Enter e Espazo, e anuncio como botón.
function activable(accion) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: accion,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        accion()
      }
    }
  }
}
// ── FIN: activable ──────────────────────────────────────

// ── INICIO: lua_mascota ─────────────────────────────────
// Mesma lúa crecente kawaii de SendaRuta.js, a 44px.
function LuaMascota({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M 17 4 a 13 13 0 1 0 0 26 a 10 13 0 1 1 0 -26 Z" fill={C.lua} />
      <circle cx="14.5" cy="15" r="1.3" fill={C.fondo} />
      <path d="M 11.5 20 q 3.5 3 7 0" stroke={C.fondo} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
// ── FIN: lua_mascota ────────────────────────────────────

// ── INICIO: tarxeta (base común) ────────────────────────
function Tarxeta({ titulo, children, onClick, style }) {
  const realzar = (cor) => (e) => { e.currentTarget.style.borderColor = cor }
  return (
    <div
      {...(onClick ? activable(onClick) : {})}
      onMouseEnter={onClick ? realzar(C.dourado) : undefined}
      onMouseLeave={onClick ? realzar(C.borde)   : undefined}
      onFocus={onClick ? realzar(C.dourado) : undefined}
      onBlur={onClick ? realzar(C.borde)    : undefined}
      style={{
        background: C.tarxeta, border: `1px solid ${C.borde}`, borderRadius: 14,
        padding: '16px 18px', cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 160ms ease', ...style
      }}>
      {titulo && (
        <div style={{
          fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.secundario, marginBottom: 10, fontWeight: 600
        }}>
          {titulo}
        </div>
      )}
      {children}
    </div>
  )
}
// ── FIN: tarxeta ────────────────────────────────────────

export default function PortadaNeno({ idioma = 'gl', onAbrirRuta, onExplorar }) {
  const { usuario, xp, nivel, authHeaders } = useUser()

  // ── INICIO: estado ────────────────────────────────────
  const [rutas,    setRutas]    = useState(null)   // null = cargando · [] = ningunha
  const [stops,    setStops]    = useState([])
  const [catalogo, setCatalogo] = useState([])     // todas as journeys existentes
  const [cargando, setCargando] = useState(true)
  // ── FIN: estado ───────────────────────────────────────

  // ── INICIO: carga_progreso ────────────────────────────
  // GET /progreso/rutas → resumo de todas as rutas empezadas.
  // DECISIÓN EXECUTOR: calquera fallo (sen login, backend caído) trátase
  // como "aínda non hai camiño" — a portada nunca peta.
  useEffect(() => {
    let vivo = true
    fetch(`${API}/progreso/rutas`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : { rutas: [] })
      .catch(() => ({ rutas: [] }))
      .then(d => { if (vivo) setRutas(Array.isArray(d.rutas) ? d.rutas : []) })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── FIN: carga_progreso ───────────────────────────────

  // ── INICIO: ruta_destacada ────────────────────────────
  // A activa = a primeira NON completada. Se todas están completadas,
  // destácase a última completada para poder volver percorrela.
  // O backend devolve `ORDER BY p.ts DESC`, logo a máis recente é rutas[0].
  const activa      = rutas ? rutas.find(r => !r.completada) : null
  const todasFeitas = !!rutas && rutas.length > 0 && !activa
  const destacada   = activa || (todasFeitas ? rutas[0] : null)
  // ── FIN: ruta_destacada ───────────────────────────────

  // ── INICIO: carga_catalogo ────────────────────────────
  // Mesmo endpoint e mesma visibilidade que o Arquivo de Rutas
  // (`GET /journeys`, sen filtros) — modelo autoservizo v1.
  useEffect(() => {
    if (!rutas) return
    let vivo = true
    fetch(`${API}/journeys`)
      .then(r => r.ok ? r.json() : { journeys: [] })
      .catch(() => ({ journeys: [] }))
      .then(d => { if (vivo) setCatalogo(Array.isArray(d.journeys) ? d.journeys : []) })
    return () => { vivo = false }
  }, [rutas])

  // Camiños POR EMPEZAR = os que non teñen PROGRESO do usuario.
  const empezadas   = new Set((rutas || []).map(r => r.id))
  const porEmpezar  = catalogo.filter(j => !empezadas.has(j.id))

  // OLLO: `/journeys` devolve `label` como OBXECTO {gl,es,en,pt},
  // mentres `/progreso/rutas` devólveo como string. Non se tratan igual.
  const labelCatalogo = (j) => j.label?.[idioma] || j.label?.gl || j.id
  // ── FIN: carga_catalogo ───────────────────────────────

  // ── INICIO: carga_stops ───────────────────────────────
  // SendaVisual precisa os stops completos → GET /journeys/:id
  useEffect(() => {
    if (!destacada?.id) { setStops([]); setCargando(false); return }
    let vivo = true
    setCargando(true)
    fetch(`${API}/journeys/${destacada.id}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(j => {
        if (!vivo) return
        const ordenados = ((j && j.stops) || [])
          .filter(s => s.nodo)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        setStops(ordenados)
        setCargando(false)
      })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destacada?.id])
  // ── FIN: carga_stops ──────────────────────────────────

  // ── INICIO: frase_do_dia ──────────────────────────────
  const nome  = usuario?.nome ? usuario.nome.split(' ')[0] : ''
  const cedo  = new Date().getHours() < 13
  const saudo = nome
    ? t(idioma, cedo ? 'portadaBosDiasNome' : 'portadaBoaTardeNome', nome)
    : t(idioma, cedo ? 'portadaBosDias'     : 'portadaBoaTarde')
  const fraseLua = activa ? `${saudo} ${t(idioma, 'portadaMisionEspera')}` : saudo
  // ── FIN: frase_do_dia ─────────────────────────────────

  const indice     = Math.min(destacada?.indice || 0, Math.max(0, stops.length - 1))
  const completada = destacada?.completada === true
  const labelRuta  = destacada
    ? (destacada[`label_${idioma}`] || destacada.label || destacada.id)
    : ''

  return (
    <div style={{
      minHeight: '100vh', background: C.fondo, color: C.texto,
      fontFamily: 'inherit', padding: '28px 20px 60px'
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── INICIO: zona_1_lua ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <LuaMascota size={44} />
          <div style={{
            flex: '1 1 200px', background: C.tarxeta, border: `1px solid ${C.borde}`,
            borderRadius: 10, padding: '11px 16px', fontSize: 14.5, color: '#c9d6ef'
          }}>
            {fraseLua}
          </div>
          <div style={{
            flexShrink: 0, background: C.tarxeta, border: `1px solid ${C.borde}`,
            borderRadius: 20, padding: '7px 14px', textAlign: 'center', lineHeight: 1.3
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dourado }}>
              {xp?.total || 0} XP
            </div>
            <div style={{ fontSize: 10.5, color: nivel?.cor || C.secundario }}>
              {nivel?.titulo || '—'}
            </div>
          </div>
        </div>
        {/* ── FIN: zona_1_lua ────────────────────────────── */}

        {/* ── INICIO: zona_2_camiño ──────────────────────── */}
        <Tarxeta titulo={t(idioma, 'portadaOTeuCamino')}
                 style={{ marginBottom: 22, padding: '18px 20px 22px' }}>

          {rutas === null || (destacada && cargando) ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: C.azul, fontSize: 13.5 }}>
              {t(idioma, 'portadaDebuxando')}
            </div>
          ) : destacada ? (
            /* Bloque principal: ruta activa, ou a última completada */
            <>
              <h2 style={{
                margin: '0 0 4px', fontFamily: 'Georgia, serif',
                fontSize: 23, fontWeight: 600, color: C.texto
              }}>
                {destacada.icono || '📚'} {labelRuta}
              </h2>

              {/* DECISIÓN EXECUTOR: tocar unha parada abre a ruta enteira (RutaNeno
                  non recibe paso inicial); a senda da propia RutaNeno xa leva ao paso. */}
              <SendaVisual
                stops={stops}
                indice={indice}
                completada={completada}
                idioma={idioma}
                onTocarPaso={() => onAbrirRuta && onAbrirRuta(destacada.id)}
              />

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                <button onClick={() => onAbrirRuta && onAbrirRuta(destacada.id)}
                  style={{
                    background: C.dourado, color: C.douradoTxt, border: 'none',
                    borderRadius: 22, padding: '12px 38px', fontSize: 15.5,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>
                  {todasFeitas ? t(idioma, 'portadaVolverPercorrer') : t(idioma, 'portadaMisionDeHoxe')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11.5, color: C.secundario }}>
                {todasFeitas
                  ? t(idioma, 'portadaCaminosCompletos')
                  : t(idioma, 'portadaParadaDe',
                      Math.min(indice + 1, Math.max(1, stops.length)),
                      stops.length || destacada.totalPasos || '?')}
              </div>
            </>
          ) : porEmpezar.length === 0 ? (
            /* Nin ruta empezada nin catálogo: só queda o mapa */
            <div style={{ padding: '18px 0 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 14.5, color: '#c9d6ef', marginBottom: 18, lineHeight: 1.6 }}>
                {t(idioma, 'portadaSenCamino')}
              </div>
              <button onClick={() => onExplorar && onExplorar()}
                style={{
                  background: C.dourado, color: C.douradoTxt, border: 'none',
                  borderRadius: 22, padding: '11px 34px', fontSize: 15,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>
                {t(idioma, 'portadaExplorarUniverso')}
              </button>
            </div>
          ) : null}

          {/* Camiños por empezar: SEMPRE que existan, tanto se hai
              ruta destacada arriba como se non. Vai debaixo. */}
          {porEmpezar.length > 0 && (
            <div style={{
              marginTop: destacada ? 22 : 6,
              paddingTop: destacada ? 18 : 0,
              borderTop: destacada ? `1px solid ${C.borde}` : 'none'
            }}>
              <div style={{
                fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: C.secundario, marginBottom: 12, fontWeight: 600
              }}>
                {t(idioma, 'portadaCaminosPodesEmpezar')}
              </div>

              {porEmpezar.map(j => {
                const realzar = (cor) => (e) => { e.currentTarget.style.borderColor = cor }
                return (
                  <div key={j.id}
                    {...activable(() => onAbrirRuta && onAbrirRuta(j.id))}
                    onMouseEnter={realzar(C.dourado)}
                    onMouseLeave={realzar(C.borde)}
                    onFocus={realzar(C.dourado)}
                    onBlur={realzar(C.borde)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: '#0d1729', border: `1px solid ${C.borde}`,
                      borderRadius: 12, padding: '13px 16px', marginBottom: 9,
                      cursor: 'pointer', transition: 'border-color 160ms ease'
                    }}>
                    <span style={{ fontSize: 22 }}>{j.icono || '📚'}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.texto }}>
                      {labelCatalogo(j)}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: C.dourado, fontWeight: 600 }}>
                      {t(idioma, 'portadaComezar')} →
                    </span>
                  </div>
                )
              })}

              {/* O secundario á vista pero apagado (só hai un dominante).
                  Se xa hai ruta destacada, o mapa xa ten porta na Zona 3. */}
              {!destacada && (
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <button onClick={() => onExplorar && onExplorar()}
                    style={{
                      background: 'none', border: 'none', color: C.secundario,
                      fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                      textUnderlineOffset: 3, fontFamily: 'inherit'
                    }}>
                    {t(idioma, 'portadaExplorarSecundario')}
                  </button>
                </div>
              )}
            </div>
          )}
        </Tarxeta>
        {/* ── FIN: zona_2_camiño ─────────────────────────── */}

        {/* ── INICIO: zona_3_tarxetas ────────────────────── */}
        {/* O teu soño — v1 ESTÁTICA (placeholder de Oberón, sen endpoint) */}
        <Tarxeta titulo={t(idioma, 'portadaOTeuSono')} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 30 }}>🥖</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.rosa }}>
                {t(idioma, 'portadaSonoOficio')}
              </div>
              <div style={{ fontSize: 12, color: C.secundario, marginTop: 3 }}>
                {t(idioma, 'portadaSonoOberon')}
              </div>
            </div>
          </div>
        </Tarxeta>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>

          {/* Cartas — placeholder v1, non funcional */}
          <Tarxeta titulo={t(idioma, 'portadaCartas')} style={{ flex: '1 1 240px', opacity: 0.75 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 44, height: 40, flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 4, width: 26, height: 34,
                  background: '#1b2742', border: `1px solid ${C.azul}`, borderRadius: 4,
                  transform: 'rotate(-12deg)'
                }} />
                <div style={{
                  position: 'absolute', left: 14, top: 2, width: 26, height: 34,
                  background: '#231b3a', border: `1px solid ${C.rosa}`, borderRadius: 4,
                  transform: 'rotate(9deg)'
                }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.texto }}>
                {t(idioma, 'portadaCartasConta', 0)}
              </div>
            </div>
          </Tarxeta>

          {/* Explorar libre — mesma acción que "Explorar o universo" */}
          <Tarxeta titulo={t(idioma, 'portadaExplorarLibre')}
            onClick={() => onExplorar && onExplorar()}
            style={{ flex: '1 1 240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="44" height="40" viewBox="0 0 44 40" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M 8 28 L 24 10 L 36 24" stroke={C.borde} strokeWidth="1.5" fill="none" />
                <circle cx="8"  cy="28" r="4"   fill={C.azul} />
                <circle cx="24" cy="10" r="5"   fill={C.dourado} />
                <circle cx="36" cy="24" r="3.5" fill={C.verde} />
              </svg>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.texto }}>
                {t(idioma, 'portadaUniversoEnteiro')}
              </div>
            </div>
          </Tarxeta>
        </div>
        {/* ── FIN: zona_3_tarxetas ───────────────────────── */}

      </div>
    </div>
  )
}
