const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function criarUsuario({ nome, email, cidade }) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, cidade }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.erro || 'Erro ao criar usuário')
  return data.usuario
}

export async function salvarPreferencias({ usuario_id, categorias }) {
  const res = await fetch(`${API_URL}/preferencias_usuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, categorias }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.erro || 'Erro ao salvar preferências')
  return data
}

export async function criarParty({ titulo, criada_por, cidade, codigo_convite, expira_em }) {
  const res = await fetch(`${API_URL}/parties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, criada_por, cidade, codigo_convite, expira_em }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.erro || 'Erro ao criar party')
  return data.party
}
