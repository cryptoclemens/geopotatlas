import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/useUIStore'

const CORRECT_PW = 'BOWA2026'
const LS_KEY = 'bowa_pw_ok'

export default function PwScreen() {
  const setPwPassed = useUIStore(s => s.setPwPassed)
  const [val, setVal] = useState('')
  const [error, setError] = useState(false)
  const [fading, setFading] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem(LS_KEY) === '1') setPwPassed()
  }, [setPwPassed])

  function submit(e) {
    e.preventDefault()
    if (val === CORRECT_PW) {
      localStorage.setItem(LS_KEY, '1')
      setFading(true)
      setTimeout(setPwPassed, 320)
    } else {
      setError(true)
      setVal('')
      setTimeout(() => setError(false), 1400)
    }
  }

  return (
    <div id="pw-screen" style={{ opacity: fading ? 0 : 1, transition: 'opacity .3s' }}>
      <div id="pw-box">
        <div className="pw-logo">🌍</div>
        <div className="pw-title">Geothermie-Potential-Atlas</div>
        <div className="pw-sub">Internes Tool — bitte Passwort eingeben</div>
        <form onSubmit={submit}>
          <input
            id="pw-input"
            type="password"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Passwort…"
            autoFocus
            className={error ? 'pw-shake' : ''}
          />
          {error && <div id="pw-error">Falsches Passwort</div>}
          <button id="pw-btn" type="submit">Einloggen →</button>
        </form>
      </div>
    </div>
  )
}
