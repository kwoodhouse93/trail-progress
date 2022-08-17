import type { NextApiRequest, NextApiResponse } from 'next'

const activities = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query
  const data = await fetch(`https://www.strava.com/api/v3/athlete/activities?access_token=${token}`)
    .then((res) => {
      console.log('Rate limit: ' + res.headers.get('x-ratelimit-usage') + ' / ' + res.headers.get('x-ratelimit-limit'))
      return res.json()
    })
  // TODO: Support iterating over response pages

  res.status(200).json(data)
}

export default activities
