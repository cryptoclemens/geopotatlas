import { useState } from 'react'
import { useUIStore } from '../../store/useUIStore'

const PRINT_OPTIONS = [
  { key: 'fw',     label: 'Fernwärme-Städte' },
  { key: 'dc',     label: 'Rechenzentren (OSM)' },
  { key: 'pp',     label: 'Kraftwerke (OSM)' },
  { key: 'waste',  label: 'Müllverbrennung (OSM)' },
  { key: 'steel',  label: 'Stahlwerke (OSM)' },
  { key: 'wms',    label: 'WMS-Layer (Höffigkeit)' },
]

export default function PrintDialog() {
  const { printDialogOpen, hidePrintDialog } = useUIStore()
  const [selected, setSelected] = useState(['fw', 'dc'])
  const [region, setRegion] = useState('viewport')
  const [quality, setQuality] = useState('standard')
  const [printing, setPrinting] = useState(false)

  if (!printDialogOpen) return null

  function toggleOption(key) {
    setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key])
  }

  function handlePrint() {
    setPrinting(true)
    // Trigger browser print with a small delay for overlay to close
    setTimeout(() => {
      hidePrintDialog()
      window.print()
      setPrinting(false)
    }, 200)
  }

  return (
    <div id="print-dialog-backdrop" onClick={hidePrintDialog}>
      <div id="print-dialog" onClick={e => e.stopPropagation()}>
        <div id="print-dialog-hdr">
          <span>🖨 Karte drucken / exportieren</span>
          <button id="print-dialog-close" onClick={hidePrintDialog}>×</button>
        </div>
        <div id="print-dialog-body">

          <div className="pd-section">
            <div className="pd-section-label">Sichtbare Layer</div>
            <div className="pd-options">
              {PRINT_OPTIONS.map(opt => (
                <label key={opt.key} className="pd-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.key)}
                    onChange={() => toggleOption(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pd-section">
            <div className="pd-section-label">Ausschnitt</div>
            <div className="pd-options">
              {[
                { val: 'viewport', label: 'Aktueller Viewport' },
                { val: 'aktionsraum', label: 'BOWA Aktionsraum' },
                { val: 'nrw', label: 'NRW gesamt' },
              ].map(opt => (
                <label key={opt.val} className="pd-option">
                  <input
                    type="radio"
                    name="region"
                    value={opt.val}
                    checked={region === opt.val}
                    onChange={() => setRegion(opt.val)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pd-section">
            <div className="pd-section-label">Qualität</div>
            <div className="pd-options">
              {[
                { val: 'draft',    label: 'Entwurf (schnell)' },
                { val: 'standard', label: 'Standard' },
                { val: 'hq',       label: 'Hoch (langsam)' },
              ].map(opt => (
                <label key={opt.val} className="pd-option">
                  <input
                    type="radio"
                    name="quality"
                    value={opt.val}
                    checked={quality === opt.val}
                    onChange={() => setQuality(opt.val)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pd-hint">
            💡 Tipp: Für beste Ergebnisse Querformat und „Hintergrundgrafiken drucken" aktivieren.
          </div>
        </div>
        <div id="print-dialog-footer">
          <button className="pd-btn-cancel" onClick={hidePrintDialog}>Abbrechen</button>
          <button className="pd-btn-print" onClick={handlePrint} disabled={printing}>
            {printing ? 'Drucke…' : '🖨 Drucken'}
          </button>
        </div>
      </div>
    </div>
  )
}
