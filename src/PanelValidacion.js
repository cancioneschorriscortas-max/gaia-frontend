import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════
// PanelValidacion — Cola de validación de envíos
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// API pública INTACTA: idioma.
//
// ⚠ NOTA DE SEGURIDADE ⚠
//   Os tres fetches (GET /envios, PUT /envio/:id/resolver,
//   DELETE /envio/:id) van SEN cabeceira Authorization, igual
//   que no ficheiro orixinal. Intentouse engadir authHeaders()
//   pero iso rompía a funcionalidade porque o backend actual
//   responde distinto segundo se hai ou non cabeceira.
//
//   TODO pendente: arranxar backend para que autentique e
//   verifique rol profesor nos 3 endpoints; engadir entón
//   authHeaders() aquí. Sen iso, a seguridade depende
//   unicamente de que estes endpoints estean protexidos no
//   servidor.
//
// MELLORAS VISUAIS:
//   1. Paleta v1.1 completa.
//   2. Status con cores de var(--gaia-*).
//   3. Emojis (📭, ✏️, ✨, ✓, ✗, ↻, ▲, ▼) → SVGs.
//   4. Tipografía coherente coa app.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cor_status ───────────────────────────────
const COR_STATUS = {
  pending: {
    bg:     'var(--gaia-accent-bg)',
    border: 'var(--gaia-accent-border)',
    text:   'var(--gaia-accent)',
    fb:     '#e8a547',
    label:  'Pendente'
  },
  validado: {
    bg:     'var(--gaia-constellation-bg)',
    border: 'var(--gaia-constellation-border)',
    text:   'var(--gaia-constellation)',
    fb:     '#5dd4a8',
    label:  'Validado'
  },
  rexeitado: {
    bg:     'var(--gaia-danger-bg)',
    border: 'var(--gaia-danger-border)',
    text:   'var(--gaia-danger)',
    fb:     '#f87171',
    label:  'Rexeitado'
  }
}
// ── FIN: cor_status ──────────────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoChevron = ({ aberto, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconoEditar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconoNovo = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconoCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoX = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconoRecargar = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)
const IconoCaixaBaleira = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)
// ── FIN: iconos_svg ──────────────────────────────────

