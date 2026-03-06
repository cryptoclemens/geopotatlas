import { useState } from 'react'
import { useUIStore } from '../../store/useUIStore'

const CORRECT_PW = 'BOWA2026'

export default function PwScreen() {
  const setPwPassed = useUIStore(s => s.setPwPassed)
  const [val, setVal] = useState('')
  const [error, setError] = useState(false)
  const [fading, setFading] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (val.trim() === CORRECT_PW) {
      setFading(true)
      setTimeout(setPwPassed, 350)
    } else {
      setError(true)
      setVal('')
      setTimeout(() => setError(false), 1400)
    }
  }

  return (
    <div id="pw-screen" style={{ opacity: fading ? 0 : 1, transition: 'opacity .35s ease' }}>
      <div id="pw-box">
        <div id="pw-logo">
          <span id="pw-logo-geo">Geothermie</span>
          <span id="pw-logo-sub">Potential-Atlas</span>
        </div>
        <div id="pw-subtitle">Internes Tool — Zugang nur mit Passwort</div>
        <form onSubmit={submit}>
          <div id="pw-input-wrap">
            <input
              id="pw-input"
              type="password"
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="Passwort…"
              autoFocus
              className={error ? 'pw-shake' : ''}
            />
            <button id="pw-btn" type="submit">→</button>
          </div>
          {error && <div id="pw-error">❌ Falsches Passwort</div>}
        </form>
      </div>
    </div>
  )
}
