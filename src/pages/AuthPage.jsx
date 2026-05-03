import { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { criarUsuario, loginUsuario, loginComGoogle } from '../services/api'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function AuthPage() {
  const navigate   = useNavigate()
  const [searchParams] = useSearchParams()
  const [modo, setModo] = useState(searchParams.get('modo') === 'cadastro' ? 'cadastro' : 'login')

  const [nome, setNome]   = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')

  const [erro, setErro]               = useState('')
  const [carregando, setCarregando]   = useState(false)
  const enviando = useRef(false)

  function trocarModo(m) {
    setModo(m)
    setErro('')
    setNome(''); setEmail(''); setSenha(''); setConfirmar('')
  }

  async function handleGoogle(credentialResponse) {
    setErro('')
    setCarregando(true)
    try {
      const data = await loginComGoogle(credentialResponse.credential)
      localStorage.setItem('hangr_user', JSON.stringify(data.usuario))
      const pendingJoin = localStorage.getItem('hangr_join_pendente')
      if (pendingJoin) {
        localStorage.removeItem('hangr_join_pendente')
        navigate(`/party/join/${pendingJoin}`)
      } else if (data.novo) {
        navigate('/onboarding')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setErro(err.message || 'Erro ao entrar com Google.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmit() {
    if (enviando.current) return
    setErro('')

    if (modo === 'cadastro') {
      if (!nome.trim() || !email.trim() || !senha.trim()) { setErro('Preencha todos os campos.'); return }
      if (!email.includes('@')) { setErro('Email inválido.'); return }
      if (senha.length < 6) { setErro('Senha deve ter no mínimo 6 caracteres.'); return }
      if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    } else {
      if (!email.trim() || !senha.trim()) { setErro('Preencha todos os campos.'); return }
    }

    enviando.current = true
    try {
      setCarregando(true)
      let usuario
      if (modo === 'cadastro') {
        usuario = await criarUsuario({ nome, email, senha })
        localStorage.setItem('hangr_user', JSON.stringify(usuario))
        navigate('/onboarding')
      } else {
        usuario = await loginUsuario({ email, senha })
        localStorage.setItem('hangr_user', JSON.stringify(usuario))
        const pendingJoin = localStorage.getItem('hangr_join_pendente')
        if (pendingJoin) {
          localStorage.removeItem('hangr_join_pendente')
          navigate(`/party/join/${pendingJoin}`)
        } else {
          navigate('/home')
        }
      }
    } catch (err) {
      setErro(err.message || 'Algo deu errado. Tenta de novo.')
    } finally {
      setCarregando(false)
      enviando.current = false
    }
  }

  const isCadastro = modo === 'cadastro'

  return (
    <div style={s.root}>
      <Link to="/" style={s.back}><ArrowLeft size={15} /> Voltar</Link>

      <motion.div
        key={modo}
        style={s.card}
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        <motion.span variants={fadeUp(0)} style={s.logo}>hangr</motion.span>
        <motion.h1 variants={fadeUp(0.05)} style={s.title}>
          {isCadastro ? 'Crie sua conta' : 'Bem-vindo de volta'}
        </motion.h1>
        <motion.p variants={fadeUp(0.1)} style={s.sub}>
          {isCadastro ? 'Grátis. Sem frescura.' : 'Entra e decide o rolê.'}
        </motion.p>

        <motion.div variants={fadeUp(0.12)} style={s.fields}>
          {isCadastro && (
            <Field icon={<User size={15} />} placeholder="Seu nome" value={nome} onChange={setNome} />
          )}
          <Field icon={<Mail size={15} />} placeholder="Seu email" type="email" value={email} onChange={setEmail} />
          <PasswordField placeholder="Senha" value={senha} onChange={setSenha} />
          {isCadastro && (
            <PasswordField placeholder="Confirmar senha" value={confirmar} onChange={setConfirmar} />
          )}
        </motion.div>

        <AnimatePresence>
          {erro && (
            <motion.p key="err"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={s.error}
            >
              {erro}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          variants={fadeUp(0.18)}
          style={{ ...s.btn, opacity: carregando ? 0.65 : 1 }}
          onClick={handleSubmit} disabled={carregando} whileTap={{ scale: 0.97 }}
        >
          {carregando
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {isCadastro ? 'Criando...' : 'Entrando...'}</>
            : <>{isCadastro ? 'Criar conta' : 'Entrar'} <ArrowRight size={15} /></>}
        </motion.button>

        <motion.div variants={fadeUp(0.22)} style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>ou</span>
          <span style={s.dividerLine} />
        </motion.div>

        <motion.div variants={fadeUp(0.25)} style={s.googleWrap}>
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setErro('Erro ao entrar com Google.')}
            theme="filled_black"
            shape="pill"
            text={isCadastro ? 'signup_with' : 'signin_with'}
            width="356"
          />
        </motion.div>

        <motion.p variants={fadeUp(0.28)} style={s.toggle}>
          {isCadastro ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button style={s.toggleBtn} onClick={() => trocarModo(isCadastro ? 'login' : 'cadastro')}>
            {isCadastro ? 'Entrar' : 'Criar conta'}
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}

function Field({ icon, placeholder, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ ...s.field, borderColor: focused ? 'var(--line-strong)' : 'var(--line)' }}>
      <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={s.fieldInput} autoComplete="off" />
    </div>
  )
}

function PasswordField({ placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ ...s.field, borderColor: focused ? 'var(--line-strong)' : 'var(--line)' }}>
      <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Lock size={15} />
      </span>
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.fieldInput}
        autoComplete="off"
      />
      <button
        type="button"
        style={s.eyeBtn}
        onMouseDown={e => { e.preventDefault(); setVisible(v => !v) }}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' },
  back: { position: 'fixed', top: 20, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', background: 'var(--bg-1)' },
  card: { width: '100%', maxWidth: 420, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 10 },
  logo:  { fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)' },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginTop: 6 },
  sub:   { fontSize: 14, color: 'var(--text-2)', marginBottom: 4 },
  fields: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  field: { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', background: 'var(--bg-2)', border: '1px solid', borderRadius: 'var(--r-lg)', transition: 'border-color .18s' },
  fieldInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#fff', minWidth: 0 },
  eyeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 },
  error: { fontSize: 13, color: '#FCA5A5', padding: '10px 14px', background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)', borderRadius: 'var(--r-md)', marginTop: 2 },
  btn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: '#fff', color: '#000', fontWeight: 700, fontSize: 14, borderRadius: 'var(--r-full)', cursor: 'pointer', marginTop: 6, border: 'none' },
  divider:     { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, background: 'var(--line)' },
  dividerText: { fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em' },
  googleWrap:  { display: 'flex', justifyContent: 'center' },
  toggle:    { fontSize: 13, color: 'var(--text-2)', textAlign: 'center', marginTop: 4 },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lime)', fontWeight: 700, fontSize: 13, padding: 0 },
}
