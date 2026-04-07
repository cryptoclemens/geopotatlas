import { useState, useEffect } from 'react'
import { CircleMarker, Tooltip, Popup } from 'react-leaflet'
import { useLayerStore } from '../../store/useLayerStore'

let _cache = null

function demandColor(mwh) {
  if (mwh >= 500_000) return '#dc2626'   // sehr groß  ≥500 GWh
  if (mwh >= 100_000) return '#f97316'   // groß       100–500 GWh
  if (mwh >= 20_000)  return '#facc15'   // mittel     20–100 GWh
  if (mwh >= 2_000)   return '#86efac'   // klein      2–20 GWh
  return '#94a3b8'                        // sehr klein  <2 GWh
}

function radius(mwh) {
  if (mwh >= 500_000) return 10
  if (mwh >= 100_000) return 7
  if (mwh >= 20_000)  return 5
  return 4
}

export default function AixDhnLayer() {
  const enabled = useLayerStore(s => s.layers['aix-dhn'])
  const [data, setData] = useState(_cache)

  useEffect(() => {
    if (!enabled || _cache) return
    fetch('/geopotatlas/geodata/aix-dhn-centroids.json')
      .then(r => r.json())
      .then(d => { _cache = d; setData(d) })
      .catch(() => {})
  }, [enabled])

  if (!enabled || !data) return null

  return data.map((n, i) => {
    const c = demandColor(n.demand_mwh)
    const r = radius(n.demand_mwh)
    return (
      <CircleMarker
        key={i}
        center={[n.lat, n.lon]}
        radius={r}
        pathOptions={{ color: c, fillColor: c, fillOpacity: 0.7, weight: 1.5 }}
      >
        <Tooltip direction="top" offset={[0, -r - 2]} opacity={0.97}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 3 }}>
            🔥 {n.gen}
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>{n.lan}</div>
          <div style={{ color: c, fontWeight: 700 }}>{n.demand_label}</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>
            {n.households.toLocaleString('de-DE')} Haushalte · {n.share_dh}% via FW
          </div>
          <div style={{ fontSize: 9, opacity: 0.45, marginTop: 3 }}>Klick für Details</div>
        </Tooltip>
        <Popup maxWidth={340} minWidth={280}>
          <div className="det-popup">
            <div className="det-header" style={{ borderLeft: `3px solid ${c}`, padding: '16px 36px 12px 16px' }}>
              <div className="det-title">🔥 {n.gen}</div>
              <div className="det-op">Fernwärmenetz · {n.lan}</div>
            </div>
            <div className="det-body">
              <div className="det-row">
                <span className="det-k">Wärmebedarf</span>
                <span className="det-v" style={{ color: c, fontWeight: 700 }}>{n.demand_label}</span>
              </div>
              <div className="det-row">
                <span className="det-k">Haushalte</span>
                <span className="det-v">{n.households.toLocaleString('de-DE')}</span>
              </div>
              <div className="det-row">
                <span className="det-k">FW-Anteil</span>
                <span className="det-v">{n.share_dh} %</span>
              </div>
              <div className="det-disclaimer">
                Quelle: AixDHN · RWTH Aachen (RWTH-EBC) · Zensus 2022
              </div>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    )
  })
}
