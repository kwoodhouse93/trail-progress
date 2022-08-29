import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Activity } from 'lib/strava/types'

const query = `INSERT INTO activities (
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
  location_city,
  location_state,
  location_country,
  summary_track,
  visibility,
  start_latlng,
  end_latlng,
  average_speed,
  max_speed,
  average_temp,
  average_watts,
  kilojoules,
  average_heartrate,
  max_heartrate,
  elev_high,
  elev_low,
  external_id
) VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11,
  $12,
  $13,
  ST_LineFromEncodedPolyline($14),
  $15,
  ST_Point($16, $17),
  ST_Point($18, $19),
  $20,
  $21,
  $22,
  $23,
  $24,
  $25,
  $26,
  $27,
  $28,
  $29
) ON CONFLICT DO NOTHING`

const toValues = (activity: Activity) => {
  return [
    activity.id,
    activity.athlete.id,
    activity.name,
    activity.distance,
    activity.moving_time,
    activity.elapsed_time,
    activity.total_elevation_gain,
    activity.type,
    activity.start_date,
    activity.timezone,
    activity.location_city,
    activity.location_state,
    activity.location_country,
    activity.map.summary_polyline,
    activity.visibility,
    activity.start_latlng[0],
    activity.start_latlng[1],
    activity.end_latlng[0],
    activity.end_latlng[1],
    activity.average_speed,
    activity.max_speed,
    activity.average_temp,
    activity.average_watts,
    activity.kilojoules,
    activity.average_heartrate,
    activity.max_heartrate,
    activity.elev_high,
    activity.elev_low,
    activity.external_id
  ]
}

const activities = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const data: Activity[] = JSON.parse(req.body)
  if (!Array.isArray(data)) {
    res.status(400).json({ error: 'Invalid data' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const activity of data) {
      await client.query(query, toValues(activity))
    }

    await client.query('COMMIT')
    res.status(200).json({})

  } catch (e) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: e })
    throw e

  } finally {
    client.release()
  }

  //   .then(logRateLimits)
  // .then(checkErrors)
  // .then(data => data.json())
  // .then(data => {
  //   res.status(200).json(data)
  // })
  // .catch(e => {
  //   if (e instanceof StravaError) {
  //     res.status(e.code).send(e.detail)
  //   } else {
  //     res.status(500).json(e)
  //   }
  // })
}

export default activities
