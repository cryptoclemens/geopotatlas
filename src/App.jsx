import { useState, useEffect } from 'react'
import MapView from './components/map/MapView'
import Sidebar from './components/sidebar/Sidebar'
import ProView from './components/pro/ProView'
import Legend from './components/ui/Legend'
import InfoPanel from './components/ui/InfoPanel'
import FeedbackModal from './components/ui/FeedbackModal'
import Loader from './components/ui/Loader'
import OsmSpinner from './components/ui/OsmSpinner'
import BootLog from './components/ui/BootLog'
import StatListPanel from './components/ui/StatListPanel'
import PrintDialog from './components/ui/PrintDialog'
import WelcomeOverlay from './components/ui/WelcomeOverlay'
import GuidedTour from './components/ui/GuidedTour'
import LoginScreen from './components/auth/LoginScreen'
import ApiKeySettings from './components/auth/ApiKeySettings'
import { useUIStore } from './store/useUIStore'
import { useAuthStore } from './store/useAuthStore'
import { useLangStore } from './store/useLangStore'
import { t } from './lib/i18n'
import { FW_CITIES } from './data/fwCities'

// Injected at build time via vite.config.js → define: { __APP_VERSION__ }
// eslint-disable-next-line no-undef
const VERSION = `v${__APP_VERSION__}`

function StatTile({ statKey, label, title }) {
  const statCounts = useUIStore(s => s.statCounts)
  const heatMarkers = useUIStore(s => s.heatMarkers)
  const showStatList = useUIStore(s => s.showStatList)
  const val = statCounts[statKey]

  function handleClick() {
    if (statKey === 'fw') {
      const bounds = window._map?.getBounds()
      const cities = bounds
        ? FW_CITIES.filter(c => c.dh >= 20 && bounds.contains([c.lat, c.lng]))
        : FW_CITIES.filter(c => c.dh >= 20)
      const items = cities.map(c => ({ name: c.n, lat: c.lat, lng: c.lng, tags: { operator: c.op } }))
      showStatList('fw', items)
      return
    }
    const layerMap = { dc: 'heat-dc', pp: 'heat-pp', abw: 'heat-abw' }
    const layerKey = layerMap[statKey]
    const items = layerKey ? (heatMarkers[layerKey] || []) : []
    showStatList(statKey, items)
  }

  return (
    <div className="stat stat-clickable" title={title} onClick={handleClick}>
      <div className="stat-v">{val !== null && val !== undefined ? val : '—'}</div>
      <div className="stat-l">im Ausschnitt<br /><small style={{opacity:.7}}>{label}</small></div>
    </div>
  )
}

export default function App() {
  const showPrintDialog = useUIStore(s => s.showPrintDialog)
  const [view, setView]           = useState('map')
  const [showSettings, setShowSettings] = useState(false)

  const { user, loading, init, profile } = useAuthStore()
  const lang       = useLangStore(s => s.lang)
  const toggleLang = useLangStore(s => s.toggleLang)
  const hasApiKey  = Boolean(profile?.claude_api_key)
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)

  useEffect(() => { init() }, []) // eslint-disable-line

  // Show API key prompt once after login if no key is set
  useEffect(() => {
    if (!user || loading) return
    const dismissed = localStorage.getItem('gpa_api_key_dismissed')
    if (!hasApiKey && !dismissed) setShowApiKeyPrompt(true)
  }, [user, hasApiKey, loading])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:'#09152a',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--muted)', fontSize:13 }}>
      ···
    </div>
  )

  if (!user) return <LoginScreen />

  return (
    <>
      <Loader />
      <WelcomeOverlay />
      <GuidedTour />

      {/* ── Header ── */}
      <header>
        <div className="hdr-left">
          <a href="https://www.vencly.com" target="_blank" rel="noopener" className="logo-link">
            <img src="vencly.png" className="logo-img" alt="Venclÿ" />
          </a>
          <div className="hdr-title">
            <h1>Geothermie-Skalierungspotenzial {VERSION}</h1>
            <p>Live-Daten · Nordeuropäisches Tiefland · Fernwärme · Wärmeproduzenten</p>
          </div>
        </div>

        {/* View tabs */}
        <div className="hdr-tabs">
          <button className={`hdr-tab${view==='map' ? ' active' : ''}`} onClick={() => setView('map')}>
            {t('tab.map', lang)}
          </button>
          <button
            className={`hdr-tab${view==='pro' ? ' active' : ''}`}
            onClick={() => {
              if (!hasApiKey) { setShowApiKeyPrompt(true) }
              else setView('pro')
            }}
            title={!hasApiKey ? t('pro.hint', lang) : ''}
            style={{ opacity: hasApiKey ? 1 : 0.45, position: 'relative' }}
          >
            {t('tab.pro', lang)}
            {!hasApiKey && <span style={{ fontSize: 8, marginLeft: 3, verticalAlign: 'super' }}>🔒</span>}
          </button>
        </div>

        {/* Stat tiles + user button */}
        <div className="hdr-stats">
          <span className="potentiale-label">Potentiale</span>
          <StatTile statKey="dc"  label="Rechenzentren"   title="Rechenzentren im Ausschnitt" />
          <StatTile statKey="pp"  label="Kraftwerke/Ind." title="Kraftwerke/Industrie im Ausschnitt" />
          <StatTile statKey="abw" label="Abwärme (BfEE)"  title="BfEE-Abwärmestandorte im Ausschnitt" />
          <StatTile statKey="fw"  label="FW-Städte >20%"  title="Fernwärme-Städte >20% im Ausschnitt" />
          <button className="print-btn-hdr" title="Drucken / Exportieren" onClick={showPrintDialog}>🖨</button>
          <button
            onClick={toggleLang}
            title="Sprache wechseln / Switch language"
            style={{
              background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)',
              borderRadius: 5, color: 'var(--muted)', fontSize: 10, padding: '3px 7px',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >{t('lang.toggle', lang)}</button>
          <button
            className="print-btn-hdr"
            title={`Eingeloggt als ${user.email}`}
            onClick={() => setShowSettings(true)}
            style={{ fontSize: 14 }}
          >⚙</button>
        </div>
      </header>

      {/* ── Map + overlaid panels ── */}
      <div id="map-wrap">
        <MapView />
        {view === 'map' ? <Sidebar /> : (
          <div id="side" style={{ overflowY: 'auto' }}>
            <ProView />
          </div>
        )}
        <InfoPanel />
        <Legend />
        <OsmSpinner />
        <BootLog />
        <div className="powered-by">
          powered by <a href="https://www.vencly.com" target="_blank" rel="noopener">Venclÿ</a>
        </div>
      </div>

      {/* ── Modals ── */}
      <FeedbackModal />
      <StatListPanel />
      <PrintDialog />
      {showSettings && <ApiKeySettings onClose={() => setShowSettings(false)} />}
      {showApiKeyPrompt && !showSettings && (
        <ApiKeySettings
          isFirstLogin
          onClose={() => {
            localStorage.setItem('gpa_api_key_dismissed', '1')
            setShowApiKeyPrompt(false)
          }}
        />
      )}
    </>
  )
}
