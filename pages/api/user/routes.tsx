import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Route } from 'lib/types'

const routes = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (req.query.id === undefined) {
    res.status(400).json({ error: 'id is required' })
    return
  }

  const rows = await pool.query<Route>(statsQuery, [req.query.id])
  res.status(200).json(rows.rows)
}

export default routes

const statsQuery = `
select
  routes.id,
  routes.display_name,
  ST_AsEncodedPolyline(routes.track::geometry) as polyline,
  ST_Length(routes.track) as length,
  routes.description,
  route_stats.covered_length
from routes
join route_stats on route_stats.route_id = routes.id
where route_stats.athlete_id = $1
`
