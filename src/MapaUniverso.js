import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import MAPA_CONFIG from './mapaConfig'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { sonClickNodo, sonZoom, sonHover } from './sistemaAudio'
import { API } from './config/api';


// Xeometrías fóra do compoñente — evita fugas de memoria
const GEO = {
  origin:        new THREE.SphereGeometry(10, 16, 16),
  galaxy:        new THREE.SphereGeometry(7, 12, 12),
  constellation: new THREE.SphereGeometry(5, 12, 12),
  system:        new THREE.SphereGeometry(3.5, 8, 8),
  process:       new THREE.OctahedronGeometry(2.4),
  default:       new THREE.SphereGeometry(2, 8, 8),
  ring:          new THREE.TorusGeometry(6.3, 0.15, 2, 32)
}

const MapaUniverso = forwardRef(function MapaUniverso({
  onNodoSeleccionado, nivel, nodoFoco, config, onConfigChange,
  modoUsuario, idioma = 'gl', lupaActiva = false, centroFiltro = '',
  pauseAnimation = false
}, ref) {

  const graphRef       = useRef(null)
  const engineStopRef  = useRef(false)
  const [datos,          setDatos]          = useState({ nodes: [], links: [] })
  const [nodoActivo,     setNodoActivo]     = useState(null)
  const [cargando,       setCargando]       = useState(true)
  const [tooltip,        setTooltip]        = useState(null)
  const [zoomSaindo,     setZoomSaindo]     = useState(false)
  const [modo3D,         setModo3D]         = useState(false)
  const [cambiandoModo,  setCambiandoModo]  = useState(false)
  const [modoVisible,    setModoVisible]    = useState(false)
  const [labels3D,       setLabels3D]       = useState([])
  // ── INICIO: fix_resize ───────────────────────────────
  const [dimensions, setDimensions] = useState({
    width:  window.innerWidth  - (modoUsuario ? 0 : 250),
    height: window.innerHeight
  })
  // ── FIN: fix_resize ──────────────────────────────────

  // ── INICIO: estado_refrescar_forzas ──────────────────
  // Só necesitamos saber se estamos refrescando (para animar o botón).
  // Sen detección automática — o botón está sempre activo e sempre visible.
  const [refrescando, setRefrescando] = useState(false)
  // ── FIN: estado_refrescar_forzas ─────────────────────

  const animFrameRef = useRef(null)
  const cfg = config || MAPA_CONFIG

  useEffect(() => { setTimeout(() => setModoVisible(true), 100) }, [])

  // ── INICIO: fix_resize_effect ────────────────────────
  useEffect(() => {
    const handler = () => setDimensions({
      width:  window.innerWidth  - (modoUsuario ? 0 : 250),
      height: window.innerHeight
    })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [modoUsuario])
  // ── FIN: fix_resize_effect ───────────────────────────

  // ── INICIO: bloom_3d ─────────────────────────────────
  useEffect(() => {
    if (!modo3D || !graphRef.current) return
    let bloomPass
    try {
      bloomPass = new UnrealBloomPass()
     bloomPass.strength  = cfg.rendemento?.bloom_strength  || 1.8
bloomPass.radius    = cfg.rendemento?.bloom_radius     || 0.8
bloomPass.threshold = cfg.rendemento?.bloom_threshold  || 0.1
      graphRef.current.postProcessingComposer().addPass(bloomPass)
    } catch(e) { console.warn('Bloom:', e.message) }
    return () => {
      try {
        if (bloomPass) {
          graphRef.current?.postProcessingComposer().removePass(bloomPass)
          bloomPass.dispose?.()
        }
      } catch(e) {}
    }
  }, [modo3D])
  // ── FIN: bloom_3d ────────────────────────────────────

  // ── INICIO: labels_overlay_3d ────────────────────────
  useEffect(() => {
    if (!modo3D) { setLabels3D([]); return }
    const actualizar = () => {
      if (!graphRef.current) { animFrameRef.current = requestAnimationFrame(actualizar); return }
      const camera   = graphRef.current.camera()
      const renderer = graphRef.current.renderer()
      if (!camera || !renderer) { animFrameRef.current = requestAnimationFrame(actualizar); return }
      const w     = renderer.domElement.width  / window.devicePixelRatio
      const h     = renderer.domElement.height / window.devicePixelRatio
      const tipos = ['origin', 'galaxy', 'constellation']
      const novasLabels = datos.nodes
        .filter(n => tipos.includes(n.type) && n.x != null)
        .map(n => {
          const vec = new THREE.Vector3(n.x, n.y, n.z || 0)
          vec.project(camera)
          const x    = (vec.x *  0.5 + 0.5) * w
          const y    = (-vec.y * 0.5 + 0.5) * h
          const dist = camera.position.distanceTo(new THREE.Vector3(n.x, n.y, n.z || 0))
          return {
            id:    n.id,
            label: n[`label_${idioma}`] || n.label,
            type:  n.type, x, y, dist,
            cor:   (config || MAPA_CONFIG).cor[n.type] || '#fff'
          }
        })
        .filter(n => n.dist < 800 && n.x > 0 && n.x < w && n.y > 0 && n.y < h)
      setLabels3D(novasLabels)
      animFrameRef.current = requestAnimationFrame(actualizar)
    }
    animFrameRef.current = requestAnimationFrame(actualizar)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [modo3D, datos, idioma, config])
  // ── FIN: labels_overlay_3d ───────────────────────────

  // ── INICIO: imperative_handle ────────────────────────
  useImperativeHandle(ref, () => ({
    centerAt: (x, y, ms) => { try { graphRef.current?.centerAt(x, y, ms) } catch(e) {} },
    zoom:     (k, ms)    => { try { graphRef.current?.zoom(k, ms) }         catch(e) {} },
    zoomToFit:(ms, p)    => { try { graphRef.current?.zoomToFit(ms, p) }    catch(e) {} },
    setModo3D: (v) => {
      setCambiandoModo(true)
      setModoVisible(false)
      setTimeout(() => {
        setModo3D(v)
        Promise.all([
          fetch(`${API}/nodos`).then(r => r.json()),
          fetch(`${API}/relacions`).then(r => r.json())
        ]).then(([nodosRes, relaRes]) => {
          const nodes = nodosRes.nodos.map(n => ({
            id: n.id, label: n.label,
            type:   n.id === 'gaia' ? 'origin' : (n.type || 'concept'),
            status: n.status, centro: n.centro || '',
            fx: n.id === 'gaia' ? 0 : undefined,
            fy: n.id === 'gaia' ? 0 : undefined
          }))
          const links = (relaRes.relacions || []).map(r => ({
            source: r.source, target: r.target,
            tipo: r.tipo, strength: r.strength || 'medium'
          }))
          setDatos({ nodes, links })
        })
        setCambiandoModo(false)
        setTimeout(() => {
          setModoVisible(true)
          setTimeout(() => graphRef.current?.zoomToFit(400, 50), 800)
        }, 100)
      }, 400)
    }
  }))
  // ── FIN: imperative_handle ───────────────────────────

  // ── INICIO: estrelas_fondo ───────────────────────────
  const getEstrelas = useCallback((cx, cy, w, h, zoom) => {
    const celdaW  = w / zoom
    const celdaH  = h / zoom
    const marxe   = 2
    const resultado = []
    for (let ix = -marxe; ix <= marxe; ix++) {
      for (let iy = -marxe; iy <= marxe; iy++) {
        const celdaX = Math.floor(cx / celdaW) + ix
        const celdaY = Math.floor(cy / celdaH) + iy
        const seed   = celdaX * 73856093 ^ celdaY * 19349663
        for (let i = 0; i < 8; i++) {
          const s  = Math.sin(seed + i * 127.1) * 43758.5453
          const s2 = Math.sin(seed + i * 311.7) * 43758.5453
          const s3 = Math.sin(seed + i * 74.3)  * 43758.5453
          const s4 = Math.sin(seed + i * 183.9) * 43758.5453
          const fx = s  - Math.floor(s)
          const fy = s2 - Math.floor(s2)
          const r  = (s3 - Math.floor(s3)) * 1.4 + 0.3
          const o  = (s4 - Math.floor(s4)) * 0.5 + 0.1
          resultado.push({
            x: (celdaX + fx) * celdaW,
            y: (celdaY + fy) * celdaH,
            r: r * (zoom < 1 ? 1 / zoom : 1), o
          })
        }
      }
    }
    return resultado
  }, [])
  // ── FIN: estrelas_fondo ──────────────────────────────

  // ── INICIO: carga_datos ──────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const [nodosRes, relaRes] = await Promise.all([
          fetch(`${API}/nodos`).then(r => r.json()),
          fetch(`${API}/relacions`).then(r => r.json())
        ])
        const nodes = nodosRes.nodos.map(n => ({
          id: n.id, label: n.label,
          type:   n.id === 'gaia' ? 'origin' : (n.type || 'concept'),
          status: n.status, centro: n.centro || '',
          fx: n.id === 'gaia' ? 0 : undefined,
          fy: n.id === 'gaia' ? 0 : undefined
        }))
        const links = (relaRes.relacions || []).map(r => ({
          source: r.source, target: r.target,
          tipo: r.tipo, strength: r.strength || 'medium'
        }))
        setDatos({ nodes, links })
      } catch (err) { console.error('Erro:', err) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])
  // ── FIN: carga_datos ─────────────────────────────────

  // ── INICIO: centrar_nodo_foco ────────────────────────
  useEffect(() => {
    if (!nodoFoco || !graphRef.current) return
    const timer = setTimeout(() => {
      const node = datos.nodes.find(n => n.id === nodoFoco)
      if (node && node.x != null && node.y != null) {
        try { graphRef.current.centerAt(node.x, node.y, 800) } catch(e) {}
        try { graphRef.current.zoom(4, 800) } catch(e) {}
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [nodoFoco, datos])
  // ── FIN: centrar_nodo_foco ───────────────────────────

  // ── INICIO: actualizar_forzas ────────────────────────
  useEffect(() => {
    if (!graphRef.current) return
    const fg = graphRef.current
    fg.d3Force('charge')?.strength(node => {
      if (node.type === 'origin')        return cfg.forzas.repulsion * 3
      if (node.type === 'galaxy')        return cfg.forzas.repulsion * 2
      if (node.type === 'constellation') return cfg.forzas.repulsion * 1.5
      if (node.type === 'system')        return cfg.forzas.repulsion
      return cfg.forzas.repulsion * 0.7
    })
    fg.d3Force('link')?.distance(link => {
      const s = link.source?.type || link.source
      const t = link.target?.type || link.target
      if (s === 'origin' || t === 'origin')               return cfg.forzas.distancia_link * 3
      if (s === 'galaxy' || t === 'galaxy')               return cfg.forzas.distancia_link * 2.5
      if (s === 'constellation' || t === 'constellation') return cfg.forzas.distancia_link * 1.8
      if (s === 'system' || t === 'system')               return cfg.forzas.distancia_link
      return cfg.forzas.distancia_link * 0.6
    })
    fg.d3ReheatSimulation()
  }, [cfg.forzas, datos])
  // ── FIN: actualizar_forzas ───────────────────────────

  // ── INICIO: refrescar_forzas ─────────────────────────
  // Función que o usuario dispara co botón ou coa tecla R.
  //
  // Replica exactamente o que fai o cambio entre 2D e 3D: recarga os
  // datos dende cero (nodos sen posicións previas), así force-graph
  // asígnalles posicións aleatorias iniciais e a simulación redistribúeos
  // correctamente con warmupTicks. É o único xeito de conseguir unha
  // reorganización real — d3ReheatSimulation() só axita as posicións
  // existentes, non desbloquea nodos amoreados.
  const refrescarForzas = useCallback(async () => {
    if (!graphRef.current) return
    setRefrescando(true)

    try {
      const [nodosRes, relaRes] = await Promise.all([
        fetch(`${API}/nodos`).then(r => r.json()),
        fetch(`${API}/relacions`).then(r => r.json())
      ])
      const nodes = nodosRes.nodos.map(n => ({
        id: n.id, label: n.label,
        type:   n.id === 'gaia' ? 'origin' : (n.type || 'concept'),
        status: n.status, centro: n.centro || '',
        fx: n.id === 'gaia' ? 0 : undefined,
        fy: n.id === 'gaia' ? 0 : undefined
      }))
      const links = (relaRes.relacions || []).map(r => ({
        source: r.source, target: r.target,
        tipo: r.tipo, strength: r.strength || 'medium'
      }))
      // Reset flag de engineStop para que o zoomToFit volva disparar
      engineStopRef.current = false
      setDatos({ nodes, links })

      // zoomToFit tras tempo suficiente para que a simulación asente
      setTimeout(() => {
        try { graphRef.current?.zoomToFit(600, 80) } catch(e) {}
        setRefrescando(false)
      }, 1400)

    } catch (e) {
      console.warn('[MapaUniverso] refrescarForzas:', e.message)
      setRefrescando(false)
    }
  }, [])
  // ── FIN: refrescar_forzas ────────────────────────────

  // ── INICIO: shortcut_R ───────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      // Evita disparar se o usuario está a escribir nun input
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          refrescarForzas()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [refrescarForzas])
  // ── FIN: shortcut_R ──────────────────────────────────

  // ── INICIO: helpers ──────────────────────────────────
  const getNodoCor    = useCallback((node) => cfg.cor[node.type]    || '#ffffff', [cfg])
  const getNodoTamaño = useCallback((node) => cfg.tamaño[node.type] || 5,         [cfg])

  const estaConectado = useCallback((node, activo) => {
    if (!activo) return true
    if (node.id === activo.id) return true
    return datos.links.some(l => (
      ((l.source?.id || l.source) === node.id && (l.target?.id || l.target) === activo.id) ||
      ((l.target?.id || l.target) === node.id && (l.source?.id || l.source) === activo.id)
    ))
  }, [datos.links])

  const linkConectado = useCallback((link, activo) => {
    if (!activo) return true
    return (link.source?.id || link.source) === activo.id ||
           (link.target?.id || link.target) === activo.id
  }, [])
  // ── FIN: helpers ─────────────────────────────────────

  // ── INICIO: render_nodo ──────────────────────────────
  const renderNodo = useCallback((node, ctx, globalScale) => {
    const size     = getNodoTamaño(node)
    const cor      = getNodoCor(node)
    const conectado          = estaConectado(node, nodoActivo)
    const nodoPertenceCentro = centroFiltro && node.centro === centroFiltro
    const corFinal           = nodoPertenceCentro ? '#6ee7b7' : cor
    const opacidadeCentro    = centroFiltro ? (nodoPertenceCentro ? 1 : 0.12) : 1
    const opacidade = nodoActivo
      ? (conectado ? 1 : cfg.seleccion.opacidade_non_conectado) * opacidadeCentro
      : opacidadeCentro
    const glowExtra = lupaActiva ? 2.2 : nodoPertenceCentro ? 2.8 : 1
    const haloExtra = lupaActiva ? 3.0 : nodoPertenceCentro ? 3.5 : 2.2

    ctx.save()
    ctx.shadowBlur  = cfg.glow.intensidade * glowExtra
    ctx.shadowColor = corFinal
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle   = corFinal
    ctx.globalAlpha = opacidade * (lupaActiva ? 0.45 : 0.3)
    ctx.fill()
    ctx.restore()

    ctx.beginPath()
    ctx.arc(node.x, node.y, size * haloExtra, 0, 2 * Math.PI)
    ctx.fillStyle = corFinal + (lupaActiva ? '22' : nodoPertenceCentro ? '33' : '15')
    ctx.fill()

    ctx.save()
    ctx.shadowBlur  = cfg.glow.intensidade * glowExtra * 1.5
    ctx.shadowColor = corFinal
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle   = corFinal
    ctx.globalAlpha = opacidade
    ctx.fill()
    ctx.restore()

    if (node.x != null && node.y != null) {
      const gradient = ctx.createRadialGradient(
        node.x - size * 0.3, node.y - size * 0.3, 0,
        node.x, node.y, size
      )
      gradient.addColorStop(0, 'rgba(255,255,255,0.4)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
      ctx.fillStyle   = gradient
      ctx.globalAlpha = opacidade
      ctx.fill()
      ctx.globalAlpha = 1
    }

    if (globalScale >= 2 || node.type === 'galaxy' || node.type === 'constellation' || node.type === 'origin') {
      const baseFontSize = node.type === 'origin' ? 18 : node.type === 'constellation' ? 14 : node.type === 'galaxy' ? 12 : node.type === 'system' ? 10 : 9
      const fontSize     = Math.max(baseFontSize / globalScale, node.type === 'origin' ? 10 : node.type === 'constellation' ? 8 : 6)
      ctx.font      = `bold ${fontSize}px Arial`
      ctx.textAlign = 'center'
      const labelY    = node.y + size + fontSize + 2
      const labelText = node[`label_${idioma}`] || node.label || node.id
      ctx.strokeStyle = 'rgba(0,0,0,0.9)'
      ctx.lineWidth   = node.type === 'origin' ? 4 : 3
      ctx.strokeText(labelText, node.x, labelY)
      ctx.fillStyle   = nodoPertenceCentro ? '#6ee7b7' : cfg.label?.[node.type] || `rgba(255,255,255,${opacidade * 0.8})`
      ctx.globalAlpha = opacidade
      ctx.fillText(labelText, node.x, labelY)
      ctx.globalAlpha = 1
    }
  }, [nodoActivo, getNodoCor, getNodoTamaño, estaConectado, cfg, idioma, lupaActiva, centroFiltro])
  // ── FIN: render_nodo ─────────────────────────────────

  // ── INICIO: handler_hover ────────────────────────────
  const handleNodeHover = useCallback((node) => {
    if (!lupaActiva) { setTooltip(null); return }
    if (!node)       { setTooltip(null); return }
    sonHover(node.type)
    if (node.x != null && node.y != null && graphRef.current) {
      const { x, y } = graphRef.current.graph2ScreenCoords(node.x, node.y)
      setTooltip({ x, y, node })
    }
  }, [lupaActiva])
  // ── FIN: handler_hover ───────────────────────────────

  // ── INICIO: handler_click ────────────────────────────
  const handleNodeClick = useCallback((node) => {
    sonClickNodo(node.type)
    if (lupaActiva) {
      setTooltip(null)
      if (graphRef.current && node.x != null && node.y != null) {
        setZoomSaindo(true)
        sonZoom('in')
        try { graphRef.current.centerAt(node.x, node.y, 400) } catch(e) {}
        try { graphRef.current.zoom(6, 400) } catch(e) {}
        setTimeout(() => {
          setZoomSaindo(false)
          if (onNodoSeleccionado) onNodoSeleccionado(node)
        }, 420)
      } else {
        if (onNodoSeleccionado) onNodoSeleccionado(node)
      }
    } else {
      setNodoActivo(prev => prev?.id === node.id ? null : node)
      if (onNodoSeleccionado) onNodoSeleccionado(node)
    }
  }, [lupaActiva, onNodoSeleccionado])
  // ── FIN: handler_click ───────────────────────────────

  // ── INICIO: cor_particulas ───────────────────────────
  const corParticula = useCallback((link) =>
    linkConectado(link, nodoActivo) ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)'
  , [nodoActivo, linkConectado])
  // ── FIN: cor_particulas ──────────────────────────────

  // ── INICIO: node_three_object ────────────────────────
  const nodeThreeObject = useCallback(node => {
    const color      = cfg.cor[node.type] || '#ffffff'
    const isImp      = ['origin', 'galaxy', 'constellation'].includes(node.type)
    const esActivo   = nodoActivo?.id === node.id
    const estaConec  = estaConectado(node, nodoActivo)
    let opacidade    = 0.75
    if (nodoActivo) opacidade = esActivo ? 1 : estaConec ? 0.8 : 0.1
    else if (isImp) opacidade = 1

    if (isImp) {
      const material = new THREE.MeshLambertMaterial({
        color, emissive: color,
        emissiveIntensity: esActivo ? 2 : 0.5,
        transparent: true, opacity: opacidade
      })
      const mesh = new THREE.Mesh(GEO[node.type], material)
      mesh.__gaiaMaterial = material
      return mesh
    }

    if (node.type === 'system') {
      const material = new THREE.MeshLambertMaterial({
        color, emissive: color,
        emissiveIntensity: esActivo ? 2 : 0.3,
        transparent: true, opacity: opacidade
      })
      const ringMat = new THREE.MeshBasicMaterial({
        color, transparent: true,
        opacity: esActivo ? 0.6 : 0.2, side: THREE.DoubleSide
      })
      const group = new THREE.Group()
      group.add(new THREE.Mesh(GEO.system, material))
      const ring = new THREE.Mesh(GEO.ring, ringMat)
      ring.rotation.x = Math.PI / 3
      group.add(ring)
      group.__gaiaMaterials = [material, ringMat]
      return group
    }

    const mat = new THREE.SpriteMaterial({
      color, transparent: true, opacity: opacidade,
      blending: THREE.AdditiveBlending
    })
    const sprite = new THREE.Sprite(mat)
    const s = node.type === 'process' ? 4 : 3
    sprite.scale.set(s, s, 1)
    sprite.__gaiaMaterial = mat
    return sprite
  }, [nodoActivo, cfg, estaConectado])
  // ── FIN: node_three_object ───────────────────────────

  if (cargando) return (
    <div style={{ width: '100%', height: '100%', background: cfg.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '14px' }}>
      Cargando universo...
    </div>
  )

  return (
    <div style={{
      width: '100%', height: '100%', background: cfg.fondo, position: 'relative',
      opacity: modoVisible ? 1 : 0,
      filter:    cambiandoModo ? 'blur(12px) brightness(1.3)' : zoomSaindo ? 'blur(6px) brightness(1.4)' : 'blur(0px) brightness(1)',
      transform: zoomSaindo ? 'scale(1.06)' : 'scale(1)',
      transition: cambiandoModo
        ? 'opacity 300ms ease, filter 400ms ease'
        : zoomSaindo
          ? 'filter 380ms ease, transform 380ms ease'
          : 'opacity 300ms ease, filter 200ms ease, transform 200ms ease'
    }}>

      {lupaActiva && !modo3D && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'rgba(4,3,2,0.18)', backdropFilter: 'blur(0.8px)', WebkitBackdropFilter: 'blur(0.8px)', transition: 'opacity 400ms ease' }} />
      )}

      {/* ── INICIO: mapa_3d ── */}
      {modo3D && (
        <ForceGraph3D
          key="graph-3d"
          ref={graphRef}
          graphData={datos}
          backgroundColor={cfg.fondo || '#02050a'}
          enableNodeDrag={!modoUsuario}
          nodeThreeObject={nodeThreeObject}
          nodeLabel={node => `
            <div style="background:rgba(0,0,0,0.85);color:#fff;padding:5px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);font-family:'Space Grotesk',sans-serif;font-size:12px;">
              <b style="color:${cfg.cor[node.type] || '#fff'}">${(node.type || '').toUpperCase()}</b><br/>
              ${node[`label_${idioma}`] || node.label || node.id}
            </div>
          `}
          linkColor={link => {
            const s      = link.source?.type || link.source
            const t      = link.target?.type || link.target
            const activo = nodoActivo && (
              (link.source?.id || link.source) === nodoActivo.id ||
              (link.target?.id || link.target) === nodoActivo.id
            )
            if (s === 'origin' || t === 'origin') return `rgba(255,220,100,${activo ? 0.9 : 0.3})`
            if (s === 'galaxy' || t === 'galaxy') return `rgba(201,168,76,${activo ? 0.7 : 0.15})`
            if (s === 'constellation' || t === 'constellation') return `rgba(168,85,247,${activo ? 0.6 : 0.1})`
            return `rgba(255,255,255,${activo ? 0.5 : 0.06})`
          }}
          linkWidth={link => {
            const s      = link.source?.type || link.source
            const t      = link.target?.type || link.target
            const activo = nodoActivo && (
              (link.source?.id || link.source) === nodoActivo.id ||
              (link.target?.id || link.target) === nodoActivo.id
            )
            const base = activo ? 1.5 : 0.2
            if (s === 'origin' || t === 'origin') return base * 3
            if (s === 'galaxy' || t === 'galaxy') return base * 2
            return base
          }}
          linkDirectionalParticles={link => {
            if (!nodoActivo) return 0
            const activo = (link.source?.id || link.source) === nodoActivo.id ||
                           (link.target?.id || link.target) === nodoActivo.id
            return activo ? 4 : 0
          }}
          linkDirectionalParticleWidth={1.2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={link => {
            const s = link.source?.type || link.source
            const t = link.target?.type || link.target
            if (s === 'origin' || t === 'origin') return 'rgba(255,220,100,0.9)'
            if (s === 'galaxy' || t === 'galaxy') return 'rgba(201,168,76,0.8)'
            return 'rgba(200,200,255,0.6)'
          }}
          onEngineStop={() => {
            if (!graphRef.current) return
            try {
              const scene = graphRef.current.scene()
              if (!scene || scene.__gaiaInicializada) return
              scene.__gaiaInicializada = true
              scene.fog = new THREE.FogExp2(0x02050a, 0.0006)
              scene.add(new THREE.AmbientLight(0xffffff, 0.5))
              const luzCentro = new THREE.PointLight(0xe2b96a, 10, 500, 2)
              luzCentro.position.set(0, 0, 0)
              scene.add(luzCentro)
            } catch(e) { console.warn('Efectos 3D:', e.message) }
          }}
          onNodeClick={node => {
            sonClickNodo(node.type)
            setNodoActivo(prev => prev?.id === node.id ? null : node)
            if (onNodoSeleccionado) onNodoSeleccionado(node)
            if (graphRef.current && node.x != null) {
              const distancia = node.type === 'origin' ? 300 : node.type === 'galaxy' ? 220 : node.type === 'constellation' ? 160 : 100
              const angulo    = Date.now() / 1000
              graphRef.current.cameraPosition(
                { x: node.x + distancia * Math.sin(angulo), y: node.y + distancia * 0.4, z: (node.z || 0) + distancia * Math.cos(angulo) },
                { x: node.x, y: node.y, z: node.z || 0 },
                1400
              )
            }
          }}
          onBackgroundClick={() => setNodoActivo(null)}
          showNavInfo={false}
          warmupTicks={cfg.rendemento?.warmup_ticks || 50}
          incrementalRendering={true}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
      {/* ── FIN: mapa_3d ── */}

      {/* ── INICIO: labels_overlay_3d ── */}
      {modo3D && labels3D.map(l => (
        <div key={l.id} style={{
          position: 'absolute',
          left: l.x, top: l.y - 32,
          transform: 'translateX(-50%)',
          pointerEvents: 'none', zIndex: 10,
          background:   'rgba(4,6,14,0.88)',
          border:       `1px solid ${l.cor}55`,
          borderRadius: 6, padding: '3px 10px',
          fontSize:   l.type === 'origin' ? 13 : l.type === 'galaxy' ? 11 : 10,
          fontWeight: 600, color: l.cor,
          fontFamily:    "'Space Grotesk', sans-serif",
          letterSpacing: '0.5px', whiteSpace: 'nowrap',
          boxShadow: `0 0 8px ${l.cor}33`,
          opacity: Math.max(0, Math.min(1, (800 - l.dist) / 400))
        }}>
          {l.label}
        </div>
      ))}
      {/* ── FIN: labels_overlay_3d ── */}

      {/* ── INICIO: mapa_2d ── */}
      {!modo3D && (
        <ForceGraph2D
          pauseAnimation={pauseAnimation}
          key="graph-2d"
          ref={graphRef}
          graphData={datos}
          backgroundColor={cfg.fondo}
          nodeCanvasObject={renderNodo}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.beginPath()
            ctx.arc(node.x, node.y, (getNodoTamaño(node) || 5) + 4, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          }}
          enableNodeDrag={!modoUsuario}
          linkWidth={link => {
            const conectado = linkConectado(link, nodoActivo)
            const type      = link.source?.type || link.source || link.target?.type || link.target
            const factor    = lupaActiva ? 0.5 : 1
            const grosores  = {
              origin:        conectado ? cfg.seleccion.grosor_link_activo * 1.5 : cfg.seleccion.grosor_link_inactivo * 3,
              galaxy:        conectado ? cfg.seleccion.grosor_link_activo       : cfg.seleccion.grosor_link_inactivo * 2,
              constellation: conectado ? cfg.seleccion.grosor_link_activo * 0.8 : cfg.seleccion.grosor_link_inactivo * 1.5
            }
            return (grosores[type] || (conectado ? cfg.seleccion.grosor_link_activo * 0.5 : cfg.seleccion.grosor_link_inactivo)) * factor
          }}
          linkColor={link => {
            const type      = link.source?.type || link.source || link.target?.type || link.target
            const conectado = linkConectado(link, nodoActivo)
            const opBase    = lupaActiva ? cfg.relacions.opacidade * 0.6 : cfg.relacions.opacidade
            const alpha     = conectado ? opBase * 3 : opBase
            const colores   = {
              origin:        `rgba(255,220,100,${alpha * 1.5})`,
              galaxy:        `rgba(201,168,76,${alpha * 1.2})`,
              constellation: `rgba(168,85,247,${alpha})`
            }
            return colores[type] || `rgba(255,255,255,${alpha})`
          }}
          linkCurvature={link => {
            const type = link.source?.type || link.source || link.target?.type || link.target
            if (type === 'origin') return 0
            if (type === 'galaxy') return 0.1
            return 0.2
          }}
          linkCurveRotation={0.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={cfg.relacions.particulas_tamaño}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={corParticula}
          onRenderFramePre={(ctx, globalScale) => {
            const transform = ctx.getTransform()
            const cx = -transform.e / transform.a
            const cy = -transform.f / transform.d
            const w  = ctx.canvas.width  / transform.a
            const h  = ctx.canvas.height / transform.d
            const t  = Date.now()

            getEstrelas(cx, cy, w, h, globalScale).forEach((s, i) => {
              const opFinal = Math.max(0.05, s.o + Math.sin(t * 0.0015 + i * 2.3) * 0.15)
              ctx.beginPath()
              ctx.arc(s.x, s.y, s.r * (1 + Math.sin(t * 0.002 + i * 1.7) * 0.1), 0, 2 * Math.PI)
              ctx.fillStyle = `rgba(255,255,255,${opFinal})`
              ctx.fill()
            })

            if (datos?.nodes) {
              const haloConfig = {
                origin:        { cor: '255,220,100', radio: 80, op: 0.12, glow: true },
                galaxy:        { cor: '201,168,76',  radio: 55, op: 0.09, glow: true },
                constellation: { cor: '168,85,247',  radio: 38, op: 0.07, glow: false },
                system:        { cor: '59,130,246',  radio: 25, op: 0.05, glow: false }
              }
              ctx.save()
              ctx.globalCompositeOperation = 'lighter'
              datos.nodes.forEach(node => {
                const hc = haloConfig[node.type]
                if (!hc || !node.x) return
                if (node.x < cx - 200 || node.x > cx + w + 200 || node.y < cy - 200 || node.y > cy + h + 200) return
                const radioFinal = (hc.radio * (1 + Math.sin(t * 0.0005 + node.x * 0.01) * 0.08) * 3.5) / globalScale
                ctx.shadowBlur = hc.glow ? 15 : 0
                if (hc.glow) ctx.shadowColor = `rgba(${hc.cor}, 0.4)`
                const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radioFinal)
                grad.addColorStop(0,   `rgba(${hc.cor}, ${hc.op * 0.9})`)
                grad.addColorStop(0.7, `rgba(${hc.cor}, ${hc.op * 0.2})`)
                grad.addColorStop(1,   `rgba(${hc.cor}, 0)`)
                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.arc(node.x, node.y, radioFinal, 0, 2 * Math.PI)
                ctx.fill()
              })
              ctx.restore()
            }
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={() => { setNodoActivo(null); setTooltip(null) }}
          // ── INICIO: fix_engine_stop ──────────────────
          onEngineStop={() => {
            if (engineStopRef.current) return
            engineStopRef.current = true
            graphRef.current?.zoomToFit(400, 50)
          }}
          // ── FIN: fix_engine_stop ─────────────────────
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
      {/* ── FIN: mapa_2d ── */}

      {/* ── INICIO: tooltip_hover_lupa ── */}
      {lupaActiva && !modo3D && tooltip && (
        <div style={{ position: 'absolute', left: tooltip.x + 16, top: tooltip.y - 10, zIndex: 20, pointerEvents: 'none', animation: 'tooltipIn 150ms ease forwards' }}>
          <style>{`@keyframes tooltipIn { from{opacity:0;transform:translateY(4px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
          <div style={{ background: 'rgba(6,8,18,0.92)', border: `1px solid ${cfg.cor[tooltip.node.type] || '#444'}44`, borderLeft: `3px solid ${cfg.cor[tooltip.node.type] || '#e2b96a'}`, borderRadius: 8, padding: '10px 14px', minWidth: 160, maxWidth: 240, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${cfg.cor[tooltip.node.type] || '#e2b96a'}22` }}>
            <div style={{ fontSize: 10, letterSpacing: '1.5px', color: cfg.cor[tooltip.node.type] || '#e2b96a', marginBottom: 5, textTransform: 'uppercase' }}>{tooltip.node.type}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 4, lineHeight: 1.3 }}>{tooltip.node[`label_${idioma}`] || tooltip.node.label || tooltip.node.id}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>Clic para explorar →</div>
          </div>
        </div>
      )}
      {/* ── FIN: tooltip_hover_lupa ── */}

      {/* ── INICIO: boton_refrescar_forzas ── */}
      <style>{`
        @keyframes refrescarXirar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <button
        onClick={refrescarForzas}
        title="Reorganizar mapa (R)"
        aria-label="Reorganizar mapa"
        style={{
          position: 'absolute',
          top: 72,
          right: 16,
          zIndex: 30,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(10, 16, 32, 0.85)',
          border: '1px solid rgba(232, 165, 71, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#e8a547',
          cursor: refrescando ? 'wait' : 'pointer',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(232, 165, 71, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(232, 165, 71, 0.7)'
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(10, 16, 32, 0.85)'
          e.currentTarget.style.borderColor = 'rgba(232, 165, 71, 0.35)'
          e.currentTarget.style.transform = 'scale(1)'
        }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: refrescando ? 'refrescarXirar 0.8s linear infinite' : 'none'
          }}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
      {/* ── FIN: boton_refrescar_forzas ── */}

    </div>
  )
})

export default MapaUniverso