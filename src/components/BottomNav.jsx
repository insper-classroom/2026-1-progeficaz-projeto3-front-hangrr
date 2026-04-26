import { useNavigate, useLocation } from 'react-router-dom'
import { Home, History, User } from 'lucide-react'

const ITEMS = [
  { label: 'Início',    Icon: Home,    path: '/home' },
  { label: 'Feed',      Icon: History, path: '/historico' },
  { label: 'Perfil',    Icon: User,    path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={s.nav}>
      {ITEMS.map(({ label, Icon, path }) => {
        const active = pathname === path
        return (
          <button key={path} style={s.item} onClick={() => navigate(path)}>
            <Icon size={20} style={{ color: active ? 'var(--lime)' : 'var(--text-3)' }} />
            <span style={{ ...s.label, color: active ? 'var(--lime)' : 'var(--text-3)' }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const s = {
  nav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    padding: '12px 0 20px',
    background: 'rgba(10,10,10,0.96)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--line)',
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, padding: '4px 24px',
    background: 'none', border: 'none', cursor: 'pointer',
  },
  label: { fontSize: 10, fontWeight: 600 },
}
