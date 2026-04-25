import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Mail, MapPin, ChevronDown, Check, Loader2 } from 'lucide-react'
import { criarUsuario } from '../services/api'

const IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] } },
})

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

  return (
    <div style={s.root}>

      <Link to="/" style={s.back}>
        <ArrowLeft size={15} /> Voltar
      </Link>

      <motion.div
        style={s.card}
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.span variants={fadeUp(0)} style={s.logo}>hangr</motion.span>

        <motion.h1 variants={fadeUp(0.05)} style={s.title}>Crie sua conta</motion.h1>
        <motion.p variants={fadeUp(0.1)} style={s.sub}>Grátis. Sem frescura.</motion.p>

        <motion.div variants={fadeUp(0.12)} style={s.fields}>
          <Field icon={<User size={15} />} placeholder="Seu nome" value={nome} onChange={setNome} />
          <Field icon={<Mail size={15} />} placeholder="Seu email" type="email" value={email} onChange={setEmail} />
          <LocationPicker onCidadeChange={setCidade} />
        </motion.div>

        <AnimatePresence>
          {erro && (
            <motion.p
              key="err"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={s.error}
            >
              {erro}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          variants={fadeUp(0.18)}
          style={{ ...s.btn, opacity: carregando ? 0.65 : 1 }}
          onClick={handleCriar}
          disabled={carregando}
          whileTap={{ scale: 0.97 }}
        >
          {carregando
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</>
            : <>Criar conta <ArrowRight size={15} /></>}
        </motion.button>

        <motion.p variants={fadeUp(0.22)} style={s.hint}>
          Ao criar, você concorda em decidir rolês com mais estilo.
        </motion.p>
      </motion.div>
    </div>
  )
}

/* ─── LocationPicker ─────────────────────────────────────────────────── */
function LocationPicker({ onCidadeChange }) {
  const [estados, setEstados] = useState([])
  const [cidades, setCidades] = useState([])
  const [estadoSel, setEstadoSel] = useState(null)
  const [estadoQuery, setEstadoQuery] = useState('')
  const [cidadeQuery, setCidadeQuery] = useState('')
  const [estadoOpen, setEstadoOpen] = useState(false)
  const [cidadeOpen, setCidadeOpen] = useState(false)
  const [loadingEstados, setLoadingEstados] = useState(true)
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [cidadeOk, setCidadeOk] = useState(false)

  const estadoRef = useRef(null)
  const cidadeRef = useRef(null)

  useEffect(() => {
    fetch(`${IBGE}/estados?orderBy=nome`)
      .then(r => r.json())
      .then(d => { setEstados(d); setLoadingEstados(false) })
      .catch(() => setLoadingEstados(false))
  }, [])

  useEffect(() => {
    if (!estadoSel) return
    setLoadingCidades(true)
    setCidades([])
    fetch(`${IBGE}/estados/${estadoSel.sigla}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(d => { setCidades(d); setLoadingCidades(false) })
      .catch(() => setLoadingCidades(false))
  }, [estadoSel])

  useEffect(() => {
    const close = e => {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false)
      if (cidadeRef.current && !cidadeRef.current.contains(e.target)) setCidadeOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtEstados = estados
    .filter(e => e.nome.toLowerCase().includes(estadoQuery.toLowerCase()) || e.sigla.toLowerCase().includes(estadoQuery.toLowerCase()))
    .slice(0, 8)

  const filtCidades = cidades
    .filter(c => c.nome.toLowerCase().includes(cidadeQuery.toLowerCase()))
    .slice(0, 8)

  function pickEstado(e) {
    setEstadoSel(e); setEstadoQuery(e.nome); setEstadoOpen(false)
    setCidadeQuery(''); setCidadeOk(false); onCidadeChange('')
  }

  function pickCidade(c) {
    setCidadeQuery(c.nome); setCidadeOpen(false); setCidadeOk(true); onCidadeChange(c.nome)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Estado */}
      <div ref={estadoRef} style={{ position: 'relative' }}>
        <PickerField
          icon={<MapPin size={15} />}
          placeholder={loadingEstados ? 'Carregando estados…' : 'Estado'}
          value={estadoQuery}
          onChange={v => { setEstadoQuery(v); setEstadoOpen(true) }}
          onFocus={() => !loadingEstados && setEstadoOpen(true)}
          loading={loadingEstados}
          suffix={
            estadoSel && estadoQuery === estadoSel.nome
              ? <span style={s.siglaBadge}>{estadoSel.sigla}</span>
              : <ChevronDown size={14} style={{ color: 'var(--text-3)', transition: 'transform .2s', transform: estadoOpen ? 'rotate(180deg)' : 'none' }} />
          }
        />
        <AnimatePresence>
          {estadoOpen && filtEstados.length > 0 && (
            <Dropdown>
              {filtEstados.map(e => (
                <DropdownItem key={e.id} onMouseDown={() => pickEstado(e)}>
                  <span style={{ flex: 1, fontSize: 14 }}>{e.nome}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700 }}>{e.sigla}</span>
                  {estadoSel?.id === e.id && <Check size={12} style={{ color: 'var(--lime)', marginLeft: 4 }} />}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </AnimatePresence>
      </div>

      {/* Cidade */}
      <AnimatePresence>
        {estadoSel && (
          <motion.div
            ref={cidadeRef}
            style={{ position: 'relative', overflow: 'visible' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PickerField
              icon={cidadeOk
                ? <Check size={15} style={{ color: 'var(--ok)' }} />
                : <MapPin size={15} />}
              placeholder={loadingCidades ? 'Carregando cidades…' : 'Cidade'}
              value={cidadeQuery}
              onChange={v => { setCidadeQuery(v); setCidadeOk(false); setCidadeOpen(true); onCidadeChange('') }}
              onFocus={() => !loadingCidades && setCidadeOpen(true)}
              loading={loadingCidades}
              done={cidadeOk}
              suffix={loadingCidades
                ? <Loader2 size={13} style={{ color: 'var(--text-3)', animation: 'spin 1s linear infinite' }} />
                : <ChevronDown size={14} style={{ color: 'var(--text-3)', transition: 'transform .2s', transform: cidadeOpen ? 'rotate(180deg)' : 'none' }} />}
            />
            <AnimatePresence>
              {cidadeOpen && filtCidades.length > 0 && (
                <Dropdown>
                  {filtCidades.map(c => (
                    <DropdownItem key={c.id} onMouseDown={() => pickCidade(c)}>
                      <span style={{ fontSize: 14 }}>{c.nome}</span>
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Dropdown({ children }) {
  return (
    <motion.ul
      style={s.dropdown}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.ul>
  )
}

function DropdownItem({ children, onMouseDown }) {
  return (
    <li>
      <button
        className="dd-item"
        style={s.ddItem}
        onMouseDown={onMouseDown}
      >
        {children}
      </button>
    </li>
  )
}

function PickerField({ icon, placeholder, value, onChange, onFocus, loading, done, suffix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      ...s.field,
      borderColor: done ? 'rgba(0,224,150,0.35)' : focused ? 'var(--line-strong)' : 'var(--line)',
    }}>
      <span style={{ color: done ? 'var(--ok)' : 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <input
        style={s.fieldInput}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => setFocused(false)}
        disabled={loading}
        autoComplete="off"
      />
      {suffix && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{suffix}</span>}
    </div>
  )
}

function Field({ icon, placeholder, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      ...s.field,
      borderColor: focused ? 'var(--line-strong)' : 'var(--line)',
    }}>
      <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.fieldInput}
      />
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px 40px',
  },
  back: {
    position: 'fixed', top: 20, left: 20, zIndex: 10,
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: 'var(--text-2)',
    padding: '8px 14px',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-full)',
    background: 'var(--bg-1)',
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg-1)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-2xl)',
    padding: '40px 32px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  logo: {
    fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)',
  },
  title: {
    fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff',
    marginTop: 6,
  },
  sub: { fontSize: 14, color: 'var(--text-2)', marginBottom: 4 },
  fields: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },

  field: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 14px',
    background: 'var(--bg-2)',
    border: '1px solid',
    borderRadius: 'var(--r-lg)',
    transition: 'border-color .18s',
  },
  fieldInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    fontSize: 14, color: '#fff', minWidth: 0,
  },

  siglaBadge: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
    padding: '2px 7px',
    background: 'rgba(204,255,0,0.12)',
    color: 'var(--lime)',
    borderRadius: 'var(--r-full)',
  },

  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
    background: '#1C1C1C',
    border: '1px solid var(--line-mid)',
    borderRadius: 'var(--r-lg)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
    maxHeight: 220, overflowY: 'auto',
    padding: 4,
  },
  ddItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderRadius: 10,
    background: 'transparent', border: 'none', cursor: 'pointer',
    textAlign: 'left', color: '#fff',
    transition: 'background .12s',
  },

  error: {
    fontSize: 13, color: '#FCA5A5',
    padding: '10px 14px',
    background: 'rgba(255,69,69,0.08)',
    border: '1px solid rgba(255,69,69,0.2)',
    borderRadius: 'var(--r-md)',
    marginTop: 2,
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px',
    background: '#fff', color: '#000',
    fontWeight: 700, fontSize: 14,
    borderRadius: 'var(--r-full)',
    cursor: 'pointer', marginTop: 6,
    border: 'none',
  },
  hint: {
    fontSize: 11, color: 'var(--text-3)', textAlign: 'center',
    marginTop: 2, lineHeight: 1.5,
  },
}
