import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Route } from 'lib/types'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const rows = await pool.query<Route>(selectQuery, [req.query.name])
  if (rows.rowCount !== 1) {
    res.status(404).json({ error: 'Route not found' })
    return
  }

  res.status(200).json(rows.rows[0])
}

export default route

const selectQuery = `SELECT
  id,
  name,
  display_name,
  ST_AsEncodedPolyline(track::geometry) as polyline,
  description
FROM routes
WHERE name = $1`
