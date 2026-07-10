import { useState } from 'react'
import { ROLES }    from '../roles'
import { useUser }  from '../contexts/UserContext'
import { t } from '../i18n'
// ═══════════════════════════════════════════════════════════
// SeleccionRol — Escolla de camiño para alumnado
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Pantalla onde o alumnado escolle o seu rol
// ("camiño") e a súa profesión/especialidade.
//
// Dous pasos: rol → profesion
//
// Respecta as cores propias de cada rol (r.cor) porque forman
// parte da identidade de cada personaxe. Só actualízanse a
// cabeceira, o fondo e as superficies da UI.
//
// API pública sen cambios: onFin, idioma
// ═══════════════════════════════════════════════════════════

// ── INICIO: icono_check ──────────────────────────────
const IconoCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconoFlechaDerecha = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconoFlechaEsquerda = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)
// ── FIN: icono_check ─────────────────────────────────

function SeleccionRol({ onFin, idioma = 'gl' }) {

  const { usuario, actualizarRolPersonaxe } = useUser()
  const xenero = usuario?.xenero || 'm'

  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  const [paso,            setPaso]            = useState('rol')
  const [cargando,        setCargando]        = useState(false)
  const [bloqueAberto,    setBloqueAberto]    = useState(null)

  const rol = ROLES.find(r => r.id === rolSeleccionado)

  // ── INICIO: confirmar_rol ────────────────────────────
  const confirmarRol = async (profesionId = '', bloqueId = '') => {
    setCargando(true)
    await actualizarRolPersonaxe(rolSeleccionado, bloqueId, profesionId)
    setCargando(false)
    onFin()
  }
  // ── FIN: confirmar_rol ───────────────────────────────

  // ── INICIO: fondo_cosmico_comun ──────────────────────
  const fondoComun = () => (
    <>
      {/* Fondo cósmico */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(232, 165, 71, 0.05) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 90%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />
      {/* Estrelas */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 10% 18%, rgba(232, 165, 71, 0.22), transparent),
          radial-gradient(1px 1px at 78% 72%, rgba(93, 212, 168, 0.2), transparent),
          radial-gradient(1px 1px at 42% 35%, rgba(155, 179, 255, 0.2), transparent),
          radial-gradient(1px 1px at 85% 25%, rgba(125, 211, 252, 0.2), transparent)
        `,
        opacity: 0.5,
        pointerEvents: 'none'
      }} />
    </>
  )
  // ── FIN: fondo_cosmico_comun ─────────────────────────

  // ── INICIO: render_seleccion_rol ─────────────────────
  const renderSeleccionRol = () => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      overflowY: 'auto',
      padding: '48px 20px'
    }}>

      {fondoComun()}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960 }}>

        {/* ═══ CABECEIRA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            letterSpacing: '0.25em',
            marginBottom: 14,
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            Arquivo GAIA
          </div>
          <h1 style={{
            fontFamily: 'var(--gaia-font-display)',
            fontSize: 'clamp(30px, 4vw, 44px)',
            fontWeight: 700,
            color: 'var(--gaia-accent)',
            letterSpacing: '-0.01em',
            margin: '0 0 12px 0',
            lineHeight: 1.1,
            textShadow: '0 0 30px rgba(232, 165, 71, 0.3)'
          }}>
            Escolle o teu camiño
          </h1>
          <p style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            margin: 0
          }}>
            Podes cambialo cando queiras.
          </p>
        </div>

        {/* ═══ CARDS DE ROL ═══ */}
        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 44
        }}>
          {ROLES.map(r => {
            const seleccionado = rolSeleccionado === r.id
            return (
              <div key={r.id}
                onClick={() => setRolSeleccionado(r.id)}
                style={{
                  width: 260,
                  cursor: 'pointer',
                  background: seleccionado
                    ? `linear-gradient(180deg, rgba(10, 16, 32, 0.4), rgba(10, 16, 32, 0.85))`
                    : 'var(--gaia-cosmos-800)',
                  border: `2px solid ${seleccionado ? r.cor : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 300ms ease',
                  transform: seleccionado ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: seleccionado ? `0 0 40px ${r.cor}44, 0 12px 32px rgba(0, 0, 0, 0.4)` : 'none'
                }}
                onMouseEnter={e => {
                  if (!seleccionado) {
                    e.currentTarget.style.border = `2px solid ${r.cor}66`
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={e => {
                  if (!seleccionado) {
                    e.currentTarget.style.border = '2px solid var(--gaia-cosmos-400)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {/* Imaxe */}
                <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                  <img
                    src={xenero === 'f' ? r.image_f : r.image_m}
                    alt={r.label}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      filter: seleccionado ? 'brightness(1)' : 'brightness(0.7)',
                      transition: 'filter 300ms ease'
                    }}
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.style.background = `${r.cor}22`
                      e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:64px">${r.icono}</div>`
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, rgba(10, 16, 32, 0.85) 100%)'
                  }} />

                  {/* Check visible se seleccionado */}
                  {seleccionado && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 30, height: 30,
                      borderRadius: '50%',
                      background: r.cor,
                      color: 'var(--gaia-cosmos-900)',
                      display: 'grid', placeItems: 'center',
                      boxShadow: `0 0 16px ${r.cor}99`
                    }}>
                      <IconoCheck size={14} />
                    </div>
                  )}
                </div>

                {/* Contido */}
                <div style={{ padding: '18px 22px 22px' }}>
                  <h3 style={{
                    color: r.cor,
                    fontSize: 22,
                    fontFamily: 'var(--gaia-font-display)',
                    fontWeight: 700,
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.01em'
                  }}>
                    {r.label}
                  </h3>
                  <p style={{
                    color: 'var(--gaia-text-secondary)',
                    fontSize: 13,
                    fontFamily: 'var(--gaia-font-body)',
                    margin: '0 0 14px 0',
                    lineHeight: 1.45,
                    minHeight: 38
                  }}>
                    {t(idioma, r.descripcion)}
                  </p>

                  {/* Habilidades */}
                  <div style={{
                    display: 'flex',
                    gap: 6,
                    justifyContent: 'center'
                  }}>
                    {r.habilidades.map((h, i) => (
                      <div key={t(idioma, h)} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        background: 'var(--gaia-cosmos-700)',
                        borderRadius: 8,
                        fontSize: 10,
                        fontFamily: 'var(--gaia-font-body)',
                        color: 'var(--gaia-text-tertiary)',
                        border: '1px solid var(--gaia-cosmos-400)',
                        minWidth: 54
                      }}>
                        <span style={{ fontSize: 16 }}>{r.iconosHab[i]}</span>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ═══ BARRA DE ACCIÓN ═══ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={onFin}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              color: 'var(--gaia-text-tertiary)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.color = 'var(--gaia-text-secondary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
            }}>
            Decidir máis tarde
          </button>

          {rolSeleccionado && (
            <button
              onClick={() => setPaso('profesion')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 32px',
                background: rol?.cor || 'var(--gaia-accent)',
                color: 'var(--gaia-cosmos-900)',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: 700,
                letterSpacing: '0.025em',
                cursor: 'pointer',
                boxShadow: `0 0 24px ${rol?.cor || '#e8a547'}44`,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 32px ${rol?.cor || '#e8a547'}66`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 0 24px ${rol?.cor || '#e8a547'}44`
              }}>
              Continuar como {rol?.label}
              <IconoFlechaDerecha />
            </button>
          )}
        </div>

        {/* ═══ INFO XP NIVEL ═══ */}
        {usuario && (
          <div style={{
            textAlign: 'center',
            marginTop: 36,
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-disabled)',
            letterSpacing: '0.05em'
          }}>
            Nivel 1 · {usuario.xp_total || 0} / 100 XP · Podes cambiar de camiño cando queiras.
          </div>
        )}
      </div>
    </div>
  )
  // ── FIN: render_seleccion_rol ────────────────────────

  // ── INICIO: render_seleccion_profesion ───────────────
  const renderSeleccionProfesion = () => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-text-primary)',
      overflowY: 'auto',
      padding: '48px 20px'
    }}>

      {fondoComun()}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 720 }}>

        {/* ═══ CABECEIRA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: rol?.cor || 'var(--gaia-accent)',
            letterSpacing: '0.2em',
            marginBottom: 10,
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: rol?.cor || 'var(--gaia-accent)',
              boxShadow: `0 0 6px ${rol?.cor || '#e8a547'}`
            }} />
            {rol?.label}
          </div>
          <h2 style={{
            fontFamily: 'var(--gaia-font-display)',
            fontSize: 'clamp(26px, 3vw, 34px)',
            fontWeight: 700,
            color: 'var(--gaia-text-primary)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
            lineHeight: 1.15
          }}>
            Escolle a túa especialidade
          </h2>
          <p style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            margin: 0
          }}>
            Podes explorar todas as áreas máis tarde.
          </p>
        </div>

        {/* ═══ BLOQUES CON PROFESIÓNS ═══ */}
        {rol?.bloques.map(bloque => (
          <div key={bloque.id} style={{ marginBottom: 12 }}>

            {/* Cabeceira bloque */}
            <div
              onClick={() => setBloqueAberto(bloqueAberto === bloque.id ? null : bloque.id)}
              style={{
                padding: '14px 20px',
                background: bloqueAberto === bloque.id
                  ? 'var(--gaia-cosmos-700)'
                  : 'var(--gaia-cosmos-800)',
                border: `1px solid ${bloqueAberto === bloque.id
                  ? bloque.cor + '66'
                  : 'var(--gaia-cosmos-400)'}`,
                borderRadius: bloqueAberto === bloque.id ? '10px 10px 0 0' : 10,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: bloque.cor,
                  boxShadow: `0 0 6px ${bloque.cor}88`
                }} />
                <span style={{
                  fontSize: 14,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: 600,
                  color: 'var(--gaia-text-primary)'
                }}>
                  {bloque.label}
                </span>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--gaia-font-mono)',
                  color: 'var(--gaia-text-tertiary)',
                  letterSpacing: '0.05em'
                }}>
                  {bloque.profesions.length} especialidades
                </span>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={bloque.cor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 200ms ease',
                  transform: bloqueAberto === bloque.id ? 'rotate(180deg)' : 'rotate(0)'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Profesións do bloque (expandido) */}
            {bloqueAberto === bloque.id && (
              <div style={{
                background: 'var(--gaia-cosmos-800)',
                border: `1px solid ${bloque.cor}44`,
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: 8
              }}>
                {bloque.profesions.map(prof => (
                  <div key={prof.id}
                    onClick={() => confirmarRol(prof.id, bloque.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'background 150ms ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      fontSize: 22,
                      flexShrink: 0,
                      width: 32,
                      textAlign: 'center'
                    }}>
                      {prof.icono}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontFamily: 'var(--gaia-font-body)',
                      fontWeight: 500,
                      color: 'var(--gaia-text-primary)',
                      flex: 1
                    }}>
                      {prof.label}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      color: bloque.cor,
                      opacity: 0.7
                    }}>
                      <IconoFlechaDerecha size={12} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ═══ BOTÓNS INFERIORES ═══ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
          <button
            onClick={() => setPaso('rol')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'transparent',
              color: 'var(--gaia-text-tertiary)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-text-tertiary)'
              e.currentTarget.style.color = 'var(--gaia-text-secondary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
              e.currentTarget.style.color = 'var(--gaia-text-tertiary)'
            }}>
            <IconoFlechaEsquerda size={12} />
            Volver
          </button>
          <button
            onClick={() => confirmarRol('', '')}
            disabled={cargando}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              background: rol?.cor || 'var(--gaia-accent)',
              color: 'var(--gaia-cosmos-900)',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--gaia-font-body)',
              fontWeight: 700,
              letterSpacing: '0.025em',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.6 : 1,
              boxShadow: `0 0 24px ${rol?.cor || '#e8a547'}44`,
              transition: 'all 150ms ease'
            }}>
            {cargando
              ? 'Gardando...'
              : <>Entrar como {rol?.label} <IconoFlechaDerecha /></>
            }
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-text-disabled)',
          letterSpacing: '0.03em'
        }}>
          Podes escoller especialidade máis tarde dende o teu perfil.
        </div>
      </div>
    </div>
  )
  // ── FIN: render_seleccion_profesion ──────────────────

  return paso === 'rol' ? renderSeleccionRol() : renderSeleccionProfesion()
}

export default SeleccionRol