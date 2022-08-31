import type { NextApiRequest, NextApiResponse } from 'next'
import pool from 'lib/database'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

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
    select name, st_simplify(track::geometry, ${simplifyRange})::geography as track
    from routes
    where name = $1
  ),
  relevants as (
    select
      id,
      activities.name,
      activities.summary_track as activity_track,
      ST_AsEncodedPolyline(activities.summary_track::geometry) as polyline,
      st_dwithin(
        st_simplify(
          summary_track::geometry,
          ${simplifyRange}
        )::geography,
        route.track,
        ${bufferDistanceMeters},
        false   -- Use sphere for speed
      ) as relevant
    from
      route,
      activities
    where
      activities.athlete_id = $2
  ),
  intersections as (
    select
      relevants.id,
      relevants.name,
      relevants.polyline,
      relevants.activity_track,
      (st_dump(
        st_intersection(
          relevants.activity_track,
          st_buffer(
            route.track,
            ${bufferDistanceMeters}
          )
        )::geometry
      )).geom as intersection_track
    from relevants, route
    where relevant = true
  ),
  aggregated as (
    select
      intersections.id,
      intersections.name,
      intersections.polyline,
      array_agg(
        ST_AsEncodedPolyline(
          intersection_track
        )
      ) as intersection_polylines
    from intersections
    group by intersections.id, intersections.name, intersections.polyline
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
