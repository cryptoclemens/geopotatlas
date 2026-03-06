import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  // ── Password ────────────────────────────────────
  // Check localStorage synchronously so PwScreen never shows for already-authenticated users
  pwPassed: localStorage.getItem('bowa_pw_ok') === '1',
  setPwPassed: () => {
    localStorage.setItem('bowa_pw_ok', '1')
    set({ pwPassed: true })
  },

  // ── Welcome / Tour ──────────────────────────────
  welcomeSeen: false,
  setWelcomeSeen: () => set({ welcomeSeen: true }),
  tourActive: false,
  tourStep: 0,
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  setTourStep: (n) => set({ tourStep: n }),
  endTour: () => set({ tourActive: false }),

  // ── Boot Log ────────────────────────────────────
  bootLogOpen: false,
  bootLogEntries: [],
  toggleBootLog: () => set(s => ({ bootLogOpen: !s.bootLogOpen })),
  addLog: (msg, status = 'ok') => set(s => ({
    bootLogEntries: [
      ...s.bootLogEntries,
      { msg, status, time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
    ],
  })),
  clearLog: () => set({ bootLogEntries: [] }),

  // ── Loader (initial) ────────────────────────────
  loaderDone: false,
  loaderProgress: 0,
  loaderDetail: 'Initialisiere…',
  setLoaderDone: () => set({ loaderDone: true }),
  setProgress: (pct, detail) => set({ loaderProgress: pct, loaderDetail: detail || '' }),

  // ── OSM Spinner ─────────────────────────────────
  osmSpinning: false,
  osmSpinnerText: 'Live-Daten laden…',
  osmSpinnerSub: 'Overpass API',
  showOsmSpinner: (sub) => set({ osmSpinning: true, osmSpinnerSub: sub || 'Overpass API' }),
  hideOsmSpinner: () => set({ osmSpinning: false }),

  // ── Stat counts (viewport) ──────────────────────
  statCounts: { dc: null, pp: null, abw: null, fw: null },
  setStatCount: (key, n) => set(s => ({ statCounts: { ...s.statCounts, [key]: n } })),

  // ── Stat list panel ─────────────────────────────
  statListOpen: false,
  statListCategory: null,
  statListItems: [],
  showStatList: (cat, items) => set({ statListOpen: true, statListCategory: cat, statListItems: items }),
  hideStatList: () => set({ statListOpen: false, statListItems: [] }),

  // ── Print dialog ────────────────────────────────
  printDialogOpen: false,
  showPrintDialog: () => set({ printDialogOpen: true }),
  hidePrintDialog: () => set({ printDialogOpen: false }),

  // ── WMS badges ──────────────────────────────────
  wmsBadges: {}, // key → 'probing' | 'live' | 'error'
  setWmsBadge: (key, status) => set(s => ({ wmsBadges: { ...s.wmsBadges, [key]: status } })),

  // ── Heat markers (for viewport counting) ────────
  heatMarkers: {}, // layerKey → [{lat, lng, name}]
  setHeatMarkers: (key, markers) => set(s => ({
    heatMarkers: { ...s.heatMarkers, [key]: markers },
  })),
}))
