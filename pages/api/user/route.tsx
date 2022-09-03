import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  // TODO: Consolidate route name and route ID
  const rows = await pool.query(relevantActivitiesQuery, [req.query.name, req.query.id])
  // const rowDict = rows.rows.reduce((acc, row) => {
  //   if (acc[row.id] === undefined) {
  //     acc[row.id] = row
  //     acc[row.id].intersection_polylines = [row.intersection_polyline]
  //   } else {
  //     acc[row.id].intersection_polylines.push(row.intersection_polyline)
  //   }
  //   return acc
  // }, {})
  // const data = Object.values(rowDict)
  // res.status(200).json(data)

  res.status(200).json(rows.rows)
}

export default route

const bufferDistanceMeters = 200
const simplifyRange = 0.000045

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
      intersections.intersection_track,
      intersections.id as intersection_id,
      route.track as route_track
    from intersections
    join activities on activities.id = intersections.activity_id
    join route on route.id = intersections.route_id
    where intersections.route_id = route.id and activities.athlete_id = $2
  ),
  start_ends as (
    select
      id,
      name,
      polyline,
      intersection_track,
      route_track,
      intersection_id,
      ST_LineLocatePoint(
        route_track::geometry,
        (ST_Dump(
          ST_Boundary(
            intersection_track::geometry
          )
        )).geom
      ) as start_end_points
    from relevants
  ),
  substrings as (
    select
      id,
      name,
      polyline,
      intersection_track,
      ST_LineSubstring(
        route_track::geometry,
        MIN(start_end_points),
        MAX(start_end_points)
      ) as substring
    from start_ends
    group by id, name, polyline, intersection_track, intersection_id, route_track
  ),
  aggregated as (
    select
      id,
      name,
      polyline,
      array_agg(
        ST_AsEncodedPolyline(
          intersection_track::geometry
        )
      ) as intersection_polylines,
      array_agg(
        ST_AsEncodedPolyline(
          ST_CollectionExtract(
            substring,
            2
          )
        )
      ) as substrings
    from substrings
    group by substrings.id, substrings.name, substrings.polyline
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
