const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function criarUsuario({ nome, email, cidade }) {
  const resposta = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, cidade }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados?.erro || "Erro ao criar usuário");
  }

  return dados.usuario;
}