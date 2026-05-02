import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, X, LogOut, Bell, BellOff, UserPlus, Clock, ChevronRight } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import LocationPicker from '../components/LocationPicker'
import { listarPartiesUsuario } from '../services/api'

/* ─── Category data (mirrors onboarding) ─────────────────────────────── */
const CATS = [
  { slug: 'restaurantes', nome: 'Restaurantes', emoji: '🍽️', cor: '#CCFF00', corTexto: '#000' },
  { slug: 'bares',        nome: 'Bares',        emoji: '🍺', cor: '#FF3D8A', corTexto: '#fff' },
  { slug: 'cafes',        nome: 'Cafés',        emoji: '☕', cor: '#F5C842', corTexto: '#000' },
  { slug: 'jogos',        nome: 'Jogos',        emoji: '🎮', cor: '#3D8AFF', corTexto: '#fff' },
  { slug: 'parque',       nome: 'Parque',       emoji: '🌳', cor: '#00E096', corTexto: '#000' },
  { slug: 'esportes',     nome: 'Esportes',     emoji: '⚽', cor: '#FF5C3A', corTexto: '#fff' },
]

const TABS = ['Perfil', 'Amigos', 'Histórico']

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

  /* notifications */
  const [notifs, setNotifs] = useState({ party: true, match: true, amigos: false, novidades: false })

  /* toast */
  const [toast, setToast] = useState(null)

  /* stats */
  const [stats, setStats] = useState({ parties: 0, criadas: 0 })

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
    listarPartiesUsuario(u._id).then(ps => {
      setStats({
        parties: ps.length,
        criadas: ps.filter(p => p.criada_por === u._id).length,
      })
    }).catch(() => {})
  }, [navigate])

  /* ── Helpers ── */
  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  function salvarPerfil() {
    const updated = { ...usuario, nome: nomeEdit, cidade: editCidade && cidadeEdit ? cidadeEdit : usuario.cidade }
    localStorage.setItem('hangr_user', JSON.stringify(updated))
    setUsuario(updated)
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

  function salvarGostos() {
    const updated = { ...prefs, categorias: [...selCats].map(slug => ({ slug, forca: 1, subs: [] })) }
    localStorage.setItem('hangr_prefs', JSON.stringify(updated))
    setPrefs(updated)
    setEditGostos(false)
    showToast('Gostos salvos!')
  }

  function toggleNotif(key) {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    localStorage.setItem('hangr_notifs', JSON.stringify(updated))
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

  if (!usuario) return null

  const iniciais = usuario.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
  const catsSelecionadas = CATS.filter(c => prefs?.categorias?.some(p => p.slug === c.slug))

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

      {/* ── Avatar + info ── */}
      <div style={s.heroSection}>
        <div style={s.avatar}>{iniciais}</div>

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
            { label: 'Total',   value: stats.parties },
            { label: 'Criadas', value: stats.criadas },
            { label: 'Entradas', value: stats.parties - stats.criadas },
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
                      {CATS.map(cat => {
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
              <div style={s.emptyState}>
                <span style={s.emptyIcon}>👥</span>
                <p style={s.emptyTitle}>Em breve.</p>
                <p style={s.emptyDesc}>A funcionalidade de amigos está sendo desenvolvida.</p>
              </div>
            </motion.div>
          )}

          {/* ── Histórico tab ── */}
          {tab === 2 && (
            <motion.div key="historico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={s.emptyState}>
                <span style={s.emptyIcon}>✳</span>
                <p style={s.emptyTitle}>Ver histórico completo.</p>
                <p style={s.emptyDesc}>Todas as suas parties estão na aba Histórico.</p>
                <button style={s.limeBtn} onClick={() => navigate('/historico')}>
                  <Clock size={14} /> Ver histórico
                </button>
              </div>
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

  /* Toast */
  toast: {
    position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', background: 'var(--lime)', color: '#000',
    fontWeight: 700, fontSize: 13, borderRadius: 'var(--r-full)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, whiteSpace: 'nowrap',
  },
}
