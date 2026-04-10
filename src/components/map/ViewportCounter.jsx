import { useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'
import { useUIStore } from '../../store/useUIStore'
import { FW_CITIES, FW_CITIES_PLANNED } from '../../data/fwCities'

export default function ViewportCounter() {
  const { heatMarkers, setStatCount } = useUIStore()

  function countInBounds(map) {
    const bounds = map.getBounds()

    // OSM-Quellen (aus heatMarkers)
    const dcMarkers    = heatMarkers['heat-dc']    || []
    const steelMarkers = heatMarkers['heat-steel'] || []

    const dc    = dcMarkers.filter(m => bounds.contains([m.lat, m.lng])).length
    const steel = steelMarkers.filter(m => bounds.contains([m.lat, m.lng])).length

    // Statische Fernwärme-Daten
    const fw_expand = FW_CITIES_PLANNED.filter(c => bounds.contains([c.lat, c.lng])).length
    const fw15      = FW_CITIES.filter(c => c.dh >= 15 && bounds.contains([c.lat, c.lng])).length

    setStatCount('dc',        dc    || null)
    setStatCount('steel',     steel || null)
    setStatCount('fw_expand', fw_expand)
    setStatCount('fw15',      fw15)
  }

  const map = useMapEvents({
    moveend: () => countInBounds(map),
    zoomend: () => countInBounds(map),
  })

  useEffect(() => {
    if (map) countInBounds(map)
  }, [heatMarkers]) // eslint-disable-line

  return null
}
