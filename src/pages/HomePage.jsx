import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Link2, Home, Users2, Search, User, ArrowRight, Zap, ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function HomePage() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('hangr_user') || '{}')
  const primeiroNome = usuario.nome?.split(' ')[0] || 'amigo'

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      {/* ── Sticky Top Nav ── */}
      <header style={s.topNav}>
        <span style={s.logo}>hangr</span>
        <div style={s.navRight}>
          <button style={s.iconBtn}>
            <Search size={18} />
          </button>
          <button style={s.avatar}>
            {primeiroNome.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main style={s.main}>

        {/* ── 1. HERO — greeting + primary CTA ── */}
        <section style={s.hero}>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            style={s.heroContent}
          >
            <motion.p variants={fadeUp} style={s.greeting}>
              Olá, {primeiroNome} 👋
            </motion.p>
            <motion.h1 variants={fadeUp} style={s.heroTitle}>
              Qual é o rolê hoje?
            </motion.h1>
            <motion.p variants={fadeUp} style={s.heroSub}>
              Crie uma party, convide seus amigos e deixa o Hangr decidir.
            </motion.p>
            <motion.button
              variants={fadeUp}
              style={s.btnPrimary}
              onClick={() => navigate('/party/criar')}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              <Plus size={18} />
              Criar nova party
            </motion.button>
          </motion.div>
        </section>

        {/* ── 2. SOCIAL PROOF strip ── */}
        <motion.div
          style={s.socialStrip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div style={s.socialDot} />
          <p style={s.socialText}>
            Junte seus amigos e acabem com a indecisão de grupo
          </p>
        </motion.div>

        {/* ── 3. ABOUT — active parties ── */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Suas parties ativas</h2>
          </div>

          <motion.div
            style={s.emptyState}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div style={s.emptyEmoji}>🎉</div>
            <p style={s.emptyTitle}>Nenhuma party ativa ainda</p>
            <p style={s.emptySub}>Crie uma e convide seus amigos para começar</p>
            <button style={s.emptyBtn} onClick={() => navigate('/party/criar')}>
              Criar primeira party <ArrowRight size={15} />
            </button>
          </motion.div>
        </section>

        {/* ── 4. KEY FEATURES — quick actions ── */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Ações rápidas</h2>

          <div style={s.actionsGrid}>
            <motion.button
              style={s.actionCard}
              onClick={() => navigate('/party/criar')}
              custom={0}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              whileHover={{ borderColor: 'rgba(139,92,246,0.4)', y: -2 }}
            >
              <div style={{ ...s.actionIcon, background: 'rgba(139,92,246,0.12)', color: 'var(--primary)' }}>
                <Plus size={22} />
              </div>
              <div style={s.actionInfo}>
                <p style={s.actionTitle}>Nova party</p>
                <p style={s.actionSub}>Crie um rolê em grupo</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }} />
            </motion.button>

            <motion.button
              style={s.actionCard}
              custom={1}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              whileHover={{ borderColor: 'rgba(99,102,241,0.4)', y: -2 }}
            >
              <div style={{ ...s.actionIcon, background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
                <Link2 size={22} />
              </div>
              <div style={s.actionInfo}>
                <p style={s.actionTitle}>Entrar com link</p>
                <p style={s.actionSub}>Acesse uma party existente</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }} />
            </motion.button>
          </div>
        </section>

        {/* ── 5. LEAD MAGNET / CTA ── */}
        <motion.section
          style={s.ctaBanner}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div style={s.ctaBannerGlow} />
          <div style={s.ctaBannerContent}>
            <div style={s.ctaBannerLeft}>
              <div style={s.ctaBannerIcon}>
                <Zap size={20} style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <p style={s.ctaBannerTitle}>Crie um rolê em 30 segundos</p>
                <p style={s.ctaBannerSub}>Convide amigos e o Hangr decide</p>
              </div>
            </div>
            <button
              style={s.ctaBannerBtn}
              onClick={() => navigate('/party/criar')}
            >
              Criar <ArrowRight size={14} />
            </button>
          </div>
        </motion.section>

        {/* ── 6. CONTENT — recent parties ── */}
        <section style={{ ...s.section, paddingBottom: '100px' }}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Histórico</h2>
          </div>
          <div style={s.historyEmpty}>
            <p style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
              Seus rolês anteriores aparecerão aqui
            </p>
          </div>
        </section>

      </main>

      {/* ── 7. BOTTOM NAV (footer) ── */}
      <nav style={s.bottomNav}>
        <NavItem icon={<Home size={22} />} label="Início" active />
        <NavItem icon={<Users2 size={22} />} label="Parties" />
        <NavItem icon={<Search size={22} />} label="Buscar" />
        <NavItem icon={<User size={22} />} label="Perfil" />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button style={s.navItem} onClick={onClick}>
      <span style={{ ...s.navIcon, color: active ? 'var(--primary)' : 'var(--text-subtle)' }}>
        {icon}
      </span>
      <span style={{ ...s.navLabel, color: active ? 'var(--primary)' : 'var(--text-subtle)', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      {active && <motion.div layoutId="navIndicator" style={s.navIndicator} />}
    </button>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    position: 'relative',
    maxWidth: '640px',
    margin: '0 auto',
  },
  bgGlow: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '500px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Top nav */
  topNav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: 'rgba(15,15,18,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },

  /* Main content */
  main: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },

  /* Hero */
  hero: {
    padding: '32px 20px 24px',
    borderBottom: '1px solid var(--border)',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  greeting: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  heroTitle: {
    fontSize: 'clamp(28px, 5vw, 38px)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    color: '#fff',
  },
  heroSub: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-primary)',
    cursor: 'pointer',
    border: 'none',
    width: 'fit-content',
    marginTop: '4px',
  },

  /* Social proof strip */
  socialStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: 'var(--bg-alt)',
    borderBottom: '1px solid var(--border)',
  },
  socialDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px rgba(34,197,94,0.6)',
    flexShrink: 0,
  },
  socialText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },

  /* Sections */
  section: {
    padding: '28px 20px 0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '16px',
  },

  /* Empty state */
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    background: 'var(--bg-card)',
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-xl)',
    gap: '8px',
  },
  emptyEmoji: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '4px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
  },
  emptySub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  emptyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    padding: '10px 20px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    border: 'none',
  },

  /* Actions */
  actionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  actionIcon: {
    width: '46px',
    height: '46px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'left',
  },
  actionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
  },
  actionSub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },

  /* CTA banner */
  ctaBanner: {
    margin: '28px 20px 0',
    borderRadius: 'var(--radius-xl)',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  ctaBannerGlow: {
    position: 'absolute',
    top: '-20px',
    right: '-20px',
    width: '120px',
    height: '120px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)',
    pointerEvents: 'none',
  },
  ctaBannerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    gap: '16px',
    position: 'relative',
  },
  ctaBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ctaBannerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(250,204,21,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaBannerTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
  },
  ctaBannerSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  ctaBannerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '13px',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
  },

  /* History */
  historyEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },

  /* Bottom nav */
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '640px',
    display: 'flex',
    background: 'rgba(15,15,18,0.9)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: '1px solid var(--border)',
    padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
    zIndex: 50,
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '6px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    position: 'relative',
  },
  navIcon: {
    display: 'flex',
    transition: 'color 0.2s',
  },
  navLabel: {
    fontSize: '10px',
    transition: 'color 0.2s',
  },
  navIndicator: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--primary)',
  },
}
