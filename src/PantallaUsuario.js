import { useState, useEffect } from 'react'
import { useUser }        from './contexts/UserContext'
import { useUI }          from './contexts/UIContext'
import { t }              from './i18n'
import { buscarCentros }  from './centros'
import { CURSOS_POR_ETAPA } from './cursos'

// ═══════════════════════════════════════════════════════════
// PantallaUsuario — Login / Rexistro
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1. Fluxo de entrada á app tras a intro.
//
// Tres modos:
//   - escoller  → pantalla inicial (crear conta / xa teño / explorador)
//   - login     → formulario de inicio sesión
//   - rexistro  → formulario de creación de conta (alumno/profesor)
//
// API pública sen cambios: prop onFin
// Arranxado: o bug de codigoArquitecto (declaración movida á parte
// superior de estados para que estea dispoñible en fazerRexistro).
// ═══════════════════════════════════════════════════════════

// ── INICIO: validar_contrasinal ──────────────────────
const validarContrasinal = (c) => ({
  lonxitude:  c.length >= 8,
  maiuscula:  /[A-Z]/.test(c),
  minuscula:  /[a-z]/.test(c),
  numero:     /\d/.test(c),
  get valido() { return this.lonxitude && this.maiuscula && this.minuscula && this.numero }
})
// ── FIN: validar_contrasinal ─────────────────────────

