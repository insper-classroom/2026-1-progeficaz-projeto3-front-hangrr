import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

const enter = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <div style={s.root}>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <span style={s.logo}>hangr</span>
        <div style={s.navRight}>
          <button style={s.navLink} onClick={() => navigate('/auth?modo=login')}>Entrar</button>
          <button style={s.navCta} onClick={() => navigate('/auth?modo=cadastro')}>
            Começar <ArrowUpRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>

        {/* Decorative starburst */}
        <div style={s.starburst} aria-hidden>✳</div>

        <div style={{ ...s.heroInner, gap: isMobile ? 32 : 60, padding: isMobile ? '60px 20px 40px' : '80px 28px' }}>

          {/* Left — headline + CTA */}
          <motion.div
            style={{ ...s.heroLeft, flex: isMobile ? '1 1 100%' : '1 1 360px' }}
            initial="hidden" animate="show"
            variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.1 } } }}
          >
            <motion.h1 variants={enter(0)} style={{ ...s.heroTitle, fontSize: isMobile ? 'clamp(38px, 12vw, 64px)' : 'clamp(52px, 7vw, 88px)' }}>
              Acabe<br />com a<br />indecisão.
            </motion.h1>
            <motion.p variants={enter(0.1)} style={s.heroSub}>
              O Hangr cruza os gostos do grupo e decide o rolê por vocês.
            </motion.p>
            <motion.button
              variants={enter(0.2)}
              style={s.btnWhite}
              onClick={() => navigate('/auth?modo=cadastro')}
              whileTap={{ scale: 0.97 }}
            >
              Criar conta grátis <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          {/* Right — match card */}
          <motion.div
            style={{ ...s.matchCard, width: isMobile ? '100%' : 260 }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={s.matchEye}>MATCH ENCONTRADO</p>
            <p style={s.matchTitle}>Japonesa<br />+ Cerveja</p>
            <div style={s.matchDivider} />
            <div style={s.matchPlace}>
              <span style={s.matchPlaceIcon}>📍</span>
              <div>
                <p style={s.matchPlaceName}>Izakaya Bar &amp; Sushi</p>
                <p style={s.matchPlaceInfo}>2.3 km · Aberto agora</p>
              </div>
            </div>
            <div style={s.matchAvatars}>
              {['#000', '#333', '#555', '#777'].map((c, i) => (
                <div key={i} style={{ ...s.matchAvatar, background: c, outline: '2px solid #CCFF00', marginLeft: i ? -8 : 0 }} />
              ))}
              <span style={s.matchAvatarsText}>3 de 4 curtiram</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={s.problem}>
        <div style={s.container}>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.1 } } }}
          >
            <motion.p variants={enter()} style={s.eyebrow}>O problema</motion.p>
            <motion.h2 variants={enter()} style={s.sectionTitle}>
              Decisão em grupo sempre vira bagunça.
            </motion.h2>

            <motion.div variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }} style={s.quoteList}>
              {[
                '"Onde vamos hoje?"',
                '"Tanto faz, qualquer lugar"',
                '"Não sei, você decide"',
                '"Aff, nunca decide nada..."',
              ].map((q, i) => (
                <motion.div key={i} variants={enter()} style={s.quoteRow}>
                  <span style={s.quoteText}>{q}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={enter()} style={s.problemAnswer}>
              <span style={s.problemAnswerTag}>SOLUÇÃO</span>
              O Hangr decide por vocês. Em 30 segundos.
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={s.how}>
        <div style={s.container}>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.1 } } }}
          >
            <motion.p variants={enter()} style={s.eyebrow}>Como funciona</motion.p>
            <motion.h2 variants={enter()} style={s.sectionTitle}>Três passos.</motion.h2>

            {[
              { n: '01', title: 'Gostos em comum', desc: 'Cada pessoa registra o que curte. O app cruza tudo.' },
              { n: '02', title: 'Lugares reais', desc: 'Via Foursquare, busca lugares abertos que encaixam no perfil do grupo.' },
              { n: '03', title: 'Link de convite', desc: 'Compartilha um link. Todo mundo entra e o match acontece.' },
            ].map((f, i) => (
              <motion.div key={f.n} variants={enter()} style={{ ...s.featureRow, borderTop: i === 0 ? `1px solid var(--line)` : 'none' }}>
                <span style={s.featureNum}>{f.n}</span>
                <div style={s.featureBody}>
                  <p style={s.featureTitle}>{f.title}</p>
                  <p style={s.featureDesc}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={s.cta}>
        <motion.div
          style={s.ctaInner}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p style={s.ctaEye}>Pronto pra isso?</p>
          <h2 style={s.ctaTitle}>Decide o rolê de hoje.</h2>
          <button style={s.btnBlack} onClick={() => navigate('/auth?modo=cadastro')}>
            Criar conta grátis <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={s.footerLogo}>hangr</span>
        <span style={s.footerText}>© 2026</span>
      </footer>
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: { minHeight: '100vh', overflowX: 'hidden' },

  /* Nav */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px',
    background: 'rgba(10,10,10,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--line)',
  },
  logo: {
    fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: {
    padding: '7px 14px', fontSize: 13, color: 'var(--text-2)',
    borderRadius: 'var(--r-full)', border: '1px solid var(--line)',
  },
  navCta: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 16px', fontSize: 13, fontWeight: 600,
    background: 'var(--text)', color: '#000',
    borderRadius: 'var(--r-full)',
  },

  /* Hero */
  hero: {
    minHeight: '100vh', paddingTop: 60,
    display: 'flex', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  starburst: {
    position: 'absolute', top: '5%', right: '-5%',
    fontSize: 'clamp(200px, 35vw, 480px)',
    color: 'var(--lime)', opacity: 0.06,
    lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
    fontWeight: 900,
  },
  heroInner: {
    maxWidth: 1100, margin: '0 auto', width: '100%',
    padding: '80px 28px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 60,
    flexWrap: 'wrap',
  },
  heroLeft: {
    flex: '1 1 360px', maxWidth: 520,
    display: 'flex', flexDirection: 'column', gap: 28,
  },
  heroTitle: {
    fontSize: 'clamp(52px, 7vw, 88px)',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    lineHeight: 0.95,
    color: '#fff',
  },
  heroSub: {
    fontSize: 18, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 400,
  },
  btnWhite: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 28px',
    background: '#fff', color: '#000',
    fontWeight: 700, fontSize: 15,
    borderRadius: 'var(--r-full)',
    width: 'fit-content',
  },

  /* Match card */
  matchCard: {
    flex: '0 0 auto',
    width: 260,
    background: 'var(--lime)',
    borderRadius: 'var(--r-2xl)',
    padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  matchEye: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(0,0,0,0.5)',
  },
  matchTitle: {
    fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em',
    lineHeight: 1.05, color: '#000',
  },
  matchDivider: { height: 1, background: 'rgba(0,0,0,0.15)' },
  matchPlace: { display: 'flex', alignItems: 'center', gap: 10 },
  matchPlaceIcon: { fontSize: 22 },
  matchPlaceName: { fontSize: 13, fontWeight: 700, color: '#000' },
  matchPlaceInfo: { fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 2 },
  matchAvatars: { display: 'flex', alignItems: 'center', gap: 6 },
  matchAvatar: {
    width: 26, height: 26, borderRadius: '50%',
  },
  matchAvatarsText: { fontSize: 12, fontWeight: 600, color: '#000', marginLeft: 4 },

  /* Problem */
  problem: {
    padding: '100px 0',
    borderTop: '1px solid var(--line)',
  },
  container: { maxWidth: 700, margin: '0 auto', padding: '0 28px' },
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-3)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
    marginBottom: 40,
  },
  quoteList: { display: 'flex', flexDirection: 'column' },
  quoteRow: {
    padding: '18px 0',
    borderBottom: '1px solid var(--line)',
  },
  quoteText: { fontSize: 18, color: 'var(--text-2)', fontStyle: 'italic' },
  problemAnswer: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginTop: 36, fontSize: 16, fontWeight: 600, color: '#fff',
  },
  problemAnswerTag: {
    padding: '4px 10px', background: 'var(--lime)', color: '#000',
    fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
    borderRadius: 'var(--r-sm)', flexShrink: 0,
  },

  /* How it works */
  how: {
    padding: '100px 0',
    borderTop: '1px solid var(--line)',
  },
  featureRow: {
    display: 'flex', alignItems: 'flex-start', gap: 32,
    padding: '28px 0',
    borderBottom: '1px solid var(--line)',
  },
  featureNum: {
    fontSize: 12, fontWeight: 700, color: 'var(--text-3)',
    letterSpacing: '0.08em', paddingTop: 3, flexShrink: 0, width: 28,
  },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  featureDesc: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 },

  /* Final CTA */
  cta: {
    background: 'var(--lime)',
    padding: '80px 28px',
  },
  ctaInner: {
    maxWidth: 700, margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  ctaEye: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)',
  },
  ctaTitle: {
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#000',
  },
  btnBlack: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 28px',
    background: '#000', color: '#fff',
    fontWeight: 700, fontSize: 15,
    borderRadius: 'var(--r-full)',
    width: 'fit-content', marginTop: 8,
  },

  /* Footer */
  footer: {
    padding: '24px 28px',
    borderTop: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  footerLogo: {
    fontSize: 15, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)',
  },
  footerText: { fontSize: 12, color: 'var(--text-3)' },
}
