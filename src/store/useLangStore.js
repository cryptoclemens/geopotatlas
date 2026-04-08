import { create } from 'zustand'

export const useLangStore = create((set) => ({
  lang: localStorage.getItem('gpa_lang') || 'de',
  toggleLang: () => set(state => {
    const next = state.lang === 'de' ? 'en' : 'de'
    localStorage.setItem('gpa_lang', next)
    return { lang: next }
  }),
}))
