import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Athlete, Status } from '.'

type AthleteStateRequest = {
  id: number
  status: Status
}

const athlete = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const reqBody = JSON.parse(req.body) as AthleteStateRequest

  // Query validation
  if (reqBody.id === undefined) {
    res.status(400).json({ error: 'id is required' })
    return
  }
  if (reqBody.status !== 'started' && reqBody.status !== 'complete') {
    res.status(400).json({ error: 'status is required' })
    return
  }

  // Begin TX
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Fetch current athlete
    const selectRows = await client.query(selectQuery, [reqBody.id])
    if (selectRows.rowCount !== 1) {
      res.status(404).json({ error: 'athlete not found' })
      return
    }
    const athlete = selectRows.rows[0]
    // Check the required state transitions are valid
    const validationError = validateTransition(athlete, reqBody.status)
    if (validationError !== null) {
      res.status(400).json({ error: validationError })
      return
    }

    // Update the desired status
    const rows = await client.query(updateBackfillQuery, [reqBody.id, reqBody.status])
    if (rows.rowCount !== 1) {
      res.status(500).json({ error: 'something went wrong' })
      return
    }

    // Commit TX
    await client.query('COMMIT')
    res.status(200).json(rows.rows[0])

    // Rollback TX on error
  } catch (e) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: e })
    throw e

    // Ensure client is released back to pool
  } finally {
    client.release()
  }
}

const validateTransition: (athlete: Athlete, status: Status) => string | null = (athlete, status) => {
  switch (status) {
    case 'started':
      if (athlete.backfill_status !== 'not_started') {
        return 'invalid backfill status transition - backfill started/complete'
      }
      break
    case 'complete':
      if (athlete.backfill_status !== 'started') {
        return 'invalid backfill status transition - backfill not started'
      }
      break
  }
  return null
}

const selectQuery = `SELECT
  id,
  backfill_status
FROM
  athletes
WHERE
  id = $1`

const updateBackfillQuery = `UPDATE athletes
SET backfill_status = $2
WHERE id = $1
RETURNING id, backfill_status`

export default athlete
