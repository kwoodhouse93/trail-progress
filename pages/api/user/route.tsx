import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { useInsertionEffect } from 'react'
import { Activity } from 'lib/strava/types'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  // TODO: Consolidate route name and route ID
  const relevantActivitiesRows = await pool.query(relevantActivitiesQuery, [req.query.route_id, req.query.athlete_id])
  const unionRows = await pool.query(unionQuery, [req.query.route_id, req.query.athlete_id])
  const statsRows = await pool.query(statsQuery, [req.query.route_id, req.query.athlete_id])
  if (statsRows.rowCount !== 1) {
    res.status(500).json({ error: 'Unexpected number of rows returned' })
    return
  }
  res.status(200).json({
    relevantActivities: relevantActivitiesRows.rows.map(a => ({
      activity: toValue(a),
      polyline: a.polyline,
      coveredSections: a.substrings,
      coveredLength: a.covered_length,
    })),
    union: unionRows.rows,
    stats: statsRows.rows[0]
  })
}

export default route

const statsQuery = `
with
  union_query as (
    select
      ST_Union(
        route_section_track::geometry
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
  ST_AsEncodedPolyline(
    (ST_Dump(
      ST_Union(
        route_section_track::geometry
      )
    )).geom
  ) as polyline
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
      activities.athlete_id,
      activities.name,
      activities.distance,
      activities.moving_time,
      activities.elapsed_time,
      activities.total_elevation_gain,
      activities.activity_type,
      activities.start_date,
      activities.local_tz,
      activities.location_city,
      activities.location_state,
      activities.location_country,
      ST_AsEncodedPolyline(activities.summary_track::geometry) as polyline,
      activities.summary_track as activity_track,
      activities.visibility,
      activities.average_speed,
      activities.max_speed,
      activities.average_temp,
      activities.average_watts,
      activities.kilojoules,
      activities.average_heartrate,
      activities.max_heartrate,
      activities.elev_high,
      activities.elev_low,
      activities.external_id,
      route_sections.route_section_track,
      route.track as route_track
    from route_sections
    join activities on activities.id = route_sections.activity_id
    join route on route.id = route_sections.route_id
    where route_sections.route_id = route.id and activities.athlete_id = $2
  ),
  aggregated as (
    select
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
      visibility,
      average_speed,
      max_speed,
      average_temp,
      average_watts,
      kilojoules,
      average_heartrate,
      max_heartrate,
      elev_high,
      elev_low,
      external_id,
      polyline,
      array_agg(
        ST_AsEncodedPolyline(
          route_section_track::geometry
        )
      ) as substrings,
      ST_Length(
        ST_Union(
          route_section_track::geometry
        )::geography
      ) as covered_length
    from relevants
    where ST_Length(route_section_track) > 5
    group by
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
      visibility,
      average_speed,
      max_speed,
      average_temp,
      average_watts,
      kilojoules,
      average_heartrate,
      max_heartrate,
      elev_high,
      elev_low,
      external_id,
      polyline
  )
select * from aggregated;`

type QueryActivity = {
  id: number
  name: string
  athlete_id: number,
  distance: number,
  moving_time: number,
  elapsed_time: number,
  total_elevation_gain: number,
  activity_type: string,
  start_date: Date,
  local_tz: string,
  location_city?: string,
  location_state?: string,
  location_country?: string,
  visibility: string,
  average_speed: number,
  max_speed: number,
  average_temp?: number,
  average_watts?: number,
  kilojoules?: number,
  average_heartrate?: number,
  max_heartrate?: number,
  elev_high?: number,
  elev_low?: number,
  external_id?: string,
  polyline: string
  substrings?: string[],
  covered_length: number
}

const toValue: (value: QueryActivity) => Activity = value => {
  return {
    id: value.id,
    athlete: {
      id: value.athlete_id,
    },
    athlete_id: value.athlete_id,
    name: value.name,
    distance: value.distance,
    moving_time: value.moving_time,
    elapsed_time: value.elapsed_time,
    total_elevation_gain: value.total_elevation_gain,
    type: value.activity_type,
    start_date: value.start_date,
    timezone: value.local_tz,
    location_city: value.location_city,
    location_state: value.location_state,
    location_country: value.location_country,
    visibility: value.visibility,
    average_speed: value.average_speed,
    max_speed: value.max_speed,
    average_temp: value.average_temp,
    average_watts: value.average_watts,
    kilojoules: value.kilojoules,
    average_heartrate: value.average_heartrate,
    max_heartrate: value.max_heartrate,
    elev_high: value.elev_high,
    elev_low: value.elev_low,
    external_id: value.external_id,
    map: {
      summary_polyline: value.polyline,
    }
  }
}

// array_agg(
  // st_astext((st_dumppoints(
  //   st_boundary(
  //     intersection_track
  //   )
  // )).geom)
// ) as start_end_points,
// mapped as (
//   select
//     intersections.id,
//     intersections.name,
//     intersections.polyline,
//     ST_AsText((ST_DumpPoints(
//       ST_Boundary(
//         intersections.intersection_track
//       )
//     )).geom) as start_end_points,
//     intersections.intersection_track
//   FROM intersections
//   GROUP BY intersections.id, intersections.name, intersections.polyline, start_end_points, intersections.intersection_track
// ),
