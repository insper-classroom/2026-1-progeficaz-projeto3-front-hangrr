import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Check, ArrowLeft } from 'lucide-react'

const CATEGORIAS = [
  {
    slug: 'restaurantes', nome: 'Restaurantes', emoji: '🍽️', cor: '#F59E0B',
    subs: ['Japonesa', 'Italiana', 'Churrasco', 'Vegano', 'Fast Food', 'Pizza', 'Frutos do Mar', 'Mexicana'],
  },
  {
    slug: 'bares', nome: 'Bares', emoji: '🍺', cor: '#3B82F6',
    subs: ['Balada', 'Boteco', 'Karaokê', 'Rooftop', 'Pub', 'Wine Bar', 'Cervejaria'],
  },
  {
    slug: 'cafes', nome: 'Cafés', emoji: '☕', cor: '#A78BFA',
    subs: ['Café da Manhã', 'Brunch', 'Café da Tarde', 'Padaria', 'Confeitaria', 'Coworking Café'],
  },
  {
    slug: 'jogos', nome: 'Jogos', emoji: '🎮', cor: '#10B981',
    subs: ['Videogame', 'Tabuleiro', 'Boliche', 'Sinuca', 'Escape Room', 'Fliperama', 'Paintball'],
  },
  {
    slug: 'parque', nome: 'Parque', emoji: '🌳', cor: '#22C55E',
    subs: ['Piquenique', 'Ciclismo', 'Corrida', 'Skate', 'Fotografia', 'Meditação'],
  },
  {
    slug: 'esportes', nome: 'Esportes', emoji: '⚽', cor: '#EF4444',
    subs: ['Futebol', 'Basquete', 'Tênis', 'Academia', 'Natação', 'Vôlei', 'Padel'],
  },
]

