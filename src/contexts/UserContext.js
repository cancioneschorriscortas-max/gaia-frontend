import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { calcularNivel, XP_ACCIONS } from '../niveis'
import { getNivelDoCurso } from '../cursos'
import { getRolById } from '../roles'
// ── INICIO: config ───────────────────────────────────
const API = process.env.REACT_APP_API || 'http://localhost:4000'
// ── FIN: config ──────────────────────────────────────

// ── INICIO: contexto ─────────────────────────────────
const UserContext = createContext(null)

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider')
  return ctx
}
// ── FIN: contexto ────────────────────────────────────

// ── INICIO: estado_inicial ───────────────────────────
const cargarSesionLocal = () => {
  try {
    const token   = localStorage.getItem('gaia_token')
    const usuario = JSON.parse(localStorage.getItem('gaia_usuario') || 'null')
    if (!token || !usuario) return { token: null, usuario: null }
    // Verificar que o token non expirou no cliente
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('gaia_token')
      localStorage.removeItem('gaia_usuario')
      return { token: null, usuario: null }
    }
    return { token, usuario }
  } catch {
    return { token: null, usuario: null }
  }
}
// ── FIN: estado_inicial ──────────────────────────────

export function UserProvider({ children }) {

  // ── INICIO: estado ───────────────────────────────────
  const sesionInicial = cargarSesionLocal()
  const [token,   setToken]   = useState(sesionInicial.token)
  const [usuario, setUsuario] = useState(sesionInicial.usuario)
  const [xp, setXp] = useState({
    total:       sesionInicial.usuario?.xp_total       || 0,
    exploracion: sesionInicial.usuario?.xp_exploracion || 0,
    conexion:    sesionInicial.usuario?.xp_conexion    || 0,
    comprension: sesionInicial.usuario?.xp_comprension || 0,
  })
  const [nivel, setNivel] = useState(
    calcularNivel(sesionInicial.usuario?.xp_total || 0)
  )
  // ── FIN: estado ──────────────────────────────────────

  // ── INICIO: cabeceira_auth ───────────────────────────
  const authHeaders = useCallback(() => ({
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])
  // ── FIN: cabeceira_auth ──────────────────────────────

  // ── INICIO: gardar_sesion ────────────────────────────
  const gardarSesion = useCallback((novoToken, novoUsuario) => {
    localStorage.setItem('gaia_token',   novoToken)
    localStorage.setItem('gaia_usuario', JSON.stringify(novoUsuario))
    setToken(novoToken)
    setUsuario(novoUsuario)
    const xpTotal = novoUsuario.xp_total || 0
    setXp({
      total:       xpTotal,
      exploracion: novoUsuario.xp_exploracion || 0,
      conexion:    novoUsuario.xp_conexion    || 0,
      comprension: novoUsuario.xp_comprension || 0,
    })
    setNivel(calcularNivel(xpTotal))
  }, [])
  // ── FIN: gardar_sesion ───────────────────────────────

  // ── INICIO: login ────────────────────────────────────
  const login = useCallback(async (nome, centro, contrasinal) => {
    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome, centro, contrasinal })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro no login')
    gardarSesion(data.token, data.usuario)
    return data.usuario
  }, [gardarSesion])
  // ── FIN: login ───────────────────────────────────────

  // ── INICIO: rexistro ─────────────────────────────────
  const rexistro = useCallback(async (campos) => {
  const res = await fetch(`${API}/auth/rexistro`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(campos)
  })
  const data = await res.json()
  if (!res.ok) {
    // Extraer mensaxe detallada do validador
    if (data.detalle && data.detalle.length > 0) {
      throw new Error(data.detalle[0].msg)
    }
    throw new Error(data.error || 'Erro no rexistro')
  }
  gardarSesion(data.token, data.usuario)
  return data.usuario
}, [gardarSesion])
  // ── FIN: rexistro ────────────────────────────────────
