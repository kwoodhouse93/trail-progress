import type { NextApiRequest, NextApiResponse } from 'next'

import { authenticateQueryId } from 'lib/auth'
import pool from 'lib/database'

const processing = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const rows = await pool.query(selectQuery, [req.query.id])
  res.status(200).json(rows.rows)
  return
}

const selectQuery = `with
  processed as (
    select
      count(processed),
      route_id
    from processing
    join activities on activities.id = processing.activity_id
    where processed = true and activities.athlete_id = $1
    group by route_id
  ),
  unprocessed as (
    select
      count(processed),
      route_id
    from processing
    join activities on activities.id = processing.activity_id
    where processed = false and activities.athlete_id = $1
    group by route_id
  )
select
  processed.route_id,
  coalesce(processed.count, 0) as processed,
  coalesce(unprocessed.count, 0) as unprocessed,
  coalesce(processed.count, 0) + coalesce(unprocessed.count, 0) as total
from processed
full join unprocessed on processed.route_id = unprocessed.route_id;
`

export default processing
