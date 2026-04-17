import { useState } from "react";

const categorias = [
  "Restaurantes",
  "Bares",
  "Cafés",
  "Jogos",
  "Parque",
  "Esportes",
];

export default function OnboardingPage({ irParaHome }) {
  const [selecionados, setSelecionados] = useState([]);

  function toggle(categoria) {
    if (selecionados.includes(categoria)) {
      setSelecionados(selecionados.filter((item) => item !== categoria));
    } else {
      setSelecionados([...selecionados, categoria]);
    }
  }

  return (
    <div className="page">
      <div className="card wide">
        <p className="badge">Onboarding</p>
        <h1 className="title">Escolha seus gostos</h1>
        <p className="text">
          Selecione algumas categorias para o Hangr entender com que tipo de
          rolê você combina.
        </p>

        <div className="chips">
          {categorias.map((cat) => {
            const ativo = selecionados.includes(cat);

            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={ativo ? "chip active" : "chip"}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <p className="smallText">
          {selecionados.length} categoria(s) selecionada(s)
        </p>

        <button className="primaryButton" onClick={irParaHome}>
          Continuar
        </button>
      </div>
    </div>
  );
}