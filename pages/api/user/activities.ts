import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Activity } from 'lib/strava/types'
import { authenticate, authenticateQueryId } from 'lib/auth'

const activities = async (req: NextApiRequest, res: NextApiResponse) => {
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

export default activities

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const valid = await authenticateQueryId(req)
  if (valid !== true) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const rows = await pool.query(selectQuery, [req.query.id])
  res.status(200).json(rows.rows.map(r => toActivity(r)))
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const data: Activity[] = JSON.parse(req.body)
  if (!Array.isArray(data)) {
    res.status(400).json({ error: 'Invalid data' })
    return
  }

  // Extract athlete ID from activities to make sure they're all owned by
  // the same person.
  const singleAthlete = data.every(activity => activity.athlete.id === data[0].athlete.id)
  if (!singleAthlete) {
    res.status(400).json({ error: 'Invalid data' })
    return
  }

  // Actually verify the caller's access token matches the athlete ID.
  const valid = await authenticate(req, data[0].athlete.id)
  if (valid !== true) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  try {
    const valuesStatements = []
    const params = []
    let i = 1
    for (const activity of data) {
      valuesStatements.push(`(
        $${i},
        $${i + 1},
        $${i + 2},
        $${i + 3},
        $${i + 4},
        $${i + 5},
        $${i + 6},
        $${i + 7},
        $${i + 8},
        $${i + 9},
        ST_LineFromEncodedPolyline($${i + 10}),
        ST_Point($${i + 11}, $${i + 12}),
        ST_Point($${i + 13}, $${i + 14}),
        $${i + 15},
        $${i + 16},
        $${i + 17}
      )`)
      params.push(...toValues(activity))
      i += 18
    }
    const query = insertQueryStart + valuesStatements.join(', ') + insertQueryEnd
    await pool.query(query, params)
    res.status(200).json({})

  } catch (e) {
    res.status(500).json({ error: e })
    throw e
  }
}

const selectQuery = `SELECT
  id,
  athlete_id,
  name,
  distance,
  moving_time,
  elapsed_time,
  total_elevation_gain,
  activity_type,
  start_date,
  local_tz,
  ST_AsEncodedPolyline(summary_track::geometry) as summary_polyline,
  ST_Y(start_latlng::geometry) as start_lat,
  ST_X(start_latlng::geometry) as start_lng,
  ST_Y(end_latlng::geometry) as end_lat,
  ST_X(end_latlng::geometry) as end_lng,
  elev_high,
  elev_low,
  external_id
FROM activities
WHERE athlete_id = $1`

const insertQueryStart = `INSERT INTO activities (
  id,
  athlete_id,
  name,
  distance,
  moving_time,
  elapsed_time,
  total_elevation_gain,
  activity_type,
  start_date,
  local_tz,
  summary_track,
  start_latlng,
  end_latlng,
  elev_high,
  elev_low,
  external_id
) VALUES `
const insertQueryEnd = ` ON CONFLICT DO NOTHING`

const toValues = (activity: Activity) => {
  let polyline: string | undefined = activity.map?.summary_polyline
  if (polyline === '') polyline = undefined

  return [
    activity.id,
    activity.athlete.id,
    activity.name,
    activity.distance,
    activity.moving_time,
    activity.elapsed_time,
    activity.total_elevation_gain,
    activity.sport_type,
    activity.start_date,
    activity.timezone,
    polyline,
    (Array.isArray(activity.start_latlng) ? activity.start_latlng[1] : undefined),
    (Array.isArray(activity.start_latlng) ? activity.start_latlng[0] : undefined),
    (Array.isArray(activity.end_latlng) ? activity.end_latlng[1] : undefined),
    (Array.isArray(activity.end_latlng) ? activity.end_latlng[0] : undefined),
    activity.elev_high,
    activity.elev_low,
    activity.external_id
  ]
}

const toActivity: (row: any) => Activity = (row) => {
  return {
    id: row.id,
    athlete: {
      id: row.athlete_id
    },
    name: row.name,
    distance: row.distance,
    moving_time: row.moving_time,
    elapsed_time: row.elapsed_time,
    total_elevation_gain: row.total_elevation_gain,
    sport_type: row.activity_type,
    start_date: row.start_date,
    timezone: row.local_tz,
    map: {
      summary_polyline: row.summary_polyline
    },
    start_latlng: [row.start_lat, row.start_lng],
    end_latlng: [row.end_lat, row.end_lng],
    elev_high: row.elev_high,
    elev_low: row.elev_low,
    external_id: row.external_id
  }
}
