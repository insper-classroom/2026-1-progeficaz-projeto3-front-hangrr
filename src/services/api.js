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

export async function getParty(id) {
  const d = await req(`/parties/${id}`)
  return d.party
}

export async function getPartyByCodigo(codigo) {
  const d = await req(`/parties/codigo/${codigo}`)
  return d.party
}

export async function listarPartiesUsuario(usuario_id) {
  const d = await req(`/parties?usuario_id=${usuario_id}`)
  return d.parties
}

// ── Membros ───────────────────────────────────────────────────────────────

export async function adicionarMembro({ party_id, usuario_id, papel = 'member' }) {
  const d = await req('/party_membros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ party_id, usuario_id, papel }),
  })
  return d.membro
}

export async function listarMembros(party_id) {
  const d = await req(`/party_membros?party_id=${party_id}`)
  return d.membros
}

export async function kickarMembro(id, host_id) {
  return req(`/party_membros/${id}?host_id=${host_id}`, { method: 'DELETE' })
}

export async function atualizarNicknameMembro(id, nickname) {
  const d = await req(`/party_membros/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  })
  return d.membro
}

// ── Votos ─────────────────────────────────────────────────────────────────

export async function verificouVoto({ party_id, usuario_id }) {
  const d = await req(`/party_preferencias?party_id=${party_id}&usuario_id=${usuario_id}`)
  return d.preferencias
}

export async function votarParty({ party_id, usuario_id, categorias }) {
  return req('/party_preferencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ party_id, usuario_id, categorias }),
  })
}

// ── Match ─────────────────────────────────────────────────────────────────

export async function calcularMatch(party_id) {
  return req(`/match/${party_id}`)
}
