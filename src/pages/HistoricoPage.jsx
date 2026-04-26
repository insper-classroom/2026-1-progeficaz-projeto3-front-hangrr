import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, MapPin, CalendarDays, ChevronRight } from 'lucide-react'
import BottomNav from '../components/BottomNav'

const enter = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function HistoricoPage() {
  const navigate  = useNavigate()
  const [parties, setParties] = useState([])

  useEffect(() => {
    const u = localStorage.getItem('hangr_user')
    if (!u) { navigate('/auth'); return }
    try {
      const saved = localStorage.getItem('hangr_historico')
      if (saved) setParties(JSON.parse(saved))
    } catch {
      localStorage.removeItem('hangr_historico')
    }
  }, [navigate])

  return (
    <div style={s.root}>

      {/* ── Nav ── */}
      <nav style={s.nav}>
        <span style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/home')}>hangr</span>
      </nav>

      {/* ── Content ── */}
      <div style={s.content}>
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          <motion.p variants={enter(0)} style={s.eyebrow}>Seu passado glorioso</motion.p>
          <motion.h1 variants={enter(0.05)} style={s.title}>Histórico</motion.h1>
        </motion.div>

        {parties.length === 0 ? (
          <motion.div
            style={s.empty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div style={s.emptyAsterisk}>✳</div>
            <p style={s.emptyTitle}>Nenhuma party ainda.</p>
            <p style={s.emptyDesc}>Crie uma party e ela vai aparecer aqui depois.</p>
            <button style={s.emptyBtn} onClick={() => navigate('/party/criar')}>
              Criar party
            </button>
          </motion.div>
        ) : (
          <motion.div
            style={s.list}
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
          >
            {parties.map((p, i) => (
              <PartyCard key={p._id ?? i} party={p} />
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function PartyCard({ party }) {
  const date = party.criada_em
    ? new Date(party.criada_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } } }}>
      <div style={s.card}>
        <div style={s.cardTop}>
          <div style={s.cardDot} />
          <p style={s.cardTitle}>{party.titulo}</p>
          <ChevronRight size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        </div>
        <div style={s.cardMeta}>
          <MetaItem icon={<MapPin size={12} />} text={party.cidade} />
          <MetaItem icon={<CalendarDays size={12} />} text={date} />
          {party.membros != null && (
            <MetaItem icon={<Users size={12} />} text={`${party.membros} participante${party.membros !== 1 ? 's' : ''}`} />
          )}
        </div>
        {party.match && (
          <div style={s.matchBadge}>
            ✳ Match: <strong style={{ marginLeft: 4 }}>{party.match}</strong>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MetaItem({ icon, text }) {
  if (!text) return null
  return (
    <span style={s.metaItem}>
      {icon}
      {text}
    </span>
  )
}

const s = {
  root:    { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },

  nav: {
    display: 'flex', alignItems: 'center',
    padding: '16px 24px', borderBottom: '1px solid var(--line)',
  },
  logo: { fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)' },

  content: {
    flex: 1,
    padding: '32px 24px 100px',
    maxWidth: 520, width: '100%', margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 28,
  },

  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 },
  title:   { fontSize: 'clamp(32px, 7vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 },

  list: { display: 'flex', flexDirection: 'column', gap: 10 },

  card: {
    padding: '18px 20px',
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-xl)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10 },
  cardDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: 700 },

  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px' },
  metaItem: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, color: 'var(--text-2)',
  },

  matchBadge: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 12, fontWeight: 600,
    color: 'var(--lime)',
    background: 'rgba(204,255,0,0.08)',
    border: '1px solid rgba(204,255,0,0.18)',
    borderRadius: 'var(--r-full)',
    padding: '4px 12px', width: 'fit-content',
  },

  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '56px 24px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)',
    background: 'var(--bg-1)', gap: 10, textAlign: 'center',
  },
  emptyAsterisk: { fontSize: 40, color: 'var(--lime)', opacity: 0.35, lineHeight: 1, marginBottom: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: 700 },
  emptyDesc:     { fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 240 },
  emptyBtn: {
    marginTop: 12, padding: '10px 22px',
    background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 13,
    borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
  },
}
