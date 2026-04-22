import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import CreatePartyPage from "./pages/CreatePartyPage";

export default function App() {
  const [tela, setTela] = useState("landing");
  const [usuario, setUsuario] = useState(null);

  if (tela === "landing") {
    return <LandingPage irParaAuth={() => setTela("auth")} />;
  }

  if (tela === "auth") {
    return (
      <AuthPage
        voltar={() => setTela("landing")}
        irParaOnboarding={() => setTela("onboarding")}
        onLoginSuccess={(novoUsuario) => setUsuario(novoUsuario)}
      />
    );
  }

  if (tela === "onboarding") {
    return <OnboardingPage irParaHome={() => setTela("home")} usuario={usuario} />;
  }

  if (tela === "home") {
    return <HomePage irParaCriarParty={() => setTela("create-party")} usuario={usuario} />;
  }

  if (tela === "create-party") {
    return <CreatePartyPage voltar={() => setTela("home")} usuario={usuario} />;
  }

  return null;
}