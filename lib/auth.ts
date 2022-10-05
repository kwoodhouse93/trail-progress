import type { NextApiRequest } from 'next'

import pool from 'lib/database'

const token = (req: NextApiRequest) => {
  const auth = req.headers.authorization
  if (auth === undefined || !auth.startsWith('Bearer ')) {
    return undefined
  }
  return auth.split(' ')[1]
}

export const authenticate = async (req: NextApiRequest, id: number) => {
  const t = token(req)
  if (t === undefined) {
    return false
  }
  const rows = await pool.query('SELECT 1 FROM access_tokens WHERE access_token = $1 AND athlete_id = $2', [t, id])
  if (rows.rowCount !== 1) {
    return false
  }
  return true
}

export const authenticateQueryId = async (req: NextApiRequest) => {
  if (req.query.id === undefined) {
    return false
  }
  const id = parseInt(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  if (isNaN(id)) {
    return false
  }
  return authenticate(req, id)
}

interface idBody {
  id: number
}

export const authenticateBodyId = async (req: NextApiRequest, reqBody: idBody) => {
  if (reqBody === undefined) {
    return false
  }
  if (reqBody.id === undefined) {
    return false
  }
  return authenticate(req, reqBody.id)
}
