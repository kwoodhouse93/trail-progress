import type { NextApiRequest, NextApiResponse } from 'next'

import { Activity } from 'lib/strava/types'
import { authenticate } from 'lib/auth'
import pool from 'lib/database'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (req.query.athlete_id === undefined) {
    res.status(400).json({ error: 'athlete_id is required' })
    return
  }
  const id = parseInt(Array.isArray(req.query.athlete_id) ? req.query.athlete_id[0] : req.query.athlete_id)
  const valid = await authenticate(req, id)
  if (valid !== true) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const relevantActivitiesRows = await pool.query(relevantActivitiesQuery, [req.query.route_id, req.query.athlete_id])
  const unionRows = await pool.query(unionQuery, [req.query.route_id, req.query.athlete_id])
  if (unionRows.rowCount !== 1) {
    res.status(500).json({ error: 'unexpected number of rows returned' })
    return
  }
  const statsRows = await pool.query(statsQuery, [req.query.route_id, req.query.athlete_id])
  if (statsRows.rowCount !== 1) {
    res.status(500).json({ error: 'unexpected number of rows returned' })
    return
  }
  res.status(200).json({
    relevantActivities: relevantActivitiesRows.rows.map(a => ({
      activity: toValue(a),
      coveredLength: a.covered_length,
    })),
    coveredGeoJSON: JSON.parse(unionRows.rows[0].geojson),
    stats: statsRows.rows[0]
  })
}

export default route

const statsQuery = `
with
  union_query as (
    select
      ST_Union(
        section_track::geometry
      )::geography as union_track
    from route_sections
    join activities on activities.id = route_sections.activity_id
    where route_id = $1 and athlete_id = $2
  )
select
  ST_Length(
    union_track
  ) as length
from union_query
`

const unionQuery = `
select
  ST_AsGeoJSON(
    ST_Collect(
      section_track::geometry
    )
  ) as geojson
from route_sections
join activities on activities.id = route_sections.activity_id
where route_id = $1 and athlete_id = $2
`

const relevantActivitiesQuery = `
with
  route as (
    select
      id,
      track
    from routes
    where id = $1
  ),
  relevants as (
    select
      activities.id,
      activities.name,
      activities.distance,
      activities.moving_time,
      activities.elapsed_time,
      activities.activity_type,
      activities.start_date,
      activities.local_tz,
      route_sections.section_track
    from route_sections
    join activities on activities.id = route_sections.activity_id
    join route on route.id = route_sections.route_id
    where route_sections.route_id = route.id and activities.athlete_id = $2
  ),
  aggregated as (
    select
      id,
      name,
      distance,
      moving_time,
      elapsed_time,
      activity_type,
      start_date,
      local_tz,
      ST_Length(
        ST_Union(
          section_track::geometry
        )::geography
      ) as covered_length
    from relevants
    where ST_Length(section_track) > 5
    group by
      id,
      name,
      distance,
      moving_time,
      elapsed_time,
      activity_type,
      start_date,
      local_tz
  )
select * from aggregated;`

type QueryActivity = {
  id: number
  name: string
  distance: number,
  moving_time: number,
  elapsed_time: number,
  activity_type: string,
  start_date: Date,
  local_tz: string,
  covered_length: number
}

const toValue: (value: QueryActivity) => Activity = value => {
  return {
    id: value.id,
    name: value.name,
    distance: value.distance,
    moving_time: value.moving_time,
    elapsed_time: value.elapsed_time,
    sport_type: value.activity_type,
    start_date: value.start_date,
    timezone: value.local_tz,
  }
}