const MIN_SELECOES = 5
const TOTAL_STEPS = 3

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1 — gênero
  const [genero, setGenero] = useState('')

  // Step 2 — data de nascimento
  const [dataNasc, setDataNasc] = useState('')

  // Step 3 — gostos
  const [selectedCats, setSelectedCats] = useState(new Set())
  const [selectedSubs, setSelectedSubs] = useState({})
  const [expandedCat, setExpandedCat] = useState(null)

  const totalSelecionados =
    selectedCats.size +
    Object.values(selectedSubs).reduce((acc, set) => acc + set.size, 0)

  function goNext() {
    setDirection(1)
    setStep(s => s + 1)
  }

  function goBack() {
    if (step === 0) { navigate('/'); return }
    setDirection(-1)
    setStep(s => s - 1)
  }

  function toggleCat(slug) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
        setSelectedSubs(s => { const n = { ...s }; delete n[slug]; return n })
        if (expandedCat === slug) setExpandedCat(null)
      } else {
        next.add(slug)
        setExpandedCat(slug)
      }
      return next
    })
  }

  function toggleSub(catSlug, sub) {
    setSelectedSubs(prev => {
      const set = new Set(prev[catSlug] || [])
      set.has(sub) ? set.delete(sub) : set.add(sub)
      return { ...prev, [catSlug]: set }
    })
  }

  async function handleFinalizar() {
    const usuario = JSON.parse(localStorage.getItem('hangr_user') || '{}')
    const prefs = {
      usuario_id: usuario._id || usuario.id,
      genero,
      data_nascimento: dataNasc,
      categorias: [...selectedCats].map(slug => {
        const subs = [...(selectedSubs[slug] || [])]
        return { slug, forca: 1, subs }
      }),
    }
    localStorage.setItem('hangr_prefs', JSON.stringify(prefs))
    navigate('/home')
  }

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={goBack}>
          <ArrowLeft size={18} />
        </button>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <motion.div
            style={s.progressFill}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <span style={s.stepCount}>{step + 1}/{TOTAL_STEPS}</span>
      </div>

      {/* Step container */}
      <div style={s.stepWrap}>
        <AnimatePresence custom={direction} mode="wait">
          {step === 0 && (
            <motion.div
              key="step-gender"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={s.step}
            >
              <StepGenero
                genero={genero}
                onSelect={(g) => { setGenero(g); goNext() }}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-dob"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={s.step}
            >
              <StepDataNasc
                dataNasc={dataNasc}
                onChange={setDataNasc}
                onNext={goNext}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-interests"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={s.step}
            >
              <StepGostos
                selectedCats={selectedCats}
                selectedSubs={selectedSubs}
                expandedCat={expandedCat}
                totalSelecionados={totalSelecionados}
                onToggleCat={toggleCat}
                onToggleSub={toggleSub}
                onExpandCat={setExpandedCat}
                onFinalizar={handleFinalizar}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Step 1: Gênero ──────────────────────────────────────────────────── */
function StepGenero({ genero, onSelect }) {
  const opcoes = [
    { label: 'Masculino', emoji: '👨' },
    { label: 'Feminino', emoji: '👩' },
    { label: 'Prefiro não dizer', emoji: '🤍' },
  ]

  return (
    <div style={s.stepInner}>
      <p style={s.eyebrow}>Passo 1 de 3</p>
      <h2 style={s.stepTitle}>Como você se identifica?</h2>
      <p style={s.stepSub}>Isso nos ajuda a personalizar suas sugestões.</p>

      <div style={s.genderGrid}>
        {opcoes.map(op => (
          <motion.button
            key={op.label}
            style={{
              ...s.genderCard,
              ...(genero === op.label ? s.genderCardActive : {}),
            }}
            onClick={() => onSelect(op.label)}
            whileTap={{ scale: 0.96 }}
            whileHover={{ borderColor: 'rgba(139,92,246,0.4)' }}
          >
            <span style={s.genderEmoji}>{op.emoji}</span>
            <span style={s.genderLabel}>{op.label}</span>
            {genero === op.label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={s.genderCheck}
              >
                <Check size={12} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ─── Step 2: Data de nascimento ─────────────────────────────────────── */
function StepDataNasc({ dataNasc, onChange, onNext }) {
  const hoje = new Date()
  const maxDate = new Date(hoje.getFullYear() - 13, hoje.getMonth(), hoje.getDate())
    .toISOString().split('T')[0]

  const canProceed = dataNasc !== ''

  return (
    <div style={s.stepInner}>
      <p style={s.eyebrow}>Passo 2 de 3</p>
      <h2 style={s.stepTitle}>Quando você nasceu?</h2>
      <p style={s.stepSub}>Usamos isso para sugerir os melhores rolês pra você.</p>

      <div style={s.dobWrap}>
        <input
          type="date"
          max={maxDate}
          value={dataNasc}
          onChange={e => onChange(e.target.value)}
          style={s.dobInput}
        />
      </div>

      {dataNasc && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={s.dobAge}
        >
          Você tem {calcularIdade(dataNasc)} anos 🎂
        </motion.p>
      )}

      <button
        style={{ ...s.btnContinue, opacity: canProceed ? 1 : 0.4 }}
        onClick={canProceed ? onNext : undefined}
        disabled={!canProceed}
      >
        Continuar <ChevronRight size={18} />
      </button>
    </div>
  )
}

function calcularIdade(dataNasc) {
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

/* ─── Step 3: Gostos ─────────────────────────────────────────────────── */
function StepGostos({
  selectedCats, selectedSubs, expandedCat, totalSelecionados,
  onToggleCat, onToggleSub, onExpandCat, onFinalizar,
}) {
  const canFinish = totalSelecionados >= MIN_SELECOES

  return (
    <div style={s.stepInner}>
      <p style={s.eyebrow}>Passo 3 de 3</p>
      <h2 style={s.stepTitle}>O que você curte fazer?</h2>

      {/* Counter */}
      <div style={s.counterRow}>
        <p style={s.stepSub}>Selecione pelo menos {MIN_SELECOES} no total</p>
        <div style={{
          ...s.counterBadge,
          background: canFinish ? 'rgba(34,197,94,0.12)' : 'var(--bg-elevated)',
          color: canFinish ? 'var(--success)' : 'var(--text-muted)',
          borderColor: canFinish ? 'rgba(34,197,94,0.25)' : 'var(--border)',
        }}>
          {totalSelecionados}/{MIN_SELECOES}
        </div>
      </div>

      {/* Category grid */}
      <div style={s.catGrid}>
        {CATEGORIAS.map(cat => {
          const isSelected = selectedCats.has(cat.slug)
          return (
            <motion.button
              key={cat.slug}
              style={{
                ...s.catCard,
                ...(isSelected ? {
                  borderColor: cat.cor + '60',
                  background: cat.cor + '12',
                  boxShadow: `0 0 20px ${cat.cor}20`,
                } : {}),
              }}
              onClick={() => onToggleCat(cat.slug)}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <span style={s.catEmoji}>{cat.emoji}</span>
              <span style={s.catName}>{cat.nome}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ ...s.catCheck, background: cat.cor }}
                >
                  <Check size={10} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Sub-interests accordion (only for selected categories) */}
      <AnimatePresence>
        {CATEGORIAS.filter(c => selectedCats.has(c.slug)).map(cat => {
          const isExpanded = expandedCat === cat.slug
          const catSubs = selectedSubs[cat.slug] || new Set()

          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={s.subSection}>
                <button
                  style={s.subHeader}
                  onClick={() => onExpandCat(isExpanded ? null : cat.slug)}
                >
                  <span style={s.subHeaderLeft}>
                    <span>{cat.emoji}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{cat.nome}</span>
                    {catSubs.size > 0 && (
                      <span style={{ ...s.subCount, background: cat.cor + '20', color: cat.cor }}>
                        +{catSubs.size}
                      </span>
                    )}
                  </span>
                  <span style={s.subOptional}>Opcional</span>
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--text-subtle)', display: 'flex' }}
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={s.subChips}>
                        {cat.subs.map(sub => {
                          const isSubSelected = catSubs.has(sub)
                          return (
                            <motion.button
                              key={sub}
                              onClick={() => onToggleSub(cat.slug, sub)}
                              style={{
                                ...s.subChip,
                                ...(isSubSelected ? {
                                  background: cat.cor + '18',
                                  borderColor: cat.cor + '60',
                                  color: '#fff',
                                } : {}),
                              }}
                              whileTap={{ scale: 0.94 }}
                            >
                              {isSubSelected && <Check size={11} style={{ color: cat.cor }} />}
                              {sub}
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Finish button */}
      <motion.button
        style={{
          ...s.btnContinue,
          opacity: canFinish ? 1 : 0.35,
          marginTop: '16px',
        }}
        onClick={canFinish ? onFinalizar : undefined}
        disabled={!canFinish}
        whileTap={canFinish ? { scale: 0.97 } : {}}
      >
        {canFinish ? 'Entrar no Hangr 🎉' : `Selecione mais ${MIN_SELECOES - totalSelecionados}`}
        {canFinish && <ChevronRight size={18} />}
      </motion.button>
    </div>
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
    overflowX: 'hidden',
  },
  bgGlow: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'rgba(15,15,18,0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: '4px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--gradient)',
    borderRadius: 'var(--radius-full)',
  },
  stepCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-subtle)',
    flexShrink: 0,
  },
  stepWrap: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  step: {
    position: 'relative',
    width: '100%',
  },
  stepInner: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--primary-light)',
  },
  stepTitle: {
    fontSize: 'clamp(24px, 4vw, 34px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    color: '#fff',
  },
  stepSub: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },

  /* Gender */
  genderGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  genderCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 20px',
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'border-color 0.2s, background 0.2s',
    textAlign: 'left',
  },
  genderCardActive: {
    borderColor: 'rgba(139,92,246,0.6)',
    background: 'rgba(139,92,246,0.08)',
  },
  genderEmoji: {
    fontSize: '28px',
    lineHeight: 1,
  },
  genderLabel: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#fff',
  },
  genderCheck: {
    marginLeft: 'auto',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },

  /* DOB */
  dobWrap: {
    marginTop: '16px',
  },
  dobInput: {
    width: '100%',
    padding: '16px 18px',
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    colorScheme: 'dark',
  },
  dobAge: {
    fontSize: '14px',
    color: 'var(--primary-light)',
    fontWeight: 600,
  },

  /* Interests */
  counterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  counterBadge: {
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.3s',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '8px',
  },
  catCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 12px',
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
  },
  catEmoji: {
    fontSize: '32px',
    lineHeight: 1,
  },
  catName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  catCheck: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },

  /* Sub-interests */
  subSection: {
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginTop: '4px',
  },
  subHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
  },
  subHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  subCount: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: 700,
  },
  subOptional: {
    fontSize: '11px',
    color: 'var(--text-subtle)',
    fontStyle: 'italic',
  },
  subChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 16px 16px',
  },
  subChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 14px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  /* Continue button */
  btnContinue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '16px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '16px',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-primary)',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s',
    marginTop: '8px',
  },
}
