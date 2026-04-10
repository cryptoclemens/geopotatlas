import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useLangStore } from '../../store/useLangStore'
import { t } from '../../lib/i18n'

const PROVIDERS = [
  { key: 'claude',     label: 'Claude',     placeholder: 'sk-ant-api03-…' },
  { key: 'copilot',    label: 'MS Copilot', placeholder: 'Bearer ey…' },
  { key: 'perplexity', label: 'Perplexity', placeholder: 'pplx-…' },
]

export default function ApiKeySettings({ onClose, isFirstLogin = false }) {
  const lang       = useLangStore(s => s.lang)
  const profile    = useAuthStore(s => s.profile)
  const saveApiKey = useAuthStore(s => s.saveApiKey)
  const saveProfile = useAuthStore(s => s.saveProfile)
  const signOut    = useAuthStore(s => s.signOut)
  const user       = useAuthStore(s => s.user)

  const [tab, setTab]           = useState('api')
  const [provider, setProvider] = useState(profile?.preferred_provider || 'claude')
  const [key, setKey]           = useState(profile?.claude_api_key || '')
  const [apiStatus, setApiStatus] = useState('idle') // idle|saving|testing|ok|fail|error

  // Profile tab state
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [email, setEmail]             = useState(user?.email || '')
  const [newPw, setNewPw]             = useState('')
  const [profStatus, setProfStatus]   = useState('idle')
  const [profErr, setProfErr]         = useState('')

  async function handleSaveApiKey(e) {
    e.preventDefault()
    setApiStatus('testing')
    const { error, keyValid } = await saveApiKey(key.trim(), provider)
    if (error) { setApiStatus('error'); return }
    if (!keyValid) { setApiStatus('fail'); return }
    setApiStatus('ok')
    setTimeout(() => { setApiStatus('idle'); if (isFirstLogin) onClose() }, 1500)
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfStatus('saving')
    setProfErr('')
    const err = await saveProfile({
      display_name: displayName.trim() || undefined,
      email: email !== user?.email ? email : undefined,
      password: newPw.trim() || undefined,
    })
    if (err) { setProfErr(err); setProfStatus('idle'); return }
    setProfStatus('saved')
    setTimeout(() => setProfStatus('idle'), 1500)
  }

  const apiLabel =
    apiStatus === 'testing' ? t('settings.testing', lang) :
    apiStatus === 'ok'      ? t('settings.keyok', lang) :
    apiStatus === 'fail'    ? t('settings.keyfail', lang) :
    apiStatus === 'saving'  ? t('settings.saving', lang) :
    t('settings.save', lang)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6000,
    }}>
      <div style={{
        width: 380, background: '#0f1d35',
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
              {isFirstLogin ? t('pro.setup', lang) : t('settings.title', lang)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Tabs (hidden when isFirstLogin) */}
        {!isFirstLogin && (
          <div style={{
            display: 'flex', borderBottom: '1px solid rgba(91,175,214,.1)',
          }}>
            {['api', 'profile'].map(k => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                borderBottom: tab === k ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === k ? 'var(--accent)' : 'var(--muted)',
                fontSize: 12, fontWeight: tab === k ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}>
                {k === 'api' ? t('settings.tab.api', lang) : t('settings.tab.profile', lang)}
              </button>
            ))}
          </div>
        )}

        {/* API Key tab */}
        {(tab === 'api' || isFirstLogin) && (
          <form onSubmit={handleSaveApiKey} style={{ padding: '20px' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '.5px', marginBottom: 8 }}>{t('settings.provider', lang)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {PROVIDERS.map(p => (
                  <button key={p.key} type="button" onClick={() => setProvider(p.key)} style={{
                    flex: 1, padding: '7px 6px', borderRadius: 6, border: '1px solid',
                    borderColor: provider === p.key ? 'var(--accent)' : 'var(--border)',
                    background: provider === p.key ? 'rgba(14,165,233,.1)' : 'transparent',
                    color: provider === p.key ? 'var(--accent)' : 'var(--muted)',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '.5px', marginBottom: 8 }}>{t('settings.apikey', lang)}</div>
              <input
                type="password" value={key} onChange={e => setKey(e.target.value)}
                placeholder={PROVIDERS.find(p => p.key === provider)?.placeholder}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(91,175,214,.2)', borderRadius: 6,
                  padding: '9px 12px', color: 'var(--text)', fontSize: 12,
                  fontFamily: 'monospace', outline: 'none', transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
              />
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>
                {t('settings.encrypted', lang)}{' '}
                {provider === 'claude'     && <a href="https://console.anthropic.com" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>console.anthropic.com</a>}
                {provider === 'copilot'    && <a href="https://copilot.microsoft.com" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>Microsoft Copilot Studio</a>}
                {provider === 'perplexity' && <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>perplexity.ai/settings/api</a>}
              </div>
            </div>

            {apiStatus === 'fail' && (
              <div style={{
                marginBottom: 10, padding: '7px 10px', borderRadius: 6, fontSize: 11,
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                color: '#fca5a5',
              }}>{t('settings.keyfail', lang)}</div>
            )}
            {apiStatus === 'error' && (
              <div style={{
                marginBottom: 10, padding: '7px 10px', borderRadius: 6, fontSize: 11,
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                color: '#fca5a5',
              }}>Speicherfehler – bitte erneut versuchen.</div>
            )}

            <button type="submit" disabled={['saving','testing','ok'].includes(apiStatus)} style={{
              width: '100%', padding: '9px 0', borderRadius: 6, border: 'none',
              background: apiStatus === 'ok'
                ? 'rgba(34,197,94,.8)'
                : apiStatus === 'fail'
                ? 'rgba(239,68,68,.7)'
                : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background .3s',
            }}>
              {apiLabel}
            </button>
          </form>
        )}

        {/* Profile tab */}
        {tab === 'profile' && !isFirstLogin && (
          <form onSubmit={handleSaveProfile} style={{ padding: '20px' }}>
            {[
              { label: t('settings.name', lang),  value: displayName, set: setDisplayName, type: 'text',     auto: 'name' },
              { label: t('settings.email', lang),  value: email,       set: setEmail,       type: 'email',    auto: 'email' },
              { label: t('settings.newpw', lang),  value: newPw,       set: setNewPw,       type: 'password', auto: 'new-password' },
            ].map(({ label, value, set, type, auto }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
                  letterSpacing: '.5px', marginBottom: 6 }}>{label}</div>
                <input
                  type={type} value={value} onChange={e => set(e.target.value)}
                  autoComplete={auto}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(91,175,214,.2)', borderRadius: 6,
                    padding: '9px 12px', color: 'var(--text)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(91,175,214,.2)'}
                />
              </div>
            ))}

            {profErr && (
              <div style={{
                marginBottom: 10, padding: '7px 10px', borderRadius: 6, fontSize: 11,
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                color: '#fca5a5',
              }}>{profErr}</div>
            )}

            <button type="submit" disabled={profStatus === 'saving'} style={{
              width: '100%', padding: '9px 0', borderRadius: 6, border: 'none',
              background: profStatus === 'saved'
                ? 'rgba(34,197,94,.8)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background .3s',
            }}>
              {profStatus === 'saving' ? '…' : profStatus === 'saved' ? t('settings.saved', lang) : t('settings.save', lang)}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'center', gap: 24 }}>
          {isFirstLogin && (
            <button onClick={onClose} style={footerBtnStyle}>
              {t('settings.later', lang)}
            </button>
          )}
          <button onClick={signOut} style={footerBtnStyle}>
            {t('settings.signout', lang)}
          </button>
        </div>
      </div>
    </div>
  )
}

const footerBtnStyle = {
  background: 'none', border: 'none', color: 'var(--muted)',
  fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
}
