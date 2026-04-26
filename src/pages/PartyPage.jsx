import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Check, Loader2, Users, X, Pencil } from 'lucide-react'
import { getParty, listarMembros, verificouVoto, votarParty, calcularMatch, atualizarNicknameMembro, kickarMembro } from '../services/api'

const CATS = [
  { slug: 'restaurantes', nome: 'Restaurantes', emoji: '🍽️', cor: '#CCFF00', corTexto: '#000' },
  { slug: 'bares',        nome: 'Bares',        emoji: '🍺', cor: '#FF3D8A', corTexto: '#fff' },
  { slug: 'cafes',        nome: 'Cafés',        emoji: '☕', cor: '#F5C842', corTexto: '#000' },
  { slug: 'jogos',        nome: 'Jogos',        emoji: '🎮', cor: '#3D8AFF', corTexto: '#fff' },
  { slug: 'parque',       nome: 'Parque',       emoji: '🌳', cor: '#00E096', corTexto: '#000' },
  { slug: 'esportes',     nome: 'Esportes',     emoji: '⚽', cor: '#FF5C3A', corTexto: '#fff' },
]
const CATS_MAP = Object.fromEntries(CATS.map(c => [c.slug, c]))

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

export default function PartyPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const usuario   = JSON.parse(localStorage.getItem('hangr_user') || '{}')

  const [view, setView]       = useState('loading')
  const [party, setParty]     = useState(null)
  const [membros, setMembros] = useState([])
  const [match, setMatch]     = useState(null)
  const [selCats, setSelCats] = useState(new Set())
  const [copiado, setCopiado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro]       = useState('')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingNick, setEditingNick] = useState(false)
  const [nickValue, setNickValue]     = useState('')
  const [savingNick, setSavingNick]   = useState(false)
  const [kickingId, setKickingId]     = useState(null)

  const enviandoRef = useRef(false)
  const nickInputRef = useRef(null)

  const meuMembro = membros.find(m => m.usuario_id === usuario._id)
  const souHost   = meuMembro?.papel === 'host'

  useEffect(() => {
    if (!usuario._id) { navigate('/auth'); return }
    carregar()
  }, [id])

  useEffect(() => {
    if (editingNick && nickInputRef.current) nickInputRef.current.focus()
  }, [editingNick])

  async function carregar() {
    try {
      const [partyData, membrosData, votos] = await Promise.all([
        getParty(id),
        listarMembros(id),
        verificouVoto({ party_id: id, usuario_id: usuario._id }),
      ])
      setParty(partyData)
      setMembros(membrosData)
      if (votos.length > 0) {
        const m = await calcularMatch(id)
        setMatch(m)
        setView('result')
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
        party_id: id,
        usuario_id: usuario._id,
        categorias: [...selCats].map(slug => ({ slug, tipo: 'like', forca: 1 })),
      })
      const m = await calcularMatch(id)
      setMatch(m)
      setView('result')
    } catch (err) {
      setErro(err.message || 'Erro ao votar.')
    } finally {
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
    setKickingId(membro._id)
    try {
      await kickarMembro(membro._id, usuario._id)
      setMembros(prev => prev.filter(m => m._id !== membro._id))
    } catch {
      // silently fail
    } finally {
      setKickingId(null)
    }
  }

  function getDisplayName(membro) {
    if (membro.nickname) return membro.nickname
    const nome = membro.nome || ''
    return nome.split(' ')[0] || 'User'
  }

  function startEditNick() {
    setNickValue(meuMembro?.nickname || '')
    setEditingNick(true)
  }

  async function salvarNickname() {
    if (!meuMembro || savingNick) return
    const trimmed = nickValue.trim()
    setSavingNick(true)
    try {
      const updated = await atualizarNicknameMembro(meuMembro._id, trimmed)
      setMembros(prev => prev.map(m => m._id === updated._id ? { ...m, nickname: updated.nickname, nome: updated.nome } : m))
      setEditingNick(false)
    } catch {
      // keep editing open on failure
    } finally {
      setSavingNick(false)
    }
  }

  if (view === 'loading') return <Loading />

  const winner = match?.match ? CATS_MAP[match.match] : null

  return (
    <div style={s.root}>

      {/* ── Header ── */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/home')}><ArrowLeft size={17} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.headerSub}>{party?.cidade}</p>
          <p style={s.headerTitle}>{party?.titulo}</p>
        </div>
        <motion.button
          style={s.membrosChip}
          onClick={() => setSidebarOpen(true)}
          whileTap={{ scale: 0.94 }}
        >
          <Users size={12} />
          {membros.length}
        </motion.button>
      </header>

      <div style={s.content}>

        {/* ── Invite card ── */}
        <div style={s.inviteCard}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={s.inviteLabel}>Link de convite</p>
            <p style={s.inviteCode}>{party?.codigo_convite}</p>
          </div>
          <button style={s.copyBtn} onClick={copiarLink}>
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

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
                      style={{
                        ...s.catCard,
                        background:  on ? cat.cor      : 'var(--bg-1)',
                        borderColor: on ? cat.cor      : 'var(--line)',
                        color:       on ? cat.corTexto : '#fff',
                      }}
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

              <button style={s.revoteBtn} onClick={() => setView('voting')}>
                Votar de novo
              </button>
            </motion.div>
          )}

          {view === 'result' && !winner && (
            <motion.div key="empty-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Nenhum voto ainda. Compartilhe o link!</p>
              <button style={s.revoteBtn} onClick={() => setView('voting')}>Votar agora</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Participants Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              style={s.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setSidebarOpen(false); setEditingNick(false) }}
            />

            <motion.div
              style={s.sidebar}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              {/* Header */}
              <div style={s.sidebarHeader}>
                <span style={s.sidebarTitle}>Participantes</span>
                <button style={s.sidebarCloseBtn} onClick={() => { setSidebarOpen(false); setEditingNick(false) }}>
                  <X size={16} />
                </button>
              </div>

              {/* List */}
              <div style={s.sidebarList}>
                {membros.map((membro, i) => {
                  const palette   = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                  const display   = getDisplayName(membro)
                  const isMe      = membro.usuario_id === usuario._id
                  const isEditing = isMe && editingNick

                  return (
                    <div key={membro._id} style={s.memberRow}>
                      {/* Avatar */}
                      <div style={{ ...s.avatar, background: palette.bg, color: palette.text }}>
                        {display[0]?.toUpperCase()}
                      </div>

                      {/* Name / edit */}
                      <div style={s.memberInfo}>
                        {isEditing ? (
                          <div style={s.nickEditRow}>
                            <input
                              ref={nickInputRef}
                              style={s.nickInput}
                              value={nickValue}
                              onChange={e => setNickValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') salvarNickname(); if (e.key === 'Escape') setEditingNick(false) }}
                              maxLength={20}
                              placeholder="Seu nickname"
                            />
                            <button style={s.nickSaveBtn} onClick={salvarNickname} disabled={savingNick}>
                              {savingNick ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                            </button>
                            <button style={s.nickCancelBtn} onClick={() => setEditingNick(false)}>
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div style={s.memberNameRow}>
                            <span style={{ ...s.memberName, color: isMe ? 'var(--lime)' : 'var(--text-1)' }}>
                              {display}
                            </span>
                            {isMe && (
                              <button style={s.editNickBtn} onClick={startEditNick} title="Editar nickname">
                                <Pencil size={11} />
                              </button>
                            )}
                          </div>
                        )}
                        {membro.nickname && !isEditing && (
                          <span style={s.memberNomePequeno}>{membro.nome?.split(' ')[0]}</span>
                        )}
                      </div>

                      {membro.papel === 'host' && (
                        <span style={s.hostBadge}>host</span>
                      )}

                      {souHost && !isMe && (
                        <button
                          style={{ ...s.kickBtn, opacity: kickingId === membro._id ? 0.5 : 1 }}
                          onClick={() => kickar(membro)}
                          disabled={!!kickingId}
                          title="Remover da party"
                        >
                          {kickingId === membro._id
                            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : <X size={12} />}
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
  root:    { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },

  header:  { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--line)' },
  backBtn: { width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  headerSub:   { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 1 },
  headerTitle: { fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  membrosChip: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--text-2)', padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', flexShrink: 0, cursor: 'pointer', background: 'var(--bg-1)' },

  content: { flex: 1, maxWidth: 520, width: '100%', margin: '0 auto', padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 },

  inviteCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)' },
  inviteLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 3 },
  inviteCode:  { fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--lime)' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },

  sectionEye:   { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 },
  sectionTitle: { fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 6 },
  sectionSub:   { fontSize: 13, color: 'var(--text-2)', marginBottom: 18 },

  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 },
  catCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px', border: '1px solid', borderRadius: 'var(--r-xl)', cursor: 'pointer', textAlign: 'left', transition: 'background .18s, border-color .18s, color .18s' },
  catEmoji: { fontSize: 20, flexShrink: 0 },
  catNome:  { fontSize: 13, fontWeight: 700, flex: 1 },

  error: { fontSize: 13, color: '#FCA5A5', padding: '10px 14px', background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)', borderRadius: 'var(--r-md)', marginBottom: 12 },

  submitBtn: { width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 15, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer' },

  winnerCard:  { padding: '36px 24px', borderRadius: 'var(--r-2xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 },
  winnerEmoji: { fontSize: 56, lineHeight: 1, marginBottom: 4 },
  winnerNome:  { fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' },
  winnerVotos: { fontSize: 13, fontWeight: 600 },

  ranking:      { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  rankingLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 },
  rankRow:      { display: 'flex', alignItems: 'center', gap: 8 },
  rankEmoji:    { fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' },
  rankNome:     { fontSize: 13, fontWeight: 600, width: 100, flexShrink: 0 },
  rankBarWrap:  { flex: 1, height: 6, background: 'var(--bg-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' },
  rankBar:      { height: '100%', borderRadius: 'var(--r-full)', transition: 'width .4s ease' },
  rankVotos:    { fontSize: 12, fontWeight: 700, color: 'var(--text-3)', width: 20, textAlign: 'right', flexShrink: 0 },

  revoteBtn: { fontSize: 13, fontWeight: 700, color: 'var(--text-3)', background: 'none', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '8px 18px', cursor: 'pointer' },

  // Sidebar
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 },
  sidebar: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 260, background: 'var(--bg-1)',
    borderLeft: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column',
    zIndex: 50,
  },
  sidebarHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 16px 14px',
    borderBottom: '1px solid var(--line)',
  },
  sidebarTitle: { fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' },
  sidebarCloseBtn: {
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer',
  },
  sidebarList: { flex: 1, overflowY: 'auto', padding: '10px 0' },

  memberRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800,
  },
  memberInfo: { flex: 1, minWidth: 0 },
  memberNameRow: { display: 'flex', alignItems: 'center', gap: 4 },
  memberName: { fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  memberNomePequeno: { fontSize: 11, color: 'var(--text-3)', marginTop: 1, display: 'block' },
  editNickBtn: {
    background: 'none', border: 'none', color: 'var(--text-3)',
    cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  hostBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: '#000', background: 'var(--lime)', borderRadius: 'var(--r-full)',
    padding: '2px 7px', flexShrink: 0,
  },

  nickEditRow: { display: 'flex', alignItems: 'center', gap: 4 },
  nickInput: {
    flex: 1, minWidth: 0,
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-md)', color: 'var(--text-1)',
    fontSize: 12, fontWeight: 600, padding: '5px 8px', outline: 'none',
  },
  nickSaveBtn: {
    width: 26, height: 26, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--lime)', border: 'none', borderRadius: 'var(--r-md)',
    color: '#000', cursor: 'pointer',
  },
  kickBtn: {
    width: 24, height: 24, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,61,138,0.12)', border: '1px solid rgba(255,61,138,0.25)',
    borderRadius: 'var(--r-full)', color: '#FF3D8A', cursor: 'pointer',
  },
  nickCancelBtn: {
    width: 26, height: 26, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
    color: 'var(--text-2)', cursor: 'pointer',
  },
}
