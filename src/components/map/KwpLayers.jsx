import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import { useLayerStore } from '../../store/useLayerStore'
import { useUIStore } from '../../store/useUIStore'

const ENERGIETRAEGER_COLORS = {
  'Erdgas':      '#f97316',
  'Fernwärme':   '#22d3ee',
  'Heizöl':      '#a78bfa',
  'Wärmepumpe':  '#4ade80',
  'Holz':        '#a16207',
  'Kohle':       '#6b7280',
  'Strom':       '#facc15',
}
const ET_DEFAULT = '#94a3b8'

const EIGNUNG_COLORS = { 1: '#22c55e', 2: '#f59e0b', 3: '#94a3b8' }

function energietraegerStyle(feature) {
  const color = ENERGIETRAEGER_COLORS[feature.properties?.ENERGIETRAEGER] || ET_DEFAULT
  return { color, fillColor: color, fillOpacity: 0.35, weight: 1.5, opacity: 0.8 }
}

function waermeclusterStyle(feature) {
  const color = EIGNUNG_COLORS[feature.properties?.EIGNUNGSKLASSE] || EIGNUNG_COLORS[3]
  return { color, fillColor: color, fillOpacity: 0.3, weight: 2, opacity: 0.85 }
}

function row(label, value) {
  return `<div class="det-row"><span class="det-k">${label}</span><span class="det-v">${value}</span></div>`
}

function energietraegerPopupHtml(p) {
  const color = ENERGIETRAEGER_COLORS[p.ENERGIETRAEGER] || ET_DEFAULT
  const rows = [
    p.ENERGIETRAEGER ? row('Energieträger', p.ENERGIETRAEGER) : '',
    p.ANTEIL_PCT != null ? row('Anteil', `${p.ANTEIL_PCT} %`) : '',
    p.WOHNEINHEITEN != null ? row('Wohneinheiten', Number(p.WOHNEINHEITEN).toLocaleString('de-DE')) : '',
    p.AGS ? row('AGS', p.AGS) : '',
    p.QUELLJAHR ? row('Datenjahr', p.QUELLJAHR) : '',
  ].filter(Boolean).join('')
  return `<div class="det-popup-wrap"><div class="det-popup">
    <div class="det-header" style="border-color:${color}">
      <div class="det-title">🔥 ${p.GEMEINDE || 'Gemeinde'}</div>
      <div class="det-op">KWP Energieträger</div>
    </div>
    <div class="det-body">${rows}
      <div class="det-disclaimer">Quelle: LANUK NRW / opengeodata.nrw.de</div>
    </div>
  </div></div>`
}

function waermeclusterPopupHtml(p) {
  const color = EIGNUNG_COLORS[p.EIGNUNGSKLASSE] || EIGNUNG_COLORS[3]
  const potenzial = p.FERNWAERME_POTENZIAL_MWH_A
  const rows = [
    p.BEZEICHNUNG ? row('Bezeichnung', p.BEZEICHNUNG) : '',
    p.EIGNUNG ? row('FW-Eignung', p.EIGNUNG) : '',
    p.WAERMEDICHTE_MWH_HA != null ? row('Wärmedichte', `${p.WAERMEDICHTE_MWH_HA} MWh/ha`) : '',
    p.FLAECHE_HA != null ? row('Fläche', `${Number(p.FLAECHE_HA).toLocaleString('de-DE')} ha`) : '',
    potenzial != null ? row('FW-Potenzial', `${Math.round(potenzial / 1000).toLocaleString('de-DE')} GWh/a`) : '',
    p.QUELLJAHR ? row('Datenjahr', p.QUELLJAHR) : '',
  ].filter(Boolean).join('')
  return `<div class="det-popup-wrap"><div class="det-popup">
    <div class="det-header" style="border-color:${color}">
      <div class="det-title">♨️ ${p.CLUSTER_ID || 'Cluster'}</div>
      <div class="det-op">KWP Wärmecluster</div>
    </div>
    <div class="det-body">${rows}
      <div class="det-disclaimer">Quelle: LANUK NRW / opengeodata.nrw.de</div>
    </div>
  </div></div>`
}

function KwpGeoJsonLayer({ dataUrl, styleFunc, popupHtmlFn, layerKey }) {
  const [data, setData] = useState(null)
  const { addLog } = useUIStore.getState()

  useEffect(() => {
    fetch(dataUrl)
      .then(r => r.json())
      .then(json => {
        setData(json)
        addLog(`${layerKey}: ${json.features?.length ?? 0} Objekte geladen`, 'ok')
      })
      .catch(() => addLog(`${layerKey}: Ladefehler`, 'error'))
  }, [dataUrl]) // eslint-disable-line

  if (!data) return null

  return (
    <GeoJSON
      key={layerKey}
      data={data}
      style={styleFunc}
      onEachFeature={(feature, layer) => {
        layer.bindPopup(popupHtmlFn(feature.properties || {}), { maxWidth: 300 })
      }}
    />
  )
}

export default function KwpLayers() {
  const layers = useLayerStore(s => s.layers)

  return (
    <>
      {layers['kwp-energietraeger'] && (
        <KwpGeoJsonLayer
          dataUrl="geodata/kwp-energietraeger.geojson"
          styleFunc={energietraegerStyle}
          popupHtmlFn={energietraegerPopupHtml}
          layerKey="kwp-energietraeger"
        />
      )}
      {layers['kwp-waermecluster'] && (
        <KwpGeoJsonLayer
          dataUrl="geodata/kwp-waermecluster.geojson"
          styleFunc={waermeclusterStyle}
          popupHtmlFn={waermeclusterPopupHtml}
          layerKey="kwp-waermecluster"
        />
      )}
    </>
  )
}
