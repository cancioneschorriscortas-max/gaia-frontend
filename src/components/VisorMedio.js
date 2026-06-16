import React from 'react'

/**
 * VisorMedio — compoñente reutilizable para mostrar contido visual.
 *
 * Detecta automaticamente o tipo de URL e renderiza:
 *   - Vídeo directo (.mp4 .webm .ogg .mov) → <video>
 *   - YouTube → <iframe> embed
 *   - Instagram → <iframe> embed
 *   - TikTok → <iframe> embed
 *   - Vimeo → <iframe> embed
 *   - Sen vídeo → imaxe de fallback (se a hai)
 *
 * Props:
 *   videoUrl       — URL do vídeo (calquera plataforma soportada). Opcional.
 *   imaxe          — URL da imaxe de fallback / poster do vídeo. Opcional.
 *   alt            — texto alternativo (para accesibilidade).
 *   estilo         — obxecto CSS aplicado ao elemento (img/video/iframe).
 *                    Por defecto: ocupar 100% do contedor con object-fit cover.
 *   videoOpcions   — props adicionais para <video> (autoPlay, loop, controls...)
 *                    Por defecto: autoplay silencioso en bucle.
 *
 * Exemplo de uso:
 *   <VisorMedio
 *     videoUrl={skill.video_url}
 *     imaxe={skill.imaxe_url}
 *     alt={skill.nome}
 *   />
 */

export default function VisorMedio({
  videoUrl,
  imaxe,
  alt = '',
  estilo,
  videoOpcions = {},
}) {
  const estiloFinal = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    ...estilo,
  }

  if (!videoUrl) {
    return imaxe
      ? <img src={imaxe} alt={alt} style={estiloFinal} />
      : null
  }

  const tipo = detectarTipoVideo(videoUrl)

  if (tipo.plataforma === 'directo') {
    const opcs = {
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      ...videoOpcions,
    }
    return (
      <video
        src={videoUrl}
        poster={imaxe}
        style={estiloFinal}
        {...opcs}
      />
    )
  }

  if (tipo.embedUrl) {
    return (
      <iframe
        src={tipo.embedUrl}
        title={alt}
        style={{ ...estiloFinal, border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  // URL non recoñecida — fallback a imaxe
  return imaxe
    ? <img src={imaxe} alt={alt} style={estiloFinal} />
    : null
}


/**
 * Detecta o tipo de URL e devolve o embed correcto.
 *
 * Devolve sempre un obxecto con:
 *   - plataforma: 'directo' | 'youtube' | 'instagram' | 'tiktok' | 'vimeo' | 'descoñecida' | null
 *   - embedUrl: URL do embed (só para plataformas con iframe)
 */

export function detectarTipoVideo(url) {
  if (!url) return { plataforma: null }

  // ── Ficheiro directo ──
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
    return { plataforma: 'directo' }
  }

  // ── YouTube ──
  // formatos:  youtu.be/ID  |  youtube.com/watch?v=ID  |  youtube.com/embed/ID  |  youtube.com/shorts/ID
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  )
  if (ytMatch) {
    return {
      plataforma: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
    }
  }

  // ── Instagram ──
  // formatos:  instagram.com/p/ID  |  instagram.com/reel/ID
  const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  if (igMatch) {
    return {
      plataforma: 'instagram',
      embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed`,
    }
  }

  // ── TikTok ──
  // formato:  tiktok.com/@usuario/video/ID
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (ttMatch) {
    return {
      plataforma: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`,
    }
  }

  // ── Vimeo ──
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return {
      plataforma: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  return { plataforma: 'descoñecida' }
}