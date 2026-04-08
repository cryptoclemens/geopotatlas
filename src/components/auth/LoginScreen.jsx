import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLangStore } from '../../store/useLangStore'
import { t } from '../../lib/i18n'

export default function LoginScreen() {
  const lang = useLangStore(s => s.lang)
  const toggleLang = useLangStore(s => s.toggleLang)

  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [status, setStatus]     = useState('idle')
  const [msg, setMsg]           = useState('')

  function switchMode(m) { setMode(m); setMsg(''); setName('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.href },
        })
        if (error) throw error
        setStatus('success')
        setMsg(t('login.success.magic', lang))
        return
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Save display_name to profiles after signup
        if (name.trim() && data.user) {
          await supabase.from('profiles')
            .upsert({ id: data.user.id, display_name: name.trim() })
        }
        setStatus('success')
        setMsg(t('login.success.signup', lang))
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
        <div style={{
          padding: '28px 28px 20px', borderBottom: '1px solid rgba(91,175,214,.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#22d3ee',
              fontFamily: "'Georgia',serif", letterSpacing: '-.3px', marginBottom: 4 }}>
              Geopotatlas
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: '1px' }}>
              {t(`login.${mode === 'magic' ? 'magic' : mode === 'signup' ? 'signup' : 'signin'}`, lang)}
            </div>
          </div>
          <button onClick={toggleLang} style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)',
            borderRadius: 5, color: 'var(--muted)', fontSize: 11, padding: '4px 8px',
            cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
          }}>
            {t('lang.toggle', lang)}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 24px' }}>
          {mode === 'signup' && (
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('login.name', lang)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
            />
          )}
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t('login.email', lang)} required
            style={{ ...inputStyle, marginTop: mode === 'signup' ? 10 : 0 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
          />
          {mode !== 'magic' && (
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={t('login.password', lang)} required minLength={6}
              style={{ ...inputStyle, marginTop: 10 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
            />
          )}

          {msg && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12,
              background: status === 'error' ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)',
              border: `1px solid ${status === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`,
              color: status === 'error' ? '#fca5a5' : '#86efac', lineHeight: 1.5,
            }}>{msg}</div>
          )}

          {status !== 'success' && (
            <button type="submit" disabled={status === 'loading'} style={{
              width: '100%', marginTop: 16, padding: '10px 0',
              background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              border: 'none', borderRadius: 7, color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', opacity: status === 'loading' ? .6 : 1,
            }}>
              {status === 'loading' ? '…' : t(
                mode === 'login' ? 'login.btn.signin' :
                mode === 'signup' ? 'login.btn.signup' : 'login.btn.magic', lang
              )}
            </button>
          )}
        </form>

        {/* Mode switcher */}
        <div style={{
          padding: '12px 28px 20px', borderTop: '1px solid rgba(91,175,214,.08)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {mode !== 'login'  && <button onClick={() => switchMode('login')}  style={linkBtnStyle}>{t('login.link.signin', lang)}</button>}
          {mode !== 'signup' && <button onClick={() => switchMode('signup')} style={linkBtnStyle}>{t('login.link.signup', lang)}</button>}
          {mode !== 'magic'  && <button onClick={() => switchMode('magic')}  style={linkBtnStyle}>{t('login.link.magic', lang)}</button>}
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
}
