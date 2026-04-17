export default function AuthPage({ voltar, irParaOnboarding }) {
  return (
    <div className="page">
      <div className="card">
        <p className="badge">Login / Signup</p>
        <h1 className="title">Entre no Hangr</h1>
        <p className="text">
          Aqui depois vamos ligar com o backend. Por enquanto é só a navegação.
        </p>

        <input className="input" placeholder="Seu nome" />
        <input className="input" placeholder="Seu email" />

        <button className="primaryButton" onClick={irParaOnboarding}>
          Entrar
        </button>

        <button className="secondaryButton" onClick={voltar}>
          Voltar
        </button>
      </div>
    </div>
  );
}