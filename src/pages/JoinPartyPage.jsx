import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getPartyByCodigo, adicionarMembro } from '../services/api'
import { pegarLocalizacao } from '../utils/geo'

export default function JoinPartyPage() {
  const { codigo } = useParams()
  const navigate   = useNavigate()
  const [erro, setErro]   = useState('')
  const [status, setStatus] = useState('localizando') // localizando | entrando

  useEffect(() => {
    entrar()
  }, [])

  async function entrar() {
    const usuario = JSON.parse(localStorage.getItem('hangr_user') || '{}')

    if (!usuario._id) {
      localStorage.setItem('hangr_join_pendente', codigo)
      navigate('/auth')
      return
    }

    setStatus('localizando')
    const geo = await pegarLocalizacao()

    setStatus('entrando')
    try {
      const party = await getPartyByCodigo(codigo)
      await adicionarMembro({
        party_id:   party._id,
        usuario_id: usuario._id,
        lat:        geo?.lat      ?? null,
        lng:        geo?.lng      ?? null,
        accuracy:   geo?.accuracy ?? null,
      })
      navigate(`/party/${party._id}`)
    } catch (err) {
      setErro(err.message || 'Convite inválido ou expirado.')
    }
  }

  if (erro) return (
    <div style={s.root}>
      <p style={s.erroTitle}>Ops.</p>
      <p style={s.erroMsg}>{erro}</p>
      <button style={s.btn} onClick={() => navigate('/home')}>Ir para o início</button>
    </div>
  )

  return (
    <div style={s.root}>
      <Loader2 size={24} style={{ color: 'var(--lime)', animation: 'spin 1s linear infinite' }} />
      <p style={s.loading}>
        {status === 'localizando' ? 'Obtendo localização…' : 'Entrando na party…'}
      </p>
    </div>
  )
}

const s = {
  root:      { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  loading:   { fontSize: 14, color: 'var(--text-2)' },
  erroTitle: { fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em' },
  erroMsg:   { fontSize: 14, color: 'var(--text-2)', textAlign: 'center', maxWidth: 280 },
  btn:       { marginTop: 8, padding: '12px 24px', background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 14, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer' },
}
