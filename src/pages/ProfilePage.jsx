import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, X, LogOut, Bell, UserPlus, ChevronRight, Camera, Search, Loader2 } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import LocationPicker from '../components/LocationPicker'
import { buscarUsuarios, seguirUsuario, atualizarUsuario, salvarPreferencias, listarPartiesUsuario, getCategorias } from '../services/api'

import p1 from '../assets/profiles/black_male_face.png'
import p2 from '../assets/profiles/asian_woman_face.png'
import p3 from '../assets/profiles/black_woman_face.png'
import p4 from '../assets/profiles/bald_male_face.png'

const PROFILES = [
  { id: 'black_male',   src: p1 },
  { id: 'asian_woman',  src: p2 },
  { id: 'black_woman',  src: p3 },
  { id: 'bald_male',    src: p4 },
]


const TABS = ['Perfil', 'Amigos']

function calcMatchFromVotes(votes) {
  const c = {}
  for (const v of (votes || [])) {
    for (const cat of (v.categorias || [])) {
      if (cat.slug) c[cat.slug] = (c[cat.slug] || 0) + (cat.forca || 1)
    }
  }
  const r = Object.entries(c).sort((a, b) => b[1] - a[1])
  return r[0]?.[0] || null
}

function calcularStreak(historico) {
  if (!historico.length) return 0
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  function weekStart(d) {
    const m = new Date(d)
    const day = m.getDay() || 7
    m.setDate(m.getDate() - (day - 1))
    m.setHours(0, 0, 0, 0)
    return m.getTime()
  }
  const semanas = new Set(historico.map(p => weekStart(new Date(p.criada_em || Date.now()))))
  let streak = 0
  let w = weekStart(new Date())
  while (semanas.has(w)) { streak++; w -= msPerWeek }
  if (streak === 0) {
    w = weekStart(new Date()) - msPerWeek
    while (semanas.has(w)) { streak++; w -= msPerWeek }
  }
  return streak
}

