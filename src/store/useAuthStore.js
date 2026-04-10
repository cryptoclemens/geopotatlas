import { create } from 'zustand'
import { supabase } from '../lib/supabase'

async function testClaudeKey(key) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await get().loadProfile(session.user.id)
    }
    set({ loading: false })

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

  // Save API key — returns { error, keyValid }
  saveApiKey: async (key, provider = 'claude') => {
    const user = get().user
    if (!user) return { error: 'Nicht angemeldet.', keyValid: false }

    // Validate key (Claude only for now)
    let keyValid = true
    if (provider === 'claude' && key) {
      keyValid = await testClaudeKey(key)
      if (!keyValid) return { error: null, keyValid: false }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, claude_api_key: key, preferred_provider: provider })
      .select()
      .single()
    if (error) return { error: error.message, keyValid }
    set({ profile: data })
    return { error: null, keyValid: true }
  },

  // Update display_name / email / password
  saveProfile: async ({ display_name, email, password }) => {
    const user = get().user
    if (!user) return 'Nicht angemeldet.'

    if (email || password) {
      const updates = {}
      if (email)    updates.email    = email
      if (password) updates.password = password
      const { error } = await supabase.auth.updateUser(updates)
      if (error) return error.message
    }

    if (display_name !== undefined) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, display_name })
        .select()
        .single()
      if (error) return error.message
      set({ profile: data })
    }
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
