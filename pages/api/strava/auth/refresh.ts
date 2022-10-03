import type { NextApiRequest, NextApiResponse } from 'next'
import { checkErrors, StravaError } from 'lib/strava/api'
import pool from 'lib/database'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

const refresh = async (req: NextApiRequest, res: NextApiResponse) => {
  const { refresh_token } = req.body

  if (req.query.id === undefined) {
    res.status(400).send('id is required')
    return
  }
  const athleteId = parseInt(req.query.id as string)

  return fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refresh_token,
      grant_type: 'refresh_token',
    }),
  })
    .then(checkErrors)
    .then(data => data.json())
    .then(data => storeTokens(athleteId, data))
    .then(data => {
      res.status(200).json(data)
    })
    .catch(e => {
      if (e instanceof StravaError) {
        res.status(e.code).send(e.detail)
      } else {
        res.status(500).json(e)
      }
    })
}

export default refresh

type RefreshResponse = {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
}

export const storeTokens = async (athleteId: number, response: RefreshResponse) => {
  const { access_token, refresh_token, expires_at } = response
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await Promise.all([
      client.query(
        insertAccessTokenQuery,
        [athleteId, access_token, new Date(), new Date(expires_at * 1000)]
      ),
      client.query(
        insertRefreshTokenQuery,
        [athleteId, refresh_token, new Date()]
      )
    ])
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  return response
}

const insertAccessTokenQuery = `
INSERT INTO access_tokens (athlete_id, access_token, updated_at, expires_at)
VALUES ($1, $2, $3, $4)
ON CONFLICT (athlete_id) DO UPDATE
SET access_token = $2, updated_at = $3, expires_at = $4
`

const insertRefreshTokenQuery = `
INSERT INTO refresh_tokens (athlete_id, refresh_token, updated_at)
VALUES ($1, $2, $3)
ON CONFLICT (athlete_id) DO UPDATE
SET refresh_token = $2, updated_at = $3
`
