import { useState, useEffect } from 'react'
import { useUser } from './contexts/UserContext'

// ═══════════════════════════════════════════════════════════
// VisorRuta — Vista embebida dunha ruta pedagóxica
// ═══════════════════════════════════════════════════════════
// Reescrito v1.1.
//
// Compoñente compacto que se embebe noutros (probablemente VisorNodo
// ou paneis laterais). Amosa unha ruta pedagóxica: cabeceira + pasos
// en chips clicables que permiten ao usuario saltar a calquera paso.
//
// API pública INTACTA: id, seleccionarNodo, idioma.
//
// MELLORAS:
//   1. authHeaders() no fetch (defensivo, por se o backend o require).
//   2. Cores semánticas nos chips segundo tipo de nodo
//      (concept → lavanda, process → rosa, etc.)
//   3. Cabeceira con chip de tipo/nivel en lugar dunha liña plana.
//   4. Flecha entre pasos máis sutil.
//   5. Estado de carga coherente co resto da app.
// ═══════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API || 'http://localhost:4000'

// ── INICIO: cor_tipo_nodo ────────────────────────────
const COR_TIPO = {
  galaxy:        'var(--gaia-galaxy)',
  constellation: 'var(--gaia-constellation)',
  system:        'var(--gaia-system)',
  concept:       'var(--gaia-concept)',
  process:       'var(--gaia-process)'
}
// ── FIN: cor_tipo_nodo ───────────────────────────────

// ── INICIO: icono_libro ──────────────────────────────
const IconoLibro = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
// ── FIN: icono_libro ─────────────────────────────────

function VisorRuta({ id, seleccionarNodo, idioma = 'gl' }) {

  const { authHeaders } = useUser()

  // ── INICIO: estados ──────────────────────────────────
  const [ruta, setRuta]     = useState(null)
  const [erro, setErro]     = useState(false)
  // ── FIN: estados ─────────────────────────────────────

  // ── INICIO: carga_ruta ───────────────────────────────
  useEffect(() => {
    if (!id) return
    setErro(false)

    fetch(`${API}/journeys/${id}`, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setRuta)
      .catch(e => {
        console.error('[VisorRuta] Erro cargando ruta:', e)
        setErro(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  // ── FIN: carga_ruta ──────────────────────────────────

  // Estado: cargando
  if (!ruta && !erro) {
    return (
      <div style={{
        padding: '14px 16px',
        background: 'var(--gaia-cosmos-800)',
        border: '1px solid var(--gaia-cosmos-400)',
        borderRadius: 10,
        fontSize: 12,
        fontFamily: 'var(--gaia-font-mono)',
        color: 'var(--gaia-text-tertiary)',
        letterSpacing: '0.05em'
      }}>
        Cargando ruta...
      </div>
    )
  }

  // Estado: erro
  if (erro) {
    return (
      <div style={{
        padding: '14px 16px',
        background: 'var(--gaia-danger-bg)',
        border: '1px solid var(--gaia-danger-border)',
        borderRadius: 10,
        fontSize: 12,
        fontFamily: 'var(--gaia-font-body)',
        color: 'var(--gaia-danger)'
      }}>
        Non se puido cargar a ruta.
      </div>
    )
  }

  const label       = ruta.label?.[idioma]       || ruta.label?.gl       || ''
  const description = ruta.description?.[idioma] || ruta.description?.gl || ''
  const stopsValidos = (ruta.stops || []).filter(s => s && s.nodo)

  return (
    <div style={{
      marginTop: 16,
      padding: '16px 18px',
      background: 'var(--gaia-cosmos-800)',
      border: '1px solid var(--gaia-cosmos-400)',
      borderLeft: '3px solid var(--gaia-system)',
      borderRadius: 10,
      fontFamily: 'var(--gaia-font-body)'
    }}>

      {/* ═══ CABECEIRA ═══ */}
      <div style={{ marginBottom: 14 }}>

        {/* Meta: tipo + nivel */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            fontSize: 10,
            fontFamily: 'var(--gaia-font-mono)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--gaia-system)',
            background: 'var(--gaia-system-bg)',
            border: '1px solid var(--gaia-system-border)',
            borderRadius: 9999
          }}>
            <IconoLibro size={10} />
            Ruta
          </span>
          {ruta.type && (
            <span style={{
              padding: '3px 10px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-secondary)',
              background: 'var(--gaia-cosmos-700)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 9999,
              letterSpacing: '0.05em'
            }}>
              {ruta.type}
            </span>
          )}
          {ruta.level && (
            <span style={{
              padding: '3px 10px',
              fontSize: 10,
              fontFamily: 'var(--gaia-font-mono)',
              color: 'var(--gaia-text-secondary)',
              background: 'var(--gaia-cosmos-700)',
              border: '1px solid var(--gaia-cosmos-400)',
              borderRadius: 9999,
              letterSpacing: '0.05em'
            }}>
              {ruta.level}
            </span>
          )}
        </div>

        {/* Título */}
        <div style={{
          fontSize: 16,
          fontFamily: 'var(--gaia-font-display)',
          fontWeight: 700,
          color: 'var(--gaia-accent)',
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
          marginBottom: description ? 4 : 0
        }}>
          {ruta.icono && (
            <span style={{ marginRight: 8 }}>{ruta.icono}</span>
          )}
          {label}
        </div>

        {/* Descrición */}
        {description && (
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--gaia-font-body)',
            color: 'var(--gaia-text-secondary)',
            lineHeight: 1.5
          }}>
            {description}
          </div>
        )}
      </div>

      {/* ═══ PASOS ═══ */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {stopsValidos.map((stop, i) => {
          const corTipo = COR_TIPO[stop.nodo.type] || 'var(--gaia-text-secondary)'
          const labelNodo = stop.nodo[`label_${idioma}`] || stop.nodo.label_gl
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div
                onClick={() => seleccionarNodo(stop.nodo.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'var(--gaia-cosmos-900)',
                  border: '1px solid var(--gaia-cosmos-400)',
                  borderLeft: `2px solid ${corTipo}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'var(--gaia-font-body)',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-700)'
                  e.currentTarget.style.borderColor = corTipo
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--gaia-cosmos-900)'
                  e.currentTarget.style.borderColor = 'var(--gaia-cosmos-400)'
                  e.currentTarget.style.borderLeftColor = corTipo
                }}
              >
                <span style={{
                  color: 'var(--gaia-text-tertiary)',
                  fontFamily: 'var(--gaia-font-mono)',
                  fontSize: 10,
                  fontWeight: 600
                }}>
                  {String(stop.order).padStart(2, '0')}
                </span>
                <span style={{
                  color: 'var(--gaia-text-primary)',
                  fontWeight: 500
                }}>
                  {labelNodo}
                </span>
              </div>
              {i < stopsValidos.length - 1 && (
                <span style={{
                  color: 'var(--gaia-text-disabled)',
                  fontFamily: 'var(--gaia-font-mono)'
                }}>
                  →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VisorRuta