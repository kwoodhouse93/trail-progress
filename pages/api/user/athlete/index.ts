import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { authenticateBodyId, authenticateQueryId } from 'lib/auth'

export type Status = 'not_started' | 'started' | 'complete'
export type Athlete = {
  id: number
  backfill_status: Status
}

const athlete = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await handleGet(req, res)
    return
  }

  if (req.method === 'POST') {
    await handlePost(req, res)
    return
  }

  res.status(405).json({ error: 'Method Not Allowed' })
  return
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
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
  if (rows.rowCount !== 1) {
    res.status(404).json({ error: 'athlete not found' })
    return
  }

  res.status(200).json(rows.rows[0])
  return
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const reqBody = JSON.parse(req.body)

  const valid = await authenticateBodyId(req, reqBody)
  if (valid !== true) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  if (reqBody.id === undefined) {
    res.status(400).json({ error: 'id is required' })
    return
  }

  await pool.query(insertQuery, [reqBody.id])
  res.status(200).json({})
  return
}

const selectQuery = `SELECT
  id,
  backfill_status
FROM
  athletes
WHERE
  id = $1`

const insertQuery = `INSERT INTO athletes (id) VALUES ($1)
ON CONFLICT DO NOTHING`


export default athlete
