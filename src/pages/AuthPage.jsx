import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Mail, MapPin, ChevronDown, Check, Loader2 } from 'lucide-react'
import { criarUsuario } from '../services/api'

const IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

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

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      <Link to="/" style={s.back}>
        <ArrowLeft size={16} /> Voltar
      </Link>

      <motion.div
        style={s.card}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        <motion.div variants={fadeUp} style={s.logoWrap}>
          <span style={s.logo}>hangr</span>
        </motion.div>

        <motion.h1 variants={fadeUp} style={s.title}>Crie sua conta</motion.h1>
        <motion.p variants={fadeUp} style={s.sub}>Rápido, grátis e sem frescura.</motion.p>

        <motion.div variants={fadeUp} style={s.fields}>
          <Field icon={<User size={16} />} placeholder="Seu nome" value={nome} onChange={setNome} />
          <Field icon={<Mail size={16} />} placeholder="Seu email" type="email" value={email} onChange={setEmail} />
          <LocationPicker onCidadeChange={setCidade} />
        </motion.div>

        {erro && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={s.error}>
            {erro}
          </motion.p>
        )}

        <motion.button
          variants={fadeUp}
          style={{ ...s.btn, opacity: carregando ? 0.7 : 1 }}
          onClick={handleCriar}
          disabled={carregando}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          {carregando
            ? <><Loader2 size={16} style={s.spin} /> Criando conta...</>
            : <>Criar conta <ArrowRight size={16} /></>}
        </motion.button>

        <motion.p variants={fadeUp} style={s.hint}>
          Ao criar, você concorda em decidir rolês com mais estilo.
        </motion.p>
      </motion.div>
    </div>
  )
}

