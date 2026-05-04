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
    paddingTop: 10,
    paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
    background: 'rgba(10,10,10,0.96)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--line)',
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '4px 0',
    background: 'none', border: 'none', cursor: 'pointer',
    minWidth: 72, minHeight: 44,
    justifyContent: 'center',
  },
  label: { fontSize: 10, fontWeight: 600 },
}
