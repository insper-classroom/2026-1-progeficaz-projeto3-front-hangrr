import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, PartyPopper, Copy, Loader2 } from 'lucide-react'
import { criarParty } from '../services/api'

export default function CreatePartyPage() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('hangr_user') || '{}')

  const [titulo, setTitulo] = useState('')
  const [cidade, setCidade] = useState(usuario.cidade || '')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [linkGerado, setLinkGerado] = useState('')
  const [copiado, setCopiado] = useState(false)

  async function handleCriar() {
    if (!titulo.trim() || !cidade.trim()) {
      setErro('Preencha o nome e a cidade.')
      return
    }
    setErro('')

    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase()

    try {
      setCarregando(true)
      await criarParty({
        titulo,
        criada_por: usuario._id || usuario.id,
        cidade,
        codigo_convite: codigo,
      })
      setLinkGerado(`hangr.app/party/${codigo}`)
    } catch (err) {
      setErro(err.message || 'Erro ao criar party.')
    } finally {
      setCarregando(false)
    }
  }

  function handleCopiar() {
    navigator.clipboard.writeText(linkGerado).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <span style={s.headerTitle}>Nova party</span>
        <div style={{ width: 36 }} />
      </header>

      <div style={s.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 style={s.title}>Cria o rolê</h1>
          <p style={s.sub}>Dê um nome e escolha a cidade. O Hangr cuida do resto.</p>

          <div style={s.fields}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Nome da party</label>
              <input
                style={s.input}
                placeholder='Ex: "Sextou com a galera"'
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Cidade</label>
              <div style={s.fieldRow}>
                <MapPin size={16} style={s.fieldIcon} />
                <input
                  style={{ ...s.input, paddingLeft: '36px' }}
                  placeholder="São Paulo"
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                />
              </div>
            </div>
          </div>

          {erro && (
            <p style={s.error}>{erro}</p>
          )}

          {/* Link gerado */}
          {linkGerado ? (
            <motion.div
              style={s.linkBox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <PartyPopper size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={s.linkLabel}>Party criada! Compartilhe o link:</p>
                <p style={s.linkText}>{linkGerado}</p>
              </div>
              <button style={s.copyBtn} onClick={handleCopiar}>
                <Copy size={14} />
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </motion.div>
          ) : (
            <motion.button
              style={{ ...s.btnPrimary, opacity: carregando ? 0.7 : 1 }}
              onClick={handleCriar}
              disabled={carregando}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              {carregando
                ? <><Loader2 size={16} style={s.spin} /> Criando...</>
                : <><PartyPopper size={16} /> Gerar link de convite</>
              }
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(15,15,18,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 10,
  },
  backBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
  },
  content: {
    padding: '32px 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#fff',
    marginBottom: '8px',
  },
  sub: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginBottom: '28px',
    lineHeight: 1.6,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.02em',
  },
  fieldRow: {
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-subtle)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    fontSize: '13px',
    color: '#FCA5A5',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(239,68,68,0.2)',
    marginBottom: '16px',
  },
  btnPrimary: {
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
  },
  spin: {
    animation: 'spin 1s linear infinite',
  },
  linkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(250,204,21,0.08)',
    border: '1px solid rgba(250,204,21,0.2)',
    borderRadius: 'var(--radius-xl)',
  },
  linkLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '2px',
  },
  linkText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
}