/* ─── LocationPicker: Estado → Cidade ───────────────────────────────── */
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
  const [cidadeSelecionada, setCidadeSelecionada] = useState(false)

  const estadoRef = useRef(null)
  const cidadeRef = useRef(null)

  // Fetch states once
  useEffect(() => {
    fetch(`${IBGE}/estados?orderBy=nome`)
      .then(r => r.json())
      .then(data => { setEstados(data); setLoadingEstados(false) })
      .catch(() => setLoadingEstados(false))
  }, [])

  // Fetch cities when state changes
  useEffect(() => {
    if (!estadoSel) return
    setLoadingCidades(true)
    setCidades([])
    fetch(`${IBGE}/estados/${estadoSel.sigla}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => { setCidades(data); setLoadingCidades(false) })
      .catch(() => setLoadingCidades(false))
  }, [estadoSel])

  // Click outside to close dropdowns
  useEffect(() => {
    function handle(e) {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false)
      if (cidadeRef.current && !cidadeRef.current.contains(e.target)) setCidadeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filteredEstados = estados
    .filter(e =>
      e.nome.toLowerCase().includes(estadoQuery.toLowerCase()) ||
      e.sigla.toLowerCase().includes(estadoQuery.toLowerCase())
    )
    .slice(0, 9)

  const filteredCidades = cidades
    .filter(c => c.nome.toLowerCase().includes(cidadeQuery.toLowerCase()))
    .slice(0, 9)

  function selectEstado(estado) {
    setEstadoSel(estado)
    setEstadoQuery(estado.nome)
    setEstadoOpen(false)
    setCidadeQuery('')
    setCidadeSelecionada(false)
    onCidadeChange('')
  }

  function selectCidade(cidade) {
    setCidadeQuery(cidade.nome)
    setCidadeOpen(false)
    setCidadeSelecionada(true)
    onCidadeChange(cidade.nome)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── Estado ── */}
      <div ref={estadoRef} style={s.pickerWrap}>
        <PickerField
          icon={<MapPin size={16} />}
          placeholder={loadingEstados ? 'Carregando estados…' : 'Estado'}
          value={estadoQuery}
          onChange={v => { setEstadoQuery(v); setEstadoOpen(true) }}
          onFocus={() => !loadingEstados && setEstadoOpen(true)}
          loading={loadingEstados}
          selected={!!estadoSel && estadoQuery === estadoSel.nome}
          suffix={
            estadoSel && estadoQuery === estadoSel.nome
              ? <span style={s.siglaBadge}>{estadoSel.sigla}</span>
              : <ChevronDown size={15} style={{ color: 'var(--text-subtle)', transition: 'transform 0.2s', transform: estadoOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          }
        />

        <AnimatePresence>
          {estadoOpen && filteredEstados.length > 0 && (
            <motion.ul
              style={s.dropdown}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              {filteredEstados.map(e => (
                <li key={e.id}>
                  <button
                    style={s.dropdownItem}
                    onMouseDown={() => selectEstado(e)}
                  >
                    <span style={s.dropdownText}>{e.nome}</span>
                    <span style={s.dropdownBadge}>{e.sigla}</span>
                    {estadoSel?.id === e.id && <Check size={13} style={{ color: 'var(--primary)', marginLeft: 4 }} />}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* ── Cidade (aparece após estado) ── */}
      <AnimatePresence>
        {estadoSel && (
          <motion.div
            ref={cidadeRef}
            style={s.pickerWrap}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PickerField
              icon={
                cidadeSelecionada
                  ? <Check size={16} style={{ color: 'var(--success)' }} />
                  : <MapPin size={16} />
              }
              placeholder={loadingCidades ? 'Carregando cidades…' : 'Cidade'}
              value={cidadeQuery}
              onChange={v => { setCidadeQuery(v); setCidadeSelecionada(false); setCidadeOpen(true); onCidadeChange('') }}
              onFocus={() => !loadingCidades && setCidadeOpen(true)}
              loading={loadingCidades}
              selected={cidadeSelecionada}
              suffix={
                loadingCidades
                  ? <Loader2 size={14} style={{ color: 'var(--text-subtle)', animation: 'spin 1s linear infinite' }} />
                  : <ChevronDown size={15} style={{ color: 'var(--text-subtle)', transition: 'transform 0.2s', transform: cidadeOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              }
            />

            <AnimatePresence>
              {cidadeOpen && filteredCidades.length > 0 && (
                <motion.ul
                  style={s.dropdown}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  {filteredCidades.map(c => (
                    <li key={c.id}>
                      <button
                        style={s.dropdownItem}
                        onMouseDown={() => selectCidade(c)}
                      >
                        <span style={s.dropdownText}>{c.nome}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── PickerField ────────────────────────────────────────────────────── */
function PickerField({ icon, placeholder, value, onChange, onFocus, loading, selected, suffix }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        ...s.fieldWrap,
        borderColor: focused
          ? selected ? 'rgba(34,197,94,0.5)' : 'rgba(139,92,246,0.6)'
          : selected ? 'rgba(34,197,94,0.3)' : 'var(--border)',
        background: focused ? '#20202A' : 'var(--bg-input)',
      }}
    >
      <span style={{ ...s.fieldIcon, color: selected ? 'var(--success)' : 'var(--text-subtle)' }}>
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
      {suffix && <span style={s.fieldSuffix}>{suffix}</span>}
    </div>
  )
}

/* ─── Plain Field (nome/email) ───────────────────────────────────────── */
function Field({ icon, placeholder, type = 'text', value, onChange }) {
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
  logoWrap: { marginBottom: '8px' },
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

  /* Shared field */
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
    minWidth: 0,
  },
  fieldSuffix: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  /* Picker */
  pickerWrap: {
    position: 'relative',
  },
  siglaBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(139,92,246,0.15)',
    color: 'var(--primary-light)',
    letterSpacing: '0.05em',
  },

  /* Dropdown */
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#1E1E28',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    zIndex: 200,
    maxHeight: '220px',
    overflowY: 'auto',
    listStyle: 'none',
    padding: '4px',
  },
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownText: {
    flex: 1,
    fontSize: '14px',
    color: '#fff',
  },
  dropdownBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-subtle)',
    letterSpacing: '0.05em',
  },

  /* Error / CTA */
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
