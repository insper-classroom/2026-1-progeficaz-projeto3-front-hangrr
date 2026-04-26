import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage     from './pages/LandingPage'
import AuthPage        from './pages/AuthPage'
import OnboardingPage  from './pages/OnboardingPage'
import HomePage        from './pages/HomePage'
import CreatePartyPage from './pages/CreatePartyPage'
import PartyPage       from './pages/PartyPage'
import JoinPartyPage   from './pages/JoinPartyPage'
import ProfilePage     from './pages/ProfilePage'
import HistoricoPage   from './pages/HistoricoPage'
import ExplorarPage    from './pages/ExplorarPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                          element={<LandingPage />} />
        <Route path="/auth"                      element={<AuthPage />} />
        <Route path="/onboarding"                element={<OnboardingPage />} />
        <Route path="/home"                      element={<HomePage />} />
        <Route path="/party/criar"               element={<CreatePartyPage />} />
        <Route path="/party/join/:codigo"        element={<JoinPartyPage />} />
        <Route path="/party/:codigo"                 element={<PartyPage />} />
        <Route path="/party/:codigo/explorar/:slug"  element={<ExplorarPage />} />
        <Route path="/profile"                   element={<ProfilePage />} />
        <Route path="/historico"                 element={<HistoricoPage />} />
        <Route path="*"                          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
