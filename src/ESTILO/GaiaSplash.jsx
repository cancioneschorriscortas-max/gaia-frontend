/**
 * ============================================================
 * GaiaSplash.jsx
 * ============================================================
 * Pantalla de entrada de GAIA.
 * Animación orquestrada de ~3s + repouso.
 * Detecta automaticamente o breakpoint (móbil/tablet/escritorio).
 *
 * Uso básico:
 *   import GaiaSplash from './GaiaSplash';
 *   <GaiaSplash onComplete={() => setShowApp(true)} />
 *
 * Props:
 *   - onComplete: callback ao rematar a animación (default: 3500ms)
 *   - autoAdvance: se true, transiciona só (default: true)
 *   - autoAdvanceDelay: ms antes de transicionar (default: 4000)
 *   - showQuote: amosar cita de LÚA (default: true)
 *   - liteMode: desactiva animacións (detecta auto se non se pasa)
 *
 * Dependencias:
 *   - tokens CSS (02-tokens.css) cargados globalmente
 *   - splash CSS (GaiaSplash.css) ou inxectado inline
 *
 * Accesibilidade:
 *   - Respecta prefers-reduced-motion
 *   - Respecta navigator.connection.effectiveType
 *   - Botón invisible para "saltar" (clic/tap en calquera sitio)
 *   - role="status" para lectores de pantalla
 *
 * Versión: 1.0.0
 * ============================================================
 */

import React, { useEffect, useState, useCallback } from 'react';
import './GaiaSplash.css'; // conten os keyframes e estilos específicos

const GaiaSplash = ({
  onComplete,
  autoAdvance = true,
  autoAdvanceDelay = 4000,
  showQuote = true,
  liteMode: liteModeProp,
}) => {
  const [liteMode, setLiteMode] = useState(false);
  const [completed, setCompleted] = useState(false);

  // ============================================================
  // Detección automática de modo lixeiro
  // ============================================================
  useEffect(() => {
    if (typeof liteModeProp === 'boolean') {
      setLiteMode(liteModeProp);
      return;
    }

    let shouldLite = false;

    // Reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      shouldLite = true;
    }

    // Conexión lenta
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) {
      shouldLite = true;
    }

    // Dispositivo con pouca memoria
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      shouldLite = true;
    }

    setLiteMode(shouldLite);
  }, [liteModeProp]);

  // ============================================================
  // Auto-advance
  // ============================================================
  useEffect(() => {
    if (!autoAdvance || completed) return;

    const timer = setTimeout(() => {
      setCompleted(true);
      onComplete?.();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvance, autoAdvanceDelay, onComplete, completed]);

  // ============================================================
  // Saltar con clic/tap ou tecla
  // ============================================================
  const handleSkip = useCallback(() => {
    if (completed) return;
    setCompleted(true);
    onComplete?.();
  }, [completed, onComplete]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSkip]);

  if (completed) return null;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div
      className={`gaia-splash ${liteMode ? 'gaia-lite' : ''}`}
      role="status"
      aria-label="Cargando GAIA · Arquivo do Coñecemento Humano"
      onClick={handleSkip}
    >
      {/* Capa de estrelas de fondo */}
      <div className="splash-stars" aria-hidden="true" />

      {/* Halo nebular */}
      <div className="splash-nebula" aria-hidden="true" />

      {/* Po cósmico flotante */}
      {!liteMode && (
        <>
          <div className="splash-dust" aria-hidden="true" />
          <div className="splash-dust" aria-hidden="true" />
          <div className="splash-dust" aria-hidden="true" />
          <div className="splash-dust" aria-hidden="true" />
          <div className="splash-dust" aria-hidden="true" />
        </>
      )}

      {/* Contido principal */}
      <div className="splash-content">

        {/* Constelación */}
        <div className="splash-constellation">
          <svg viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line className="const-line" x1="130" y1="60" x2="220" y2="35"/>
            <line className="const-line" x1="220" y1="35" x2="300" y2="55"/>
            <line className="const-line" x1="300" y1="55" x2="380" y2="25"/>
            <line className="const-line" x1="380" y1="25" x2="470" y2="50"/>
            <line className="const-line" x1="300" y1="55" x2="300" y2="95"/>
            <line className="const-line" x1="220" y1="35" x2="300" y2="95"/>
            <line className="const-line" x1="380" y1="25" x2="300" y2="95"/>
            <line className="const-line" x1="130" y1="60" x2="80" y2="85"/>
            <line className="const-line" x1="470" y1="50" x2="520" y2="80"/>
            <circle cx="130" cy="60" r="4" fill="var(--gaia-constellation)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-constellation-glow))' }}/>
            <circle cx="220" cy="35" r="5" fill="var(--gaia-galaxy)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-galaxy-glow))' }}/>
            <circle cx="300" cy="55" r="4" fill="var(--gaia-system)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-system-glow))' }}/>
            <circle cx="380" cy="25" r="5" fill="var(--gaia-galaxy)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-galaxy-glow))' }}/>
            <circle cx="470" cy="50" r="3.5" fill="var(--gaia-concept)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-concept-glow))' }}/>
            <circle cx="80" cy="85" r="3" fill="var(--gaia-concept)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-concept-glow))' }}/>
            <circle cx="520" cy="80" r="3.5" fill="var(--gaia-system)" style={{ filter: 'drop-shadow(0 0 4px var(--gaia-system-glow))' }}/>
            <circle className="node-origin-splash" cx="300" cy="95" r="6" fill="var(--gaia-origin)" style={{ filter: 'drop-shadow(0 0 6px var(--gaia-origin-glow))' }}/>
          </svg>
        </div>

        {/* Título */}
        <h1 className="splash-title">GAIA</h1>

        {/* Subtítulo */}
        <p className="splash-subtitle">Arquivo do coñecemento humano</p>

        {/* Versión */}
        <p className="splash-version">— v0.7 · grafo semántico</p>

        {/* Cita de LÚA */}
        {showQuote && (
          <blockquote className="splash-quote">
            LÚA non che dá respostas. Axúdache a velas.
            <cite className="splash-quote-attribution">— LÚA, a túa copiloto</cite>
          </blockquote>
        )}
      </div>
    </div>
  );
};

export default GaiaSplash;