export default function ProfilePage() {
  const navigate = useNavigate()

  /* ── State ── */
  const [tab, setTab]         = useState(0)
  const [usuario, setUsuario] = useState(null)
  const [prefs, setPrefs]     = useState(null)

  /* edit profile */
  const [editMode, setEditMode]         = useState(false)
  const [nomeEdit, setNomeEdit]         = useState('')
  const [cidadeEdit, setCidadeEdit]     = useState('')
  const [editCidade, setEditCidade]     = useState(false)

  /* edit gostos */
  const [editGostos, setEditGostos]     = useState(false)
  const [selCats, setSelCats]           = useState(new Set())

  /* photo picker */
  const [pickingPhoto, setPickingPhoto] = useState(false)

  /* add friend sheet */
  const [showAddFriend, setShowAddFriend]   = useState(false)
  const [searchAmigo, setSearchAmigo]       = useState('')
  const [searchResultados, setSearchResultados] = useState([])
  const [buscandoAmigo, setBuscandoAmigo]   = useState(false)
  const [seguidos, setSeguidos]             = useState(new Set())
  const [linkCopiado, setLinkCopiado]       = useState(false)

  /* notifications */
  const [notifs, setNotifs] = useState({ party: true, match: true, amigos: false, novidades: false })

  /* toast */
  const [toast, setToast] = useState(null)

  /* parties loaded from API for stats */
  const [partiesData, setPartiesData] = useState([])
  const [cats, setCats] = useState([])

  /* ── Load ── */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('hangr_user') || 'null')
    const p = JSON.parse(localStorage.getItem('hangr_prefs') || 'null')
    const n = JSON.parse(localStorage.getItem('hangr_notifs') || 'null')
    if (!u) { navigate('/auth'); return }
    setUsuario(u)
    setPrefs(p)
    setNomeEdit(u.nome || '')
    setCidadeEdit(u.cidade || '')
    if (p?.categorias) setSelCats(new Set(p.categorias.map(c => c.slug)))
    if (n) setNotifs(n)
    listarPartiesUsuario(u._id).then(ps => setPartiesData(ps || [])).catch(() => {})
    getCategorias().then(setCats).catch(() => {})
  }, [navigate])

  /* ── Helpers ── */
  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  async function salvarPerfil() {
    const campos = { nome: nomeEdit }
    if (editCidade && cidadeEdit) campos.cidade = cidadeEdit
    try {
      const atualizado = await atualizarUsuario(usuario._id, campos)
      localStorage.setItem('hangr_user', JSON.stringify(atualizado))
      setUsuario(atualizado)
    } catch {
      const fallback = { ...usuario, nome: nomeEdit, ...(editCidade && cidadeEdit ? { cidade: cidadeEdit } : {}) }
      localStorage.setItem('hangr_user', JSON.stringify(fallback))
      setUsuario(fallback)
    }
    setEditMode(false)
    setEditCidade(false)
    showToast('Perfil salvo!')
  }

  function cancelarEdit() {
    setNomeEdit(usuario.nome)
    setCidadeEdit(usuario.cidade)
    setEditMode(false)
    setEditCidade(false)
  }

  function escolherFoto(photoId) {
    const updated = { ...usuario }
    if (photoId) updated.photo = photoId
    else delete updated.photo
    localStorage.setItem('hangr_user', JSON.stringify(updated))
    setUsuario(updated)
    setPickingPhoto(false)
    showToast('Foto atualizada!')
  }

  async function salvarGostos() {
    const cats = [...selCats].map(slug => ({ slug, forca: 1, subs: [] }))
    const updated = { ...prefs, categorias: cats }
    localStorage.setItem('hangr_prefs', JSON.stringify(updated))
    setPrefs(updated)
    try { await salvarPreferencias({ usuario_id: usuario._id, categorias: cats }) } catch {}
    setEditGostos(false)
    showToast('Gostos salvos!')
  }

  function toggleNotif(key) {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    localStorage.setItem('hangr_notifs', JSON.stringify(updated))
  }

  async function seguir(alvo_id) {
    if (!usuario?._id) return
    setSeguidos(prev => new Set([...prev, alvo_id]))
    try { await seguirUsuario(usuario._id, alvo_id) } catch {}
  }

  function copiarLinkConvite() {
    const link = `${window.location.origin}/auth?modo=cadastro`
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2200)
    })
  }

  function toggleCat(slug) {
    setSelCats(prev => {
      const n = new Set(prev)
      n.has(slug) ? n.delete(slug) : n.add(slug)
      return n
    })
  }

  function sair() {
    localStorage.removeItem('hangr_user')
    localStorage.removeItem('hangr_prefs')
    localStorage.removeItem('hangr_notifs')
    navigate('/')
  }

  // ── Friend search debounce ───────────────────────────────────────────────
  useEffect(() => {
    if (!searchAmigo.trim()) { setSearchResultados([]); return }
    const t = setTimeout(async () => {
      setBuscandoAmigo(true)
      try {
        const res = await buscarUsuarios(searchAmigo, usuario?._id)
        setSearchResultados(res || [])
      } catch { setSearchResultados([]) }
      finally { setBuscandoAmigo(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [searchAmigo])

  // ── Stats from API parties (hooks must be before any early return) ────────
  const streak       = useMemo(() => calcularStreak(partiesData), [partiesData])
  const totalMatches = useMemo(() => partiesData.filter(p => calcMatchFromVotes(p.votes || []) !== null).length, [partiesData])
  const favCat       = useMemo(() => {
    const freq = {}
    partiesData.forEach(p => {
      const m = calcMatchFromVotes(p.votes || [])
      if (m) freq[m] = (freq[m] || 0) + 1
    })
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }, [partiesData])

  if (!usuario) return null

  const iniciais = usuario.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
  const catsSelecionadas = cats.filter(c => prefs?.categorias?.some(p => p.slug === c.slug))

  return (
    <div style={s.root}>

      {/* ── Top nav ── */}
      <nav style={s.nav}>
        <span style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/home')}>hangr</span>
        {tab === 0 && !editMode && (
          <button style={s.editBtn} onClick={() => setEditMode(true)}>
            <Pencil size={14} /> Editar
          </button>
        )}
        {editMode && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.cancelBtn} onClick={cancelarEdit}><X size={16} /></button>
            <button style={s.saveBtn} onClick={salvarPerfil}><Check size={14} /> Salvar</button>
          </div>
        )}
      </nav>

      {/* backdrop to close picker */}
      {pickingPhoto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setPickingPhoto(false)} />
      )}

      {/* ── Avatar + info ── */}
      <div style={s.heroSection}>

        {/* avatar with photo picker */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <motion.button style={s.avatarBtn} onClick={() => setPickingPhoto(p => !p)} whileTap={{ scale: 0.94 }}>
            {usuario.photo ? (
              <img src={PROFILES.find(p => p.id === usuario.photo)?.src} style={s.avatarImg} alt="perfil" />
            ) : (
              <div style={s.avatar}>{iniciais}</div>
            )}
            <div style={s.cameraBadge}><Camera size={11} /></div>
          </motion.button>

          <AnimatePresence>
            {pickingPhoto && (
              <motion.div
                style={s.photoPicker}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.16 }}
              >
                <p style={s.pickerLabel}>Escolha uma foto</p>
                <div style={s.photoGrid}>
                  {/* default: initials */}
                  <motion.button
                    style={{ ...s.photoOption, borderColor: !usuario.photo ? 'var(--lime)' : 'var(--line)' }}
                    onClick={() => escolherFoto(null)}
                    whileTap={{ scale: 0.93 }}
                  >
                    <div style={{ ...s.avatar, width: 50, height: 50, fontSize: 16 }}>{iniciais}</div>
                  </motion.button>
                  {PROFILES.map(p => (
                    <motion.button
                      key={p.id}
                      style={{ ...s.photoOption, borderColor: usuario.photo === p.id ? 'var(--lime)' : 'var(--line)' }}
                      onClick={() => escolherFoto(p.id)}
                      whileTap={{ scale: 0.93 }}
                    >
                      <img src={p.src} style={s.photoThumb} alt={p.id} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {editMode ? (
          <div style={s.editFields}>
            <input
              style={s.nameInput}
              value={nomeEdit}
              onChange={e => setNomeEdit(e.target.value)}
              placeholder="Seu nome"
            />
            <p style={s.emailReadonly}>{usuario.email}</p>

            {!editCidade ? (
              <button style={s.cidadeRow} onClick={() => setEditCidade(true)}>
                <span style={s.cidadeTag}>📍 {usuario.cidade}</span>
                <span style={s.cidadeHint}>Alterar cidade</span>
                <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
              </button>
            ) : (
              <div style={{ marginTop: 8 }}>
                <LocationPicker onCidadeChange={setCidadeEdit} />
              </div>
            )}
          </div>
        ) : (
          <div style={s.infoBlock}>
            <h1 style={s.userName}>{usuario.nome}</h1>
            <p style={s.userEmail}>{usuario.email}</p>
            <span style={s.cidadeChip}>📍 {usuario.cidade}</span>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      {!editMode && (
        <div style={s.stats}>
          {[
            { label: 'Parties',  value: String(partiesData.length) },
            { label: 'Streak 🔥', value: streak > 0 ? `${streak}` : '—' },
            { label: 'Matches',  value: String(totalMatches) },
          ].map(({ label, value }) => (
            <div key={label} style={s.statItem}>
              <span style={s.statValue}>{value}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={s.tabRow}>
        {TABS.map((t, i) => (
          <button
            key={t}
            style={{
              ...s.tabBtn,
              color: tab === i ? '#fff' : 'var(--text-3)',
              borderBottom: tab === i ? '2px solid var(--lime)' : '2px solid transparent',
            }}
            onClick={() => { setTab(i); setEditMode(false) }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={s.tabContent}>
        <AnimatePresence mode="wait">

          {/* ── Perfil tab ── */}
          {tab === 0 && (
            <motion.div key="perfil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Meus gostos */}
              <Section
                title="Meus gostos"
                action={!editGostos ? { label: 'Editar', onClick: () => setEditGostos(true) } : null}
              >
                {editGostos ? (
                  <>
                    <div style={s.catGrid}>
                      {cats.map(cat => {
                        const on = selCats.has(cat.slug)
                        return (
                          <motion.button
                            key={cat.slug}
                            style={{
                              ...s.catCard,
                              background:  on ? cat.cor      : 'var(--bg-2)',
                              borderColor: on ? cat.cor      : 'var(--line)',
                              color:       on ? cat.corTexto : '#fff',
                            }}
                            onClick={() => toggleCat(cat.slug)}
                            whileTap={{ scale: 0.96 }}
                          >
                            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{cat.nome}</span>
                            {on && <Check size={13} style={{ flexShrink: 0 }} />}
                          </motion.button>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button style={s.ghostBtn} onClick={() => { setEditGostos(false); setSelCats(new Set(prefs?.categorias?.map(c => c.slug) || [])) }}>Cancelar</button>
                      <button style={s.limeBtn} onClick={salvarGostos}>Salvar gostos</button>
                    </div>
                  </>
                ) : catsSelecionadas.length > 0 ? (
                  <div style={s.chips}>
                    {catsSelecionadas.map(cat => (
                      <span key={cat.slug} style={{ ...s.chip, background: cat.cor + '18', color: cat.cor, borderColor: cat.cor + '35' }}>
                        {cat.emoji} {cat.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={s.emptyText}>Nenhum gosto selecionado ainda.</p>
                )}
              </Section>

              {/* Estatísticas */}
              <Section title="Estatísticas">
                {partiesData.length === 0 ? (
                  <p style={s.emptyText}>Nenhuma party ainda.</p>
                ) : (
                  <div style={s.statsCards}>
                    {favCat && (
                      <div style={s.statCard}>
                        <span style={{ fontSize: 28 }}>{cats.find(c => c.slug === favCat)?.emoji}</span>
                        <p style={s.statCardVal}>{cats.find(c => c.slug === favCat)?.nome}</p>
                        <p style={s.statCardLabel}>Categoria favorita</p>
                      </div>
                    )}
                    <div style={s.statCard}>
                      <span style={{ fontSize: 28 }}>🔥</span>
                      <p style={s.statCardVal}>{streak > 0 ? streak : '—'}</p>
                      <p style={s.statCardLabel}>Semanas seguidas</p>
                    </div>
                    <div style={s.statCard}>
                      <span style={{ fontSize: 28 }}>🎯</span>
                      <p style={s.statCardVal}>{partiesData.length}</p>
                      <p style={s.statCardLabel}>Parties</p>
                    </div>
                  </div>
                )}
              </Section>

              {/* Notificações */}
              <Section title="Notificações">
                {[
                  { key: 'party',     icon: <Bell size={15} />, label: 'Atividade na party',     desc: 'Quando alguém entra ou sai' },
                  { key: 'match',     icon: <Check size={15} />, label: 'Match encontrado',       desc: 'Quando o app decide um lugar' },
                  { key: 'amigos',    icon: <UserPlus size={15} />, label: 'Convites de amigos',  desc: 'Quando alguém te adiciona' },
                  { key: 'novidades', icon: <Bell size={15} />, label: 'Novidades do Hangr',      desc: 'Atualizações e novas features' },
                ].map(({ key, icon, label, desc }) => (
                  <div key={key} style={s.notifRow}>
                    <div style={s.notifIcon}>{icon}</div>
                    <div style={s.notifBody}>
                      <p style={s.notifLabel}>{label}</p>
                      <p style={s.notifDesc}>{desc}</p>
                    </div>
                    <Toggle on={notifs[key]} onChange={() => toggleNotif(key)} />
                  </div>
                ))}
              </Section>

              {/* Conta */}
              <Section title="Conta">
                <button style={s.dangerBtn} onClick={sair}>
                  <LogOut size={15} /> Sair da conta
                </button>
              </Section>

            </motion.div>
          )}

          {/* ── Amigos tab ── */}
          {tab === 1 && (
            <motion.div key="amigos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <Section title="Amigos">
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>👥</span>
                  <p style={s.emptyTitle}>Nenhum amigo ainda.</p>
                  <p style={s.emptyDesc}>Adicione amigos para criar parties juntos.</p>
                  <button style={s.limeBtn} onClick={() => setShowAddFriend(true)}>
                    <UserPlus size={14} /> Adicionar amigo
                  </button>
                </div>
              </Section>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={s.toast}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Friend Sheet ── */}
      <AnimatePresence>
        {showAddFriend && (
          <>
            <motion.div
              style={s.sheetBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddFriend(false); setSearchAmigo(''); setSearchResultados([]) }}
            />
            <motion.div
              style={s.sheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div style={s.sheetHandle} />
              <div style={s.sheetHeader}>
                <p style={s.sheetTitle}>Adicionar amigo</p>
                <button style={s.sheetClose} onClick={() => { setShowAddFriend(false); setSearchAmigo(''); setSearchResultados([]) }}>
                  <X size={18} />
                </button>
              </div>

              {/* Search input */}
              <div style={s.searchRow}>
                <Search size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <input
                  style={s.searchField}
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchAmigo}
                  onChange={e => setSearchAmigo(e.target.value)}
                  autoFocus
                />
                {buscandoAmigo && <Loader2 size={15} style={{ color: 'var(--text-3)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
              </div>

              {/* Results */}
              {searchResultados.length > 0 && (
                <div style={s.resultList}>
                  {searchResultados.map(u => (
                    <div key={u._id} style={s.resultRow}>
                      <div style={s.resultAvatar}>
                        {u.photo
                          ? <img src={PROFILES.find(p => p.id === u.photo)?.src} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt={u.nome} />
                          : <div style={{ ...s.avatar, width: 40, height: 40, fontSize: 14 }}>{u.nome?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || '?'}</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={s.resultNome}>{u.nome}</p>
                        {u.cidade && <p style={s.resultEmail}>{u.cidade}</p>}
                      </div>
                      {seguidos.has(u._id) ? (
                        <span style={s.seguidoTag}><Check size={12} /> Seguindo</span>
                      ) : (
                        <motion.button style={s.seguirBtn} onClick={() => seguir(u._id)} whileTap={{ scale: 0.94 }}>
                          <UserPlus size={13} /> Seguir
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchAmigo.trim() && !buscandoAmigo && searchResultados.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                  Nenhum usuário encontrado.
                </p>
              )}

              {/* Invite section */}
              <div style={s.inviteBox}>
                <div style={s.inviteTextBlock}>
                  <p style={s.inviteTitle}>Convidar amigo a criar conta</p>
                  <p style={s.inviteDesc}>Compartilhe o link e chame seus amigos para o Hangr.</p>
                </div>
                <motion.button style={{ ...s.inviteBtn, background: linkCopiado ? 'var(--lime)' : 'var(--bg-3)', color: linkCopiado ? '#000' : '#fff' }} onClick={copiarLinkConvite} whileTap={{ scale: 0.95 }}>
                  {linkCopiado ? <><Check size={12} /> Copiado</> : 'Copiar link'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

/* ─── Section wrapper ────────────────────────────────────────────────── */
function Section({ title, action, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHead}>
        <p style={s.sectionTitle}>{title}</p>
        {action && (
          <button style={s.sectionAction} onClick={action.onClick}>{action.label}</button>
        )}
      </div>
      {children}
    </div>
  )
}

/* ─── Toggle switch ──────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button
      style={{
        ...s.toggle,
        background: on ? 'var(--lime)' : 'var(--bg-3)',
      }}
      onClick={onChange}
    >
      <motion.div
        style={s.toggleThumb}
        animate={{ left: on ? 22 : 3, background: on ? '#000' : 'var(--text-3)' }}
        transition={{ duration: 0.18 }}
      />
    </button>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', paddingBottom: 80 },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid var(--line)',
  },
  logo:      { fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--lime)' },
  editBtn:   { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)', padding: '7px 14px', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', background: 'var(--bg-1)', cursor: 'pointer' },
  cancelBtn: { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  saveBtn:   { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '7px 16px', background: 'var(--lime)', color: '#000', border: 'none', borderRadius: 'var(--r-full)', cursor: 'pointer' },

  /* Hero */
  heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px 20px', gap: 14 },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'var(--lime)', color: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', flexShrink: 0,
  },
  infoBlock:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  userName:   { fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center' },
  userEmail:  { fontSize: 13, color: 'var(--text-2)' },
  cidadeChip: { fontSize: 12, fontWeight: 600, padding: '4px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)' },

  /* Edit mode */
  editFields: { width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 },
  nameInput:  { width: '100%', padding: '13px 16px', background: 'var(--bg-2)', border: '1px solid var(--line-mid)', borderRadius: 'var(--r-lg)', color: '#fff', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center' },
  emailReadonly: { fontSize: 13, color: 'var(--text-3)', textAlign: 'center' },
  cidadeRow:  { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', cursor: 'pointer', width: '100%' },
  cidadeTag:  { fontSize: 13, color: 'var(--text-2)', flex: 1, textAlign: 'left' },
  cidadeHint: { fontSize: 12, color: 'var(--lime)', fontWeight: 600 },

  /* Stats */
  stats: {
    display: 'flex', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
  },
  statItem:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', gap: 4, borderRight: '1px solid var(--line)' },
  statValue: { fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em' },
  statLabel: { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em' },

  /* Tabs */
  tabRow: { display: 'flex', borderBottom: '1px solid var(--line)' },
  tabBtn: { flex: 1, padding: '14px 8px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .15s, border-color .15s', letterSpacing: '0.02em' },

  /* Content */
  tabContent: { flex: 1, padding: '0 24px', maxWidth: 520, width: '100%', margin: '0 auto' },

  /* Section */
  section:       { paddingTop: 28, paddingBottom: 8 },
  sectionHead:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle:  { fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)' },
  sectionAction: { fontSize: 12, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' },

  /* Gostos */
  catGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  catCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid', borderRadius: 'var(--r-xl)', cursor: 'pointer', width: '100%', transition: 'background .18s, border-color .18s, color .18s' },
  chips:   { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip:    { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 600 },

  /* Notifications */
  notifRow:  { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' },
  notifIcon: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifLabel:{ fontSize: 14, fontWeight: 600, marginBottom: 2 },
  notifDesc: { fontSize: 12, color: 'var(--text-2)' },

  /* Toggle */
  toggle:      { width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' },
  toggleThumb: { position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%' },

  /* Friends / history empty */
  searchInput: { width: '100%', padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 20 },
  emptyState:  { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', gap: 10, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-2xl)', background: 'var(--bg-1)' },
  emptyIcon:   { fontSize: 36, lineHeight: 1, color: 'var(--lime)', opacity: 0.5 },
  emptyTitle:  { fontSize: 15, fontWeight: 700 },
  emptyDesc:   { fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 },
  emptyText:   { fontSize: 13, color: 'var(--text-3)' },

  /* Buttons */
  limeBtn:   { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--lime)', color: '#000', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 'var(--r-full)', cursor: 'pointer', marginTop: 4 },
  ghostBtn:  { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'transparent', color: 'var(--text-2)', fontWeight: 600, fontSize: 13, border: '1px solid var(--line)', borderRadius: 'var(--r-full)', cursor: 'pointer' },
  dangerBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: '#FF4545', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' },

  /* Stats cards */
  statsCards: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  statCard: {
    flex: '1 1 90px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '16px 12px',
    background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)',
    textAlign: 'center',
  },
  statCardVal:   { fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' },
  statCardLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.02em' },

  /* Toast */
  toast: {
    position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 13, borderRadius: 'var(--r-full)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, whiteSpace: 'nowrap',
  },

  /* Add friend sheet */
  sheetBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 200, backdropFilter: 'blur(2px)',
  },
  sheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'var(--bg-1)', borderRadius: '24px 24px 0 0',
    border: '1px solid var(--line)', borderBottom: 'none',
    padding: '0 20px 40px', zIndex: 201,
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    overflowY: 'auto',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    background: 'var(--line)', margin: '12px auto 0',
    flexShrink: 0,
  },
  sheetHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0 12px', flexShrink: 0,
  },
  sheetTitle: { fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em' },
  sheetClose: {
    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '50%',
    color: 'var(--text-2)', cursor: 'pointer',
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)', padding: '11px 14px',
    marginBottom: 16, flexShrink: 0,
  },
  searchField: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: 14,
  },
  resultList: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 },
  resultRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid var(--line)',
  },
  resultAvatar: { flexShrink: 0 },
  resultNome:  { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  resultEmail: { fontSize: 12, color: 'var(--text-3)' },
  seguirBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 14px', background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 12, border: 'none',
    borderRadius: 'var(--r-full)', cursor: 'pointer', flexShrink: 0,
  },
  seguidoTag: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
    padding: '7px 12px', border: '1px solid var(--line)',
    borderRadius: 'var(--r-full)', flexShrink: 0,
  },
  inviteBox: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px', marginTop: 8,
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-2xl)', flexShrink: 0,
  },
  inviteTextBlock: { flex: 1 },
  inviteTitle: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  inviteDesc:  { fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 },
  inviteBtn: {
    padding: '9px 16px', background: 'var(--bg-3)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-full)', color: '#fff', fontWeight: 700, fontSize: 12,
    cursor: 'pointer', flexShrink: 0,
  },

  /* Avatar button */
  avatarBtn: {
    position: 'relative', display: 'block',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    borderRadius: '50%',
  },
  avatarImg: {
    width: 80, height: 80, borderRadius: '50%',
    objectFit: 'cover', display: 'block',
    border: '3px solid var(--lime)',
  },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: '50%',
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-2)',
  },

  /* Photo picker */
  photoPicker: {
    position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-2)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-2xl)', padding: '14px 16px',
    zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    minWidth: 280,
  },
  pickerLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12,
    textAlign: 'center',
  },
  photoGrid: {
    display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
  },
  photoOption: {
    padding: 3, background: 'none', borderRadius: '50%',
    border: '2px solid', cursor: 'pointer',
    transition: 'border-color .15s',
  },
  photoThumb: {
    width: 50, height: 50, borderRadius: '50%',
    objectFit: 'cover', display: 'block',
  },
}
