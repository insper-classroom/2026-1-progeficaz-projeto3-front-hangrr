import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MapPin, UserPlus, X, Check, Loader2, Search, UserCheck } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { getFeed, listarSeguindo, seguirUsuario, deixarDeSeguir, buscarUsuarios, getCategorias } from '../services/api'

function formatData(str) {
  if (!str) return ''
  const d = new Date(str)
  const hoje = new Date()
  const diff = Math.floor((hoje - d) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  if (diff < 7)  return d.toLocaleDateString('pt-BR', { weekday: 'short' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function FeedPage() {
  const navigate = useNavigate()
  const usuario  = JSON.parse(localStorage.getItem('hangr_user') || '{}')

  const [feed, setFeed]             = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [seguindo, setSeguindo]     = useState([])
  const [showAmigos, setShowAmigos] = useState(false)
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [searching, setSearching]   = useState(false)
  const [pendente, setPendente]     = useState({}) // { id: 'seguindo'|'removendo' }
  const [catsMap, setCatsMap]       = useState({})

  const debounceRef = useRef(null)

  useEffect(() => {
    if (!usuario._id) { navigate('/auth'); return }
    carregarTudo()
    getCategorias().then(cats => setCatsMap(Object.fromEntries(cats.map(c => [c.slug, c])))).catch(() => {})
  }, [])

  async function carregarTudo() {
    setLoadingFeed(true)
    try {
      const [feedData, seguindoData] = await Promise.all([
        getFeed(usuario._id),
        listarSeguindo(usuario._id),
      ])
      setFeed(feedData || [])
      setSeguindo(seguindoData || [])
    } catch {
      setFeed([])
    } finally {
      setLoadingFeed(false)
    }
  }

  async function recarregarFeed() {
    try {
      const feedData = await getFeed(usuario._id)
      setFeed(feedData || [])
    } catch {}
  }

  function handleQueryChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (q.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await buscarUsuarios(q.trim(), usuario._id)
        setResults(r || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  async function handleSeguir(uid) {
    setPendente(p => ({ ...p, [uid]: 'seguindo' }))
    try {
      await seguirUsuario(usuario._id, uid)
      const novoSeguindo = await listarSeguindo(usuario._id)
      setSeguindo(novoSeguindo || [])
      setResults(prev => prev.map(u => u._id === uid ? { ...u, seguindo: true } : u))
      recarregarFeed()
    } catch {}
    setPendente(p => { const n = { ...p }; delete n[uid]; return n })
  }

  async function handleDeixarSeguir(uid) {
    setPendente(p => ({ ...p, [uid]: 'removendo' }))
    try {
      await deixarDeSeguir(usuario._id, uid)
      setSeguindo(prev => prev.filter(u => u._id !== uid))
      setResults(prev => prev.map(u => u._id === uid ? { ...u, seguindo: false } : u))
      recarregarFeed()
    } catch {}
    setPendente(p => { const n = { ...p }; delete n[uid]; return n })
  }

  const seguindoSet = new Set(seguindo.map(u => u._id))

  return (
    <div style={s.root}>

      <nav style={s.nav}>
        <span style={s.logo}>hangr</span>
        <button
          style={{ ...s.addBtn, background: showAmigos ? 'var(--lime)' : 'var(--bg-1)', color: showAmigos ? '#000' : 'var(--text-2)' }}
          onClick={() => setShowAmigos(v => !v)}
        >
          {showAmigos ? <X size={15} /> : <UserPlus size={15} />}
          {showAmigos ? 'Fechar' : 'Amigos'}
        </button>
      </nav>

      <div style={s.content}>

        {/* ── Painel de amigos ── */}
        <AnimatePresence>
          {showAmigos && (
            <motion.div
              key="amigos"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={s.painelAmigos}>

                {/* Busca */}
                <div style={s.searchRow}>
                  <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  <input
                    style={s.searchInput}
                    placeholder="Buscar por nome ou email…"
                    value={query}
                    onChange={handleQueryChange}
                    autoFocus
                  />
                  {searching && <Loader2 size={14} style={{ color: 'var(--text-3)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
                </div>

                {/* Resultados da busca */}
                {results.length > 0 && (
                  <div style={s.resultSection}>
                    <p style={s.sectionLabel}>Resultados</p>
                    {results.map(u => (
                      <UserRow
                        key={u._id}
                        user={u}
                        seguindo={u.seguindo || seguindoSet.has(u._id)}
                        loading={!!pendente[u._id]}
                        onSeguir={() => handleSeguir(u._id)}
                        onDeixar={() => handleDeixarSeguir(u._id)}
                      />
                    ))}
                  </div>
                )}

                {/* Quem você segue */}
                {seguindo.length > 0 && (
                  <div style={s.resultSection}>
                    <p style={s.sectionLabel}>Seguindo</p>
                    {seguindo.map(u => (
                      <UserRow
                        key={u._id}
                        user={u}
                        seguindo={true}
                        loading={!!pendente[u._id]}
                        onSeguir={() => handleSeguir(u._id)}
                        onDeixar={() => handleDeixarSeguir(u._id)}
                      />
                    ))}
                  </div>
                )}

                {seguindo.length === 0 && results.length === 0 && !searching && (
                  <p style={s.emptyHint}>Busque pelo nome ou email de um amigo para seguir.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Feed ── */}
        <div style={s.feedHeader}>
          <p style={s.eyebrow}>Rolês encerrados</p>
          <h1 style={s.title}>Feed</h1>
        </div>

        {loadingFeed ? (
          <div style={s.center}>
            <Loader2 size={22} style={{ color: 'var(--lime)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : feed.length === 0 ? (
          <EmptyFeed temAmigos={seguindo.length > 0} onAddAmigos={() => setShowAmigos(true)} />
        ) : (
          <motion.div
            style={s.feedList}
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            {feed.map(party => (
              <FeedCard key={party._id} party={party} meuId={usuario._id} catsMap={catsMap} />
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function UserRow({ user, seguindo, loading, onSeguir, onDeixar }) {
  return (
    <div style={s.userRow}>
      <div style={s.userAvatar}>
        {user.nome?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={s.userInfo}>
        <p style={s.userName}>{user.nome}</p>
        {user.cidade && <p style={s.userCidade}>{user.cidade}</p>}
      </div>
      <button
        style={{ ...s.followBtn, ...(seguindo ? s.followBtnOn : {}) }}
        onClick={seguindo ? onDeixar : onSeguir}
        disabled={loading}
      >
        {loading
          ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
          : seguindo
            ? <><UserCheck size={12} /> Seguindo</>
            : <><UserPlus size={12} /> Seguir</>}
      </button>
    </div>
  )
}

function FeedCard({ party, meuId, catsMap }) {
  const cat  = catsMap[party.match]
  const data = formatData(party.encerrada_em || party.criada_em)

  return (
    <motion.div
      style={s.card}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } } }}
    >
      <div style={s.cardTop}>
        <div style={s.cardDot} />
        <p style={s.cardTitulo}>{party.titulo}</p>
        {party.minha && <span style={s.minhaBadge}>seu</span>}
      </div>

      <div style={s.cardMeta}>
        {party.criador_nome && !party.minha && (
          <span style={s.metaItem}>por {party.criador_nome}</span>
        )}
        {party.cidade && (
          <span style={s.metaItem}><MapPin size={11} />{party.cidade}</span>
        )}
        <span style={s.metaItem}><Users size={11} />{party.membros}</span>
        <span style={s.metaItem}>{data}</span>
      </div>

      {cat && (
        <div style={s.matchBadge}>
          {cat.emoji} {cat.nome}
        </div>
      )}
    </motion.div>
  )
}

function EmptyFeed({ temAmigos, onAddAmigos }) {
  return (
    <div style={s.empty}>
      <div style={s.emptyAsterisk}>✳</div>
      {temAmigos ? (
        <>
          <p style={s.emptyTitle}>Nenhum rolê encerrado ainda.</p>
          <p style={s.emptyDesc}>Quando alguém encerrar uma party, aparece aqui.</p>
        </>
      ) : (
        <>
          <p style={s.emptyTitle}>Seu feed está vazio.</p>
          <p style={s.emptyDesc}>Siga amigos para ver os rolês deles aqui.</p>
          <button style={s.emptyBtn} onClick={onAddAmigos}>
            <UserPlus size={14} /> Adicionar amigos
          </button>
        </>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────

const s = {
  root:    { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid var(--line)',
  },
  logo:   { fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', border: '1px solid var(--line)',
    borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', transition: 'background .15s',
  },

  content: {
    flex: 1, overflowY: 'auto',
    padding: '0 0 max(100px, calc(env(safe-area-inset-bottom) + 80px))',
    maxWidth: 520, width: '100%', margin: '0 auto',
    display: 'flex', flexDirection: 'column',
  },

  // Painel amigos
  painelAmigos: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)',
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: 'var(--text-1)', fontSize: 16,
  },
  resultSection: { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
    textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4,
  },
  emptyHint: { fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '4px 0 2px' },

  userRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' },
  userAvatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color: 'var(--text-2)',
  },
  userInfo:   { flex: 1, minWidth: 0 },
  userName:   { fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userCidade: { fontSize: 11, color: 'var(--text-3)', marginTop: 1 },
  followBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', fontSize: 12, fontWeight: 700,
    border: '1px solid var(--line)', borderRadius: 'var(--r-full)',
    background: 'var(--bg-1)', color: 'var(--text-2)', cursor: 'pointer',
    flexShrink: 0, whiteSpace: 'nowrap',
  },
  followBtnOn: {
    background: 'rgba(204,255,0,0.1)', borderColor: 'rgba(204,255,0,0.3)',
    color: 'var(--lime)',
  },

  // Feed
  feedHeader: { padding: '24px 24px 12px' },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 },
  title:   { fontSize: 'clamp(32px, 7vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 },

  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },

  feedList: { display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 24px 0' },

  card: {
    padding: '16px 18px',
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-xl)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  cardTop:    { display: 'flex', alignItems: 'center', gap: 8 },
  cardDot:    { width: 7, height: 7, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 },
  cardTitulo: { flex: 1, fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  minhaBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: '#000', background: 'var(--lime)', borderRadius: 'var(--r-full)',
    padding: '2px 7px', flexShrink: 0,
  },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: '4px 12px' },
  metaItem: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, color: 'var(--text-3)',
  },
  matchBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 700,
    color: 'var(--lime)',
    background: 'rgba(204,255,0,0.08)',
    border: '1px solid rgba(204,255,0,0.18)',
    borderRadius: 'var(--r-full)',
    padding: '4px 12px', width: 'fit-content',
  },

  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '56px 24px', margin: '0 24px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)',
    background: 'var(--bg-1)', gap: 10, textAlign: 'center',
  },
  emptyAsterisk: { fontSize: 40, color: 'var(--lime)', opacity: 0.35, lineHeight: 1, marginBottom: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: 700 },
  emptyDesc:     { fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 240 },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 8, padding: '10px 22px',
    background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 13,
    borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
  },
}
