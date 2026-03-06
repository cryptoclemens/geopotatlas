import { create } from 'zustand'

const DEFAULT_LAYERS = {
  // Basisdaten
  'tiefland-plain':  true,
  'tiefland-rhein':  true,
  'aktionsraum':     true,
  // Aquifer-Systeme
  'aq-niederrhein':  true,
  'aq-norddeutsch':  true,
  'aq-molasse':      true,
  'aq-oberrhein':    true,
  // Geothermie-Höffigkeit (WMS)
  'geo-egdi':        false,
  'geo-bgr':         true,
  'geo-huek250':     true,
  // LANUV Wärmekataster (WMS)
  'waerme-wms':      false,
  'waerme-bbsr':     false,
  // (Ab-)Wärmeproduzenten
  'heat-dc':         true,
  'heat-pp':         false,
  'heat-waste':      false,
  'heat-steel':      false,
  'heat-abw':        false,
  // Fernwärme-Märkte
  'fw-cities-hi':    true,
  'fw-cities-mid':   true,
  'fw-cities-lo':    true,
  // FW Ausbau (neu)
  'fw-expand':       false,
  'fw-new':          false,
  // Legacy (Höffigkeit polygons)
  'hoeff-locker':    false,
}

export const useLayerStore = create((set, get) => ({
  layers: { ...DEFAULT_LAYERS },
  toggle: (key) => set(s => ({
    layers: { ...s.layers, [key]: !s.layers[key] }
  })),
  setLayer: (key, val) => set(s => ({
    layers: { ...s.layers, [key]: val }
  })),
  setGroup: (keys, val) => set(s => {
    const next = { ...s.layers }
    keys.forEach(k => { next[k] = val })
    return { layers: next }
  }),
  isGroupOn: (keys) => keys.some(k => get().layers[k]),
}))
