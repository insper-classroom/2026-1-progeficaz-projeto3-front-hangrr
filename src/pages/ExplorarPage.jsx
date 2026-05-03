import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Globe, Loader2, Navigation, X, Maximize2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { buscarLugares, getParty, getCategorias, getConfiguracoes } from '../services/api'
import { pegarLocalizacao } from '../utils/geo'

// Fix Leaflet's default icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const AVATAR_PALETTE = ['#FF3D8A', '#3D8AFF', '#00E096', '#FF5C3A', '#F5C842', '#B084FF', '#00CED1']

const GPS_THRESHOLD = 500

// ── Leaflet helpers ──────────────────────────────────────────────────────

function makeIcon(html, size = 36) {
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

const userIcon = makeIcon(
  `<div style="width:36px;height:36px;background:#CCFF00;border-radius:50%;border:3px solid #000;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:9px;color:#000;box-shadow:0 2px 8px rgba(0,0,0,0.5)">EU</div>`,
  36,
)

function memberIcon(nome, cor) {
  const letra = (nome || '?')[0].toUpperCase()
  return makeIcon(
    `<div style="width:32px;height:32px;background:${cor};border-radius:50%;border:2px solid rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${letra}</div>`,
    32,
  )
}

function placeIcon(emoji) {
  return makeIcon(
    `<div style="width:34px;height:34px;background:#111;border:1px solid #444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 6px rgba(0,0,0,0.5)">${emoji}</div>`,
    34,
  )
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    const valid = points.filter(p => p?.lat != null && p?.lng != null)
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 15)
    } else {
      map.fitBounds(valid.map(p => [p.lat, p.lng]), { padding: [48, 48], maxZoom: 16 })
    }
  }, []) // only on initial mount
  return null
}

// ── Main component ────────────────────────────────────────────────────────

