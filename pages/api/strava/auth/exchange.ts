import type { NextApiRequest, NextApiResponse } from 'next'

import { checkErrors, StravaError } from 'lib/strava/api'
import { Athlete } from 'lib/strava/types'
import pool from 'lib/database'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

const exchange = async (req: NextApiRequest, res: NextApiResponse) => {
  const { code } = req.body

  return fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
    }),
  })
    .then(checkErrors)
    .then(data => data.json())
    .then(storeTokens)
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

export default exchange


type ExchangeResponse = {
  access_token: string
  athlete: Athlete
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: 'Bearer'
}

export const storeTokens = async (response: ExchangeResponse) => {
  const { athlete, access_token, refresh_token, expires_at } = response
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      insertAthleteQuery,
      [athlete.id]
    )
    await Promise.all([
      client.query(
        insertAccessTokenQuery,
        [athlete.id, access_token, new Date(), new Date(expires_at * 1000)]
      ),
      client.query(
        insertRefreshTokenQuery,
        [athlete.id, refresh_token, new Date()]
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

const insertAthleteQuery = `INSERT INTO athletes (id) VALUES ($1)
ON CONFLICT DO NOTHING`

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
