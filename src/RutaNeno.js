// ─────────────────────────────────────────────────────────
// src/RutaNeno.js — Contedor da experiencia de ruta do neno
//
// Alterna entre a SENDA (portada) e o PASO (PercorridoRuta).
// Ao volver dun paso, a senda remóntase (refetch do progreso)
// e a parada recén desbloqueada fai POP (momento ouro v1).
//
// Uso:  <RutaNeno journeyId="galicia_no_prato" idioma="gl"
//                 onSair={() => ...volver á portada/mapa...} />
// ─────────────────────────────────────────────────────────
import { useState } from 'react'
import SendaRuta from './SendaRuta'
import PercorridoRuta from './PercorridoRuta'

export default function RutaNeno({ journeyId, idioma = 'gl', onSair }) {
  const [modo, setModo]         = useState('senda')   // 'senda' | 'paso'
  const [paso, setPaso]         = useState(0)
  const [sendaKey, setSendaKey] = useState(0)         // remonta a senda (refetch)
  const [volvinDePaso, setVolvinDePaso] = useState(false)

  if (modo === 'paso') {
    return (
      <PercorridoRuta
        journeyId={journeyId}
        idioma={idioma}
        pasoInicial={paso}
        onPechar={() => {
          setModo('senda')
          setVolvinDePaso(true)
          setSendaKey(k => k + 1)
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050a14', paddingTop: 40 }}>
      <SendaRuta
        key={sendaKey}
        journeyId={journeyId}
        idioma={idioma}
        popActual={volvinDePaso}
        onEntrar={(i) => { setPaso(i); setModo('paso') }}
        onPechar={onSair}
      />
    </div>
  )
}