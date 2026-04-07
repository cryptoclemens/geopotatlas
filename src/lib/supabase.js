import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bcqqdlkttuxmkymrssgz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcXFkbGt0dHV4bWt5bXJzc2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTMzNTksImV4cCI6MjA5MTE2OTM1OX0.4T_SQUTGrKltfPckWSAWjELoXr4qyWm37d3r7U2Eop0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
