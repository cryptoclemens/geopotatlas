import { useEffect } from 'react'
import { WMSTileLayer } from 'react-leaflet'
import { useLayerStore } from '../../store/useLayerStore'
import { useUIStore } from '../../store/useUIStore'
import { WMS_LAYERS } from '../../data/layers'

// Build a GetCapabilities probe URL
function probeUrl(wms) {
  return `${wms.url}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=${wms.params.version || '1.3.0'}`
}

export default function WMSLayers() {
  const layers = useLayerStore(s => s.layers)
  const { setWmsBadge } = useUIStore()

  // Probe each WMS service once on mount
  useEffect(() => {
    Object.entries(WMS_LAYERS).forEach(([key, wms]) => {
      setWmsBadge(key, 'probing')
      const url = probeUrl(wms)
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      fetch(url, { signal: ctrl.signal, mode: 'no-cors' })
        .then(() => setWmsBadge(key, 'live'))
        .catch(() => setWmsBadge(key, 'error'))
        .finally(() => clearTimeout(timer))
    })
  }, []) // eslint-disable-line

  return (<>
    {Object.entries(WMS_LAYERS).map(([key, wms]) =>
      layers[key] && (
        <WMSTileLayer
          key={key}
          url={wms.url}
          layers={wms.params.layers}
          format={wms.params.format}
          transparent={wms.params.transparent}
          version={wms.params.version}
          opacity={wms.opacity}
          attribution={wms.attribution || `© BGR · ${key}`}
          eventHandlers={{
            tileerror: () => setWmsBadge(key, 'error'),
            tileload:  () => setWmsBadge(key, 'live'),
          }}
        />
      )
    )}
  </>)
}
