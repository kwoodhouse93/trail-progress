import type { NextApiRequest, NextApiResponse } from 'next'
import { checkErrors, StravaError } from 'lib/strava/api'

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
