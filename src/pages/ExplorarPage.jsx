import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Globe, Loader2, Navigation } from 'lucide-react'
import { buscarLugares } from '../services/api'
import { pegarLocalizacao } from '../utils/geo'

const CATS_META = {
  restaurantes: { nome: 'Restaurantes', emoji: '🍽️', cor: '#CCFF00', corTexto: '#000' },
  bares:        { nome: 'Bares',        emoji: '🍺', cor: '#FF3D8A', corTexto: '#fff' },
  cafes:        { nome: 'Cafés',        emoji: '☕', cor: '#F5C842', corTexto: '#000' },
  jogos:        { nome: 'Jogos',        emoji: '🎮', cor: '#3D8AFF', corTexto: '#fff' },
  parque:       { nome: 'Parque',       emoji: '🌳', cor: '#00E096', corTexto: '#000' },
  esportes:     { nome: 'Esportes',     emoji: '⚽', cor: '#FF5C3A', corTexto: '#fff' },
}

const RAIOS = [
  { label: '500m', value: 500 },
  { label: '1km',  value: 1000 },
  { label: '2km',  value: 2000 },
  { label: '5km',  value: 5000 },
  { label: '10km', value: 10000 },
]

// GPS confiável = accuracy ≤ 200m (exclui WiFi/IP)
const GPS_THRESHOLD = 200

export default function ExplorarPage() {
  const { id, slug }    = useParams()
  const navigate        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const raioInicial     = parseInt(searchParams.get('raio') || '2000')
  const [raio, setRaio] = useState(raioInicial)

  const [lugares, setLugares]       = useState([])
  const [cidade, setCidade]         = useState('')
  const [modoGeo, setModoGeo]       = useState(null)   // 'gps' | 'cidade' | null
  const [status, setStatus]         = useState('localizando')
  const [erroMsg, setErroMsg]       = useState('')
  const [geoAtual, setGeoAtual]     = useState(null)   // { lat, lng, accuracy }
  const [buscandoGeo, setBuscandoGeo] = useState(false)

  const cat = CATS_META[slug] || { nome: slug, emoji: '📍', cor: '#CCFF00', corTexto: '#000' }

  // Na abertura: pega localização fresca → busca
  useEffect(() => {
    iniciar()
  }, [id, slug])

  // Quando raio muda: rebusca com localização já conhecida
  useEffect(() => {
    if (status !== 'loading' && status !== 'localizando') {
      carregar(geoAtual, raio)
    }
  }, [raio])

  async function iniciar() {
    setStatus('localizando')
    const geo = await pegarLocalizacao(8000)
    setGeoAtual(geo)
    await carregar(geo, raio)
  }

  async function carregar(geo, r) {
    setStatus('loading')
    try {
      const data = await buscarLugares(id, slug, r, geo)
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
    const geo = await pegarLocalizacao(10000)
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

  return (
    <div style={s.root}>

      {/* Header */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
        </button>
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

      {/* Barra de localização + raio */}
      <div style={s.controlBar}>
        {/* Indicador de modo */}
        <button
          style={{
            ...s.geoBtn,
            ...(modoGeo === 'gps' ? s.geoBtnGps : s.geoBtnCidade),
          }}
          onClick={atualizarLocalizacao}
          disabled={buscandoGeo}
          title="Atualizar localização"
        >
          {buscandoGeo
            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            : <Navigation size={12} />}
          {buscandoGeo
            ? 'Localizando…'
            : modoGeo === 'gps'
              ? 'GPS ativo'
              : 'Usar minha localização'}
        </button>

        {/* Pills de raio */}
        <div style={s.raioRow}>
          {RAIOS.map(r => (
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
            <p style={s.centerText}>
              {isLocalizando ? 'Obtendo sua localização…' : 'Buscando lugares…'}
            </p>
          </div>
        )}

        {isErro && (
          <div style={s.center}>
            <p style={s.errorEmoji}>😕</p>
            <p style={s.centerText}>{erroMsg}</p>
            <button
              style={{ ...s.retryBtn, borderColor: cat.cor, color: cat.cor }}
              onClick={() => carregar(geoAtual, raio)}
            >
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
                  {lugar.icone ? (
                    <img src={lugar.icone} alt="" style={s.catIcon} />
                  ) : (
                    <div style={{ ...s.catIconFallback, background: cat.cor, color: cat.corTexto }}>
                      {cat.emoji}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.placeName}>{lugar.nome}</p>
                    <p style={s.placeCategory}>{lugar.categoria}</p>
                  </div>
                  {lugar.distancia && (
                    <span style={s.distChip}>{lugar.distancia}</span>
                  )}
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
                      <a href={`tel:${lugar.tel}`} style={s.linkBtn}>
                        <Phone size={12} />
                        {lugar.tel}
                      </a>
                    )}
                    {lugar.instagram && (
                      <a href={`https://instagram.com/${lugar.instagram}`} target="_blank" rel="noreferrer" style={s.linkBtn}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>ig</span>
                        @{lugar.instagram}
                      </a>
                    )}
                    {lugar.website && !lugar.instagram && (
                      <a href={lugar.website} target="_blank" rel="noreferrer" style={s.linkBtn}>
                        <Globe size={12} />
                        Site
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  root:    { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },

  header:  { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--line)' },
  backBtn: { width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', color: 'var(--text-2)', cursor: 'pointer', background: 'var(--bg-1)' },
  headerSub:   { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 1 },
  headerTitle: { fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' },
  catChip:     { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--r-full)', flexShrink: 0 },

  controlBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--line)', overflowX: 'auto' },
  geoBtn:     { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  geoBtnGps:  { background: 'rgba(0,224,150,0.15)', borderColor: 'var(--mint)', color: '#00E096' },
  geoBtnCidade: { background: 'var(--bg-1)', color: 'var(--text-2)' },
  raioRow:    { display: 'flex', gap: 6, flexShrink: 0, marginLeft: 'auto' },
  raioPill:   { padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-full)', border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap' },
  raioPillOn: { background: 'var(--lime)', borderColor: 'var(--lime)', color: '#000' },

  content: { flex: 1, maxWidth: 560, width: '100%', margin: '0 auto', padding: '20px 16px 60px' },

  center:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 },
  centerText: { fontSize: 14, color: 'var(--text-2)', textAlign: 'center' },
  errorEmoji: { fontSize: 40 },
  retryBtn:   { marginTop: 8, background: 'none', border: '1px solid', borderRadius: 'var(--r-full)', padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  list: { display: 'flex', flexDirection: 'column', gap: 12 },

  card: { background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 },

  cardTop:        { display: 'flex', alignItems: 'flex-start', gap: 12 },
  catIcon:        { width: 40, height: 40, borderRadius: 10, flexShrink: 0, objectFit: 'cover', background: 'var(--bg-2)' },
  catIconFallback:{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  placeName:      { fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 2 },
  placeCategory:  { fontSize: 11, color: 'var(--text-3)', fontWeight: 600 },
  distChip:       { fontSize: 11, fontWeight: 700, color: 'var(--text-3)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' },

  addressRow: { display: 'flex', alignItems: 'flex-start', gap: 6 },
  addressText:{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 },

  linksRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  linkBtn:  { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-full)', padding: '5px 10px', textDecoration: 'none', flexShrink: 0 },
}
