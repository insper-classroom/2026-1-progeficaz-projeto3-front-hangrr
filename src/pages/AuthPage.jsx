import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Mail, MapPin, Loader2 } from 'lucide-react'
import { criarUsuario } from '../services/api'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cidade, setCidade] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCriar() {
    setErro('')
    if (!nome.trim() || !email.trim() || !cidade.trim()) {
      setErro('Preencha todos os campos.')
      return
    }
    if (!email.includes('@')) {
      setErro('Email inválido.')
      return
    }

    try {
      setCarregando(true)
      const usuario = await criarUsuario({ nome, email, cidade })
      localStorage.setItem('hangr_user', JSON.stringify(usuario))
      navigate('/onboarding')
    } catch (err) {
      setErro(err.message || 'Algo deu errado. Tenta de novo.')
    } finally {
      setCarregando(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleCriar()
  }

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      {/* Back */}
      <Link to="/" style={s.back}>
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <motion.div
        style={s.card}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        {/* Logo */}
        <motion.div variants={fadeUp} style={s.logoWrap}>
          <span style={s.logo}>hangr</span>
        </motion.div>

        <motion.h1 variants={fadeUp} style={s.title}>
          Crie sua conta
        </motion.h1>
        <motion.p variants={fadeUp} style={s.sub}>
          Rápido, grátis e sem frescura.
        </motion.p>

        {/* Fields */}
        <motion.div variants={fadeUp} style={s.fields}>
          <Field
            icon={<User size={16} />}
            placeholder="Seu nome"
            value={nome}
            onChange={setNome}
            onKeyDown={handleKeyDown}
          />
          <Field
            icon={<Mail size={16} />}
            placeholder="Seu email"
            type="email"
            value={email}
            onChange={setEmail}
            onKeyDown={handleKeyDown}
          />
          <Field
            icon={<MapPin size={16} />}
            placeholder="Sua cidade"
            value={cidade}
            onChange={setCidade}
            onKeyDown={handleKeyDown}
          />
        </motion.div>

        {erro && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={s.error}
          >
            {erro}
          </motion.p>
        )}

        <motion.button
          variants={fadeUp}
          style={{
            ...s.btn,
            opacity: carregando ? 0.7 : 1,
          }}
          onClick={handleCriar}
          disabled={carregando}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          {carregando
            ? <><Loader2 size={16} style={s.spin} /> Criando conta...</>
            : <>Criar conta <ArrowRight size={16} /></>
          }
        </motion.button>

        <motion.p variants={fadeUp} style={s.hint}>
          Ao criar, você concorda em decidir rolês com mais estilo.
        </motion.p>
      </motion.div>
    </div>
  )
}

function Field({ icon, placeholder, type = 'text', value, onChange, onKeyDown }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        ...s.fieldWrap,
        borderColor: focused ? 'rgba(139,92,246,0.6)' : 'var(--border)',
        background: focused ? '#20202A' : 'var(--bg-input)',
      }}
    >
      <span style={s.fieldIcon}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        style={s.fieldInput}
      />
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  back: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-2xl)',
    padding: '40px 36px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    marginBottom: '8px',
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
  title: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#fff',
    marginBottom: '2px',
  },
  sub: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  fieldWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid',
    transition: 'border-color 0.2s, background 0.2s',
  },
  fieldIcon: {
    color: 'var(--text-subtle)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  fieldInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#fff',
  },
  error: {
    fontSize: '13px',
    color: '#FCA5A5',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(239,68,68,0.2)',
    marginTop: '4px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '15px',
    background: 'var(--gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-primary)',
    cursor: 'pointer',
    marginTop: '8px',
    border: 'none',
  },
  spin: {
    animation: 'spin 1s linear infinite',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-subtle)',
    textAlign: 'center',
    marginTop: '4px',
    lineHeight: 1.5,
  },
}
