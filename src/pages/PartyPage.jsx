import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Copy, Check, Loader2, Users, X, Pencil,
  MapPin, QrCode, MessageSquare, Timer, Send,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import {
  getParty, votarParty, calcularMatch,
  atualizarNicknameMembro, kickarMembro, encerrarParty,
  getChatMensagens, enviarMensagemChat,
} from '../services/api'

const CATS = [
  { slug: 'restaurantes', nome: 'Restaurantes', emoji: '🍽️', cor: '#CCFF00', corTexto: '#000' },
  { slug: 'bares',        nome: 'Bares',        emoji: '🍺', cor: '#FF3D8A', corTexto: '#fff' },
  { slug: 'cafes',        nome: 'Cafés',        emoji: '☕', cor: '#F5C842', corTexto: '#000' },
  { slug: 'jogos',        nome: 'Jogos',        emoji: '🎮', cor: '#3D8AFF', corTexto: '#fff' },
  { slug: 'parque',       nome: 'Parque',       emoji: '🌳', cor: '#00E096', corTexto: '#000' },
  { slug: 'esportes',     nome: 'Esportes',     emoji: '⚽', cor: '#FF5C3A', corTexto: '#fff' },
]
const CATS_MAP = Object.fromEntries(CATS.map(c => [c.slug, c]))

const RAIOS = [
  { label: '500m', value: 500 },
  { label: '1km',  value: 1000 },
  { label: '2km',  value: 2000 },
  { label: '5km',  value: 5000 },
  { label: '10km', value: 10000 },
]

const AVATAR_PALETTE = [
  { bg: '#CCFF00', text: '#000' },
  { bg: '#FF3D8A', text: '#fff' },
  { bg: '#3D8AFF', text: '#fff' },
  { bg: '#00E096', text: '#000' },
  { bg: '#FF5C3A', text: '#fff' },
  { bg: '#F5C842', text: '#000' },
  { bg: '#B084FF', text: '#fff' },
  { bg: '#00CED1', text: '#000' },
]

const REACAO_EMOJIS = ['🔥', '😍', '😭', '🤙', '👏']
const TIMER_OPTS    = [1, 2, 5, 10]

