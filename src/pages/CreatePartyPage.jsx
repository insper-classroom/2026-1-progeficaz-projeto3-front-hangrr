import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, PartyPopper, Loader2 } from 'lucide-react'
import { criarParty, adicionarMembro } from '../services/api'

export default function CreatePartyPage() {
  const navigate = useNavigate()
  const usuario  = JSON.parse(localStorage.getItem('hangr_user') || '{}')

  const [titulo, setTitulo]         = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState('')
  const enviando = useRef(false)

  const cidade = usuario.cidade || ''

  async function handleCriar() {
    if (enviando.current) return
    if (!titulo.trim()) { setErro('Dê um nome para a party.'); return }
    if (!cidade) { setErro('Atualize sua cidade no perfil antes de criar uma party.'); return }

    setErro('')
    enviando.current = true
    setCarregando(true)
    try {
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase()
      const party  = await criarParty({
        titulo: titulo.trim(),
        criada_por: usuario._id,
        cidade,
        codigo_convite: codigo,
      })
      await adicionarMembro({ party_id: party._id, usuario_id: usuario._id, papel: 'host' })
      navigate(`/party/${party._id}`)
    } catch (err) {
      setErro(err.message || 'Erro ao criar party.')
    } finally {
      setCarregando(false)
      enviando.current = false
    }
  }

  return (
    <div style={s.root}>

      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={17} />
        </button>
        <span style={s.headerTitle}>Nova party</span>
        <div style={{ width: 36 }} />
      </header>

      <div style={s.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <p style={s.eye}>Vamos lá</p>
          <h1 style={s.title}>Cria o rolê</h1>
          <p style={s.sub}>
            Dê um nome, chame o pessoal e o Hangr decide onde ir.
          </p>

          <div style={s.fieldGroup}>
            <label style={s.label}>Nome da party</label>
            <input
              style={s.input}
              placeholder='"Sextou com a galera"'
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCriar()}
              autoFocus
            />
          </div>

          {cidade ? (
            <div style={s.cidadeChip}>
              <span style={s.cidadeDot} />
              {cidade}
            </div>
          ) : (
            <p style={s.cidadeAviso}>
              Cidade não encontrada.{' '}
              <button style={s.cidadeLink} onClick={() => navigate('/profile')}>
                Atualizar no perfil
              </button>
            </p>
          )}

          {erro && <p style={s.error}>{erro}</p>}

          <motion.button
            style={{ ...s.btn, opacity: carregando || !titulo.trim() ? 0.5 : 1 }}
            onClick={handleCriar}
            disabled={carregando || !titulo.trim()}
            whileTap={{ scale: 0.97 }}
          >
            {carregando
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</>
              : <><PartyPopper size={16} /> Criar party</>}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

const s = {
  root:    { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--line)' },
  backBtn: { width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  headerTitle: { fontSize: 15, fontWeight: 700 },

  content: { flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '32px 24px 60px' },

  eye:   { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' },
  title: { fontSize: 'clamp(32px, 7vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 },
  sub:   { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  label: { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' },
  input: {
    width: '100%', padding: '14px 16px',
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)', color: '#fff',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  },

  cidadeChip: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-2)', padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', width: 'fit-content' },
  cidadeDot:  { width: 7, height: 7, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 },
  cidadeAviso: { fontSize: 13, color: 'var(--text-3)' },
  cidadeLink:  { background: 'none', border: 'none', color: 'var(--lime)', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 },

  error: { fontSize: 13, color: '#FCA5A5', padding: '10px 14px', background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)', borderRadius: 'var(--r-md)' },

  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 15, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', marginTop: 16 },
}
