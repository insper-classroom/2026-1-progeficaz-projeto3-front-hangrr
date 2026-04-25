import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

/* ─── Data ───────────────────────────────────────────────────────────── */
const GENEROS = [
  { id: 'masculino',  label: 'Masculino' },
  { id: 'feminino',   label: 'Feminino' },
  { id: 'nao_dizer',  label: 'Prefiro não dizer' },
]

const CATEGORIAS = [
  { slug: 'restaurantes', nome: 'Restaurantes', emoji: '🍽️', cor: '#CCFF00', corTexto: '#000',
    subs: ['Japonesa','Italiana','Churrasco','Vegano','Fast Food','Pizza','Frutos do Mar','Mexicana'] },
  { slug: 'bares',        nome: 'Bares',        emoji: '🍺', cor: '#FF3D8A', corTexto: '#fff',
    subs: ['Balada','Boteco','Karaokê','Rooftop','Pub','Wine Bar','Cervejaria'] },
  { slug: 'cafes',        nome: 'Cafés',        emoji: '☕', cor: '#F5C842', corTexto: '#000',
    subs: ['Café da Manhã','Brunch','Café da Tarde','Padaria','Confeitaria','Coworking Café'] },
  { slug: 'jogos',        nome: 'Jogos',        emoji: '🎮', cor: '#3D8AFF', corTexto: '#fff',
    subs: ['Videogame','Tabuleiro','Boliche','Sinuca','Escape Room','Fliperama','Paintball'] },
  { slug: 'parque',       nome: 'Parque',       emoji: '🌳', cor: '#00E096', corTexto: '#000',
    subs: ['Piquenique','Ciclismo','Corrida','Skate','Fotografia','Meditação'] },
  { slug: 'esportes',     nome: 'Esportes',     emoji: '⚽', cor: '#FF5C3A', corTexto: '#fff',
    subs: ['Futebol','Basquete','Tênis','Academia','Natação','Vôlei','Padel'] },
]

const MIN = 3

