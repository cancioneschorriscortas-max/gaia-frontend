import React from 'react'

/*
  ═══════════════════════════════════════════════════════════
  GaiaLogo — Compoñente oficial do logo
  ═══════════════════════════════════════════════════════════
  Tres variantes:
    full    → logo con texto "GAIA" debaixo da constelación
    compact → só mark + "GAIA" ao lado (topbar)
    mark    → só o SVG da constelación (favicon, iconos pequenos)

  Uso:
    <GaiaLogo variant="full"    size={80} />
    <GaiaLogo variant="compact" size={32} />
    <GaiaLogo variant="mark"    size={24} />
  ═══════════════════════════════════════════════════════════
*/

function GaiaLogo({
  variant = 'compact',
  size = 32,
  color = '#e8a547',
  style = {},
  onClick = null
}) {
  const handleClick = onClick ? { onClick, style: { ...style, cursor: 'pointer' } } : { style }

  // ── Mark (só SVG) ───────────────────────────
  const Mark = ({ s }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Liñas entre nodos (constelación) */}
      <line x1="15" y1="20" x2="45" y2="15"
            stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="45" y1="15" x2="30" y2="40"
            stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="20" x2="30" y2="40"
            stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* Nodos */}
      <circle cx="15" cy="20" r="3" fill="#ffd966" />
      <circle cx="45" cy="15" r="3" fill="#ffd966" />
      <circle cx="30" cy="40" r="4" fill={color} />
    </svg>
  )

  // ── Só mark ─────────────────────────────────
  if (variant === 'mark') {
    return (
      <div {...handleClick}>
        <Mark s={size} />
      </div>
    )
  }

  // ── Compact (mark + texto ao lado) ──────────
  if (variant === 'compact') {
    return (
      <div
        {...handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: size * 0.2,
          color,
          ...handleClick.style
        }}
      >
        <Mark s={size} />
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 900,
            fontSize: size * 0.55,
            letterSpacing: '0.08em',
            lineHeight: 1,
            color
          }}
        >
          GAIA
        </span>
      </div>
    )
  }

  // ── Full (mark arriba, texto grande debaixo) ─
  return (
    <div
      {...handleClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size * 0.15,
        color,
        ...handleClick.style
      }}
    >
      <Mark s={size} />
      <span
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 900,
          fontSize: size * 0.6,
          letterSpacing: '0.12em',
          lineHeight: 1,
          color
        }}
      >
        GAIA
      </span>
    </div>
  )
}

export default GaiaLogo
