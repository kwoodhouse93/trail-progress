import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
})

export default pool
