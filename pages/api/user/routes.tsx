import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Route } from 'lib/types'
import { authenticateQueryId } from 'lib/auth'

const routes = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const valid = await authenticateQueryId(req)
  if (valid !== true) {
    res.status(401).json({ error: 'unauthorized' })
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
with stats as (
  select
    route_id,
    covered_length
  from route_stats
  where athlete_id = $1
)
select
  routes.id,
  routes.display_name,
  ST_AsEncodedPolyline(routes.track::geometry) as polyline,
  ST_Length(routes.track) as length,
  routes.description,
  coalesce(stats.covered_length, 0) as covered_length
from routes
left outer join stats on stats.route_id = routes.id
`
