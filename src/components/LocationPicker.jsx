import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, Check, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

export default function LocationPicker({ onCidadeChange }) {
  const [estados, setEstados]         = useState([])
  const [cidades, setCidades]         = useState([])
  const [estadoSel, setEstadoSel]     = useState(null)
  const [estadoQuery, setEstadoQuery] = useState('')
  const [cidadeQuery, setCidadeQuery] = useState('')
  const [estadoOpen, setEstadoOpen]   = useState(false)
  const [cidadeOpen, setCidadeOpen]   = useState(false)
  const [loadingE, setLoadingE]       = useState(true)
  const [loadingC, setLoadingC]       = useState(false)
  const [cidadeOk, setCidadeOk]       = useState(false)

  const estadoRef = useRef(null)
  const cidadeRef = useRef(null)

  useEffect(() => {
    fetch(`${IBGE}/estados?orderBy=nome`)
      .then(r => r.json())
      .then(d => { setEstados(d); setLoadingE(false) })
      .catch(() => setLoadingE(false))
  }, [])

  useEffect(() => {
    if (!estadoSel) return
    setLoadingC(true); setCidades([])
    fetch(`${IBGE}/estados/${estadoSel.sigla}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(d => { setCidades(d); setLoadingC(false) })
      .catch(() => setLoadingC(false))
  }, [estadoSel])

  useEffect(() => {
    const close = e => {
      if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false)
      if (cidadeRef.current && !cidadeRef.current.contains(e.target)) setCidadeOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtE = estados
    .filter(e => e.nome.toLowerCase().includes(estadoQuery.toLowerCase()) || e.sigla.toLowerCase().includes(estadoQuery.toLowerCase()))
    .slice(0, 8)

  const filtC = cidades
    .filter(c => c.nome.toLowerCase().includes(cidadeQuery.toLowerCase()))
    .slice(0, 8)

  function pickEstado(e) {
    setEstadoSel(e); setEstadoQuery(e.nome); setEstadoOpen(false)
    setCidadeQuery(''); setCidadeOk(false); onCidadeChange('')
  }

  function pickCidade(c) {
    setCidadeQuery(c.nome); setCidadeOpen(false); setCidadeOk(true); onCidadeChange(c.nome)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Estado */}
      <div ref={estadoRef} style={{ position: 'relative' }}>
        <PickerField
          icon={<MapPin size={15} />}
          placeholder={loadingE ? 'Carregando estados…' : 'Estado'}
          value={estadoQuery}
          onChange={v => { setEstadoQuery(v); setEstadoOpen(true) }}
          onFocus={() => !loadingE && setEstadoOpen(true)}
          loading={loadingE}
          suffix={
            estadoSel && estadoQuery === estadoSel.nome
              ? <span style={s.badge}>{estadoSel.sigla}</span>
              : <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: estadoOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          }
        />
        <AnimatePresence>
          {estadoOpen && filtE.length > 0 && (
            <Dropdown>
              {filtE.map(e => (
                <DDItem key={e.id} onMouseDown={() => pickEstado(e)}>
                  <span style={{ flex: 1, fontSize: 14 }}>{e.nome}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700 }}>{e.sigla}</span>
                  {estadoSel?.id === e.id && <Check size={12} style={{ color: 'var(--lime)' }} />}
                </DDItem>
              ))}
            </Dropdown>
          )}
        </AnimatePresence>
      </div>

      {/* Cidade */}
      <AnimatePresence>
        {estadoSel && (
          <motion.div
            ref={cidadeRef}
            style={{ position: 'relative', overflow: 'visible' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <PickerField
              icon={cidadeOk ? <Check size={15} style={{ color: 'var(--ok)' }} /> : <MapPin size={15} />}
              placeholder={loadingC ? 'Carregando cidades…' : 'Cidade'}
              value={cidadeQuery}
              onChange={v => { setCidadeQuery(v); setCidadeOk(false); setCidadeOpen(true); onCidadeChange('') }}
              onFocus={() => !loadingC && setCidadeOpen(true)}
              loading={loadingC}
              done={cidadeOk}
              suffix={loadingC
                ? <Loader2 size={13} style={{ color: 'var(--text-3)', animation: 'spin 1s linear infinite' }} />
                : <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: cidadeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
            />
            <AnimatePresence>
              {cidadeOpen && filtC.length > 0 && (
                <Dropdown>
                  {filtC.map(c => (
                    <DDItem key={c.id} onMouseDown={() => pickCidade(c)}>
                      <span style={{ fontSize: 14 }}>{c.nome}</span>
                    </DDItem>
                  ))}
                </Dropdown>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Dropdown({ children }) {
  return (
    <motion.ul
      style={s.dropdown}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.ul>
  )
}

function DDItem({ children, onMouseDown }) {
  return (
    <li>
      <button className="dd-item" style={s.ddItem} onMouseDown={onMouseDown}>
        {children}
      </button>
    </li>
  )
}

function PickerField({ icon, placeholder, value, onChange, onFocus, loading, done, suffix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      ...s.field,
      borderColor: done ? 'rgba(0,224,150,0.35)' : focused ? 'var(--line-strong)' : 'var(--line)',
    }}>
      <span style={{ color: done ? 'var(--ok)' : 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <input
        style={s.fieldInput}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => setFocused(false)}
        disabled={loading}
        autoComplete="off"
      />
      {suffix && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{suffix}</span>}
    </div>
  )
}

const s = {
  field: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 14px',
    background: 'var(--bg-2)', border: '1px solid',
    borderRadius: 'var(--r-lg)', transition: 'border-color .18s',
  },
  fieldInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    fontSize: 14, color: '#fff', minWidth: 0,
  },
  badge: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
    padding: '2px 7px',
    background: 'rgba(204,255,0,0.12)', color: 'var(--lime)',
    borderRadius: 'var(--r-full)',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
    background: '#1C1C1C', border: '1px solid var(--line-mid)',
    borderRadius: 'var(--r-lg)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
    maxHeight: 220, overflowY: 'auto', padding: 4,
  },
  ddItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderRadius: 10,
    background: 'transparent', border: 'none', cursor: 'pointer',
    textAlign: 'left', color: '#fff', transition: 'background .12s',
  },
}
