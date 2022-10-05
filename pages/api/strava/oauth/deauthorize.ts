import type { NextApiRequest, NextApiResponse } from 'next'

import { checkErrors, logRateLimits, StravaError } from 'lib/strava/api'

const deauthorize = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization
  if (auth === undefined || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const access_token = auth.split(' ')[1]

  if (req.query.id === undefined) {
    res.status(400).json({ error: 'id is required' })
    return
  }

  try {
    const data = await fetch(`https://www.strava.com/oauth/deauthorize?access_token=${access_token}`, {
      method: 'POST'
    })
      .then(logRateLimits)
      .then(checkErrors)
      .then(data => data.json())

    res.status(200).json(data)
  } catch (e) {
    if (e instanceof StravaError) {
      res.status(e.code).send(e.detail)
    } else {
      res.status(500).json(e)
    }
  }
}

export default deauthorize
