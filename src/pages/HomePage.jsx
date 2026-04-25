import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Link2, Compass, User } from 'lucide-react'
import BottomNav from '../components/BottomNav'

const enter = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function HomePage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('hangr_user')
    if (u) setUsuario(JSON.parse(u))
    else navigate('/auth')
  }, [navigate])

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'aí'

  return (
    <div style={s.root}>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <span style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/home')}>hangr</span>
        <button style={s.avatarBtn}><User size={16} /></button>
      </nav>

      {/* ── CONTENT ── */}
      <div style={s.content}>

        {/* Hero */}
        <motion.div
          style={s.hero}
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p variants={enter(0)} style={s.greeting}>Olá, {primeiroNome}.</motion.p>
          <motion.h1 variants={enter(0.06)} style={s.heroTitle}>
            Qual é o<br />rolê hoje?
          </motion.h1>
          <motion.button
            variants={enter(0.14)}
            style={s.ctaPrimary}
            onClick={() => navigate('/party/criar')}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} strokeWidth={2.5} /> Nova party
          </motion.button>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          style={s.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
        >
          <ActionCard
            label="Entrar com link"
            desc="Alguém te mandou um convite?"
            icon={<Link2 size={20} />}
            color="#3D8AFF"
            onClick={() => {}}
          />
          <ActionCard
            label="Explorar lugares"
            desc="Veja sugestões perto de você"
            icon={<Compass size={20} />}
            color="#00E096"
            onClick={() => {}}
          />
        </motion.div>

        {/* Parties */}
        <motion.div
          style={s.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p style={s.sectionLabel}>Suas parties</p>
          <EmptyParties onCriar={() => navigate('/party/criar')} />
        </motion.div>

      </div>

      <BottomNav />
    </div>
  )
}

function ActionCard({ label, desc, icon, color, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.button
      style={{
        ...s.actionCard,
        background:  hover ? 'var(--bg-2)' : 'var(--bg-1)',
        borderColor: hover ? 'var(--line-mid)' : 'var(--line)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ ...s.actionIcon, background: color + '18', color }}>{icon}</div>
      <div style={s.actionBody}>
        <p style={s.actionLabel}>{label}</p>
        <p style={s.actionDesc}>{desc}</p>
      </div>
    </motion.button>
  )
}

function EmptyParties({ onCriar }) {
  return (
    <div style={s.empty}>
      <div style={s.emptyAsterisk}>✳</div>
      <p style={s.emptyTitle}>Nenhuma party ainda.</p>
      <p style={s.emptyDesc}>Crie uma e chame seus amigos.</p>
      <button style={s.emptyBtn} onClick={onCriar}>
        <Plus size={14} /> Criar party
      </button>
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid var(--line)',
  },
  logo: { fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)' },
  avatarBtn: {
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--line)', borderRadius: 'var(--r-full)',
    color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)',
  },

  content: {
    flex: 1, overflowY: 'auto',
    padding: '32px 24px 100px',
    maxWidth: 520, width: '100%', margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 36,
  },

  hero:      { display: 'flex', flexDirection: 'column', gap: 16 },
  greeting:  { fontSize: 14, color: 'var(--text-3)', fontWeight: 600 },
  heroTitle: {
    fontSize: 'clamp(40px, 8vw, 56px)',
    fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
  },
  ctaPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 24px',
    background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 15,
    borderRadius: 'var(--r-full)',
    border: 'none', cursor: 'pointer', width: 'fit-content', marginTop: 8,
  },

  actions:    { display: 'flex', flexDirection: 'column', gap: 10 },
  actionCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 18px', border: '1px solid',
    borderRadius: 'var(--r-xl)', cursor: 'pointer', textAlign: 'left',
    transition: 'background .15s, border-color .15s', width: '100%',
  },
  actionIcon: {
    width: 44, height: 44, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--r-lg)',
  },
  actionBody:  { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  actionDesc:  { fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45 },

  section:      { display: 'flex', flexDirection: 'column', gap: 14 },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
    textTransform: 'uppercase', color: 'var(--text-3)',
  },

  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 24px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)',
    background: 'var(--bg-1)', gap: 10, textAlign: 'center',
  },
  emptyAsterisk: { fontSize: 40, color: 'var(--lime)', opacity: 0.4, lineHeight: 1, marginBottom: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: 700 },
  emptyDesc:     { fontSize: 13, color: 'var(--text-2)' },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 12, padding: '10px 20px',
    background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 13,
    borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
  },

}
