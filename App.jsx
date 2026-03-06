import MapView from './components/map/MapView'
import Sidebar from './components/sidebar/Sidebar'
import Legend from './components/ui/Legend'
import InfoPanel from './components/ui/InfoPanel'
import FeedbackModal from './components/ui/FeedbackModal'
import Loader from './components/ui/Loader'
import OsmSpinner from './components/ui/OsmSpinner'
import BootLog from './components/ui/BootLog'
import StatListPanel from './components/ui/StatListPanel'
import PrintDialog from './components/ui/PrintDialog'
import PwScreen from './components/ui/PwScreen'
import WelcomeOverlay from './components/ui/WelcomeOverlay'
import GuidedTour from './components/ui/GuidedTour'
import { useUIStore } from './store/useUIStore'

// Injected at build time via vite.config.js → define: { __APP_VERSION__ }
// Bump package.json version for each release
// eslint-disable-next-line no-undef
const VERSION = `v${__APP_VERSION__}`

function StatTile({ statKey, label, title }) {
  const statCounts = useUIStore(s => s.statCounts)
  const heatMarkers = useUIStore(s => s.heatMarkers)
  const showStatList = useUIStore(s => s.showStatList)
  const val = statCounts[statKey]

  function handleClick() {
    // Map stat key to heat layer key
    const layerMap = { dc: 'heat-dc', pp: 'heat-pp', abw: 'heat-abw', fw: null }
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
  const pwPassed = useUIStore(s => s.pwPassed)
  const showPrintDialog = useUIStore(s => s.showPrintDialog)

  // Show PW screen if not passed
  if (!pwPassed) return <PwScreen />

  return (
    <>
      {/* ── Loader (initial) ─────────────────── */}
      <Loader />

      {/* ── Welcome Overlay (first visit) — guard is inside component ── */}
      <WelcomeOverlay />

      {/* ── Guided Tour ─────────────────────── */}
      <GuidedTour />

      {/* ── Header ─────────────────────────── */}
      <header>
        <div className="hdr-left">
          {/* Vencly Logo */}
          <a href="https://www.vencly.com" target="_blank" rel="noopener" className="logo-link">
            <img src="vencly.png" className="logo-img" alt="Venclÿ" />
          </a>
          {/* Title */}
          <div className="hdr-title">
            <h1>Geothermie-Skalierungspotenzial {VERSION}</h1>
            <p>Live-Daten · Nordeuropäisches Tiefland · Fernwärme · Wärmeproduzenten</p>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="hdr-stats">
          <span className="potentiale-label">Potentiale</span>
          <StatTile statKey="dc"  label="Rechenzentren"  title="Rechenzentren im Ausschnitt" />
          <StatTile statKey="pp"  label="Kraftwerke/Ind." title="Kraftwerke/Industrie im Ausschnitt" />
          <StatTile statKey="abw" label="Abwärme (BfEE)" title="BfEE-Abwärmestandorte im Ausschnitt" />
          <StatTile statKey="fw"  label="FW-Städte >20%" title="Fernwärme-Städte >20% im Ausschnitt" />
          <button
            className="print-btn-hdr"
            title="Drucken / Exportieren"
            onClick={showPrintDialog}
          >🖨</button>
        </div>
      </header>

      {/* ── Map + overlaid panels ───────────────── */}
      <div id="map-wrap">
        <MapView />
        <Sidebar />
        <InfoPanel />
        <Legend />
        {/* OSM Spinner */}
        <OsmSpinner />
        {/* Boot Log */}
        <BootLog />
        {/* powered by Vencly */}
        <div className="powered-by">
          powered by <a href="https://www.vencly.com" target="_blank" rel="noopener">Venclÿ</a>
        </div>
      </div>

      {/* ── Modals / Overlays ──────────────────── */}
      <FeedbackModal />
      <StatListPanel />
      <PrintDialog />
    </>
  )
}
