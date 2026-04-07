import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  init: async () => {
    // Restore session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await get().loadProfile(session.user.id)
    }
    set({ loading: false })

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      set({ user })
      if (user) await get().loadProfile(user.id)
      else set({ profile: null })
    })
  },

  loadProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: data || null })
  },

  saveApiKey: async (key, provider = 'claude') => {
    const user = get().user
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .upsert({ id: user.id, claude_api_key: key, preferred_provider: provider })
      .select()
      .single()
    set({ profile: data })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