export default function PartyPage() {
  const { codigo } = useParams()
  const navigate   = useNavigate()
  const usuario    = JSON.parse(localStorage.getItem('hangr_user') || '{}')

  // ── Core state ─────────────────────────────────────────────────────────
  const [view, setView]         = useState('loading')
  const [party, setParty]       = useState(null)
  const [membros, setMembros]   = useState([])
  const [match, setMatch]       = useState(null)
  const [selCats, setSelCats]   = useState(new Set())
  const [copiado, setCopiado]   = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro]         = useState('')

  // ── Sidebar / nick / kick ───────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [editingNick, setEditingNick]     = useState(false)
  const [nickValue, setNickValue]         = useState('')
  const [savingNick, setSavingNick]       = useState(false)
  const [kickingId, setKickingId]         = useState(null)
  const [raio, setRaio]                   = useState(2000)
  const [confirmEncerrar, setConfirmEncerrar] = useState(false)
  const [encerrando, setEncerrando]           = useState(false)

  // ── New features ────────────────────────────────────────────────────────
  const [showQR, setShowQR]               = useState(false)
  const [timerSecs, setTimerSecs]         = useState(0)
  const [timerAtivo, setTimerAtivo]       = useState(false)
  const [timerExpired, setTimerExpired]   = useState(false)
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [chatOpen, setChatOpen]           = useState(false)
  const [chatMensagens, setChatMensagens] = useState([])
  const [chatTexto, setChatTexto]         = useState('')
  const [enviandoMsg, setEnviandoMsg]     = useState(false)
  const [reacoes, setReacoes]             = useState({})
  const [floaters, setFloaters]           = useState([])

  // ── Refs ────────────────────────────────────────────────────────────────
  const enviandoRef   = useRef(false)
  const nickInputRef  = useRef(null)
  const timerRef      = useRef(null)
  const chatPollRef   = useRef(null)
  const chatBottomRef = useRef(null)
  const chatInputRef  = useRef(null)
  const encerrarRef   = useRef(null)

  // ── Derived ─────────────────────────────────────────────────────────────
  const meuMembro = membros.find(m => m.usuario_id === usuario._id)
  const souHost   = meuMembro?.papel === 'host'
  const votouIds  = useMemo(() => new Set((party?.votes || []).map(v => v.usuario_id)), [party])

  // ── Keep encerrarRef fresh every render ─────────────────────────────────
  encerrarRef.current = encerrar

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(chatPollRef.current)
    }
  }, [])

  // ── Load party ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!usuario._id) { navigate('/auth'); return }
    carregar()
  }, [codigo])

  // ── Nick input focus ────────────────────────────────────────────────────
  useEffect(() => {
    if (editingNick && nickInputRef.current) nickInputRef.current.focus()
  }, [editingNick])

  // ── Revealing → result with confetti ────────────────────────────────────
  useEffect(() => {
    if (view !== 'revealing') return
    const t = setTimeout(() => {
      setView('result')
      confetti({
        particleCount: 160,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#CCFF00', '#ffffff', '#FF3D8A', '#3D8AFF'],
      })
    }, 2600)
    return () => clearTimeout(t)
  }, [view])

  // ── Timer expired → auto-encerrar ───────────────────────────────────────
  useEffect(() => {
    if (!timerExpired || !souHost) return
    setTimerExpired(false)
    encerrarRef.current()
  }, [timerExpired, souHost])

  // ── Chat polling ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatOpen) {
      clearInterval(chatPollRef.current)
      return
    }
    const poll = async () => {
      try {
        const msgs = await getChatMensagens(codigo)
        setChatMensagens(msgs || [])
      } catch {}
    }
    poll()
    chatPollRef.current = setInterval(poll, 5000)
    return () => clearInterval(chatPollRef.current)
  }, [chatOpen, codigo])

  // ── Chat scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMensagens, chatOpen])

  // ── Functions ────────────────────────────────────────────────────────────

  function salvarNoHistorico(partyData, membrosData, matchData = null) {
    if (!partyData?._id) return
    const entry = {
      _id:       partyData._id,
      titulo:    partyData.titulo,
      cidade:    partyData.cidade,
      criada_em: partyData.criada_em,
      membros:   Array.isArray(membrosData) ? membrosData.length : 0,
      match:     matchData?.match || null,
    }
    const saved = JSON.parse(localStorage.getItem('hangr_historico') || '[]')
    const idx = saved.findIndex(p => p._id === entry._id)
    if (idx >= 0) saved[idx] = entry
    else saved.unshift(entry)
    localStorage.setItem('hangr_historico', JSON.stringify(saved.slice(0, 20)))
  }

  async function carregar() {
    try {
      const partyData = await getParty(codigo)
      setParty(partyData)
      setMembros(partyData.membros || [])
      const saved = JSON.parse(localStorage.getItem(`hangr_r_${partyData._id}`) || '{}')
      setReacoes(saved)

      const jaVotou = (partyData.votes || []).some(v => v.usuario_id === usuario._id)
      if (jaVotou) {
        const m = await calcularMatch(codigo)
        setMatch(m)
        salvarNoHistorico(partyData, partyData.membros || [], m)
        setView('result') // skip reveal on page reload
      } else {
        setView('voting')
      }
    } catch {
      setView('voting')
    }
  }

  async function votar() {
    if (enviandoRef.current || selCats.size === 0) return
    enviandoRef.current = true
    setEnviando(true)
    setErro('')
    try {
      await votarParty({
        codigo,
        usuario_id: usuario._id,
        categorias: [...selCats].map(slug => ({ slug, tipo: 'like', forca: 1 })),
      })
      const m = await calcularMatch(codigo)
      setMatch(m)
      setParty(prev => ({
        ...prev,
        votes: [...(prev?.votes || []), { usuario_id: usuario._id, categorias: [...selCats].map(s => ({ slug: s })) }],
      }))
      salvarNoHistorico(party, membros, m)
      setView('revealing') // dramatic reveal!
    } catch (err) {
      setErro(err.message || 'Erro ao votar.')
      setEnviando(false)
      enviandoRef.current = false
    }
  }

  function copiarLink() {
    const link = `${window.location.origin}/party/join/${party?.codigo_convite}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  function toggleCat(slug) {
    setSelCats(prev => {
      const n = new Set(prev)
      n.has(slug) ? n.delete(slug) : n.add(slug)
      return n
    })
  }

  async function kickar(membro) {
    if (kickingId || !souHost) return
    setKickingId(membro.usuario_id)
    try {
      await kickarMembro(codigo, membro.usuario_id, usuario._id)
      setMembros(prev => prev.filter(m => m.usuario_id !== membro.usuario_id))
    } catch {}
    finally { setKickingId(null) }
  }

  function getDisplayName(membro) {
    return membro.nickname || membro.nome?.split(' ')[0] || 'User'
  }

  async function salvarNickname() {
    if (!meuMembro || savingNick) return
    const trimmed = nickValue.trim()
    setSavingNick(true)
    try {
      const updated = await atualizarNicknameMembro(codigo, meuMembro.usuario_id, trimmed)
      setMembros(prev => prev.map(m =>
        m.usuario_id === updated.usuario_id ? { ...m, nickname: updated.nickname } : m
      ))
      setEditingNick(false)
    } catch {}
    finally { setSavingNick(false) }
  }

  async function encerrar() {
    if (!party?._id) return
    setEncerrando(true)
    try {
      let matchFinal = match
      try { matchFinal = await calcularMatch(codigo) } catch {}
      await encerrarParty(codigo, usuario._id)
      salvarNoHistorico(party, membros, matchFinal)
      navigate('/home')
    } catch {
      setEncerrando(false)
      setConfirmEncerrar(false)
    }
  }

  function iniciarTimer(minutos) {
    clearInterval(timerRef.current)
    let remaining = minutos * 60
    setTimerSecs(remaining)
    setTimerAtivo(true)
    setShowTimerPicker(false)
    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimerSecs(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setTimerAtivo(false)
        setTimerExpired(true)
      }
    }, 1000)
  }

  function pararTimer() {
    clearInterval(timerRef.current)
    setTimerAtivo(false)
    setTimerSecs(0)
  }

  function reagir(emoji) {
    setReacoes(prev => {
      const updated = { ...prev, [emoji]: (prev[emoji] || 0) + 1 }
      if (party?._id) localStorage.setItem(`hangr_r_${party._id}`, JSON.stringify(updated))
      return updated
    })
    const id   = Date.now() + Math.random()
    const left = 15 + Math.random() * 70
    setFloaters(prev => [...prev, { id, emoji, left }])
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 1800)
  }

  async function enviarMsg() {
    const texto = chatTexto.trim()
    if (!texto || enviandoMsg) return
    setEnviandoMsg(true)
    setChatTexto('')
    try {
      await enviarMensagemChat(codigo, {
        usuario_id: usuario._id,
        nome: meuMembro ? getDisplayName(meuMembro) : (usuario.nome?.split(' ')[0] || 'User'),
        texto,
      })
      const msgs = await getChatMensagens(codigo)
      setChatMensagens(msgs || [])
    } catch {}
    finally { setEnviandoMsg(false) }
  }

  function fmtChatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (view === 'loading') return <Loading />

  const winner = match?.match ? CATS_MAP[match.match] : null

  return (
    <div style={s.root}>

      {/* ── Floating reactions ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
        <AnimatePresence>
          {floaters.map(f => (
            <motion.div
              key={f.id}
              style={{ position: 'absolute', bottom: 120, left: `${f.left}%`, fontSize: 36 }}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -130 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── QR Modal ── */}
      <AnimatePresence>
        {showQR && (
          <>
            <motion.div
              style={s.backdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
            />
            <motion.div
              style={s.qrModal}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <button style={s.qrClose} onClick={() => setShowQR(false)}><X size={15} /></button>
              <p style={s.qrTitle}>Convite</p>
              <div style={s.qrBox}>
                <QRCodeSVG
                  value={`${window.location.origin}/party/join/${party?.codigo_convite}`}
                  size={180}
                  bgColor="transparent"
                  fgColor="#CCFF00"
                />
              </div>
              <p style={s.qrCode}>{party?.codigo_convite}</p>
              <button style={s.qrCopyBtn} onClick={copiarLink}>
                {copiado ? <Check size={13} /> : <Copy size={13} />}
                {copiado ? 'Copiado!' : 'Copiar link'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/home')}><ArrowLeft size={17} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.headerSub}>{party?.cidade}</p>
          <p style={s.headerTitle}>{party?.titulo}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button style={s.iconChip} onClick={() => setChatOpen(true)} whileTap={{ scale: 0.93 }}>
            <MessageSquare size={13} />
          </motion.button>
          <motion.button style={s.membrosChip} onClick={() => setSidebarOpen(true)} whileTap={{ scale: 0.94 }}>
            <Users size={12} />
            {membros.length}
          </motion.button>
        </div>
      </header>

      <div style={s.content}>

        {/* ── Invite card ── */}
        <div style={s.inviteCard}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={s.inviteLabel}>Código de convite</p>
            <p style={s.inviteCode}>{party?.codigo_convite}</p>
          </div>
          <button style={s.iconBtn} onClick={() => setShowQR(true)} title="QR Code">
            <QrCode size={15} />
          </button>
          <button style={s.copyBtn} onClick={copiarLink}>
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            {copiado ? 'Copiado!' : 'Link'}
          </button>
        </div>

        {/* ── Timer (host only) ── */}
        {souHost && (
          <div style={s.timerSection}>
            {timerAtivo ? (
              <div style={s.timerRunning}>
                <Timer size={13} style={{ color: timerSecs < 30 ? '#FF4545' : 'var(--lime)' }} />
                <span style={{ ...s.timerDisplay, color: timerSecs < 30 ? '#FF4545' : 'var(--lime)' }}>
                  {String(Math.floor(timerSecs / 60)).padStart(2, '0')}:{String(timerSecs % 60).padStart(2, '0')}
                </span>
                <button style={s.timerStop} onClick={pararTimer}><X size={11} /></button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <button style={s.timerBtn} onClick={() => setShowTimerPicker(p => !p)}>
                  <Timer size={13} /> Timer
                </button>
                <AnimatePresence>
                  {showTimerPicker && (
                    <motion.div
                      style={s.timerPicker}
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.14 }}
                    >
                      {TIMER_OPTS.map(m => (
                        <button key={m} style={s.timerOpt} onClick={() => iniciarTimer(m)}>
                          {m}min
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showTimerPicker && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowTimerPicker(false)} />
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Voting ── */}
          {view === 'voting' && (
            <motion.div key="voting" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <p style={s.sectionEye}>Seu voto</p>
              <h2 style={s.sectionTitle}>Qual é o seu vibe?</h2>
              <p style={s.sectionSub}>Selecione um ou mais.</p>

              <div style={s.catGrid}>
                {CATS.map(cat => {
                  const on = selCats.has(cat.slug)
                  return (
                    <motion.button
                      key={cat.slug}
                      style={{ ...s.catCard, background: on ? cat.cor : 'var(--bg-1)', borderColor: on ? cat.cor : 'var(--line)', color: on ? cat.corTexto : '#fff' }}
                      onClick={() => toggleCat(cat.slug)}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span style={s.catEmoji}>{cat.emoji}</span>
                      <span style={s.catNome}>{cat.nome}</span>
                      {on && <Check size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    </motion.button>
                  )
                })}
              </div>

              {erro && <p style={s.error}>{erro}</p>}

              <motion.button
                style={{ ...s.submitBtn, opacity: selCats.size === 0 || enviando ? 0.4 : 1 }}
                onClick={votar}
                disabled={selCats.size === 0 || enviando}
                whileTap={{ scale: 0.97 }}
              >
                {enviando
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</>
                  : <>Ver resultado</>}
              </motion.button>
            </motion.div>
          )}

          {/* ── Revealing ── */}
          {view === 'revealing' && (
            <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={s.sectionEye}>✳ Match</p>
              <h2 style={{ ...s.sectionTitle, textAlign: 'center' }}>e o rolê é...</h2>
              <motion.div
                style={{ fontSize: 80, margin: '32px 0' }}
                animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
              >
                {match?.match ? CATS_MAP[match.match]?.emoji : '🎲'}
              </motion.div>
              <p style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>Contando os votos...</p>
            </motion.div>
          )}

          {/* ── Result ── */}
          {view === 'result' && winner && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <p style={s.sectionEye}>✳ Match</p>
              <h2 style={s.sectionTitle}>O rolê é</h2>

              <motion.div
                style={{ ...s.winnerCard, background: winner.cor }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span style={s.winnerEmoji}>{winner.emoji}</span>
                <p style={{ ...s.winnerNome, color: winner.corTexto }}>{winner.nome}</p>
                <p style={{ ...s.winnerVotos, color: winner.corTexto, opacity: 0.7 }}>
                  {match.ranking[0]?.votos} voto{match.ranking[0]?.votos !== 1 ? 's' : ''} · {match.total_votaram} de {match.total_membros} participante{match.total_membros !== 1 ? 's' : ''}
                </p>
              </motion.div>

              {/* Reactions */}
              <div style={s.reacoes}>
                {REACAO_EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji}
                    style={s.reacaoBtn}
                    onClick={() => reagir(emoji)}
                    whileTap={{ scale: 0.82 }}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    {reacoes[emoji] > 0 && <span style={s.reacaoCount}>{reacoes[emoji]}</span>}
                  </motion.button>
                ))}
              </div>

              {/* Radius picker */}
              <div style={s.raioWrap}>
                <p style={s.raioLabel}><MapPin size={11} /> Distância de mim</p>
                <div style={s.raioRow}>
                  {RAIOS.map(r => (
                    <button
                      key={r.value}
                      style={{ ...s.raioPill, ...(raio === r.value ? s.raioPillOn : {}) }}
                      onClick={() => setRaio(r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                style={s.explorarBtn}
                onClick={() => navigate(`/party/${codigo}/explorar/${match.match}?raio=${raio}`)}
                whileTap={{ scale: 0.97 }}
              >
                <MapPin size={15} /> Explorar lugares
              </motion.button>

              {match.ranking.length > 1 && (
                <div style={s.ranking}>
                  <p style={s.rankingLabel}>Todos os votos</p>
                  {match.ranking.map((item, i) => {
                    const cat = CATS_MAP[item.slug]
                    if (!cat) return null
                    const pct = Math.round((item.votos / match.ranking[0].votos) * 100)
                    return (
                      <div key={item.slug} style={s.rankRow}>
                        <span style={s.rankEmoji}>{cat.emoji}</span>
                        <span style={s.rankNome}>{cat.nome}</span>
                        <div style={s.rankBarWrap}>
                          <div style={{ ...s.rankBar, width: `${pct}%`, background: cat.cor, opacity: i === 0 ? 1 : 0.45 }} />
                        </div>
                        <span style={s.rankVotos}>{item.votos}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <button style={s.revoteBtn} onClick={() => setView('voting')}>Votar de novo</button>
            </motion.div>
          )}

          {view === 'result' && !winner && (
            <motion.div key="empty-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Nenhum voto ainda. Compartilhe o link!</p>
              <button style={s.revoteBtn} onClick={() => setView('voting')}>Votar agora</button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Encerrar party (host only) ── */}
        {souHost && (
          <div style={s.encerrarWrap}>
            {!confirmEncerrar ? (
              <button style={s.encerrarBtn} onClick={() => setConfirmEncerrar(true)}>Encerrar party</button>
            ) : (
              <div style={s.encerrarConfirm}>
                <p style={s.encerrarPergunta}>Encerrar de vez?</p>
                <div style={s.encerrarActions}>
                  <button style={{ ...s.encerrarSimBtn, opacity: encerrando ? 0.5 : 1 }} onClick={encerrar} disabled={encerrando}>
                    {encerrando ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    Sim, encerrar
                  </button>
                  <button style={s.encerrarNaoBtn} onClick={() => setConfirmEncerrar(false)} disabled={encerrando}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Participants Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div style={s.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => { setSidebarOpen(false); setEditingNick(false) }} />
            <motion.div style={s.sidebar} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
              <div style={s.sidebarHeader}>
                <span style={s.sidebarTitle}>Participantes</span>
                <button style={s.sidebarCloseBtn} onClick={() => { setSidebarOpen(false); setEditingNick(false) }}><X size={16} /></button>
              </div>

              <div style={s.sidebarList}>
                {membros.map((membro, i) => {
                  const palette   = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                  const display   = getDisplayName(membro)
                  const isMe      = membro.usuario_id === usuario._id
                  const isEditing = isMe && editingNick
                  const jaVotou   = votouIds.has(membro.usuario_id)

                  return (
                    <div key={membro.usuario_id} style={s.memberRow}>
                      <div style={{ ...s.avatar, background: palette.bg, color: palette.text }}>
                        {display[0]?.toUpperCase()}
                      </div>

                      <div style={s.memberInfo}>
                        {isEditing ? (
                          <div style={s.nickEditRow}>
                            <input ref={nickInputRef} style={s.nickInput} value={nickValue} onChange={e => setNickValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') salvarNickname(); if (e.key === 'Escape') setEditingNick(false) }} maxLength={20} placeholder="Seu nickname" />
                            <button style={s.nickSaveBtn} onClick={salvarNickname} disabled={savingNick}>
                              {savingNick ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                            </button>
                            <button style={s.nickCancelBtn} onClick={() => setEditingNick(false)}><X size={13} /></button>
                          </div>
                        ) : (
                          <div style={s.memberNameRow}>
                            <span style={{ ...s.memberName, color: isMe ? 'var(--lime)' : 'var(--text-1)' }}>{display}</span>
                            {isMe && <button style={s.editNickBtn} onClick={() => { setNickValue(meuMembro?.nickname || ''); setEditingNick(true) }}><Pencil size={11} /></button>}
                          </div>
                        )}
                        {membro.nickname && !isEditing && <span style={s.memberNomePequeno}>{membro.nome?.split(' ')[0]}</span>}
                      </div>

                      <span style={{ fontSize: 14, flexShrink: 0 }} title={jaVotou ? 'Votou' : 'Ainda não votou'}>
                        {jaVotou ? '✅' : '⏳'}
                      </span>

                      {membro.papel === 'host' && <span style={s.hostBadge}>host</span>}

                      {souHost && !isMe && (
                        <button style={{ ...s.kickBtn, opacity: kickingId === membro.usuario_id ? 0.5 : 1 }} onClick={() => kickar(membro)} disabled={!!kickingId}>
                          {kickingId === membro.usuario_id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={12} />}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Chat Sheet ── */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div style={{ ...s.backdrop, zIndex: 55 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChatOpen(false)} />
            <motion.div
              style={s.chatSheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 320 }}
            >
              <div style={s.chatHeader}>
                <span style={s.chatTitle}><MessageSquare size={14} /> Chat da party</span>
                <button style={s.sidebarCloseBtn} onClick={() => setChatOpen(false)}><X size={16} /></button>
              </div>

              <div style={s.chatMessages}>
                {chatMensagens.length === 0 && (
                  <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                    Nenhuma mensagem ainda. Manda a primeira! 👋
                  </p>
                )}
                {chatMensagens.map((msg, i) => {
                  const isMe = msg.usuario_id === usuario._id
                  return (
                    <div key={msg.id || i} style={{ ...s.msgRow, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div style={{ ...s.msgAvatar, background: isMe ? 'var(--lime)' : 'var(--bg-3)', color: isMe ? '#000' : '#fff' }}>
                        {msg.nome?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ maxWidth: '65%' }}>
                        {!isMe && <p style={s.msgNome}>{msg.nome}</p>}
                        <div style={{ ...s.msgBubble, background: isMe ? 'var(--lime)' : 'var(--bg-2)', color: isMe ? '#000' : 'var(--text-1)', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px' }}>
                          {msg.texto}
                        </div>
                        <p style={{ ...s.msgTime, textAlign: isMe ? 'right' : 'left' }}>{fmtChatTime(msg.criado_em)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatBottomRef} />
              </div>

              <div style={s.chatInput}>
                <input
                  ref={chatInputRef}
                  style={s.chatInputField}
                  value={chatTexto}
                  onChange={e => setChatTexto(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMsg() } }}
                  placeholder="Mensagem..."
                  maxLength={200}
                />
                <motion.button
                  style={{ ...s.chatSendBtn, opacity: !chatTexto.trim() || enviandoMsg ? 0.4 : 1 }}
                  onClick={enviarMsg}
                  disabled={!chatTexto.trim() || enviandoMsg}
                  whileTap={{ scale: 0.9 }}
                >
                  {enviandoMsg ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Loader2 size={24} style={{ color: 'var(--lime)', animation: 'spin 1s linear infinite' }} />
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },

  header:      { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--line)' },
  backBtn:     { width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  headerSub:   { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 1 },
  headerTitle: { fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  membrosChip: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--text-2)', padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', flexShrink: 0, cursor: 'pointer', background: 'var(--bg-1)' },
  iconChip:    { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)', flexShrink: 0 },

  content: { flex: 1, maxWidth: 520, width: '100%', margin: '0 auto', padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 20 },

  inviteCard:  { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)' },
  inviteLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 3 },
  inviteCode:  { fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--lime)' },
  iconBtn:     { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', flexShrink: 0 },
  copyBtn:     { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },

  /* Timer */
  timerSection: { display: 'flex', alignItems: 'center' },
  timerBtn:     { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-3)', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  timerPicker:  { position: 'absolute', top: 'calc(100% + 6px)', left: 0, display: 'flex', gap: 6, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: '8px 10px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  timerOpt:     { padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer' },
  timerRunning: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)' },
  timerDisplay: { fontSize: 16, fontWeight: 900, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' },
  timerStop:    { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 },

  /* QR Modal */
  qrModal: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)',
    padding: '28px 28px 24px', zIndex: 60,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    minWidth: 260,
  },
  qrClose:   { position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer' },
  qrTitle:   { fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 4 },
  qrBox:     { padding: 16, background: 'var(--bg-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--line)' },
  qrCode:    { fontSize: 22, fontWeight: 900, letterSpacing: '0.16em', color: 'var(--lime)' },
  qrCopyBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  sectionEye:   { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 },
  sectionTitle: { fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 6 },
  sectionSub:   { fontSize: 13, color: 'var(--text-2)', marginBottom: 18 },

  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 },
  catCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px', border: '1px solid', borderRadius: 'var(--r-xl)', cursor: 'pointer', textAlign: 'left', transition: 'background .18s, border-color .18s, color .18s' },
  catEmoji: { fontSize: 20, flexShrink: 0 },
  catNome:  { fontSize: 13, fontWeight: 700, flex: 1 },
  error:    { fontSize: 13, color: '#FCA5A5', padding: '10px 14px', background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)', borderRadius: 'var(--r-md)', marginBottom: 12 },
  submitBtn: { width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 15, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer' },

  winnerCard:  { padding: '36px 24px', borderRadius: 'var(--r-2xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16 },
  winnerEmoji: { fontSize: 56, lineHeight: 1, marginBottom: 4 },
  winnerNome:  { fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' },
  winnerVotos: { fontSize: 13, fontWeight: 600 },

  /* Reactions */
  reacoes:     { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 },
  reacaoBtn:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 10px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', cursor: 'pointer', minWidth: 48 },
  reacaoCount: { fontSize: 11, fontWeight: 800, color: 'var(--lime)' },

  ranking:      { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  rankingLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 },
  rankRow:      { display: 'flex', alignItems: 'center', gap: 8 },
  rankEmoji:    { fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' },
  rankNome:     { fontSize: 13, fontWeight: 600, width: 100, flexShrink: 0 },
  rankBarWrap:  { flex: 1, height: 6, background: 'var(--bg-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' },
  rankBar:      { height: '100%', borderRadius: 'var(--r-full)', transition: 'width .4s ease' },
  rankVotos:    { fontSize: 12, fontWeight: 700, color: 'var(--text-3)', width: 20, textAlign: 'right', flexShrink: 0 },

  raioWrap:    { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', marginBottom: 10 },
  raioLabel:   { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' },
  raioRow:     { display: 'flex', gap: 6 },
  raioPill:    { padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', background: 'var(--bg-2)', color: 'var(--text-2)', cursor: 'pointer' },
  raioPillOn:  { background: 'var(--lime)', borderColor: 'var(--lime)', color: '#000' },
  explorarBtn: { width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--bg-1)', border: '1px solid var(--line)', color: 'var(--text-1)', fontWeight: 700, fontSize: 15, borderRadius: 'var(--r-full)', cursor: 'pointer', marginBottom: 16 },
  revoteBtn:   { fontSize: 13, fontWeight: 700, color: 'var(--text-3)', background: 'none', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '8px 18px', cursor: 'pointer' },

  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 },

  /* Encerrar */
  encerrarWrap:     { borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 4 },
  encerrarBtn:      { background: 'none', border: '1px solid rgba(255,69,69,0.25)', borderRadius: 'var(--r-full)', color: 'rgba(255,100,100,0.7)', fontSize: 13, fontWeight: 700, padding: '9px 20px', cursor: 'pointer', width: '100%' },
  encerrarConfirm:  { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: 'rgba(255,69,69,0.06)', border: '1px solid rgba(255,69,69,0.2)', borderRadius: 'var(--r-xl)' },
  encerrarPergunta: { fontSize: 13, fontWeight: 700, color: 'rgba(255,120,120,0.9)' },
  encerrarActions:  { display: 'flex', gap: 8 },
  encerrarSimBtn:   { display: 'flex', alignItems: 'center', gap: 6, flex: 1, padding: '10px', justifyContent: 'center', background: 'rgba(255,69,69,0.15)', border: '1px solid rgba(255,69,69,0.35)', borderRadius: 'var(--r-full)', color: '#ff6464', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  encerrarNaoBtn:   { padding: '10px 18px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  /* Sidebar */
  sidebar: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 260, background: 'var(--bg-1)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', zIndex: 50 },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 14px', borderBottom: '1px solid var(--line)' },
  sidebarTitle:  { fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' },
  sidebarCloseBtn: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer' },
  sidebarList: { flex: 1, overflowY: 'auto', padding: '10px 0' },

  memberRow:        { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' },
  avatar:           { width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 },
  memberInfo:       { flex: 1, minWidth: 0 },
  memberNameRow:    { display: 'flex', alignItems: 'center', gap: 4 },
  memberName:       { fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  memberNomePequeno: { fontSize: 11, color: 'var(--text-3)', marginTop: 1, display: 'block' },
  editNickBtn:      { background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  hostBadge:        { fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#000', background: 'var(--lime)', borderRadius: 'var(--r-full)', padding: '2px 7px', flexShrink: 0 },
  nickEditRow:      { display: 'flex', alignItems: 'center', gap: 4 },
  nickInput:        { flex: 1, minWidth: 0, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'var(--text-1)', fontSize: 12, fontWeight: 600, padding: '5px 8px', outline: 'none' },
  nickSaveBtn:      { width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lime)', border: 'none', borderRadius: 'var(--r-md)', color: '#000', cursor: 'pointer' },
  nickCancelBtn:    { width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer' },
  kickBtn:          { width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,61,138,0.12)', border: '1px solid rgba(255,61,138,0.25)', borderRadius: 'var(--r-full)', color: '#FF3D8A', cursor: 'pointer' },

  /* Chat */
  chatSheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: '70vh', background: 'var(--bg-1)',
    borderTop: '1px solid var(--line)', borderRadius: '20px 20px 0 0',
    display: 'flex', flexDirection: 'column', zIndex: 60,
  },
  chatHeader:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px', borderBottom: '1px solid var(--line)' },
  chatTitle:      { display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800 },
  chatMessages:   { flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 },
  msgRow:         { display: 'flex', gap: 8, alignItems: 'flex-end' },
  msgAvatar:      { width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 },
  msgNome:        { fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 3, marginLeft: 4 },
  msgBubble:      { padding: '9px 13px', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' },
  msgTime:        { fontSize: 10, color: 'var(--text-3)', marginTop: 3, paddingLeft: 4, paddingRight: 4 },
  chatInput:      { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--line)' },
  chatInputField: { flex: 1, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-1)', fontSize: 14, padding: '10px 16px', outline: 'none' },
  chatSendBtn:    { width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lime)', border: 'none', borderRadius: 'var(--r-full)', color: '#000', cursor: 'pointer' },
}
