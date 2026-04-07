import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [mode, setMode]       = useState('login')  // login | signup | magic
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]   = useState('idle')   // idle | loading | success | error
  const [msg, setMsg]         = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.href }
        })
        if (error) throw error
        setStatus('success')
        setMsg('Magic Link gesendet – bitte E-Mail prüfen.')
        return
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setStatus('success')
        setMsg('Konto erstellt – bitte E-Mail bestätigen.')
        return
      }
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setMsg(err.message)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#09152a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000, fontFamily: 'inherit',
    }}>
      <div style={{
        width: 360, background: '#0f1d35',
        border: '1px solid rgba(91,175,214,.2)', borderRadius: 14,
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(91,175,214,.1)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22d3ee',
            fontFamily: "'Georgia',serif", letterSpacing: '-.3px', marginBottom: 4 }}>
            Geopotatlas
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '1px' }}>
            {mode === 'login'  ? 'Anmelden' :
             mode === 'signup' ? 'Konto erstellen' : 'Magic Link anfordern'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 24px' }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse" required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
          />

          {mode !== 'magic' && (
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Passwort" required minLength={6}
              style={{ ...inputStyle, marginTop: 10 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
            />
          )}

          {msg && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12,
              background: status === 'error'
                ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)',
              border: `1px solid ${status === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`,
              color: status === 'error' ? '#fca5a5' : '#86efac',
              lineHeight: 1.5,
            }}>{msg}</div>
          )}

          {status !== 'success' && (
            <button type="submit" disabled={status === 'loading'}
              style={{
                width: '100%', marginTop: 16, padding: '10px 0',
                background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
                border: 'none', borderRadius: 7, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: status === 'loading' ? .6 : 1,
              }}>
              {status === 'loading' ? '…' :
               mode === 'login'  ? 'Anmelden →' :
               mode === 'signup' ? 'Konto erstellen →' : 'Magic Link senden →'}
            </button>
          )}
        </form>

        {/* Mode switcher */}
        <div style={{
          padding: '12px 28px 20px', borderTop: '1px solid rgba(91,175,214,.08)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setMsg('') }} style={linkBtnStyle}>
              ← Bereits registriert? Anmelden
            </button>
          )}
          {mode !== 'signup' && (
            <button onClick={() => { setMode('signup'); setMsg('') }} style={linkBtnStyle}>
              Noch kein Konto? Registrieren
            </button>
          )}
          {mode !== 'magic' && (
            <button onClick={() => { setMode('magic'); setMsg('') }} style={linkBtnStyle}>
              Passwort vergessen? Magic Link
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(91,175,214,.2)', borderRadius: 7,
  padding: '9px 12px', color: 'var(--text)', fontSize: 13,
  fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
}

const linkBtnStyle = {
  background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11,
  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0,
  transition: 'color .15s',
}
