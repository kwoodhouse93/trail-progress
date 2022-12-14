import type { NextApiRequest, NextApiResponse } from 'next'

import pool from 'lib/database'
import { Route } from 'lib/types'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (req.query.id === undefined) {
    res.status(400).json({ error: 'id is required' })
  }

  const rows = await pool.query<Route>(selectQuery, [req.query.id])
  if (rows.rowCount !== 1) {
    res.status(404).json({ error: 'route not found' })
    return
  }

  res.status(200).json(rows.rows[0])
}

export default route

const selectQuery = `SELECT
  id,
  display_name,
  ST_AsGeoJSON(track::geometry) as geojson,
  length,
  description
FROM routes
WHERE id = $1`
