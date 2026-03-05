import { useUIStore } from '../../store/useUIStore'

export default function OsmSpinner() {
  const { osmSpinning, osmSpinnerSub } = useUIStore()

  if (!osmSpinning) return null

  return (
    <div id="osm-spinner">
      <div id="osm-spinner-ring" />
      <div id="osm-spinner-label">
        <span>OSM</span>
        {osmSpinnerSub && <span id="osm-spinner-sub">{osmSpinnerSub}</span>}
      </div>
    </div>
  )
}
