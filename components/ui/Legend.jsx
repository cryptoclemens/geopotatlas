import { useState } from 'react'

export default function Legend() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div id="legend" className={collapsed ? 'collapsed' : ''}>
      <h3 onClick={() => setCollapsed(c => !c)}>
        <span>Legende</span>
        <span style={{fontSize:'11px',opacity:.7}}>{collapsed ? '▸' : '▾'}</span>
      </h3>
      <div id="legend-body">
        {/* Polygon layers */}
        <Row sw={{ background:'rgba(91,175,214,.25)', border:'1px dashed #5bafd6' }} label="Lockergestein-Gürtel" />
        <Row sw={{ background:'rgba(78,205,196,.3)', border:'1px solid #4ecdc4' }} label="Niederrhein-Aquifer" />
        <Row sw={{ background:'rgba(91,175,214,.25)', border:'1px solid #5bafd6' }} label="Norddeutscher Aquifer" />
        <Row sw={{ background:'rgba(240,192,64,.3)', border:'1px solid #f0c040' }} label="Malmkarst / Molasse" />
        <Row sw={{ background:'rgba(232,168,87,.3)', border:'1px solid #e8a857' }} label="Buntsandstein Oberrhein" />
        <Row sw={{ background:'rgba(167,139,250,.2)', border:'1px solid #a78bfa' }} label="WMS Geologie (BGR)" />
        {/* Circle markers */}
        <Row ci sw={{ background:'#5bd68a', width:12, height:12 }} label="Fernwärme >50%" />
        <Row ci sw={{ background:'#e8a857', width:12, height:12 }} label="Fernwärme 30–50%" />
        <Row ci sw={{ background:'#5bafd6', width:12, height:12 }} label="Fernwärme 20–30%" />
        <Row ci sw={{ background:'#a87cd6', width:10, height:10 }} label="Rechenzentrum (OSM)" />
        <Row ci sw={{ background:'#d67c5b', width:10, height:10 }} label="Kraftwerk (OSM)" />
        <Row ci sw={{ background:'#5bd6c8', width:10, height:10 }} label="Müllverbrennung (OSM)" />
        <Row ci sw={{ background:'#d6c85b', width:10, height:10 }} label="Stahlwerk (OSM)" />
        <Row sw={{ background:'rgba(214,91,91,.25)', border:'1px dashed #d65b5b' }} label="Aktionsraum" />

        {/* Section: Geothermie-Höffigkeit */}
        <div className="leg-section">Geothermie-Höffigkeit</div>
        <Row sw={{ background:'rgba(91,214,200,.3)', border:'1px solid #5bd6c8' }} label="Lockergestein" />
        <Row sw={{ background:'rgba(240,192,64,.25)', border:'1px solid #c8a840' }} label="Festgestein &lt;1.000 m" />
        <Row sw={{ background:'rgba(214,91,91,.25)', border:'1px solid #b05050' }} label="Festgestein &gt;1.000 m" />
      </div>
    </div>
  )
}

function Row({ sw, label, ci = false }) {
  return (
    <div className="leg-row">
      <div
        className={'leg-sw' + (ci ? ' leg-ci' : '')}
        style={{ width: sw.width || 20, height: sw.height || 12, ...sw }}
      />
      <span>{label}</span>
    </div>
  )
}