function TarxetaEnvio({ envio, onResolver, onBorrar }) {
  const [expandido, setExpandido] = useState(false)
  const [nota, setNota] = useState('')
  const [resolving, setResolving] = useState(false)
  const cor = COR_STATUS[envio.status] || COR_STATUS.pending

  const handleResolver = async (accion) => {
    setResolving(true)
    await onResolver(envio.id, accion, nota)
    setResolving(false)
  }

  const data = envio.created_at
    ? new Date(envio.created_at).toLocaleDateString('gl', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  return (
    <div style={{
      background: 'var(--gaia-cosmos-800)',
      border: `1px solid ${cor.fb}44`,
      borderLeft: `3px solid ${cor.fb}`,
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden'
    }}>

      {/* ═══ CABECEIRA DA TARXETA ═══ */}
      <div
        onClick={() => setExpandido(!expandido)}
        style={{
          padding: '13px 16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          transition: 'background 150ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4
          }}>
            <div style={{
              color: envio.nodo_existente ? 'var(--gaia-system)' : 'var(--gaia-accent)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
              {envio.nodo_existente ? <IconoEditar /> : <IconoNovo />}
            </div>
            <span style={{
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 600,
              color: 'var(--gaia-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}>
              {envio.nodo_existente || envio.label_gl}
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              padding: '3px 8px',
              background: cor.bg,
              color: cor.text,
              border: `1px solid ${cor.border}`,
              borderRadius: 9999,
              flexShrink: 0,
              letterSpacing: '0.05em',
              fontWeight: 600
            }}>
              {cor.label}
            </span>
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.01em'
          }}>
            {envio.autor}{envio.centro ? ` · ${envio.centro}` : ''} · {data}
          </div>
        </div>
        <div style={{ color: 'var(--gaia-text-tertiary)' }}>
          <IconoChevron aberto={expandido} />
        </div>
      </div>

      {/* ═══ DETALLE EXPANDIDO ═══ */}
      {expandido && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid var(--gaia-cosmos-500)'
        }}>

          {/* Datos básicos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            margin: '14px 0'
          }}>
            {[
              { k: 'Autor', v: envio.autor },
              { k: 'Centro', v: envio.centro },
              { k: 'Tipo nodo', v: envio.tipo_nodo },
              { k: envio.nodo_existente ? 'Nodo existente' : 'Nodo novo', v: envio.nodo_existente || envio.label_gl }
            ].map(item => (
              <div key={item.k}>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  marginBottom: 3,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {item.k}
                </div>
                <div style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-text-primary)'
                }}>
                  {item.v || '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Explicación */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              marginBottom: 5,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              Explicación
            </div>
            <p style={{
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              color: 'var(--gaia-text-primary)',
              margin: 0,
              lineHeight: 1.7,
              padding: '11px 14px',
              background: 'var(--gaia-cosmos-900)',
              border: '1px solid var(--gaia-cosmos-500)',
              borderRadius: 8
            }}>
              {envio.explicacion_gl}
            </p>
          </div>

          {/* Relacións */}
          {envio.relacions?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 6,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Relacións propostas
              </div>
              {envio.relacions.map((r, i) => (
                <div key={i} style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-concept)',
                  marginBottom: 4
                }}>
                  <span style={{ fontFamily: 'var(--gaia-font-mono)', fontWeight: 600 }}>{r.tipo}</span>
                  <span style={{ color: 'var(--gaia-text-disabled)' }}> → </span>
                  <span style={{ color: 'var(--gaia-system)' }}>{r.nodo_target}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recurso */}
          {envio.recurso_url && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 4,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Recurso
              </div>
              <a
                href={envio.recurso_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  color: 'var(--gaia-system)',
                  wordBreak: 'break-all',
                  textDecoration: 'none',
                  borderBottom: '1px dotted var(--gaia-system)'
                }}>
                <span style={{ color: 'var(--gaia-text-tertiary)' }}>{envio.recurso_tipo}: </span>
                {envio.recurso_url}
              </a>
            </div>
          )}

          {/* Nota do profesor se xa foi resolto */}
          {envio.nota_profesor && (
            <div style={{
              marginBottom: 14,
              padding: '10px 14px',
              background: 'var(--gaia-cosmos-900)',
              border: '1px solid var(--gaia-cosmos-500)',
              borderRadius: 8
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 4,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Nota do profesor
              </div>
              <p style={{
                fontSize: 12,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                margin: 0,
                lineHeight: 1.6,
                fontStyle: 'italic'
              }}>
                {envio.nota_profesor}
              </p>
            </div>
          )}

          {/* Accións só se está pendente */}
          {envio.status === 'pending' && (
            <div style={{ marginTop: 18 }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--gaia-font-mono)',
                color: 'var(--gaia-text-tertiary)',
                marginBottom: 8,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Nota para o estudante (opcional)
              </div>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="ex: Boa aportación. Engadimos o nodo á constelación correcta."
                style={{
                  width: '100%',
                  padding: 10,
                  background: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  color: 'var(--gaia-text-primary)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  height: 64,
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 10,
                  outline: 'none',
                  lineHeight: 1.5
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleResolver('validar')}
                  disabled={resolving}
                  style={{
                    flex: 2,
                    padding: '11px',
                    background: resolving ? 'var(--gaia-cosmos-700)' : 'var(--gaia-constellation-bg)',
                    border: '1px solid var(--gaia-constellation-border)',
                    color: 'var(--gaia-constellation)',
                    borderRadius: 8,
                    cursor: resolving ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    letterSpacing: '0.02em',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={e => { if (!resolving) e.currentTarget.style.background = 'rgba(93, 212, 168, 0.2)' }}
                  onMouseLeave={e => { if (!resolving) e.currentTarget.style.background = 'var(--gaia-constellation-bg)' }}>
                  <IconoCheck /> Validar e publicar
                </button>
                <button
                  onClick={() => handleResolver('rexeitar')}
                  disabled={resolving}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'var(--gaia-danger-bg)',
                    border: '1px solid var(--gaia-danger-border)',
                    color: 'var(--gaia-danger)',
                    borderRadius: 8,
                    cursor: resolving ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontFamily: 'var(--gaia-font-body)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={e => { if (!resolving) e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)' }}
                  onMouseLeave={e => { if (!resolving) e.currentTarget.style.background = 'var(--gaia-danger-bg)' }}>
                  <IconoX /> Rexeitar
                </button>
              </div>
            </div>
          )}

          {/* Borrar */}
          <button
            onClick={() => onBorrar(envio.id)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '7px',
              background: 'transparent',
              border: '1px dashed var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-disabled)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-danger)'
              e.currentTarget.style.borderColor = 'var(--gaia-danger-border)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-disabled)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            }}>
            Borrar este envío
          </button>

        </div>
      )}
    </div>
  )
}

function PanelValidacion({ idioma = 'gl' }) {

  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('pending')

  // ── INICIO: cargar_envios ────────────────────────────
  // IMPORTANTE: Os fetches aquí non levan authHeaders() porque o
  // backend, tal como está hoxe, responde distinto segundo se hai
  // ou non cabeceira Authorization. Manter como o orixinal.
  // TODO: Facer que o backend autentique e verifique rol profesor
  // nos endpoints /envios, /envio/:id/resolver e /envio/:id, e
  // engadir authHeaders aquí unha vez arranxado o backend.
  const cargar = () => {
    setCargando(true)
    const url = filtroStatus === 'todos'
      ? `${API}/envios`
      : `${API}/envios?status=${filtroStatus}`
    fetch(url)
      .then(r => r.json())
      .then(data => { setEnvios(data.envios || []); setCargando(false) })
      .catch(() => setCargando(false))
  }

  useEffect(() => { cargar() /* eslint-disable-next-line */ }, [filtroStatus])
  // ── FIN: cargar_envios ───────────────────────────────

  // ── INICIO: resolver_envio ───────────────────────────
  const handleResolver = async (id, accion, nota) => {
    await fetch(`${API}/envio/${id}/resolver`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion, nota_profesor: nota })
    })
    cargar()
  }
  // ── FIN: resolver_envio ──────────────────────────────

  // ── INICIO: borrar_envio ─────────────────────────────
  const handleBorrar = async (id) => {
    if (!window.confirm('Borrar este envío?')) return
    await fetch(`${API}/envio/${id}`, { method: 'DELETE' })
    cargar()
  }
  // ── FIN: borrar_envio ────────────────────────────────

  const pendentes = envios.filter(e => e.status === 'pending').length

  const tabBtn = (v) => {
    const activo = filtroStatus === v
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      fontSize: 11,
      fontFamily: 'var(--gaia-font-body)',
      fontWeight: activo ? 700 : 500,
      cursor: 'pointer',
      background: activo ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-800)',
      color: activo ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-tertiary)',
      border: `1px solid ${activo ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
      borderRadius: 9999,
      letterSpacing: '0.02em',
      transition: 'all 150ms ease'
    }
  }

  return (
    <div style={{
      padding: 24,
      maxWidth: 760,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)'
    }}>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-accent)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 6
          }}>
            Cola de validación
          </div>
          <h2 style={{
            color: 'var(--gaia-text-primary)',
            fontFamily: 'var(--gaia-font-display)',
            margin: '0 0 6px',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            Envíos pendentes de revisión
          </h2>
          <p style={{
            color: 'var(--gaia-text-secondary)',
            fontFamily: 'var(--gaia-font-body)',
            fontSize: 13,
            margin: 0,
            lineHeight: 1.5
          }}>
            Revisa e publica os envíos dos estudantes
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {pendentes > 0 && (
            <div style={{
              padding: '5px 12px',
              background: 'var(--gaia-accent-bg)',
              border: '1px solid var(--gaia-accent-border)',
              borderRadius: 9999,
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-accent)',
              fontWeight: 600,
              letterSpacing: '0.02em'
            }}>
              {pendentes} pendente{pendentes !== 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={cargar}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: 'var(--gaia-cosmos-800)',
              border: '1px solid var(--gaia-cosmos-400)',
              color: 'var(--gaia-text-tertiary)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'var(--gaia-font-body)',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--gaia-text-primary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
            }}>
            <IconoRecargar />
            Actualizar
          </button>
        </div>
      </div>

      {/* ═══ FILTROS STATUS ═══ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabBtn('pending')}   onClick={() => setFiltroStatus('pending')}>Pendentes</button>
        <button style={tabBtn('validado')}  onClick={() => setFiltroStatus('validado')}>Validados</button>
        <button style={tabBtn('rexeitado')} onClick={() => setFiltroStatus('rexeitado')}>Rexeitados</button>
        <button style={tabBtn('todos')}     onClick={() => setFiltroStatus('todos')}>Todos</button>
      </div>

      {/* ═══ LISTA DE ENVÍOS ═══ */}
      {cargando && (
        <div style={{
          color: 'var(--gaia-text-tertiary)',
          textAlign: 'center',
          padding: 48,
          fontSize: 13,
          fontFamily: 'var(--gaia-font-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          Cargando envíos...
        </div>
      )}

      {!cargando && envios.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '56px 20px',
          color: 'var(--gaia-text-tertiary)',
          border: '1px dashed var(--gaia-cosmos-400)',
          borderRadius: 10,
          background: 'var(--gaia-cosmos-800)'
        }}>
          <div style={{
            display: 'inline-flex',
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'var(--gaia-cosmos-700)',
            border: '1px solid var(--gaia-cosmos-400)',
            color: 'var(--gaia-text-tertiary)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 14
          }}>
            <IconoCaixaBaleira size={28} />
          </div>
          <div style={{
            fontSize: 14,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)'
          }}>
            {filtroStatus === 'pending'
              ? 'Non hai envíos pendentes'
              : 'Non hai envíos nesta categoría'
            }
          </div>
        </div>
      )}

      {!cargando && envios.map(e => (
        <TarxetaEnvio key={e.id} envio={e} onResolver={handleResolver} onBorrar={handleBorrar} />
      ))}

    </div>
  )
}

export default PanelValidacion