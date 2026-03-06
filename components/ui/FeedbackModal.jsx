import { useState } from 'react'

// Original Supabase project (same as v5.43 HTML)
const SUPABASE_URL = 'https://uqpdnylqlnnifwmziyer.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGRueWxxbG5uaWZ3bXppeWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzgwOTgsImV4cCI6MjA4ODMxNDA5OH0.ttsDjRn8OPEZC_F3Hew_3rv-aCTjvRJpeTdtmTIfUKI'
const FB_MAIL = 'hello@vencly.com'

const CHIPS = ['UI/Design','Layer-Daten','Performance','Feature-Wunsch','Fehler','Sonstiges']

// Styles replicating original HTML exactly
const panelStyle = {
  position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
  width:340, zIndex:5000,
  background:'#0f1d35', border:'1px solid rgba(90,175,214,0.25)',
  borderRadius:12, overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,.7)',
}
const overlayStyle = {
  position:'fixed', inset:0, zIndex:4900, background:'rgba(0,0,0,.55)',
}
const inputStyle = {
  width:'100%', background:'rgba(22,38,64,.85)',
  border:'1px solid rgba(91,175,214,0.18)', borderRadius:6,
  padding:'7px 10px', color:'#ddeeff', fontSize:11,
  outline:'none', fontFamily:'inherit',
}
const btnStyle = {
  width:'100%', padding:'8px 0', borderRadius:6, border:'none',
  background:'linear-gradient(135deg,#1d6a9e,#2a8ab8)',
  color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer',
}

export default function FeedbackModal() {
  const [open, setOpen]       = useState(false)
  const [message, setMessage] = useState('')
  const [rating, setRating]   = useState(0)
  const [cats, setCats]       = useState([])
  const [status, setStatus]   = useState('idle')

  function toggleCat(c) {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const payload = {
      page: '/geopotaltals/',
      stars: rating,
      categories: cats,
      message,
      lang: navigator.language || 'de',
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setStatus('ok')
      setTimeout(() => {
        setOpen(false)
        setMessage(''); setRating(0); setCats([]); setStatus('idle')
      }, 1800)
    } catch (err) {
      // Fallback: open mailto
      const body = encodeURIComponent(`Feedback (${rating}★ / ${cats.join(', ')}): ${message}`)
      window.open(`mailto:${FB_MAIL}?subject=Geothermie-Atlas Feedback&body=${body}`)
      setStatus('err')
    }
  }

  return (
    <>
      {/* Pill button */}
      <button id="fb-tab" onClick={() => setOpen(true)}>
        <span>✉</span> Feedback geben
      </button>

      {/* Overlay (no backdrop-filter to avoid stacking context bug) */}
      {open && <div style={overlayStyle} onClick={() => setOpen(false)} />}

      {/* Modal panel */}
      {open && (
        <div style={panelStyle}>
          <div style={{background:'linear-gradient(90deg,#1d3a5e,#1d6a9e)',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:13}}>✉ Feedback geben</span>
            <button onClick={() => setOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>
          </div>
          {status === 'ok' ? (
            <div style={{padding:'32px 18px',textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>✓</div>
              <div style={{fontSize:13,color:'#5bd68a',fontWeight:600}}>Feedback gesendet – vielen Dank!</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:10}}>
              {/* Stars */}
              <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    style={{background:'none',border:'none',fontSize:20,cursor:'pointer',
                      color:s<=rating?'#f0c040':'rgba(255,255,255,.2)',transition:'transform .1s'}}
                  >★</button>
                ))}
              </div>
              {/* Category chips */}
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {CHIPS.map(c => (
                  <button key={c} type="button" onClick={() => toggleCat(c)}
                    style={{
                      padding:'3px 9px', borderRadius:12, fontSize:10, cursor:'pointer',
                      border:`1px solid ${cats.includes(c) ? '#5bafd6' : 'rgba(91,175,214,.25)'}`,
                      background: cats.includes(c) ? 'rgba(91,175,214,.2)' : 'transparent',
                      color: cats.includes(c) ? '#ddeeff' : '#7a9ab8',
                    }}
                  >{c}</button>
                ))}
              </div>
              <textarea value={message} onChange={e=>setMessage(e.target.value)}
                placeholder="Ihr Feedback…" required rows={4}
                style={{...inputStyle, resize:'none'}} />
              {status==='err' && (
                <div style={{fontSize:10,color:'#e8a857',textAlign:'center'}}>
                  Supabase nicht erreichbar — E-Mail-Fallback geöffnet.
                </div>
              )}
              <button type="submit" disabled={status==='sending'} style={{...btnStyle,opacity:status==='sending'?.6:1}}>
                {status==='sending'?'Sende…':'Absenden →'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
