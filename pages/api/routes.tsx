import type { NextApiRequest, NextApiResponse } from 'next'

import pool from 'lib/database'
import { Route } from 'lib/types'

const routes = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const rows = await pool.query<Route>(selectQuery)
  res.status(200).json(rows.rows)
}

export default routes

const selectQuery = `SELECT
  id,
  display_name,
  length,
  description,
  thumbnail
FROM routes`