export default function ExplorarPage() {
  const { codigo, slug } = useParams()
  const navigate         = useNavigate()
  const usuario          = JSON.parse(localStorage.getItem('hangr_user') || '{}')
  const [searchParams, setSearchParams] = useSearchParams()

  const raioInicial     = parseInt(searchParams.get('raio') || '2000')
  const [raio, setRaio] = useState(raioInicial)

  const [catsMeta, setCatsMeta] = useState({})
  const [raios, setRaios]       = useState([
    { label: '500m', value: 500 }, { label: '1km', value: 1000 },
    { label: '2km', value: 2000 }, { label: '5km', value: 5000 }, { label: '10km', value: 10000 },
  ])

  const [lugares, setLugares]           = useState([])
  const [cidade, setCidade]             = useState('')
  const [modoGeo, setModoGeo]           = useState(null)
  const [status, setStatus]             = useState('localizando')
  const [erroMsg, setErroMsg]           = useState('')
  const [geoAtual, setGeoAtual]         = useState(null)
  const [buscandoGeo, setBuscandoGeo]   = useState(false)
  const [membrosGps, setMembrosGps]     = useState([])
  const [mapExpanded, setMapExpanded]   = useState(false)

  const cat = catsMeta[slug] || { nome: slug, emoji: '📍', cor: '#CCFF00', corTexto: '#000' }

  useEffect(() => { iniciar() }, [codigo, slug])

  useEffect(() => {
    getCategorias().then(cats => setCatsMeta(Object.fromEntries(cats.map(c => [c.slug, c])))).catch(() => {})
    getConfiguracoes().then(cfg => { if (cfg.raios_busca) setRaios(cfg.raios_busca) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (status !== 'loading' && status !== 'localizando') carregar(geoAtual, raio)
  }, [raio])

  // Lock body scroll when map is open
  useEffect(() => {
    document.body.style.overflow = mapExpanded ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mapExpanded])

  async function iniciar() {
    setStatus('localizando')
    const [geo, partyData] = await Promise.all([
      pegarLocalizacao(12000),
      getParty(codigo).catch(() => null),
    ])
    setGeoAtual(geo)
    if (partyData) {
      const comGps = (partyData.membros || [])
        .filter(m => m.lat != null && m.lng != null && m.usuario_id !== usuario._id)
      setMembrosGps(comGps)
    }
    await carregar(geo, raio)
  }

  async function carregar(geo, r) {
    setStatus('loading')
    try {
      const data = await buscarLugares(codigo, slug, r, geo)
      setLugares(data.lugares || [])
      setCidade(data.cidade || '')
      setModoGeo(data.modo_busca || 'cidade')
      setStatus('ok')
    } catch (err) {
      setErroMsg(err.message || 'Não foi possível carregar os lugares.')
      setStatus('erro')
    }
  }

  async function atualizarLocalizacao() {
    if (buscandoGeo) return
    setBuscandoGeo(true)
    const geo = await pegarLocalizacao(12000)
    setGeoAtual(geo)
    setBuscandoGeo(false)
    await carregar(geo, raio)
  }

  function trocarRaio(r) {
    setRaio(r)
    setSearchParams({ raio: r })
  }

  const isLocalizando = status === 'localizando'
  const isLoading     = status === 'loading'
  const isOk          = status === 'ok'
  const isErro        = status === 'erro'

  // All map points
  const mapCenter = geoAtual
    ? [geoAtual.lat, geoAtual.lng]
    : membrosGps.length > 0
      ? [membrosGps[0].lat, membrosGps[0].lng]
      : null

  const allPoints = [
    geoAtual ? { lat: geoAtual.lat, lng: geoAtual.lng } : null,
    ...membrosGps.map(m => ({ lat: m.lat, lng: m.lng })),
    ...lugares.filter(l => l.lat != null).map(l => ({ lat: l.lat, lng: l.lng })),
  ].filter(Boolean)

  const hasMapData = mapCenter !== null

  return (
    <div style={s.root}>

      {/* ── Expanded Map Overlay ── */}
      <AnimatePresence>
        {mapExpanded && mapCenter && (
          <motion.div
            style={s.mapOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />
              <FitBounds points={allPoints} />

              {/* User */}
              {geoAtual && (
                <Marker position={[geoAtual.lat, geoAtual.lng]} icon={userIcon}>
                  <Popup>
                    <strong>Você</strong>
                    <br /><small>Precisão: ~{Math.round(geoAtual.accuracy)}m</small>
                  </Popup>
                </Marker>
              )}

              {/* Party members */}
              {membrosGps.map((m, i) => (
                <Marker
                  key={m.usuario_id}
                  position={[m.lat, m.lng]}
                  icon={memberIcon(m.nickname || m.nome, AVATAR_PALETTE[i % AVATAR_PALETTE.length])}
                >
                  <Popup><strong>{m.nickname || m.nome?.split(' ')[0]}</strong></Popup>
                </Marker>
              ))}

              {/* Places */}
              {lugares.filter(l => l.lat != null).map((lugar) => (
                <Marker
                  key={lugar.id}
                  position={[lugar.lat, lugar.lng]}
                  icon={placeIcon(cat.emoji)}
                >
                  <Popup>
                    <strong>{lugar.nome}</strong>
                    {lugar.distancia && <><br /><small>{lugar.distancia}</small></>}
                    {lugar.endereco && <><br /><small>{lugar.endereco}</small></>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend */}
            <div style={s.mapLegend}>
              {geoAtual && <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#CCFF00' }} />Você</span>}
              {membrosGps.length > 0 && <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#FF3D8A' }} />{membrosGps.length} amigo{membrosGps.length > 1 ? 's' : ''}</span>}
              {lugares.filter(l => l.lat != null).length > 0 && (
                <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#333' }} />{cat.emoji} Lugares</span>
              )}
            </div>

            <button style={s.mapCloseBtn} onClick={() => setMapExpanded(false)}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={17} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.headerSub}>{cidade || '…'}</p>
          <p style={s.headerTitle}>{cat.emoji} {cat.nome}</p>
        </div>
        {isOk && lugares.length > 0 && (
          <div style={{ ...s.catChip, background: cat.cor, color: cat.corTexto }}>
            {lugares.length} lugares
          </div>
        )}
      </header>

      {/* ── Control bar ── */}
      <div style={s.controlBar}>
        <button
          style={{ ...s.geoBtn, ...(modoGeo === 'gps' ? s.geoBtnGps : s.geoBtnCidade) }}
          onClick={atualizarLocalizacao}
          disabled={buscandoGeo}
        >
          {buscandoGeo
            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            : <Navigation size={12} />}
          {buscandoGeo ? 'Localizando…' : modoGeo === 'gps' ? 'GPS ativo' : 'Usar minha localização'}
        </button>
        <div style={s.raioRow}>
          {raios.map(r => (
            <button
              key={r.value}
              style={{ ...s.raioPill, ...(raio === r.value ? s.raioPillOn : {}) }}
              onClick={() => trocarRaio(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content}>
        {(isLocalizando || isLoading) && (
          <div style={s.center}>
            <Loader2 size={28} style={{ color: cat.cor, animation: 'spin 1s linear infinite' }} />
            <p style={s.centerText}>{isLocalizando ? 'Obtendo sua localização…' : 'Buscando lugares…'}</p>
          </div>
        )}

        {isErro && (
          <div style={s.center}>
            <p style={s.errorEmoji}>😕</p>
            <p style={s.centerText}>{erroMsg}</p>
            <button style={{ ...s.retryBtn, borderColor: cat.cor, color: cat.cor }} onClick={() => carregar(geoAtual, raio)}>
              Tentar novamente
            </button>
          </div>
        )}

        {isOk && lugares.length === 0 && (
          <div style={s.center}>
            <p style={s.errorEmoji}>🔍</p>
            <p style={s.centerText}>Nenhum lugar encontrado. Tente aumentar o raio.</p>
          </div>
        )}

        {isOk && lugares.length > 0 && (
          <div style={s.list}>
            {lugares.map((lugar, i) => (
              <motion.div
                key={lugar.id}
                style={s.card}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div style={s.cardTop}>
                  {lugar.icone
                    ? <img src={lugar.icone} alt="" style={s.catIcon} />
                    : <div style={{ ...s.catIconFallback, background: cat.cor, color: cat.corTexto }}>{cat.emoji}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.placeName}>{lugar.nome}</p>
                    <p style={s.placeCategory}>{lugar.categoria}</p>
                  </div>
                  {lugar.distancia && <span style={s.distChip}>{lugar.distancia}</span>}
                </div>

                {lugar.endereco && (
                  <div style={s.addressRow}>
                    <MapPin size={11} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
                    <span style={s.addressText}>{lugar.endereco}</span>
                  </div>
                )}

                {(lugar.tel || lugar.website || lugar.instagram) && (
                  <div style={s.linksRow}>
                    {lugar.tel && (
                      <a href={`tel:${lugar.tel}`} style={s.linkBtn}><Phone size={12} />{lugar.tel}</a>
                    )}
                    {lugar.instagram && (
                      <a href={`https://instagram.com/${lugar.instagram}`} target="_blank" rel="noreferrer" style={s.linkBtn}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>ig</span>@{lugar.instagram}
                      </a>
                    )}
                    {lugar.website && !lugar.instagram && (
                      <a href={lugar.website} target="_blank" rel="noreferrer" style={s.linkBtn}><Globe size={12} />Site</a>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating mini map ── */}
      {hasMapData && !mapExpanded && (
        <motion.button
          style={s.miniMap}
          onClick={() => setMapExpanded(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 20, stiffness: 260 }}
          whileTap={{ scale: 0.93 }}
          title="Abrir mapa"
        >
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ width: '100%', height: '100%', borderRadius: 16, pointerEvents: 'none' }}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {geoAtual && (
              <Marker position={[geoAtual.lat, geoAtual.lng]} icon={makeIcon(
                `<div style="width:12px;height:12px;background:#CCFF00;border-radius:50%;border:2px solid #000"></div>`, 12
              )} />
            )}
            {membrosGps.map((m, i) => (
              <Marker key={m.usuario_id} position={[m.lat, m.lng]} icon={makeIcon(
                `<div style="width:10px;height:10px;background:${AVATAR_PALETTE[i % AVATAR_PALETTE.length]};border-radius:50%;border:1.5px solid #000"></div>`, 10
              )} />
            ))}
            {lugares.filter(l => l.lat != null).map(l => (
              <Marker key={l.id} position={[l.lat, l.lng]} icon={makeIcon(
                `<div style="width:20px;height:20px;background:#111;border:1px solid #333;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px">${cat.emoji}</div>`, 20
              )} />
            ))}
          </MapContainer>

          {/* Expand overlay */}
          <div style={s.miniMapOverlay}>
            <Maximize2 size={14} style={{ color: '#fff' }} />
          </div>

          {/* Dot counts */}
          <div style={s.miniMapBadge}>
            {geoAtual && <span style={{ ...s.badgeDot, background: '#CCFF00' }} />}
            {membrosGps.map((_, i) => (
              <span key={i} style={{ ...s.badgeDot, background: AVATAR_PALETTE[i % AVATAR_PALETTE.length] }} />
            ))}
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
              {lugares.filter(l => l.lat != null).length} {cat.emoji}
            </span>
          </div>
        </motion.button>
      )}

    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },

  header:      { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--line)' },
  backBtn:     { width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  headerSub:   { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 1 },
  headerTitle: { fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' },
  catChip:     { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--r-full)', flexShrink: 0 },

  controlBar:   { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--line)', overflowX: 'auto' },
  geoBtn:       { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  geoBtnGps:    { background: 'rgba(0,224,150,0.15)', borderColor: 'var(--mint)', color: '#00E096' },
  geoBtnCidade: { background: 'var(--bg-1)', color: 'var(--text-2)' },
  raioRow:      { display: 'flex', gap: 6, flexShrink: 0, marginLeft: 'auto' },
  raioPill:     { padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap' },
  raioPillOn:   { background: 'var(--lime)', borderColor: 'var(--lime)', color: '#000' },

  content: { flex: 1, maxWidth: 560, width: '100%', margin: '0 auto', padding: '20px 16px 100px' },

  center:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 },
  centerText: { fontSize: 14, color: 'var(--text-2)', textAlign: 'center' },
  errorEmoji: { fontSize: 40 },
  retryBtn:   { marginTop: 8, background: 'none', border: '1px solid', borderRadius: 'var(--r-full)', padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 },

  cardTop:         { display: 'flex', alignItems: 'flex-start', gap: 12 },
  catIcon:         { width: 40, height: 40, borderRadius: 10, flexShrink: 0, objectFit: 'cover', background: 'var(--bg-2)' },
  catIconFallback: { width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  placeName:       { fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 2 },
  placeCategory:   { fontSize: 11, color: 'var(--text-3)', fontWeight: 600 },
  distChip:        { fontSize: 11, fontWeight: 700, color: 'var(--text-3)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' },

  addressRow:  { display: 'flex', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 },
  linksRow:    { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  linkBtn:     { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '5px 10px', textDecoration: 'none', flexShrink: 0 },

  /* Mini map (floating) */
  miniMap: {
    position: 'fixed', bottom: 24, right: 16,
    width: 110, height: 110,
    borderRadius: 16,
    border: '2px solid var(--line)',
    overflow: 'hidden',
    cursor: 'pointer',
    padding: 0,
    background: '#111',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 30,
  },
  miniMapOverlay: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24,
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  miniMapBadge: {
    position: 'absolute', bottom: 5, left: 5,
    display: 'flex', alignItems: 'center', gap: 3,
    background: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    padding: '2px 5px',
    zIndex: 10,
  },
  badgeDot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },

  /* Expanded map */
  mapOverlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: '#000',
  },
  mapCloseBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 110,
    width: 40, height: 40,
    background: 'rgba(0,0,0,0.75)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 'var(--r-full)',
    color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  mapLegend: {
    position: 'absolute', bottom: 24, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', gap: 12, alignItems: 'center',
    background: 'rgba(0,0,0,0.75)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--r-full)',
    padding: '8px 16px',
    zIndex: 110,
    backdropFilter: 'blur(8px)',
    whiteSpace: 'nowrap',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#fff' },
  legendDot:  { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
}
