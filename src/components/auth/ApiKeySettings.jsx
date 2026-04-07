import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

const PROVIDERS = [
  { key: 'claude',     label: 'Claude (Anthropic)', placeholder: 'sk-ant-api03-…' },
  { key: 'perplexity', label: 'Perplexity AI',       placeholder: 'pplx-…' },
]

export default function ApiKeySettings({ onClose, isFirstLogin = false }) {
  const profile    = useAuthStore(s => s.profile)
  const saveApiKey = useAuthStore(s => s.saveApiKey)
  const signOut    = useAuthStore(s => s.signOut)
  const user       = useAuthStore(s => s.user)

  const [provider, setProvider] = useState(profile?.preferred_provider || 'claude')
  const [key, setKey]           = useState(profile?.claude_api_key || '')
  const [status, setStatus]     = useState('idle')

  async function handleSave(e) {
    e.preventDefault()
    setStatus('saving')
    await saveApiKey(key.trim(), provider)
    setStatus('saved')
    setTimeout(() => { setStatus('idle'); if (isFirstLogin) onClose() }, 1200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6000,
    }}>
      <div style={{
        width: 360, background: '#0f1d35',
        border: '1px solid rgba(91,175,214,.2)', borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,.7)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(91,175,214,.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {isFirstLogin ? '✦ Geopotatlas Pro einrichten' : 'API-Key Einstellungen'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {user?.email}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '20px' }}>
          {/* Provider selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: '.5px', marginBottom: 8 }}>KI-Anbieter</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PROVIDERS.map(p => (
                <button key={p.key} type="button"
                  onClick={() => setProvider(p.key)}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid',
                    borderColor: provider === p.key ? 'var(--accent)' : 'var(--border)',
                    background: provider === p.key ? 'rgba(14,165,233,.1)' : 'transparent',
                    color: provider === p.key ? 'var(--accent)' : 'var(--muted)',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: '.5px', marginBottom: 8 }}>API-Key</div>
            <input
              type="password" value={key} onChange={e => setKey(e.target.value)}
              placeholder={PROVIDERS.find(p => p.key === provider)?.placeholder}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(91,175,214,.2)', borderRadius: 6,
                padding: '9px 12px', color: 'var(--text)', fontSize: 12,
                fontFamily: 'monospace', outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
            />
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>
              Wird verschlüsselt in deinem Profil gespeichert.
              {provider === 'claude' && <> Hol dir einen Key auf <a href="https://console.anthropic.com"
                target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>console.anthropic.com</a>.</>}
            </div>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '9px 0', borderRadius: 6, border: 'none',
            background: status === 'saved'
              ? 'rgba(34,197,94,.8)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
            color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background .3s',
          }}>
            {status === 'saving' ? '…' : status === 'saved' ? '✓ Gespeichert' : 'Speichern'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'center', gap: 20 }}>
          {isFirstLogin && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Später einrichten
            </button>
          )}
          <button onClick={signOut} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Abmelden
          </button>
        </div>
      </div>
    </div>
  )
}