const esArquitecto = usuario?.arquitecto === true
  // ── INICIO: logout ───────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('gaia_token')
    localStorage.removeItem('gaia_usuario')
    localStorage.removeItem('gaia_intro_vista')
    setToken(null)
    setUsuario(null)
    setXp({ total: 0, exploracion: 0, conexion: 0, comprension: 0 })
    setNivel(calcularNivel(0))
  }, [])
  // ── FIN: logout ──────────────────────────────────────

  // ── INICIO: rexistrar_xp ─────────────────────────────
  // Optimistic update — actualiza UI de inmediato, envía ao servidor async
  const rexistrarXP = useCallback(async (accionKey, nodoId = null) => {
    if (!token || !usuario || usuario.explorador) return null

    const accion = XP_ACCIONS[accionKey]
    if (!accion) return null

    // Actualización local inmediata
    const cantidade = accion.base
    setXp(prev => {
      const novoTotal = prev.total + cantidade
      setNivel(calcularNivel(novoTotal))
      return {
        ...prev,
        total:          novoTotal,
        [accion.tipo]:  prev[accion.tipo] + cantidade
      }
    })

    // Envío ao servidor en segundo plano
    try {
      const res = await fetch(`${API}/xp`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({
          tipo:      accion.tipo,
          cantidade: accion.base,
          motivo:    accion.motivo,
          nodoId
        })
      })
      if (res.ok) {
        const data = await res.json()
        // Sincronizar co valor real do servidor
        setXp(prev => ({ ...prev, total: data.xp_total }))
        setNivel(data.nivel)
      }
    } catch {
      // Fallo silencioso — o XP local mantense para esta sesión
    }

    return { tipo: accion.tipo, cantidade, motivo: accion.motivo }
  }, [token, usuario, authHeaders])
  // ── FIN: rexistrar_xp ────────────────────────────────

  // ── INICIO: rexistrar_reto_xp ────────────────────────
  const rexistrarRetoXP = useCallback(async (nivel, nodoId = null) => {
    const claves = {
      primary:   'RETO_PRIMARY',
      secondary: 'RETO_SECONDARY',
      expert:    'RETO_EXPERT'
    }
    return rexistrarXP(claves[nivel] || 'RETO_PRIMARY', nodoId)
  }, [rexistrarXP])
  // ── FIN: rexistrar_reto_xp ───────────────────────────

  // ── INICIO: actualizar_perfil_servidor ───────────────
  // Refresca os datos do servidor ao montar se hai token
  useEffect(() => {
    if (!token) return
    fetch(`${API}/auth/perfil`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { logout(); return }
        const xpTotal = data.xp_total || 0
        console.log('PERFIL DO SERVIDOR:', data.arquitecto)
        setUsuario(data)
        setXp({
          total:       xpTotal,
          exploracion: data.xp_exploracion || 0,
          conexion:    data.xp_conexion    || 0,
          comprension: data.xp_comprension || 0,
        })
        setNivel(calcularNivel(xpTotal))
        localStorage.setItem('gaia_usuario', JSON.stringify(data))
      })
      .catch(() => {})
  }, [token, logout])
  // ── FIN: actualizar_perfil_servidor ──────────────────
 
// ── INICIO: nivel_contido_automatico ────────────────
const nivelContido = useCallback(() => {
  if (!usuario) return 'primary'
  if (usuario.rol === 'profesor') return 'expert'
  return getNivelDoCurso(usuario.curso)
}, [usuario])
// ── FIN: nivel_contido_automatico ───────────────────
// ── INICIO: rol_personaxe ────────────────────────────
const [rolPersonaxe, setRolPersonaxeState] = useState(
  usuario?.rol_personaxe || ''
)

const actualizarRolPersonaxe = useCallback(async (rolId, bloqueId = '', profesionId = '') => {
  try {
    const res = await fetch(`${API}/usuario/rol`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify({
        rol_personaxe:       rolId,
        bloque_personaxe:    bloqueId,
        profesion_personaxe: profesionId
      })
    })
    if (res.ok) {
      setRolPersonaxeState(rolId)
      const usuarioActualizado = {
        ...usuario,
        rol_personaxe:       rolId,
        bloque_personaxe:    bloqueId,
        profesion_personaxe: profesionId
      }
      setUsuario(usuarioActualizado)
      localStorage.setItem('gaia_usuario', JSON.stringify(usuarioActualizado))
    }
  } catch (e) {
    console.error('Erro actualizando rol:', e)
  }
}, [authHeaders, usuario])
// ── FIN: rol_personaxe ───────────────────────────────
  // ── INICIO: valor_contexto ───────────────────────────
  const valor = {
    // Estado
    usuario,
    token,
    xp,
    nivel,
    estaAutenticado: !!token && !!usuario,
    esProfesor:      usuario?.rol === 'profesor',
    esExplorador:    usuario?.explorador === true,
    // ── NOVO: arquitecto ────────────────────────────────
    esArquitecto:    usuario?.arquitecto === true,
    // ── FIN: arquitecto ─────────────────────────────────
    rolPersonaxe,
    rolPersonaxeData: getRolById(rolPersonaxe),
    actualizarRolPersonaxe,
    nivelContido,
    // Accións auth
    login,
    rexistro,
    logout,
    // Accións XP
    rexistrarXP,
    rexistrarRetoXP,
    // Utilidades
    authHeaders,
  }
  // ── FIN: valor_contexto ──────────────────────────────

  return (
    <UserContext.Provider value={valor}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext