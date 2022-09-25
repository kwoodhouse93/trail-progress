import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { Activity } from 'lib/strava/types'

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
  const rows = await pool.query(selectQuery, [req.query.id])
  res.status(200).json(rows.rows.map(r => toActivity(r)))
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const data: Activity[] = JSON.parse(req.body)
  if (!Array.isArray(data)) {
    res.status(400).json({ error: 'Invalid data' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const activity of data) {
      await client.query(insertQuery, toValues(activity))
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
  location_city,
  location_state,
  location_country,
  ST_AsEncodedPolyline(summary_track::geometry) as summary_polyline,
  visibility,
  ST_Y(start_latlng::geometry) as start_lat,
  ST_X(start_latlng::geometry) as start_lng,
  ST_Y(end_latlng::geometry) as end_lat,
  ST_X(end_latlng::geometry) as end_lng,
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
FROM activities
WHERE athlete_id = $1`

const insertQuery = `INSERT INTO activities (
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
    activity.map?.summary_polyline,
    activity.visibility,
    (Array.isArray(activity.start_latlng) ? activity.start_latlng[1] : undefined),
    (Array.isArray(activity.start_latlng) ? activity.start_latlng[0] : undefined),
    (Array.isArray(activity.end_latlng) ? activity.end_latlng[1] : undefined),
    (Array.isArray(activity.end_latlng) ? activity.end_latlng[0] : undefined),
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
    type: row.activity_type,
    start_date: row.start_date,
    timezone: row.local_tz,
    location_city: row.location_city,
    location_state: row.location_state,
    location_country: row.location_country,
    map: {
      summary_polyline: row.summary_polyline
    },
    visibility: row.visibility,
    start_latlng: [row.start_lat, row.start_lng],
    end_latlng: [row.end_lat, row.end_lng],
    average_speed: row.average_speed,
    max_speed: row.max_speed,
    average_temp: row.average_temp,
    average_watts: row.average_watts,
    kilojoules: row.kilojoules,
    average_heartrate: row.average_heartrate,
    max_heartrate: row.max_heartrate,
    elev_high: row.elev_high,
    elev_low: row.elev_low,
    external_id: row.external_id
  }
}
