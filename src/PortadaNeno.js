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
import { fraseLua } from './lua'
import CARTAS from './data/cartas.json'
import { misionDaSemana } from './misions'
import { CartaRevelada } from './PercorridoRuta'
import { sonXP } from './sistemaAudio'
import ColeccionCartas from './ColeccionCartas'
import { ROLES } from './roles'
import OberonProfesionVista from './OberonProfesionVista'

// Oficios que xa teñen árbore real en Oberón (GET /oberon/profesion/:id/completa)
const OFICIOS_OBERON = { panadeiro: 'panadeiro' }

function atoparProfesion(id) {
  for (const r of ROLES) for (const b of r.bloques || []) for (const p of b.profesions || []) {
    if (p.id === id) return { ...p, rol: r, bloque: b }
  }
  return null
}

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

export default function PortadaNeno({ idioma = 'gl', onAbrirRuta, onExplorar, onEscollerCamino, onTest }) {
  const { usuario, xp, nivel, authHeaders, rexistrarXP } = useUser()

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
  // O tutorial (§3.3) vai sempre primeiro no catálogo: é por onde se empeza.
  const TUTORIAL_ID = 'a_viaxe_do_pan'
  // Orde: tutorial → rutas do nivel do alumno (primaria ou secundaria polo curso) → o resto.
  const nivelAlumno = /prim/.test(usuario?.curso || '') || !usuario?.curso ? 'primary' : 'secondary'
  const peso = (j) => j.id === TUTORIAL_ID ? 0 : (j.level || 'primary') === nivelAlumno ? 1 : 2
  const porEmpezar  = catalogo.filter(j => !empezadas.has(j.id)).sort((a, b) => peso(a) - peso(b))

  // OLLO: `/journeys` devolve `label` como OBXECTO {gl,es,en,pt},
  // mentres `/progreso/rutas` devólveo como string. Non se tratan igual.
  const labelCatalogo = (j) => j.label?.[idioma] || j.label?.gl || j.id
  // ── FIN: carga_catalogo ───────────────────────────────

  // ── INICIO: carga_stops ───────────────────────────────
  // SendaVisual precisa os stops completos → GET /journeys/:id
  // Se a ruta xa non existe (404) ou quedou sen pasos, márcase como
  // desaparecida: a portada avisa e ofrece o catálogo en vez dun botón
  // que leva a un erro.
  const [rutaDesaparecida, setRutaDesaparecida] = useState(false)
  useEffect(() => {
    if (!destacada?.id) { setStops([]); setCargando(false); setRutaDesaparecida(false); return }
    let vivo = true
    setCargando(true)
    setRutaDesaparecida(false)
    fetch(`${API}/journeys/${destacada.id}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(j => {
        if (!vivo) return
        const ordenados = ((j && j.stops) || [])
          .filter(s => s.nodo)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        setStops(ordenados)
        setRutaDesaparecida(ordenados.length === 0)
        setCargando(false)
      })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destacada?.id])
  // ── FIN: carga_stops ──────────────────────────────────

  // ── INICIO: cartas ────────────────────────────────────
  const [cartas, setCartas] = useState([])
  const [verCartas, setVerCartas] = useState(false)
  const [verOficio, setVerOficio] = useState(null)   // id de profesión de Oberón aberta
  useEffect(() => {
    let vivo = true
    fetch(`${API}/cartas`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : { cartas: [] })
      .catch(() => ({ cartas: [] }))
      .then(d => { if (vivo) setCartas(Array.isArray(d.cartas) ? d.cartas : []) })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── FIN: cartas ───────────────────────────────────────

  // ── INICIO: mision_da_semana ──────────────────────────
  // Un tema por semana (rota pola semana do ano, determinista: o mesmo
  // para toda a clase). Completar as 3 rutas dá a carta da misión e +50 XP,
  // unha soa vez: o backend só devolve nova=true a primeira vez que se
  // garda a carta, e o XP colga desa resposta.
  const misionSemana = misionDaSemana()
  const feitasSet   = new Set((rutas || []).filter(r => r.completada).map(r => r.id))
  const misionRutas = misionSemana.rutas.map(id => {
    const j = catalogo.find(x => x.id === id)
    const r = (rutas || []).find(x => x.id === id)
    return { id, feita: feitasSet.has(id), label: (j && labelCatalogo(j)) || r?.[`label_${idioma}`] || r?.label || id }
  })
  const misionFeitas   = misionRutas.filter(r => r.feita).length
  const misionCompleta = misionFeitas === misionSemana.rutas.length
  const [cartaMision, setCartaMision] = useState(null)   // carta acabada de gañar (celebración)
  useEffect(() => {
    if (!misionCompleta || !usuario || usuario.explorador) return
    if (cartas.includes(misionSemana.carta)) return
    let vivo = true
    fetch(`${API}/cartas/${misionSemana.carta}`, { method: 'POST', headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!vivo || !d) return
        setCartas(c => c.includes(misionSemana.carta) ? c : [...c, misionSemana.carta])
        if (d.nova) {
          rexistrarXP('MISION_SEMANA', misionSemana.id)
          try { sonXP(50) } catch (e) {}
          setCartaMision(CARTAS.cartas.find(c => c.id === misionSemana.carta) || null)
        }
      })
      .catch(() => {})
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [misionCompleta, cartas.length])
  // ── FIN: mision_da_semana ─────────────────────────────

  const indice     = Math.min(destacada?.indice || 0, Math.max(0, stops.length - 1))

  // ── INICIO: frase_do_dia (banco de frases de Lúa, sen IA) ──
  // Saúdo pola hora + misión segundo o estado da ruta. As dúas saen do
  // banco (src/data/frasesLua.json): a mesma frase todo o día, outra mañá.
  const nome  = usuario?.nome ? usuario.nome.split(' ')[0] : ''
  const labelStop = (s) => s?.nodo?.[`label_${idioma}`] || s?.nodo?.label_gl || ''
  const saudo  = fraseLua({ idioma, nome })
  const mision = fraseLua({
    idioma, nome, hora: -1,
    // 'novas': o empezado está feito pero hai camiños por estrear no catálogo
    ruta: activa ? 'activa' : porEmpezar.length > 0 ? (todasFeitas ? 'novas' : 'ningunha') : todasFeitas ? 'todas' : 'ningunha',
    nodo: activa ? labelStop(stops[indice]) : '',
    anterior: activa && indice > 0 ? labelStop(stops[indice - 1]) : '',
    // Metrónomo (§3.4): se o último avance foi hoxe, Lúa dío e non apura.
    hoxe: !!(activa?.ts && new Date(activa.ts).toDateString() === new Date().toDateString())
  })
  // Misión da semana: se queda unha soa ruta, Lúa empúxaa; se xa está feita e non hai
  // camiño activo, dío. Se non, a misión do día de sempre.
  const pendenteSemana = misionRutas.find(r => !r.feita)
  const misionSemanal = !usuario?.explorador && misionFeitas === 2 && pendenteSemana
    ? fraseLua({ idioma, nome, hora: -1, misionFalta: 1, ruta: pendenteSemana.label })
    : (misionCompleta && !activa ? fraseLua({ idioma, nome, hora: -1, misionFalta: 0 }) : '')
  const fraseDoDia = [saudo, misionSemanal || mision].filter(Boolean).join(' ')
  // ── FIN: frase_do_dia ─────────────────────────────────
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

        {/* Saída explícita: a portada substitúe a app enteira (tamén a barra
            inferior do móbil), así que precisa a súa propia porta de volta. */}
        <button onClick={() => onExplorar && onExplorar()}
          style={{
            background: 'none', border: 'none', color: C.secundario, fontSize: 13,
            cursor: 'pointer', padding: '0 0 14px', fontFamily: 'inherit'
          }}>
          {t(idioma, 'portadaVolverAoMapa')}
        </button>

        {/* ── INICIO: zona_1_lua ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <LuaMascota size={44} />
          <div style={{
            flex: '1 1 200px', background: C.tarxeta, border: `1px solid ${C.borde}`,
            borderRadius: 10, padding: '11px 16px', fontSize: 14.5, color: '#c9d6ef'
          }}>
            {fraseDoDia}
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
          ) : destacada && rutaDesaparecida ? (
            /* A ruta con progreso xa non existe no backend */
            <div role="status" style={{ padding: '14px 0 4px', textAlign: 'center', fontSize: 14, color: '#c9d6ef', lineHeight: 1.6 }}>
              {t(idioma, 'portadaRutaDesaparecida')}
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
          {/* Os OUTROS camiños empezados (a medias ou feitos) que non son o destacado:
              antes desaparecían da portada e o neno perdíaos de vista. */}
          {(() => {
            const outros = (rutas || []).filter(r => r.id !== destacada?.id)
            const aMedias = outros.filter(r => !r.completada)
            const feitos  = outros.filter(r => r.completada)
            const fila = (r, feito) => (
              <div key={r.id}
                {...activable(() => onAbrirRuta && onAbrirRuta(r.id))}
                aria-label={t(idioma, 'portadaContinuarRutaAria', r[`label_${idioma}`] || r.label || r.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 8,
                         background: '#0d1729', border: `1px solid ${C.borde}`, borderRadius: 12, cursor: 'pointer',
                         opacity: feito ? 0.8 : 1 }}>
                <span style={{ fontSize: 20 }}>{r.icono || '📚'}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.texto, flex: 1, minWidth: 0 }}>
                  {r[`label_${idioma}`] || r.label || r.id}
                </span>
                <span style={{ fontSize: 11.5, color: C.secundario }}>
                  {feito ? '🌟' : t(idioma, 'portadaParadaDe', Math.min((r.indice || 0) + 1, r.totalPasos || 1), r.totalPasos || '?')}
                </span>
                <span style={{ fontSize: 12.5, color: feito ? C.verde : C.dourado, fontWeight: 600 }}>
                  {feito ? t(idioma, 'portadaVolverPercorrer') : t(idioma, 'portadaContinuar')} →
                </span>
              </div>
            )
            const seccion = (titulo, lista, feito) => lista.length > 0 && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.borde}` }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.secundario, marginBottom: 10, fontWeight: 600 }}>
                  {t(idioma, titulo)}
                </div>
                {lista.map(r => fila(r, feito))}
              </div>
            )
            return <>{seccion('portadaCaminosAMedias', aMedias, false)}{seccion('portadaCaminosFeitos', feitos, true)}</>
          })()}

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
                    aria-label={t(idioma, 'portadaAbrirRutaAria', labelCatalogo(j))}
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
                    {(j.level || 'primary') !== 'primary' && (
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.azul,
                                     border: `1px solid ${C.azul}`, borderRadius: 8, padding: '2px 7px', fontWeight: 700 }}>
                        {t(idioma, j.level === 'expert' ? 'experto' : 'percorridoSecundaria')}
                      </span>
                    )}
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

        {/* ── INICIO: zona_misión_semana ─────────────────── */}
        {/* Misión da semana: 3 rutas dun tema, carta especial + XP ao rematar (src/data/misions.json). */}
        <Tarxeta titulo={t(idioma, 'misionSemana')} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 34, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{misionSemana.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: C.texto, marginBottom: 4 }}>
                {misionSemana.titulo[idioma] || misionSemana.titulo.gl}
              </div>
              <div style={{ fontSize: 13, color: C.secundario, lineHeight: 1.5, marginBottom: 10 }}>
                {misionSemana.texto[idioma] || misionSemana.texto.gl}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}
                aria-label={t(idioma, 'misionSemanaProgreso', misionFeitas, misionSemana.rutas.length)}>
                {misionRutas.map(r => (
                  <li key={r.id}>
                    <button type="button" onClick={() => onAbrirRuta && onAbrirRuta(r.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                        background: r.feita ? '#1a2d24' : '#101a30', border: `1px solid ${r.feita ? '#2f6b4a' : '#22304f'}`,
                        borderRadius: 10, padding: '7px 10px', color: r.feita ? '#8fe0b0' : C.texto,
                        fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                      <span aria-hidden="true" style={{ width: 18, textAlign: 'center' }}>{r.feita ? '✅' : '○'}</span>
                      <span style={{ flex: 1, textDecoration: r.feita ? 'line-through' : 'none', opacity: r.feita ? 0.85 : 1 }}>{r.label}</span>
                      {!r.feita && <span aria-hidden="true" style={{ color: C.secundario }}>→</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 10, fontSize: 12.5, color: misionCompleta ? '#8fe0b0' : C.secundario }}>
                {misionCompleta ? `🃏 ${t(idioma, 'misionSemanaFeita')}` : `${t(idioma, 'misionSemanaProgreso', misionFeitas, misionSemana.rutas.length)} · ${t(idioma, 'misionSemanaPremio')}`}
              </div>
            </div>
          </div>
        </Tarxeta>
        {cartaMision && (
          <div role="dialog" aria-modal="true" aria-label={t(idioma, 'misionSemanaFeita')} onClick={() => setCartaMision(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(5,9,20,0.86)', display: 'grid', placeItems: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: 360, width: '100%' }}>
              <div style={{ textAlign: 'center', color: '#8fe0b0', fontFamily: 'Georgia, serif', fontSize: 18, marginBottom: 12 }}>
                {t(idioma, 'misionSemanaFeita')}
              </div>
              <CartaRevelada carta={cartaMision} idioma={idioma} />
              <button type="button" onClick={() => setCartaMision(null)} autoFocus
                style={{ marginTop: 14, width: '100%', background: '#e2b96a', color: '#111', border: 'none', borderRadius: 22, padding: '10px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t(idioma, 'pechar')}
              </button>
            </div>
          </div>
        )}
        {/* ── FIN: zona_misión_semana ────────────────────── */}

        {/* ── INICIO: zona_3_tarxetas ────────────────────── */}
        {/* O teu soño — v1 ESTÁTICA (placeholder de Oberón, sen endpoint).
            Leva a marca "proximamente" para que non pareza tocable. */}
        <Tarxeta titulo={t(idioma, 'portadaOTeuSono')} style={{ marginBottom: 14 }}>
          {(() => {
            // O soño v1: o oficio escollido (SeleccionRol) ou o camiño; e a porta a
            // Oberón para o oficio que xa ten árbore real (panadeiro), que se abre
            // ao completar o tutorial do pan. Sen endpoint novo: todo é datos que xa hai.
            const prof = usuario?.profesion_personaxe ? atoparProfesion(usuario.profesion_personaxe) : null
            const rol  = ROLES.find(r => r.id === usuario?.rol_personaxe)
            const panFeito = (rutas || []).some(r => r.id === 'a_viaxe_do_pan' && r.completada)
            const oberonId = (prof && OFICIOS_OBERON[prof.id]) || (panFeito ? 'panadeiro' : null)
            const botonEstilo = (cor) => ({
              background: 'none', border: `1px solid ${cor}`, color: cor, borderRadius: 18,
              padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            })
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 30 }}>{prof ? prof.icono : rol ? rol.icono : '✨'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: rol?.cor || C.rosa }}>
                      {prof ? prof.label : rol ? rol.label : t(idioma, 'sonoSenCamino')}
                    </div>
                    <div style={{ fontSize: 12, color: C.secundario, marginTop: 3 }}>
                      {prof ? `${t(idioma, 'sonoOficio')} · ${rol?.label || ''}` : rol ? t(idioma, 'sonoCamino') : ''}
                    </div>
                  </div>
                  <button onClick={() => onEscollerCamino && onEscollerCamino()} style={botonEstilo(C.secundario)}>
                    {rol ? t(idioma, 'sonoCambiar') : t(idioma, 'sonoEscoller')}
                  </button>
                </div>

                {/* A porta a Oberón: o oficio de panadeiro, desbloqueado polo tutorial */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                              padding: '10px 12px', background: '#0d1424', borderRadius: 10, border: `1px dashed ${oberonId ? C.dourado : C.borde}` }}>
                  <span style={{ fontSize: 22, filter: oberonId ? 'none' : 'grayscale(1) brightness(0.6)' }}>🍞</span>
                  <div style={{ flex: '1 1 200px', fontSize: 12.5, lineHeight: 1.5, color: oberonId ? C.texto : C.secundario }}>
                    {oberonId ? t(idioma, 'sonoPanAberto') : t(idioma, 'sonoPanBloqueado')}
                  </div>
                  {oberonId && (
                    <button onClick={() => setVerOficio(oberonId)} style={{ ...botonEstilo(C.dourado), background: C.dourado, color: '#412402' }}>
                      {t(idioma, 'sonoVerOficio')} →
                    </button>
                  )}
                </div>

                {onTest && (
                  <button onClick={onTest} style={{ background: 'none', border: 'none', color: C.azul, fontSize: 12, cursor: 'pointer',
                                                    textAlign: 'left', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                    {t(idioma, 'sonoTest')}
                  </button>
                )}
              </div>
            )
          })()}
        </Tarxeta>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>

          {/* Cartas — a colección (gáñanse completando camiños e cruzando portais) */}
          <Tarxeta titulo={t(idioma, 'portadaCartas')} onClick={() => setVerCartas(true)} style={{ flex: '1 1 240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 44, height: 40, flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 4, width: 26, height: 34,
                  background: '#1b2742', border: `1px solid ${C.azul}`, borderRadius: 4,
                  transform: 'rotate(-12deg)', display: 'grid', placeItems: 'center', fontSize: 15
                }}>{CARTAS.cartas.find(c => cartas.includes(c.id))?.emoji || ''}</div>
                <div style={{
                  position: 'absolute', left: 14, top: 2, width: 26, height: 34,
                  background: '#231b3a', border: `1px solid ${C.rosa}`, borderRadius: 4,
                  transform: 'rotate(9deg)', display: 'grid', placeItems: 'center', fontSize: 15
                }}>{CARTAS.cartas.filter(c => cartas.includes(c.id))[1]?.emoji || ''}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.texto }}>
                  {t(idioma, 'cartasTidas', cartas.length, CARTAS.cartas.length)}
                </div>
                <div style={{ fontSize: 12, color: C.secundario, marginTop: 3 }}>
                  {t(idioma, 'portadaCartasAbrir')} →
                </div>
              </div>
            </div>
          </Tarxeta>

          {/* Explorar libre — mesma acción que "Explorar o universo" */}
          <Tarxeta titulo={t(idioma, 'portadaExplorarLibre')}
            /* Explorar libre empeza no nodo onde o neno está (a súa parada actual): o
               mapa ábrese sobre algo coñecido e coas súas conexións, non sobre 1.800 estrelas. */
            onClick={() => onExplorar && onExplorar(stops[indice]?.nodo?.id || null)}
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

      {verCartas && (
        <ColeccionCartas idioma={idioma} tidas={cartas} onPechar={() => setVerCartas(false)} />
      )}

      {/* O oficio por dentro: a vista de Oberón envolta cunha barra de volta */}
      {verOficio && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 170, background: '#050a14', overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', background: 'rgba(5,10,20,0.92)', borderBottom: `1px solid ${C.borde}` }}>
            <button onClick={() => setVerOficio(null)}
              style={{ background: 'none', border: 'none', color: C.dourado, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t(idioma, 'sonoVolverPortada')}
            </button>
            <span style={{ fontSize: 12, color: C.secundario }}>{t(idioma, 'sonoOficio')} · Oberón</span>
          </div>
          <OberonProfesionVista profesionId={verOficio} />
        </div>
      )}
    </div>
  )
}
