export default function LandingPage({ irParaAuth }) {
  return (
    <div className="page">
      <div className="card">
        <p className="badge">Hangr</p>
        <h1 className="title">Decidir rolê em grupo sem virar caos.</h1>
        <p className="text">
          O app que junta amigos, entende gostos em comum e sugere uma opção
          que todo mundo aceita.
        </p>

        <button className="primaryButton" onClick={irParaAuth}>
          Começar
        </button>
      </div>
    </div>
  );
}