const slide = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, x: -40, transition: { duration: 0.22 } },
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [genero, setGenero] = useState(null)
  const [dob, setDob]       = useState('')

  const [selCats, setSelCats]   = useState(new Set())
  const [selSubs, setSelSubs]   = useState({})
  const [expanded, setExpanded] = useState(null)

  const totalSel = selCats.size + Object.values(selSubs).reduce((a, s) => a + s.size, 0)

  function toggleCat(slug) {
    setSelCats(prev => {
      const n = new Set(prev)
      if (n.has(slug)) {
        n.delete(slug)
        setSelSubs(s => { const c = { ...s }; delete c[slug]; return c })
        if (expanded === slug) setExpanded(null)
      } else {
        n.add(slug)
        setExpanded(slug)
      }
      return n
    })
  }

  function toggleSub(catSlug, sub) {
    setSelSubs(prev => {
      const set = new Set(prev[catSlug] || [])
      set.has(sub) ? set.delete(sub) : set.add(sub)
      return { ...prev, [catSlug]: set }
    })
  }

  function next() { setStep(s => s + 1) }
  function back() { step > 0 ? setStep(s => s - 1) : navigate('/auth') }

  async function finalizar() {
    if (totalSel < MIN) return
    const usuario = JSON.parse(localStorage.getItem('hangr_user') || '{}')
    localStorage.setItem('hangr_prefs', JSON.stringify({
      usuario_id: usuario._id,
      genero,
      data_nascimento: dob,
      categorias: [...selCats].map(slug => ({
        slug, forca: 1, subs: [...(selSubs[slug] || [])],
      })),
    }))
    navigate('/home')
  }

  return (
    <div style={s.root}>

      {/* Progress bar */}
      <div style={s.bar}>
        <motion.div
          style={s.barFill}
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={back}>
          <ArrowLeft size={16} />
        </button>
        <span style={s.stepNum}>{step + 1} / 3</span>
      </div>

      {/* Steps */}
      <div style={s.body}>
        <AnimatePresence mode="wait">

          {/* ── Gênero ── */}
          {step === 0 && (
            <motion.div key="g" variants={slide} initial="hidden" animate="show" exit="exit" style={s.step}>
              <p style={s.eye}>Sobre você</p>
              <h1 style={s.title}>Como você<br />se identifica?</h1>

              <div style={s.genList}>
                {GENEROS.map(g => {
                  const on = genero === g.id
                  return (
                    <motion.button
                      key={g.id}
                      style={{
                        ...s.genCard,
                        background:  on ? '#fff'          : 'var(--bg-1)',
                        borderColor: on ? '#fff'          : 'var(--line)',
                        color:       on ? '#000'          : 'var(--text-2)',
                        fontWeight:  on ? 700             : 500,
                      }}
                      onClick={() => setGenero(g.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      {g.label}
                      {on && <Check size={15} style={{ marginLeft: 'auto' }} />}
                    </motion.button>
                  )
                })}
              </div>

              <Btn label="Continuar" onClick={next} disabled={!genero} />
            </motion.div>
          )}

          {/* ── Data de nascimento ── */}
          {step === 1 && (
            <motion.div key="d" variants={slide} initial="hidden" animate="show" exit="exit" style={s.step}>
              <p style={s.eye}>Sobre você</p>
              <h1 style={s.title}>Quando você<br />nasceu?</h1>

              <input
                type="date"
                style={s.dateInput}
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />

              <AnimatePresence>
                {dob && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={s.age}
                  >
                    {calcAge(dob)} anos
                  </motion.p>
                )}
              </AnimatePresence>

              <Btn label="Continuar" onClick={next} disabled={!dob} />
            </motion.div>
          )}

          {/* ── Gostos ── */}
          {step === 2 && (
            <motion.div key="i" variants={slide} initial="hidden" animate="show" exit="exit" style={s.step}>
              <p style={s.eye}>Seus gostos</p>
              <h1 style={s.title}>O que você<br />curte fazer?</h1>

              {/* Counter */}
              <div style={s.counter}>
                <motion.span
                  style={{ color: totalSel >= MIN ? 'var(--lime)' : '#fff', fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em' }}
                  key={totalSel}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {totalSel}
                </motion.span>
                <span style={{ color: 'var(--text-3)', fontSize: 14 }}>/ {MIN} mínimo</span>
              </div>

              {/* Categories */}
              <div style={s.catGrid}>
                {CATEGORIAS.map(cat => {
                  const on = selCats.has(cat.slug)
                  return (
                    <div key={cat.slug}>
                      <motion.button
                        style={{
                          ...s.catCard,
                          background:  on ? cat.cor        : 'var(--bg-1)',
                          borderColor: on ? cat.cor        : 'var(--line)',
                          color:       on ? cat.corTexto   : '#fff',
                        }}
                        onClick={() => toggleCat(cat.slug)}
                        whileTap={{ scale: 0.97 }}
                        layout
                      >
                        <span style={s.catEmoji}>{cat.emoji}</span>
                        <span style={s.catNome}>{cat.nome}</span>
                        {on && <Check size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                      </motion.button>

                      {/* Sub-toggle */}
                      {on && (
                        <button
                          style={{ ...s.subToggle, color: cat.cor }}
                          onClick={() => setExpanded(e => e === cat.slug ? null : cat.slug)}
                        >
                          {expanded === cat.slug ? '▲ fechar' : '▼ subcategorias'}
                        </button>
                      )}

                      {/* Subs */}
                      <AnimatePresence>
                        {on && expanded === cat.slug && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={s.subChips}>
                              {cat.subs.map(sub => {
                                const subOn = (selSubs[cat.slug] || new Set()).has(sub)
                                return (
                                  <motion.button
                                    key={sub}
                                    style={{
                                      ...s.subChip,
                                      background:  subOn ? cat.cor      : 'transparent',
                                      borderColor: subOn ? cat.cor      : 'var(--line-mid)',
                                      color:       subOn ? cat.corTexto : 'var(--text-2)',
                                    }}
                                    onClick={() => toggleSub(cat.slug, sub)}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {sub}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              <Btn
                label={totalSel >= MIN ? 'Entrar no Hangr' : `Selecione mais ${MIN - totalSel}`}
                onClick={finalizar}
                disabled={totalSel < MIN}
                lime={totalSel >= MIN}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Button ─────────────────────────────────────────────────────────── */
function Btn({ label, onClick, disabled, lime }) {
  return (
    <motion.button
      style={{
        ...s.btn,
        background:  lime ? 'var(--lime)' : '#fff',
        color:       lime ? '#000'        : '#000',
        opacity:     disabled ? 0.3       : 1,
        marginTop: 32,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {label} <ArrowRight size={15} />
    </motion.button>
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function calcAge(dob) {
  const b = new Date(dob), t = new Date()
  let a = t.getFullYear() - b.getFullYear()
  const m = t.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--
  return a
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    background: 'var(--bg)', overflowX: 'hidden',
  },
  bar:     { height: 3, background: 'var(--bg-2)', flexShrink: 0 },
  barFill: { height: '100%', background: 'var(--lime)', borderRadius: 'var(--r-full)' },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px',
  },
  backBtn: {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--line)', borderRadius: 'var(--r-full)',
    color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)',
  },
  stepNum: { fontSize: 12, fontWeight: 600, color: 'var(--text-3)' },

  body: {
    flex: 1, overflowX: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  step: {
    maxWidth: 480, width: '100%', margin: '0 auto',
    padding: '16px 24px 60px',
    display: 'flex', flexDirection: 'column',
  },

  eye: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12,
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 46px)',
    fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
    marginBottom: 32,
  },

  /* Gênero */
  genList: { display: 'flex', flexDirection: 'column', gap: 10 },
  genCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '16px 20px',
    border: '1px solid', borderRadius: 'var(--r-xl)',
    fontSize: 15, cursor: 'pointer', textAlign: 'left',
    transition: 'background .18s, border-color .18s, color .18s',
  },

  /* DOB */
  dateInput: {
    width: '100%', padding: '16px 18px',
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-xl)', color: '#fff',
    fontSize: 18, fontWeight: 600, outline: 'none', colorScheme: 'dark',
  },
  age: {
    marginTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--lime)',
  },

  /* Gostos */
  counter: {
    display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20,
  },
  catGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  catCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '15px 18px',
    border: '1px solid', borderRadius: 'var(--r-xl)',
    cursor: 'pointer', textAlign: 'left',
    transition: 'background .2s, border-color .2s, color .2s',
  },
  catEmoji: { fontSize: 22, flexShrink: 0 },
  catNome:  { fontSize: 15, fontWeight: 700, flex: 1 },

  subToggle: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', cursor: 'pointer',
    padding: '5px 18px', background: 'none', border: 'none',
    textAlign: 'left',
  },
  subChips: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    padding: '6px 4px 10px 4px',
  },
  subChip: {
    padding: '7px 14px', border: '1px solid',
    borderRadius: 'var(--r-full)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'background .15s, border-color .15s, color .15s',
  },

  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '15px', border: 'none',
    borderRadius: 'var(--r-full)', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'opacity .2s',
  },
}
