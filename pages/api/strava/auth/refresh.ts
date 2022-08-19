import type { NextApiRequest, NextApiResponse } from 'next'
import { checkErrors, StravaError } from '../../../../utils/api'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

const refresh = async (req: NextApiRequest, res: NextApiResponse) => {
  const { refresh_token } = req.body

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
