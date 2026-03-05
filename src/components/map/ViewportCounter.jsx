import { useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'
import { useUIStore } from '../../store/useUIStore'

export default function ViewportCounter() {
  const { heatMarkers, setStatCount } = useUIStore()

  function countInBounds(map) {
    const bounds = map.getBounds()
    // Count each heat source type in bounds
    const counts = {}
    Object.entries(heatMarkers).forEach(([key, markers]) => {
      counts[key] = markers.filter(m => bounds.contains([m.lat, m.lng])).length
    })
    // Map layer keys → stat keys
    const dc  = counts['heat-dc']    ?? null
    const pp  = counts['heat-pp']    ?? null
    const abw = counts['heat-abw']   ?? null
    const fw  = counts['heat-fw']    ?? null
    setStatCount('dc',  dc)
    setStatCount('pp',  pp)
    setStatCount('abw', abw)
    setStatCount('fw',  fw)
  }

  const map = useMapEvents({
    moveend: () => countInBounds(map),
    zoomend: () => countInBounds(map),
  })

  // Initial count when heatMarkers update
  useEffect(() => {
    if (map) countInBounds(map)
  }, [heatMarkers]) // eslint-disable-line

  return null
}
