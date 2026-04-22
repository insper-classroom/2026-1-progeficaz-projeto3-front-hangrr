import { useState } from "react";
import { criarUsuario } from "../services/api";

export default function AuthPage({ voltar, irParaOnboarding, onLoginSuccess }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    setErro("");

    if (!nome || !email || !cidade) {
      setErro("Preencha nome, email e cidade.");
      return;
    }

    try {
      setCarregando(true);
      const usuario = await criarUsuario({ nome, email, cidade });

      if (onLoginSuccess) {
        onLoginSuccess(usuario);
      }

      irParaOnboarding();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <p className="badge">Login / Signup</p>
        <h1 className="title">Entre no Hangr</h1>
        <p className="text">
          Aqui já estamos criando o usuário no backend.
        </p>

        <input
          className="input"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="input"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Sua cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />

        {erro ? <p className="smallText" style={{ color: "#fca5a5" }}>{erro}</p> : null}

        <button className="primaryButton" onClick={handleEntrar} disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <button className="secondaryButton" onClick={voltar}>
          Voltar
        </button>
      </div>
    </div>
  );
}