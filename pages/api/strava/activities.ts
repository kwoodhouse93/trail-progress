import type { NextApiRequest, NextApiResponse } from 'next'
import { checkErrors, logRateLimits, StravaError } from 'lib/strava/api'

const activities = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization
  if (auth === undefined || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  // Take token after Bearer part
  const access_token = auth.split(' ')[1]

  // Default to first page if page parameter not provided
  let page = req.query.page || 1

  // TODO: Report an error if rate limits hit
  // TODO: Test more error cases - do we always throw on error?
  try {
    const data = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200&access_token=${access_token}`)
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

export default activities
