import { useState } from "react";

export default function CreatePartyPage({ voltar }) {
  const [partyName, setPartyName] = useState("Sextou com a galera");
  const [cidade, setCidade] = useState("Recife");

  return (
    <div className="page">
      <div className="card wide">
        <p className="badge">Criar party</p>
        <h1 className="title">Novo grupo</h1>
        <p className="text">
          Crie a sala do rolê e depois ligamos isso ao backend.
        </p>

        <input
          className="input"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="Nome da party"
        />

        <input
          className="input"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
        />

        <div className="miniCard">
          <h3>Resumo</h3>
          <p>
            Party atual: <strong>{partyName}</strong>
          </p>
          <p>Cidade: {cidade}</p>
        </div>

        <button className="primaryButton">Gerar link de convite</button>

        <button className="secondaryButton" onClick={voltar}>
          Voltar
        </button>
      </div>
    </div>
  );
}