export default function HomePage({ irParaCriarParty }) {
  return (
    <div className="page">
      <div className="card wide">
        <p className="badge">Home</p>
        <h1 className="title">Bem-vindo ao Hangr</h1>
        <p className="text">
          Aqui você verá suas parties, histórico e ações rápidas.
        </p>

        <div className="grid">
          <div className="miniCard">
            <h3>Parties recentes</h3>
            <p>Depois vamos listar as suas últimas decisões.</p>
          </div>

          <div className="miniCard">
            <h3>Sugestões</h3>
            <p>Depois entraremos com recomendações inteligentes.</p>
          </div>
        </div>

        <button className="primaryButton" onClick={irParaCriarParty}>
          Criar party
        </button>
      </div>
    </div>
  );
}