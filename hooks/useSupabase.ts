import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const useSupabase = () => {
  if (supabaseUrl === undefined || supabaseAnonKey === undefined) {
    throw new Error('Missing supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export default useSupabase
