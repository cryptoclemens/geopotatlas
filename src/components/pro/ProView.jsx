import { useState, useRef } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

const EXAMPLE_QUERIES = [
  'Mitteltiefe Geothermie im Lockergestein – FW-Abnehmer in NRW',
  'Tiefe Geothermie im Malmkarst – Stadtwerke Bayern mit Ausbauplan',
  'Rechenzentren als Sommerwärme-Kunden für Aquifer-Speicher',
  'Industrieabwärme neben ungenutzten Aquiferen',
  'Neue FW-Netze im Ruhrgebiet – wo fehlt noch eine Wärmequelle?',
]

const SYSTEM_PROMPT = `Du bist ein Geothermie-Potenzial-Assistent für Geologen, Hydrologen und Business Developer.

Verfügbare Datenlayer (layer keys):
- tiefland-plain: Norddeutsches Lockergestein
- aq-niederrhein: Niederrhein-Aquifer
- aq-norddeutsch: Norddeutscher Aquifer
- aq-molasse: Malmkarst / Molasse Bayern
- aq-oberrhein: Buntsandstein Oberrhein
- fw-cities-hi/mid/lo: Bestehende Fernwärme-Städte
- fw-expand: Städte mit FW-Ausbauplänen
- fw-new: Städte mit geplantem FW-Neubau
- aix-dhn: 8684 Fernwärmenetze (RWTH Aachen)
- kwp-energietraeger: Energieträger-Mix NRW
- kwp-waermecluster: FW-Potenzialflächen NRW
- heat-dc: Rechenzentren
- heat-pp: Kraftwerke / Industrie
- heat-abw: Industrieabwärme (BfEE)
- geo-bgr: Geologie WMS (BGR)
- waerme-wms: Zensus Heizungsstruktur

Antworte IMMER als valides JSON (kein Markdown, kein Text außenrum):
{
  "location": { "name": "Region", "lat": 51.5, "lng": 7.0, "zoom": 9 },
  "layers": ["key1", "key2"],
  "headline": "Prägnante Einschätzung in max. 12 Wörtern",
  "insights": [
    "Konkreter Fakt 1 (max. 20 Wörter)",
    "Konkreter Fakt 2",
    "Konkreter Fakt 3"
  ],
  "warning": "Nur bei echter Datenlücke oder Risiko – sonst Feld weglassen"
}

Regeln: max. 4 Insights je max. 20 Wörter · keine Firmennamen erfinden · keine Quellen zitieren`

async function callClaude(query, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Keine JSON-Antwort erhalten')
  return JSON.parse(match[0])
}

export default function ProView({ onResult }) {
  const [query, setQuery]   = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | no-key
  const [errMsg, setErrMsg] = useState('')
  const textRef = useRef(null)
  const profile = useAuthStore(s => s.profile)
  const apiKey  = profile?.claude_api_key || import.meta.env.VITE_CLAUDE_API_KEY || ''

  async function handleSearch() {
    if (!query.trim()) return
    if (!apiKey) { setStatus('no-key'); return }
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await callClaude(query.trim(), apiKey)
      onResult?.(res)
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '10px 12px', overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', marginBottom: 2 }}>
          Geopotatlas Pro
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
          Beschreiben Sie Ihr Vorhaben — KI aktiviert relevante Layer und zeigt das Ergebnis auf der Karte.
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSearch() }}
        placeholder='z.B. „Mitteltiefe Geothermie NRW – wo sind unversorgte Fernwärme-Städte?"'
        rows={4}
        disabled={status === 'loading'}
        style={{
          width: '100%', background: 'rgba(255,255,255,.04)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '8px 10px', color: 'var(--text)', fontSize: 11,
          fontFamily: 'inherit', resize: 'none', outline: 'none',
          lineHeight: 1.5, marginBottom: 8, boxSizing: 'border-box',
          transition: 'border-color .15s',
          opacity: status === 'loading' ? 0.6 : 1,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      <button
        onClick={handleSearch}
        disabled={status === 'loading' || !query.trim()}
        style={{
          width: '100%', padding: '8px 0', borderRadius: 6, border: 'none',
          background: status === 'loading'
            ? 'rgba(14,165,233,.3)'
            : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
          color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', marginBottom: 12,
          opacity: !query.trim() ? 0.5 : 1,
          transition: 'opacity .15s',
        }}
      >
        {status === 'loading' ? '⏳ Analysiere…' : '🔍 Analysieren (Strg+Enter)'}
      </button>

      {/* No-key hint */}
      {status === 'no-key' && (
        <div style={{
          background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)',
          borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 11,
          color: '#fcd34d', lineHeight: 1.6,
        }}>
          ⚠ Kein API-Key hinterlegt.<br />
          <span style={{ color: 'var(--muted)' }}>
            Klicke oben rechts auf ⚙ und trage deinen Claude API-Key ein.
          </span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
          borderRadius: 6, padding: '8px 10px', marginBottom: 12, fontSize: 11,
          color: '#fca5a5', lineHeight: 1.5,
        }}>
          ✗ {errMsg}
        </div>
      )}

      {/* Example chips */}
      <div style={{
        fontSize: 10, color: 'var(--muted)', marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: '.5px',
      }}>
        Beispiele
      </div>
      {EXAMPLE_QUERIES.map((q, i) => (
        <button key={i} onClick={() => { setQuery(q); setTimeout(() => textRef.current?.focus(), 50) }} style={{
          display: 'block', width: '100%', textAlign: 'left',
          background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '7px 10px', marginBottom: 6,
          color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
          transition: 'all .15s', fontFamily: 'inherit', lineHeight: 1.4,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)' }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
