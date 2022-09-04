import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'
import { useInsertionEffect } from 'react'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  // TODO: Consolidate route name and route ID
  const relevantActivitiesRows = await pool.query(relevantActivitiesQuery, [req.query.name, req.query.id])
  const unionRows = await pool.query(unionQuery, [req.query.name, req.query.id])
  const statsRows = await pool.query(statsQuery, [req.query.name, req.query.id])
  if (statsRows.rowCount !== 1) {
    res.status(500).json({ error: 'Unexpected number of rows returned' })
    return
  }
  res.status(200).json({
    relevantActivities: relevantActivitiesRows.rows,
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
      name,
      track
    from routes
    where name = $1
  ),
  relevants as (
    select
      activities.id,
      activities.name,
      ST_AsEncodedPolyline(activities.summary_track::geometry) as polyline,
      activities.summary_track as activity_track,
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
      name,
      polyline,
      array_agg(
        ST_AsEncodedPolyline(
          route_section_track::geometry
        )
      ) as substrings
    from relevants
    where ST_Length(route_section_track) > 5
    group by relevants.id, relevants.name, relevants.polyline
  )
select * from aggregated;`

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
