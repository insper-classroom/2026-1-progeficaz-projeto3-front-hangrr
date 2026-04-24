import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users2, MapPin, Link2, ArrowRight, Zap, Star } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={s.root}>
      {/* ── 1. NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <span style={s.logo}>hangr</span>
          <div style={s.navLinks}>
            <button style={s.navLink} onClick={() => navigate('/auth')}>Entrar</button>
            <button style={s.btnPrimary} onClick={() => navigate('/auth')}>
              Começar <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO ── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner}>
          <motion.div
            style={s.heroContent}
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.div variants={fadeUp} style={s.heroBadge}>
              <Zap size={13} style={{ color: 'var(--warning)' }} />
              Novo jeito de combinar rolê
            </motion.div>

            <motion.h1 variants={fadeUp} style={s.heroTitle}>
              Acabe com a indecisão,{' '}
              <span className="gradient-text">o Hangr decide</span>{' '}
              por você!
            </motion.h1>

            <motion.p variants={fadeUp} style={s.heroSub}>
              Reúna seus amigos, registrem gostos em comum e o app encontra o
              rolê perfeito pra todo mundo.
            </motion.p>

            <motion.div variants={fadeUp} style={s.heroCtas}>
              <button style={s.btnPrimary} onClick={() => navigate('/auth')}>
                Criar conta grátis <ArrowRight size={16} />
              </button>
              <button style={s.btnGhost} onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                Como funciona
              </button>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            style={s.phoneMockup}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              style={s.phone}
            >
              <div style={s.phoneNotch} />
              <div style={s.phoneScreen}>
                <div style={s.mockupHeader}>
                  <span style={s.mockupLogo}>hangr</span>
                  <div style={s.mockupAvatars}>
                    {['#8B5CF6', '#6366F1', '#EC4899'].map((c, i) => (
                      <div key={i} style={{ ...s.mockupAvatar, background: c, marginLeft: i ? -8 : 0 }} />
                    ))}
                  </div>
                </div>

                <div style={s.mockupMatch}>
                  <div style={s.matchBadge}><Star size={11} /> Match encontrado!</div>
                  <p style={s.matchTitle}>Japonesa + Cerveja</p>
                  <p style={s.matchSub}>3 de 4 amigos curtiram</p>
                </div>

                <div style={s.mockupPlace}>
                  <div style={s.placeIcon}>📍</div>
                  <div>
                    <p style={s.placeName}>Izakaya Bar & Sushi</p>
                    <p style={s.placeInfo}>2.3 km · Aberto agora</p>
                  </div>
                  <div style={s.placeScore}>98%</div>
                </div>

                <div style={s.mockupPlace}>
                  <div style={s.placeIcon}>🍺</div>
                  <div>
                    <p style={s.placeName}>Cervejaria Centro</p>
                    <p style={s.placeInfo}>1.1 km · Aberto agora</p>
                  </div>
                  <div style={{ ...s.placeScore, background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>91%</div>
                </div>

                <button style={s.mockupBtn}>Ver todos os lugares</button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. PROBLEM ── */}
      <section style={s.problem}>
        <div style={s.container}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            style={s.problemInner}
          >
            <motion.p variants={fadeUp} style={s.problemEyebrow}>Você conhece bem essa cena</motion.p>
            <motion.h2 variants={fadeUp} style={s.sectionTitle}>
              A decisão de grupo nunca é simples
            </motion.h2>

            <motion.div variants={stagger} style={s.bubbles}>
              {[
                { text: '"Onde vamos hoje?"', side: 'left' },
                { text: '"Tanto faz, qualquer lugar"', side: 'right' },
                { text: '"Não sei não, você decide"', side: 'left' },
                { text: '"Ai nunca decide nada 😤"', side: 'right' },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  style={{
                    ...s.bubble,
                    alignSelf: b.side === 'right' ? 'flex-end' : 'flex-start',
                    background: b.side === 'right' ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    borderRadius: b.side === 'right'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                  }}
                >
                  {b.text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} style={s.problemResolution}>
              <div style={s.resolutionLine} />
              <div style={s.resolutionBadge}>
                <Zap size={14} style={{ color: 'var(--warning)' }} />
                Chega disso. O Hangr resolve.
              </div>
              <div style={s.resolutionLine} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 4. SOLUTION / FEATURES ── */}
      <section id="features" style={s.features}>
        <div style={s.container}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} style={s.problemEyebrow}>Como funciona</motion.p>
            <motion.h2 variants={fadeUp} style={s.sectionTitle}>
              Três passos, zero discussão
            </motion.h2>

            <motion.div variants={stagger} style={s.featureGrid}>
              {[
                {
                  icon: <Users2 size={26} />,
                  num: '01',
                  title: 'Gostos em comum',
                  desc: 'Cria um rolê baseado no que todos do grupo curtem. O app cruza as preferências e encontra o match.',
                  color: '#8B5CF6',
                },
                {
                  icon: <MapPin size={26} />,
                  num: '02',
                  title: 'Lugares reais',
                  desc: 'Via Foursquare, o Hangr encontra lugares abertos perto de vocês que combinam com o gosto do grupo.',
                  color: '#6366F1',
                },
                {
                  icon: <Link2 size={26} />,
                  num: '03',
                  title: 'Link de convite',
                  desc: 'Compartilha um link com o grupo. Cada um entra, registra seus gostos e o app faz o match automático.',
                  color: '#EC4899',
                },
              ].map((f) => (
                <motion.div
                  key={f.num}
                  variants={fadeUp}
                  style={s.featureCard}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div style={{ ...s.featureIcon, background: `${f.color}20`, color: f.color }}>
                    {f.icon}
                  </div>
                  <span style={s.featureNum}>{f.num}</span>
                  <h3 style={s.featureTitle}>{f.title}</h3>
                  <p style={s.featureDesc}>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. FINAL CTA ── */}
      <section style={s.finalCta}>
        <div style={s.finalCtaGlow} />
        <div style={s.container}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            style={s.finalCtaInner}
          >
            <motion.h2 variants={fadeUp} style={s.finalCtaTitle}>
              Pronto pra decidir o rolê de hoje?
            </motion.h2>
            <motion.p variants={fadeUp} style={s.finalCtaSub}>
              Grátis, rápido e sem burocracia. Cria em 30 segundos.
            </motion.p>
            <motion.button
              variants={fadeUp}
              style={s.btnPrimaryLg}
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Criar conta grátis <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerLogo}>hangr</span>
          <p style={s.footerText}>© 2025 Hangr · Feito pra quem não consegue decidir</p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  /* Nav */
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: '64px',
    background: 'rgba(15,15,18,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  navInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    height: '100%',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLink: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    transition: 'color 0.2s',
  },

  /* Buttons */
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-primary)',
    transition: 'opacity 0.2s, transform 0.15s',
    cursor: 'pointer',
  },
  btnPrimaryLg: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 36px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '16px',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 12px 40px rgba(139,92,246,0.5)',
    cursor: 'pointer',
  },
  btnGhost: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: '14px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    background: 'transparent',
  },

  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    paddingTop: '64px',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '60px',
    width: '100%',
    flexWrap: 'wrap',
  },
  heroContent: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '540px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(250,204,21,0.1)',
    border: '1px solid rgba(250,204,21,0.2)',
    color: 'var(--warning)',
    fontSize: '13px',
    fontWeight: 600,
    width: 'fit-content',
  },
  heroTitle: {
    fontSize: 'clamp(36px, 5vw, 58px)',
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
    color: '#fff',
  },
  heroSub: {
    fontSize: '18px',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    maxWidth: '460px',
  },
  heroCtas: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },

  /* Phone mockup */
  phoneMockup: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  phone: {
    width: '240px',
    background: '#1A1A1F',
    borderRadius: '40px',
    border: '1.5px solid rgba(139,92,246,0.3)',
    boxShadow: '0 0 60px rgba(139,92,246,0.2), 0 40px 80px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    padding: '0 0 20px',
  },
  phoneNotch: {
    width: '72px',
    height: '6px',
    background: '#2A2A33',
    borderRadius: 'var(--radius-full)',
    margin: '14px auto 0',
  },
  phoneScreen: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  mockupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  mockupLogo: {
    fontSize: '14px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  mockupAvatars: {
    display: 'flex',
    alignItems: 'center',
  },
  mockupAvatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #1A1A1F',
  },
  mockupMatch: {
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '14px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  matchBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--warning)',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  matchTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
  },
  matchSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  mockupPlace: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '10px',
    border: '1px solid var(--border)',
  },
  placeIcon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  placeName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
  },
  placeInfo: {
    fontSize: '10px',
    color: 'var(--text-subtle)',
    marginTop: '1px',
  },
  placeScore: {
    marginLeft: 'auto',
    background: 'rgba(139,92,246,0.15)',
    color: 'var(--primary-light)',
    borderRadius: 'var(--radius-full)',
    padding: '3px 8px',
    fontSize: '10px',
    fontWeight: 700,
  },
  mockupBtn: {
    width: '100%',
    padding: '10px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '11px',
    borderRadius: '10px',
    marginTop: '4px',
    cursor: 'pointer',
  },

  /* Problem */
  problem: {
    padding: '100px 0',
    background: 'var(--bg-alt)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  },
  problemInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  problemEyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--primary-light)',
  },
  sectionTitle: {
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    marginBottom: '8px',
  },
  bubbles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '460px',
    textAlign: 'left',
  },
  bubble: {
    padding: '12px 18px',
    fontSize: '15px',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    maxWidth: '80%',
  },
  problemResolution: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '420px',
    marginTop: '8px',
  },
  resolutionLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border)',
  },
  resolutionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(250,204,21,0.1)',
    border: '1px solid rgba(250,204,21,0.2)',
    color: 'var(--warning)',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },

  /* Features */
  features: {
    padding: '100px 0',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    marginTop: '48px',
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  },
  featureIcon: {
    width: '52px',
    height: '52px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureNum: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-subtle)',
    letterSpacing: '0.08em',
    marginTop: '4px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff',
  },
  featureDesc: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
  },

  /* Final CTA */
  finalCta: {
    position: 'relative',
    padding: '120px 0',
    background: 'var(--bg-alt)',
    borderTop: '1px solid var(--border)',
    overflow: 'hidden',
  },
  finalCtaGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  finalCtaInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
    position: 'relative',
  },
  finalCtaTitle: {
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  finalCtaSub: {
    fontSize: '16px',
    color: 'var(--text-muted)',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '32px 24px',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerLogo: {
    fontSize: '18px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-subtle)',
  },
}
