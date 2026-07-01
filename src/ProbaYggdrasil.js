// ─────────────────────────────────────────────────────────
// ProbaYggdrasil.js — PROBA DE FUME da integración (ADR-006)
//
// Círculo completo:  GET /oberon/profesion/panadeiro/completa
//                    → importGaiaProfession(json)  → TreeDef
//                    → new TreeEngine(treeDef)
//                    → <ClusterCardsView> + <NodeInspector>
//
// É un compoñente DESBOTABLE: só demostra que a cadea funciona.
// Non toca OberonProfesionVista nin nada existente.
//
// Como probalo (2 pasos):
//   1. Garda este ficheiro como  src/ProbaYggdrasil.js
//   2. En App.js (temporalmente):  import ProbaYggdrasil from './ProbaYggdrasil'
//      e renderiza <ProbaYggdrasil /> nalgún sitio visible.
//   (Backend + Neo4j en marcha co teu .bat)
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useCallback } from 'react'
import { TreeEngine } from '@yggdrasil-forge/core'
import { resolveLocalized } from '@yggdrasil-forge/common'
import { importGaiaProfession } from '@yggdrasil-forge/importers'
import { ClusterCardsView, NodeInspector, ThemeProvider } from '@yggdrasil-forge/react'
import { API } from './config/api'

const LOCALE = 'gl'

// Strings do inspector en galego (por defecto veñen en inglés)
const STRINGS_GL = {
  levels: 'NIVEIS',
  keyAction: 'ACCIÓN CLAVE',
  completed: 'COMPLETADO',
  current: 'ACTUAL',
  locked: 'BLOQUEADO',
  levelWord: 'NIVEL',
  ofWord: 'DE',
  maxedSuffix: 'MÁX',
  increase: 'SUBIR NIVEL',
  maxed: 'NIVEL MÁXIMO',
  blocked: 'BLOQUEADO',
  close: 'Pechar',
}

export default function ProbaYggdrasil() {
  const [gaiaJson, setGaiaJson] = useState(null)
  const [erro, setErro] = useState(null)
  const [seleccion, setSeleccion] = useState(null)
  const [tick, setTick] = useState(0) // forza re-render tras unlock

  // 1. Fetch ao endpoint real de GAIA
  useEffect(() => {
    fetch(`${API}/oberon/profesion/panadeiro/completa`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setGaiaJson)
      .catch(e => setErro(`Fetch: ${e.message}`))
  }, [])

  // 2. JSON de GAIA → TreeDef → TreeEngine  (o corazón da integración)
  const engine = useMemo(() => {
    if (!gaiaJson) return null
    try {
      const treeDef = importGaiaProfession(gaiaJson)
      return new TreeEngine(treeDef)
    } catch (e) {
      setErro(`Adaptador/Engine: ${e.message}`)
      return null
    }
  }, [gaiaJson])

  // 3. TreeDef+engine → props presentacionais de ClusterCardsView
  const grupos = useMemo(() => {
    if (!engine || !gaiaJson) return []
    const treeDef = engine.treeDef || importGaiaProfession(gaiaJson)
    const nodos = treeDef.nodes.filter(n => n.type !== 'root')
    return (treeDef.groups || []).map(g => ({
      id: g.id,
      label: resolveLocalized(g.label, LOCALE),
      color: g.color || '#e8a547',
      members: nodos
        .filter(n => n.group === g.id)
        .map(n => {
          const st = engine.getNodeState(n.id)
          return {
            id: n.id,
            label: resolveLocalized(n.label, LOCALE),
            currentTier: st ? st.currentTier : 0,
            maxTier: n.maxTier || 3,
          }
        }),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, gaiaJson, tick])

  // Posicións das tarxetas desde grupos[].posicion do JSON de GAIA (0-1 → %)
  const posicions = useMemo(() => {
    if (!gaiaJson) return undefined
    const out = {}
    for (const g of gaiaJson.grupos || []) {
      if (g.posicion) out[g.id] = { left: `${g.posicion.x * 100}%`, top: `${g.posicion.y * 100}%` }
    }
    return out
  }, [gaiaJson])

  // Nodo seleccionado (NodeDef + estado) para o inspector
  const nodoSel = useMemo(() => {
    if (!engine || !seleccion || !gaiaJson) return null
    const treeDef = engine.treeDef || importGaiaProfession(gaiaJson)
    const def = treeDef.nodes.find(n => n.id === seleccion)
    if (!def) return null
    const st = engine.getNodeState(seleccion)
    const check = engine.canUnlock(seleccion)
    return {
      def,
      currentTier: st ? st.currentTier : 0,
      canIncrease: !!(check && check.ok !== false && (check.value ? check.value.ok !== false : true)),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, seleccion, gaiaJson, tick])

  const subirNivel = useCallback(async (id) => {
    if (!engine) return
    await engine.unlock(id)          // async!
    setTick(t => t + 1)              // re-render co novo estado
  }, [engine])

  if (erro) return <div style={{ padding: 24, color: '#f87171' }}>Erro na proba: {erro}</div>
  if (!engine) return <div style={{ padding: 24, color: '#9bb3ff' }}>Cargando panadeiro…</div>

  return (
    <ThemeProvider>
      <div style={{ display: 'flex', height: '100vh', background: '#0a1020' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ClusterCardsView
            groups={grupos}
            positions={posicions}
            crownLabel={resolveLocalized(gaiaJson.label || 'Panadeiro/a', LOCALE)}
            selectedNodeId={seleccion || undefined}
            onRowClick={setSeleccion}
          />
        </div>
        {nodoSel && (
          <div style={{ width: 380, overflowY: 'auto' }}>
            <NodeInspector
              node={nodoSel.def}
              currentTier={nodoSel.currentTier}
              canIncrease={nodoSel.canIncrease}
              onIncreaseTier={subirNivel}
              onClose={() => setSeleccion(null)}
              locale={LOCALE}
              strings={STRINGS_GL}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
