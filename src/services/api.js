const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function req(path, options = {}) {
  const res  = await fetch(`${API_URL}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.erro || 'Erro desconhecido')
  return data
}

// ── Usuários ──────────────────────────────────────────────────────────────

export async function criarUsuario({ nome, email, senha }) {
  const d = await req('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  })
  return d.usuario
}

export async function loginUsuario({ email, senha }) {
  const d = await req('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  return d.usuario
}

export async function atualizarUsuario(id, campos) {
  const d = await req(`/usuarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campos),
  })
  return d.usuario
}

export async function salvarPreferencias({ usuario_id, categorias }) {
  return req('/preferencias_usuario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, categorias }),
  })
}

// ── Parties ───────────────────────────────────────────────────────────────

export async function criarParty({ titulo, criada_por, cidade, codigo_convite }) {
  const d = await req('/parties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, criada_por, cidade, codigo_convite }),
  })
  return d.party
}

export async function getParty(codigo) {
  const d = await req(`/parties/${codigo}`)
  return d.party
}

// alias kept for JoinPartyPage
export const getPartyByCodigo = getParty

export async function listarPartiesUsuario(usuario_id) {
  const d = await req(`/parties?usuario_id=${usuario_id}`)
  return d.parties
}

// ── Membros ───────────────────────────────────────────────────────────────

export async function adicionarMembro({ codigo, usuario_id, papel = 'member', lat = null, lng = null, accuracy = null }) {
  const d = await req(`/parties/${codigo}/membros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, papel, lat, lng, accuracy }),
  })
  return d.membro
}

export async function kickarMembro(codigo, usuario_id, host_id) {
  return req(`/parties/${codigo}/membros/${usuario_id}?host_id=${host_id}`, { method: 'DELETE' })
}

export async function atualizarNicknameMembro(codigo, usuario_id, nickname) {
  const d = await req(`/parties/${codigo}/membros/${usuario_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  })
  return d.membro
}

// ── Votos ─────────────────────────────────────────────────────────────────

export async function votarParty({ codigo, usuario_id, categorias }) {
  return req(`/parties/${codigo}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, categorias }),
  })
}

export async function calcularMatch(codigo) {
  return req(`/parties/${codigo}/match`)
}

export async function encerrarParty(codigo, host_id) {
  return req(`/parties/${codigo}/encerrar?host_id=${host_id}`, { method: 'PATCH' })
}

// ── Social ────────────────────────────────────────────────────────────────

export async function seguirUsuario(seguidor_id, seguido_id) {
  return req('/seguir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seguidor_id, seguido_id }),
  })
}

export async function deixarDeSeguir(seguidor_id, seguido_id) {
  return req(`/seguir?seguidor_id=${seguidor_id}&seguido_id=${seguido_id}`, { method: 'DELETE' })
}

export async function listarSeguindo(usuario_id) {
  const d = await req(`/seguindo?usuario_id=${usuario_id}`)
  return d.seguindo
}

export async function getFeed(usuario_id) {
  const d = await req(`/feed?usuario_id=${usuario_id}`)
  return d.feed
}

export async function buscarUsuarios(q, usuario_id) {
  const d = await req(`/usuarios/buscar?q=${encodeURIComponent(q)}&usuario_id=${usuario_id}`)
  return d.usuarios
}

// ── Google OAuth ──────────────────────────────────────────────────────

export async function loginComGoogle(credential) {
  return req('/login/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
}

// ── Chat ──────────────────────────────────────────────────────────────────

export async function getChatMensagens(codigo) {
  const d = await req(`/parties/${codigo}/chat`)
  return d.mensagens
}

export async function enviarMensagemChat(codigo, { usuario_id, nome, texto }) {
  return req(`/parties/${codigo}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, nome, texto }),
  })
}

// ── Explorar ──────────────────────────────────────────────────────────────

export async function buscarLugares(codigo, slug, raio = 2000, geo = null) {
  let url = `/lugares?codigo=${codigo}&slug=${slug}&raio=${raio}`
  if (geo?.lat != null && geo?.lng != null) {
    url += `&lat=${geo.lat}&lng=${geo.lng}&accuracy=${geo.accuracy ?? 9999}`
  }
  return req(url)
}
