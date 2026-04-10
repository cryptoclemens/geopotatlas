import { useState, useRef } from 'react'
import { useLayerStore } from '../../store/useLayerStore'
import { useAuthStore } from '../../store/useAuthStore'

const EXAMPLE_QUERIES = [
  'Mitteltiefe Geothermie im Lockergestein – potenzielle FW-Abnehmer in NRW',
  'Tiefe Geothermie im Malmkarst – Stadtwerke Bayern mit Ausbauplan',
  'Rechenzentren als Sommerwärme-Kunden für Aquifer-Speicher',
  'Wo gibt es Industrieabwärme neben ungenutzten Aquiferen?',
  'Neue FW-Netze im Ruhrgebiet – wo fehlt noch eine Wärmequelle?',
]

const SYSTEM_PROMPT = `Du bist ein Geothermie-Potenzial-Assistent für Geologen, Hydrologen und Business Developer.

Verfügbare Datenlayer in der App (layer keys):
- tiefland-plain: Norddeutsches Lockergestein (Aquifer)
- aq-niederrhein: Niederrhein-Aquifer (Primärziel BOWA)
- aq-norddeutsch: Norddeutscher Aquifer
- aq-molasse: Malmkarst / Molasse Bayern
- aq-oberrhein: Buntsandstein Oberrhein
- fw-cities-hi/mid/lo: Bestehende Fernwärme-Städte (nach FW-Anteil)
- fw-expand: Städte mit FW-Ausbauplänen
- fw-new: Städte mit geplantem FW-Neubau
- aix-dhn: 8684 Fernwärmenetze Deutschland (RWTH Aachen)
- kwp-energietraeger: TG-Potenzial Raster NRW (LANUK)
- kwp-waermecluster: FW-Ausbaucluster NRW (LANUK)
- heat-dc: Rechenzentren (OSM)
- heat-pp: Kraftwerke (OSM)
- heat-waste: Müllverbrennung (OSM)
- heat-steel: Stahlwerke (OSM)
- heat-abw: Industrieabwärme (BfEE)
- heat-fw: Fernwärme-Heizwerke (OSM)
- geo-bgr: Geologie WMS (BGR)
- waerme-wms: Zensus 2022 Heizungsart

Antworte IMMER als valides JSON (kein Markdown, kein Text davor/danach):
{
  "location": { "name": "Stadtname/Region", "lat": 51.5, "lng": 7.0, "zoom": 9 },
  "layers": ["layer-key-1", "layer-key-2"],
  "headline": "Kurze Einschätzung in 1 Satz",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "contacts": [
    { "name": "Stadtwerke XY", "type": "FW-Abnehmer", "detail": "180 km Netz, Ausbau bis 2040" }
  ],
  "warning": "Optionaler Hinweis auf Risiken oder fehlende Daten"
}`

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
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  // Robustly extract JSON object from response (handles fences + extra text)
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Keine JSON-Antwort erhalten')
  return JSON.parse(match[0])
}

function ResultCard({ result, onReset }) {
  const toggle = useLayerStore(s => s.setGroup)

  // Activate suggested layers on mount
  useState(() => {
    if (result.layers?.length) {
      // Reset all optional layers first, then enable suggested ones
      toggle(result.layers, true)
      // Fly map to suggested location
      if (result.location && window._map) {
        window._map.flyTo(
          [result.location.lat, result.location.lng],
          result.location.zoom || 9,
          { duration: 1.2 }
        )
      }
    }
  })

  return (
    <div style={{ padding: '0 0 12px' }}>
      {/* Headline */}
      <div style={{
        background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.2)',
        borderRadius: 8, padding: '10px 14px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
          🤖 KI-Analyse
        </div>
        <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
          {result.headline}
        </div>
      </div>

      {/* Insights */}
      {result.insights?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '0.5px', marginBottom: 6 }}>Erkenntnisse</div>
          {result.insights.map((ins, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              padding: '5px 0', borderBottom: '1px solid rgba(91,175,214,.06)',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
              <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{ins}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contacts */}
      {result.contacts?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '0.5px', marginBottom: 6 }}>Relevante Kontakte</div>
          {result.contacts.map((c, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 10px', marginBottom: 6,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 2 }}>{c.type}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.detail}</div>
            </div>
          ))}
        </div>
      )}

      {/* Warning */}
      {result.warning && (
        <div style={{
          background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
          borderRadius: 6, padding: '8px 10px', marginBottom: 12, fontSize: 11,
          color: '#fcd34d', lineHeight: 1.5,
        }}>
          ⚠ {result.warning}
        </div>
      )}

      {/* Active layers info */}
      {result.layers?.length > 0 && (
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
          ✓ {result.layers.length} Layer aktiviert · Karte zentriert auf {result.location?.name}
        </div>
      )}

      <button onClick={onReset} style={{
        width: '100%', padding: '7px 0', background: 'transparent',
        border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)',
        fontSize: 11, cursor: 'pointer', transition: 'border-color .15s',
      }}
        onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
      >
        ← Neue Anfrage
      </button>
    </div>
  )
}

export default function ProView() {
  const [query, setQuery]   = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error | no-key
  const [result, setResult] = useState(null)
  const [errMsg, setErrMsg] = useState('')
  const textRef = useRef(null)
  const profile = useAuthStore(s => s.profile)
  const apiKey  = profile?.claude_api_key || import.meta.env.VITE_CLAUDE_API_KEY || ''

  async function handleSearch() {
    if (!query.trim()) return
    if (!apiKey) { setStatus('no-key'); return }
    setStatus('loading')
    try {
      const res = await callClaude(query.trim(), apiKey)
      setResult(res)
      setStatus('done')
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  function handleChip(q) {
    setQuery(q)
    setTimeout(() => textRef.current?.focus(), 50)
  }

  function reset() {
    setQuery(''); setStatus('idle'); setResult(null); setErrMsg('')
  }

  return (
    <div style={{ padding: '10px 12px', overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', marginBottom: 2 }}>
          Geopotatlas Pro
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
          Beschreiben Sie Ihr Vorhaben — KI aktiviert die relevanten Layer und zeigt Potenziale.
        </div>
      </div>

      {status !== 'done' && (
        <>
          {/* Textarea */}
          <textarea
            ref={textRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSearch() }}
            placeholder='z.B. „Wir bieten mitteltiefe Geothermie im Lockergestein und suchen Stadtwerke in NRW…"'
            rows={4}
            style={{
              width: '100%', background: 'rgba(255,255,255,.04)',
              border: '1px solid var(--border)', borderRadius: 6,
              padding: '8px 10px', color: 'var(--text)', fontSize: 11,
              fontFamily: 'inherit', resize: 'none', outline: 'none',
              lineHeight: 1.5, marginBottom: 8, boxSizing: 'border-box',
              transition: 'border-color .15s',
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
              fontFamily: 'inherit', marginBottom: 14,
              opacity: !query.trim() ? 0.5 : 1,
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
              color: '#fca5a5',
            }}>
              ✗ Fehler: {errMsg}
            </div>
          )}

          {/* Example chips */}
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '.5px' }}>
            Beispiele
          </div>
          {EXAMPLE_QUERIES.map((q, i) => (
            <button key={i} onClick={() => handleChip(q)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '7px 10px', marginBottom: 6,
              color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
              transition: 'all .15s', fontFamily: 'inherit', lineHeight: 1.4,
            }}
              onMouseEnter={e => { e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--muted)' }}
            >
              {q}
            </button>
          ))}
        </>
      )}

      {status === 'done' && result && (
        <ResultCard result={result} onReset={reset} />
      )}
    </div>
  )
}
