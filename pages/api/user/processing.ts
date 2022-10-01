import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'

const processing = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
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

const selectQuery = `SELECT
  route_id,
  COUNT(processed) AS unprocessed_count
FROM
  processing
JOIN
  activities ON activities.id = processing.activity_id
WHERE
  activities.athlete_id = $1 AND
  processing.processed = false
GROUP BY
  route_id`

export default processing
