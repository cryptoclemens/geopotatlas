import { useUIStore } from '../../store/useUIStore'

export default function WelcomeOverlay() {
  const { setWelcomeSeen, startTour } = useUIStore()

  function handleTour() {
    setWelcomeSeen()
    startTour()
  }

  return (
    <div id="welcome-overlay">
      <div id="welcome-box">
        <div className="wm-badge">BOWA</div>
        <div className="wm-title">Geothermie-Marktanalyse<br />Europa</div>
        <div className="wm-body">
          Diese Karte unterstützt die strategische Expansionsplanung von <strong>BOWA</strong>{' '}
          über das Rheinische Revier hinaus.<br /><br />
          Sie überlagert <strong>geologische Bohrbedingungen</strong> (Lockergestein),{' '}
          <strong>bestehende Fernwärme-Infrastruktur</strong> und{' '}
          <strong>industrielle Wärmequellen</strong> — und zeigt, wo Geothermie-Projekte
          besonders wirtschaftlich realisierbar sind.
        </div>
        <div className="wm-actions">
          <button className="wm-btn wm-btn-ok" onClick={setWelcomeSeen}>Verstanden</button>
          <button className="wm-btn wm-btn-tour" onClick={handleTour}>Gib mir eine Tour →</button>
        </div>
      </div>
    </div>
  )
}
