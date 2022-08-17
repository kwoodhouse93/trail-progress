import { NextApiRequest, NextApiResponse } from 'next'

const positions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token, id } = req.query
  const data = await fetch(`https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng&key_by_type&access_token=${token}`)
    .then((res) => {
      console.log('Rate limit: ' + res.headers.get('x-ratelimit-usage') + ' / ' + res.headers.get('x-ratelimit-limit'))
      return res.json()
    })
  res.status(200).json(data)
}

export default positions