// ── INICIO: iconos_svg ───────────────────────────────
const IconoEdificio = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" />
    <path d="M9 21V11h6v10" />
    <path d="M12 4L3 8h18z" />
  </svg>
)
const IconoCheck = ({ size = 12 }) => (
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
// ── FIN: iconos_svg ──────────────────────────────────

function PantallaUsuario({ onFin }) {

  const { login, rexistro } = useUser()
  const { idioma, setIdioma, idiomasActivos } = useUI()

  // ── INICIO: estados ──────────────────────────────────
  const [modo,              setModo]              = useState('escoller')
  const [nome,              setNome]              = useState('')
  const [xenero,            setXenero]            = useState('m')
  const [curso,             setCurso]             = useState('')
  const [contrasinal,       setContrasinal]       = useState('')
  const [contrasinal2,      setContrasinal2]      = useState('')
  const [centroInput,       setCentroInput]       = useState('')
  const [centroSel,         setCentroSel]         = useState('')
  const [suxerencias,       setSuxerencias]       = useState([])
  const [erro,              setErro]              = useState('')
  const [cargando,          setCargando]          = useState(false)
  const [visible,           setVisible]           = useState(false)
  const [rol,               setRol]               = useState('alumno')
  const [codigoProf,        setCodigoProf]        = useState('')
  const [codigoArquitecto,  setCodigoArquitecto]  = useState('')
  const [mostrarReqs,       setMostrarReqs]       = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  const reqs = validarContrasinal(contrasinal)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  // ── INICIO: autocompletado ───────────────────────────
  useEffect(() => {
    setSuxerencias(buscarCentros(centroInput))
  }, [centroInput])
  // ── FIN: autocompletado ──────────────────────────────

  // ── INICIO: accions ──────────────────────────────────
  const entrarExplorador = () => {
    setVisible(false)
    setTimeout(() => onFin({ explorador: true }), 400)
  }

  const fazerLogin = async () => {
    if (!nome.trim() || !contrasinal) { setErro('Enche todos os campos'); return }
    setCargando(true); setErro('')
    try {
      await login(nome.trim(), centroSel || centroInput.trim(), contrasinal)
      setVisible(false)
      setTimeout(() => onFin(), 400)
    } catch (e) {
      setErro(e.message || 'Credenciais incorrectas')
    } finally { setCargando(false) }
  }

  const fazerRexistro = async () => {
    if (rol === 'alumno' && !curso) {
      setErro('Selecciona o teu curso')
      return
    }
    if (!nome.trim() || !contrasinal) { setErro('Nome e contrasinal son obrigatorios'); return }
    if (!reqs.valido) { setErro('O contrasinal non cumpre os requisitos'); setMostrarReqs(true); return }
    if (contrasinal !== contrasinal2) { setErro('Os contrasinais non coinciden'); return }
    if (rol === 'profesor' && !codigoProf) { setErro('O código de profesor é obrigatorio'); return }
    const centroFinal = centroSel || centroInput.trim()
    if (!centroFinal) { setErro('Selecciona o teu centro educativo'); return }
    setCargando(true); setErro('')
    try {
      await rexistro({
        nome: nome.trim(),
        contrasinal,
        centro: centroFinal,
        rol,
        curso: curso || 'outro',
        xenero: xenero || 'm',
        codigo_profesor: codigoProf,
        codigo_arquitecto: codigoArquitecto || undefined
      })
      setVisible(false)
      setTimeout(() => onFin(), 400)
    } catch (e) {
      setErro(e.message || 'Erro no rexistro')
    } finally { setCargando(false) }
  }
  // ── FIN: accions ─────────────────────────────────────

  // ── INICIO: estilos ──────────────────────────────────
  const inputStyle = (activo, cor = 'var(--gaia-accent)') => ({
    width: '100%',
    padding: '12px 16px',
    background: 'var(--gaia-cosmos-800)',
    border: `1px solid ${activo ? cor : 'var(--gaia-cosmos-400)'}`,
    borderRadius: 10,
    color: 'var(--gaia-text-primary)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'var(--gaia-font-body)',
    transition: 'border 200ms ease',
    boxSizing: 'border-box'
  })

  const labelStyle = {
    fontSize: 10,
    fontFamily: 'var(--gaia-font-mono)',
    color: 'var(--gaia-text-tertiary)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 8,
    fontWeight: 600
  }

  const campoStyle = { marginBottom: 16 }
  // ── FIN: estilos ─────────────────────────────────────

  // ── INICIO: campo_centro ─────────────────────────────
  const renderCampoCentro = (obrigatorio = false) => (
    <div style={{ ...campoStyle, position: 'relative' }}>
      <label style={labelStyle}>
        {obrigatorio ? t(idioma, 'centroLabel') : t(idioma, 'centroOpcional')}
      </label>
      <input
        value={centroInput}
        onChange={e => { setCentroInput(e.target.value); setCentroSel('') }}
        placeholder={t(idioma, 'buscarCentro')}
        style={inputStyle(!!(centroSel || centroInput))}
        autoComplete="off"
      />
      {suxerencias.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% - 2px)', left: 0, right: 0,
          background: 'rgba(15, 23, 41, 0.98)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          zIndex: 20,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          maxHeight: 220,
          overflowY: 'auto'
        }}>
          {suxerencias.map((c, i) => (
            <div key={c}
              onClick={() => { setCentroSel(c); setCentroInput(c); setSuxerencias([]) }}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                color: 'var(--gaia-text-secondary)',
                cursor: 'pointer',
                borderBottom: i < suxerencias.length - 1 ? '1px solid var(--gaia-cosmos-400)' : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gaia-cosmos-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--gaia-text-tertiary)' }}>
                <IconoEdificio />
              </span>
              {c}
            </div>
          ))}
        </div>
      )}
      {centroSel && (
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--gaia-font-mono)',
          color: 'var(--gaia-success)',
          marginTop: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          letterSpacing: '0.025em'
        }}>
          <IconoCheck size={10} /> {centroSel}
        </div>
      )}
    </div>
  )
  // ── FIN: campo_centro ────────────────────────────────

  // ── INICIO: campo_contrasinal ────────────────────────
  const renderCampoContrasinal = () => (
    <div style={campoStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>{t(idioma, 'contrasinelLabel')}</label>
        <button
          onClick={() => setMostrarReqs(v => !v)}
          style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-tertiary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
            letterSpacing: '0.025em'
          }}
        >
          {mostrarReqs ? '▲ ocultar' : '? requisitos'}
        </button>
      </div>

      <input
        type="password"
        value={contrasinal}
        onChange={e => { setContrasinal(e.target.value); setMostrarReqs(true) }}
        placeholder="Contrasinal..."
        style={inputStyle(
          !!contrasinal,
          reqs.valido && contrasinal ? 'var(--gaia-success)' : 'var(--gaia-accent)'
        )}
      />

      {/* Indicador visual de requisitos */}
      {mostrarReqs && contrasinal && (
        <div style={{
          marginTop: 8,
          padding: '10px 12px',
          background: 'var(--gaia-cosmos-800)',
          border: '1px solid var(--gaia-cosmos-400)',
          borderRadius: 8
        }}>
          {[
            { ok: reqs.lonxitude, texto: t(idioma, 'contrasinelReq1') },
            { ok: reqs.maiuscula, texto: t(idioma, 'contrasinelReq2') },
            { ok: reqs.minuscula, texto: t(idioma, 'contrasinelReq3') },
            { ok: reqs.numero,    texto: t(idioma, 'contrasinelReq4') },
          ].map((r, i) => (
            <div key={i} style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-body)',
              color: r.ok ? 'var(--gaia-success)' : 'var(--gaia-text-tertiary)',
              marginBottom: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 200ms ease'
            }}>
              {r.ok
                ? <IconoCheck size={10} />
                : <span style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    border: '1px solid currentColor',
                    display: 'inline-block'
                  }} />
              }
              {r.texto.replace('✓ ', '')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
  // ── FIN: campo_contrasinal ───────────────────────────

  // ── INICIO: campo_repetir_contrasinal ────────────────
  const renderCampoRepetir = () => {
    const coincide = contrasinal2 && contrasinal === contrasinal2
    const nonCoinc = contrasinal2 && contrasinal !== contrasinal2
    return (
      <div style={campoStyle}>
        <label style={labelStyle}>{t(idioma, 'contrasinelRep')}</label>
        <input
          type="password"
          value={contrasinal2}
          onChange={e => setContrasinal2(e.target.value)}
          placeholder="Repite o contrasinal..."
          style={{
            ...inputStyle(!!contrasinal2,
              coincide ? 'var(--gaia-success)' : nonCoinc ? 'var(--gaia-danger)' : 'var(--gaia-accent)'
            )
          }}
        />
        {coincide && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-success)',
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <IconoCheck size={10} /> {t(idioma, 'contrasinaisCoinciden')}
          </div>
        )}
        {nonCoinc && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-danger)',
            marginTop: 6
          }}>
            {t(idioma, 'contrasinaisNonCoinciden')}
          </div>
        )}
      </div>
    )
  }
  // ── FIN: campo_repetir_contrasinal ───────────────────

  // ── INICIO: selector_idioma ──────────────────────────
  const renderSelectorIdioma = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 32,
      background: 'var(--gaia-cosmos-700)',
      border: '1px solid var(--gaia-cosmos-400)',
      borderRadius: 8,
      padding: 3,
      width: 'fit-content',
      margin: '0 auto 32px'
    }}>
      {idiomasActivos.map(i => (
        <button key={i} onClick={() => setIdioma(i)}
          style={{
            padding: '5px 14px',
            fontSize: 11,
            fontFamily: 'var(--gaia-font-mono)',
            background: idioma === i ? 'var(--gaia-accent-bg)' : 'transparent',
            color: idioma === i ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontWeight: idioma === i ? 700 : 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 150ms ease'
          }}>
          {i}
        </button>
      ))}
    </div>
  )
  // ── FIN: selector_idioma ─────────────────────────────

  // ── INICIO: erro_display ─────────────────────────────
  const renderErro = () => erro ? (
    <div style={{
      padding: '10px 14px',
      marginBottom: 16,
      background: 'var(--gaia-danger-bg)',
      border: '1px solid var(--gaia-danger-border)',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'var(--gaia-font-body)',
      color: 'var(--gaia-danger)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {erro}
    </div>
  ) : null
  // ── FIN: erro_display ────────────────────────────────

  // ── INICIO: botón_principal ──────────────────────────
  const renderBotonPrincipal = (label, accion, destacado = true) => (
    <button
      onClick={accion}
      disabled={cargando}
      style={{
        width: '100%',
        padding: 14,
        background: cargando
          ? 'var(--gaia-cosmos-700)'
          : destacado ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-700)',
        color: cargando
          ? 'var(--gaia-text-disabled)'
          : destacado ? 'var(--gaia-cosmos-900)' : 'var(--gaia-text-primary)',
        border: `1px solid ${cargando
          ? 'var(--gaia-cosmos-400)'
          : destacado ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: cargando ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--gaia-font-body)',
        letterSpacing: '0.02em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 150ms ease',
        boxShadow: destacado && !cargando ? '0 0 20px rgba(232, 165, 71, 0.2)' : 'none'
      }}>
      {label}
    </button>
  )

  const renderBotonVolver = () => (
    <button
      onClick={() => { setModo('escoller'); setErro('') }}
      style={{
        width: '100%',
        marginTop: 10,
        padding: 10,
        background: 'transparent',
        color: 'var(--gaia-text-tertiary)',
        border: 'none',
        fontSize: 12,
        fontFamily: 'var(--gaia-font-body)',
        cursor: 'pointer',
        transition: 'color 150ms ease'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--gaia-text-secondary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--gaia-text-tertiary)'}>
      {t(idioma, 'volver')}
    </button>
  )
  // ── FIN: botón_principal ─────────────────────────────

  // ── INICIO: render_escoller ──────────────────────────
  const renderEscoller = () => (
    <>
      {renderSelectorIdioma()}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Crear conta (CTA principal) */}
        <button onClick={() => { setModo('rexistro'); setErro('') }}
          style={{
            width: '100%',
            padding: 14,
            background: 'var(--gaia-accent)',
            color: 'var(--gaia-cosmos-900)',
            border: '1px solid var(--gaia-accent)',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--gaia-font-body)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 0 20px rgba(232, 165, 71, 0.2)',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gaia-accent-hover)'
            e.currentTarget.style.boxShadow = '0 0 28px rgba(232, 165, 71, 0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--gaia-accent)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(232, 165, 71, 0.2)'
          }}>
          {t(idioma, 'crearConta')}
          <IconoFlechaDerecha />
        </button>

        {/* Xa teño conta */}
        <button onClick={() => { setModo('login'); setErro('') }}
          style={{
            width: '100%',
            padding: 14,
            background: 'var(--gaia-cosmos-700)',
            color: 'var(--gaia-text-primary)',
            border: '1px solid var(--gaia-cosmos-400)',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--gaia-font-body)',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-300)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'}>
          {t(idioma, 'xaTenConta')}
        </button>

        {/* Separador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0'
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gaia-cosmos-400)' }} />
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            color: 'var(--gaia-text-disabled)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            ou
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--gaia-cosmos-400)' }} />
        </div>

        {/* Entrar como explorador */}
        <button onClick={entrarExplorador}
          style={{
            width: '100%',
            padding: 12,
            background: 'transparent',
            color: 'var(--gaia-text-tertiary)',
            border: '1px dashed var(--gaia-cosmos-400)',
            borderRadius: 10,
            fontSize: 12,
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
          {t(idioma, 'entrarExplorador')}
        </button>
      </div>

      <p style={{
        fontSize: 11,
        fontFamily: 'var(--gaia-font-body)',
        color: 'var(--gaia-text-disabled)',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 0,
        lineHeight: 1.6
      }}>
        {t(idioma, 'senContaAviso')}
      </p>
    </>
  )
  // ── FIN: render_escoller ─────────────────────────────

  // ── INICIO: render_login ─────────────────────────────
  const renderLogin = () => (
    <>
      <div style={campoStyle}>
        <label style={labelStyle}>{t(idioma, 'nomeLabel')}</label>
        <input value={nome} onChange={e => setNome(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fazerLogin()}
          placeholder="O teu nome..."
          style={inputStyle(!!nome)} autoFocus />
      </div>
      {renderCampoCentro(false)}
      <div style={campoStyle}>
        <label style={labelStyle}>{t(idioma, 'contrasinelLabel')}</label>
        <input type="password" value={contrasinal}
          onChange={e => setContrasinal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fazerLogin()}
          placeholder="Contrasinal..."
          style={inputStyle(!!contrasinal)} />
      </div>
      {renderErro()}
      {renderBotonPrincipal(
        cargando
          ? t(idioma, 'entrando')
          : <>{t(idioma, 'iniciarSesion')} <IconoFlechaDerecha /></>,
        fazerLogin
      )}
      {renderBotonVolver()}
    </>
  )
  // ── FIN: render_login ────────────────────────────────

  // ── INICIO: render_rexistro ──────────────────────────
  const renderRexistro = () => (
    <>
      {/* Honeypot antibot */}
      <input tabIndex={-1} autoComplete="off" name="website"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
        onChange={() => {}} value="" />

      <div style={campoStyle}>
        <label style={labelStyle}>{t(idioma, 'nomeLabel')} *</label>
        <input value={nome} onChange={e => setNome(e.target.value)}
          placeholder="O teu nome..."
          style={inputStyle(!!nome)} autoFocus />
      </div>

      {/* Selector de curso — só para alumnos */}
      {rol === 'alumno' && (
        <div style={campoStyle}>
          <label style={labelStyle}>Curso *</label>
          <select
            value={curso}
            onChange={e => setCurso(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: curso ? 'var(--gaia-cosmos-700)' : 'var(--gaia-cosmos-800)',
              border: `1px solid ${curso ? 'var(--gaia-accent)' : 'var(--gaia-cosmos-400)'}`,
              borderRadius: 10,
              color: curso ? 'var(--gaia-text-primary)' : 'var(--gaia-text-tertiary)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'var(--gaia-font-body)',
              cursor: 'pointer',
              transition: 'border 200ms ease'
            }}
          >
            <option value="">Selecciona o teu curso...</option>
            {Object.entries(CURSOS_POR_ETAPA).map(([etapa, cursos]) => (
              <optgroup key={etapa} label={etapa}>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Selector xénero */}
      {rol === 'alumno' && (
        <div style={campoStyle}>
          <label style={labelStyle}>Personaxe</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'm', label: 'Masculino' },
              { id: 'f', label: 'Feminino' }
            ].map(x => (
              <button key={x.id}
                onClick={() => setXenero(x.id)}
                style={{
                  flex: 1,
                  padding: 10,
                  background: xenero === x.id ? 'var(--gaia-accent-bg)' : 'var(--gaia-cosmos-700)',
                  color: xenero === x.id ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                  border: `1px solid ${xenero === x.id ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'var(--gaia-font-body)',
                  fontWeight: xenero === x.id ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {renderCampoCentro(true)}
      {renderCampoContrasinal()}
      {renderCampoRepetir()}

      {/* Selector rol */}
      <div style={campoStyle}>
        <label style={labelStyle}>{t(idioma, 'rolLabel')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'alumno',   label: t(idioma, 'rolAlumno')   },
            { id: 'profesor', label: t(idioma, 'rolProfesor') }
          ].map(r => (
            <button key={r.id} onClick={() => setRol(r.id)}
              style={{
                flex: 1,
                padding: 10,
                background: rol === r.id ? 'var(--gaia-accent-bg)' : 'var(--gaia-cosmos-700)',
                color: rol === r.id ? 'var(--gaia-accent)' : 'var(--gaia-text-tertiary)',
                border: `1px solid ${rol === r.id ? 'var(--gaia-accent-border)' : 'var(--gaia-cosmos-400)'}`,
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'var(--gaia-font-body)',
                fontWeight: rol === r.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {rol === 'profesor' && (
        <>
          {/* Código profesor obrigatorio */}
          <div style={campoStyle}>
            <label style={labelStyle}>{t(idioma, 'codigoProfesorLabel')} *</label>
            <input
              value={codigoProf}
              onChange={e => setCodigoProf(e.target.value)}
              placeholder={t(idioma, 'codigoProfesorPlaceholder')}
              style={inputStyle(!!codigoProf)}
            />
          </div>
          {/* Código arquitecto opcional */}
          <div style={campoStyle}>
            <label style={labelStyle}>Código arquitecto (opcional)</label>
            <input
              type="password"
              value={codigoArquitecto}
              onChange={e => setCodigoArquitecto(e.target.value)}
              placeholder="Só se tes permisos de arquitecto..."
              style={inputStyle(!!codigoArquitecto)}
              autoComplete="off"
            />
          </div>
        </>
      )}

      {renderErro()}
      {renderBotonPrincipal(
        cargando
          ? t(idioma, 'creandoConta')
          : <>{t(idioma, 'rexistrarse')} <IconoFlechaDerecha /></>,
        fazerRexistro
      )}
      {renderBotonVolver()}
    </>
  )
  // ── FIN: render_rexistro ─────────────────────────────

  // ── INICIO: títulos ──────────────────────────────────
  const TITULOS = {
    escoller: { pre: t(idioma, 'benvido'),              titulo: 'GAIA',                    sub: 'Arquivo do coñecemento galego' },
    login:    { pre: null,                              titulo: t(idioma, 'iniciarSesion'), sub: null },
    rexistro: { pre: null,                              titulo: t(idioma, 'rexistrarse'),   sub: null },
  }
  const tit = TITULOS[modo]
  // ── FIN: títulos ─────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--gaia-cosmos-900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--gaia-font-body)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 400ms ease',
      overflowY: 'auto',
      padding: '20px 0'
    }}>

      {/* ═══ FONDO CÓSMICO ═══ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(232, 165, 71, 0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 80%, rgba(93, 212, 168, 0.04) 0%, transparent 55%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Estrelas sutís */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 10% 18%, rgba(232, 165, 71, 0.25), transparent),
          radial-gradient(1px 1px at 78% 72%, rgba(93, 212, 168, 0.22), transparent),
          radial-gradient(1px 1px at 42% 35%, rgba(155, 179, 255, 0.22), transparent),
          radial-gradient(1px 1px at 85% 25%, rgba(125, 211, 252, 0.22), transparent),
          radial-gradient(1px 1px at 20% 85%, rgba(255, 217, 102, 0.2),  transparent)
        `,
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* ═══ TARXETA PRINCIPAL ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        maxWidth: 440,
        padding: '44px 40px',
        background: 'rgba(15, 23, 41, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(232, 165, 71, 0.08)',
        margin: '0 20px'
      }}>

        {/* Cabeceira */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {tit.pre && (
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              letterSpacing: '0.25em',
              marginBottom: 12,
              textTransform: 'uppercase',
              fontWeight: 500
            }}>
              {tit.pre}
            </div>
          )}
          <div style={{
            fontSize: modo === 'escoller' ? 'clamp(36px, 6vw, 52px)' : 28,
            fontFamily: 'var(--gaia-font-display)',
            fontWeight: 900,
            color: 'var(--gaia-accent)',
            letterSpacing: modo === 'escoller' ? '0.12em' : '-0.01em',
            lineHeight: 1,
            textShadow: modo === 'escoller' ? '0 0 30px rgba(232, 165, 71, 0.35)' : 'none'
          }}>
            {tit.titulo}
          </div>
          {tit.sub && (
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-tertiary)',
              marginTop: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              {tit.sub}
            </div>
          )}
        </div>

        {modo === 'escoller'  && renderEscoller()}
        {modo === 'login'     && renderLogin()}
        {modo === 'rexistro'  && renderRexistro()}

      </div>
    </div>
  )
}

export default PantallaUsuario