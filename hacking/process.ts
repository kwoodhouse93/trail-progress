import * as fs from 'fs'
import simplifyjs from 'simplify-js'
import * as xml2js from 'xml2js'
import { performance } from 'perf_hooks'

//--- Constants ---
const DEG_TO_MET = 111_139 // Very approximate but good enough for us for now
const MET_TO_DEG = 1 / DEG_TO_MET

//--- Tuning params ---
const BUFFER_DISTANCE = 150 /* meters */
const SIMPLIFY_TOLERANCE = 5 * MET_TO_DEG

//--- Types ---
type Point = {
  lat: number
  lon: number
}

type Track = Point[]

type VisitablePoint = {
  point: Point
  visited: boolean
}

type VisitableTrack = VisitablePoint[]

type Bounds = {
  min: Point
  max: Point
}

//--- Helper functions ---
const parseGPX = (gpx: xml2js.convertableToString) => {
  let outputTrack: Track = []
  xml2js.parseString(gpx, (err, result) => {
    if (err) {
      console.log(err)
      return
    }
    const track = result.gpx.trk.map((t: any) => {
      return t.trkseg[0].trkpt.map((p: any) => {
        return {
          lat: parseFloat(p.$.lat),
          lon: parseFloat(p.$.lon),
        }
      })
    }).flat()
    outputTrack = track
  })
  return outputTrack
}

const parseArrays = (a: number[][]) => {
  return a.map(([lat, lon]) => {
    return {
      lat: lat,
      lon: lon,
    }
  })
}

const trackToVisitable = (track: Track) => {
  return track.map(p => {
    return {
      point: p,
      visited: false,
    }
  })
}

const visitableToTrack = (visitable: VisitableTrack) => {
  return visitable.map(p => {
    return p.point
  })
}

const simplify = (track: Track) => {
  const out = simplifyjs(track.map(p => { return { x: p.lat, y: p.lon } }), SIMPLIFY_TOLERANCE)
  return out.map(p => { return { lat: p.x, lon: p.y } })
}

const coverage = (track: VisitableTrack) => {
  return track.filter(p => p.visited).length / track.length
}

const distanceCovered = (track: VisitableTrack) => {
  let length = 0
  for (let i = 0; i < track.length - 1; i++) {
    if (track[i].visited && track[i + 1].visited) {
      length += distance(track[i].point, track[i + 1].point)
    }
  }
  return length
}

// Not a true geometric center, but the average of all points.
// Typically fine for a GPS track with a fairly even distance between samples.
const trackCenter = (track: Track) => {
  const sum = track.reduce((acc, cur) => {
    acc.lat += cur.lat
    acc.lon += cur.lon
    return acc
  }, { lat: 0, lon: 0 })
  return {
    lat: sum.lat / track.length,
    lon: sum.lon / track.length
  }
}

const outputTrack = (track: Track, filename: string) => {
  const latlong = track.map(r => `[${r.lat}, ${r.lon}]`).join(',')
  fs.writeFile(filename, `[${latlong}]`, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('wrote track to file ', filename)
  })
}

// Haversine distance
const distance = (p1: Point, p2: Point) => {
  const p = 0.017453292519943295    // Math.PI / 180
  const r = 6371                  // Earth radius in kilometers
  const c = Math.cos
  const a = 0.5 - c((p2.lat - p1.lat) * p) / 2 +
    c(p1.lat * p) * c(p2.lat * p) *
    (1 - c((p2.lon - p1.lon) * p)) / 2

  return 2 * r * Math.asin(Math.sqrt(a)) * 1000 // *1000 to convert to meters
}

// Linear distance - not accurate as the Earth is not flat
// const distance = (p1: Point, p2: Point) => {
//   return Math.sqrt(
//     Math.pow(
//       Math.abs(p1.lat - p2.lat),
//       2,
//     ) + Math.pow(
//       Math.abs(p1.lon - p2.lon),
//       2,
//     )
//   )
// }

const inBufferedBounds = (point: Point, bounds: Bounds, bufferDistance: number) => {
  const bufferedBounds = bufferBounds(bounds, bufferDistance)
  return !(
    point.lat < bufferedBounds.min.lat ||
    point.lat > bufferedBounds.max.lat ||
    point.lon < bufferedBounds.min.lon ||
    point.lon > bufferedBounds.max.lon
  )
}

// Find the closest point to `point` on `route`
// This is *very* slow.
const closestPoint = (route: Track, point: Point, routeBounds: Bounds) => {
  let closest: { distance: number, point?: Point, index: number } = {
    distance: Number.MAX_SAFE_INTEGER,
    point: undefined,
    index: -1,
  }

  // Discard points not within route bounds (plus a buffer)
  if (routeBounds !== undefined) {
    if (!inBufferedBounds(point, routeBounds, BUFFER_DISTANCE)) {
      return closest
    }
  }

  route.forEach((p, i) => {
    const d = distance(p, point)
    if (d < closest.distance) {
      closest.distance = d
      closest.point = p
      closest.index = i
    }
  })
  return closest
}

// Returns true if point is within the buffer distance of a route point.
// Short circuits after finding a matching point.
const isPointWithinBuffer = (route: Track, point: Point, routeBounds: Bounds, bufferDistance: number) => {
  // Discard points not within route bounds (plus a buffer)
  if (routeBounds !== undefined) {
    if (!inBufferedBounds(point, routeBounds, bufferDistance)) {
      return false
    }
  }

  return route.some(p => {
    const d = distance(p, point)
    if (d < bufferDistance) {
      return true
    }
  })
}

// Does the same as isPointWithinBufferIndex, but returns the index of the point found
// and uses it to find the next point to check.
// This should be faster when checking track points in order, as the next point on our
// track is likely to be at, or very near, the next point on the route.
const isPointWithinBufferIndex
  : (route: Track, point: Point, routeBounds: Bounds, bufferDistance: number, startIndex: number | undefined) => { ok: boolean, index: number }
  = (route, point, routeBounds, bufferDistance, startIndex) => {
    const maxSearchPoints = 100

    // Discard points not within route bounds (plus a buffer)
    if (routeBounds !== undefined) {
      if (!inBufferedBounds(point, routeBounds, bufferDistance)) {
        return { ok: false, index: -1 }
      }
    }

    // If we don't know where to start looking, start from the beginning.
    if (startIndex === undefined) {
      for (let i = 0; i < route.length; i++) {
        const d = distance(route[i], point)
        if (d < bufferDistance) {
          return { ok: true, index: i }
        }
      }
      return { ok: false, index: -1 }
    }

    // If we do have a start index, expand our search in either direction from there.
    for (let i = 0; i < maxSearchPoints; i++) {
      const mod = i % 2 === 1 ? Math.round(i / 2) : Math.round(-i / 2)
      if (startIndex + mod < 0 || startIndex + mod >= route.length) {
        continue
      }
      const d = distance(route[startIndex + mod], point)
      if (d < bufferDistance) {
        return { ok: true, index: startIndex + mod }
      }
    }
    return { ok: false, index: -1 }
  }

const isOnRoute = (route: Track, point: Point, routeBounds: Bounds, bufferDistance: number) => {
  return isPointWithinBuffer(route, point, routeBounds, bufferDistance)
}

const fullTrackRouteIntersection = (route: Track, track: Track) => {
  const routeBounds = boundingBox(route)
  const trackBounds = boundingBox(track)
  return trackRouteIntersection(route, track, routeBounds, trackBounds)
}

const trackRouteIntersection = (route: Track, track: Track, routeBounds: Bounds, trackBounds: Bounds) => {
  if (!boundsOverlap(routeBounds, trackBounds)) {
    return []
  }
  return track.filter(p => isOnRoute(route, p, routeBounds, BUFFER_DISTANCE))
}

const trackRouteIntersectionWithIndexOptimisation = (route: Track, track: Track, routeBounds: Bounds, trackBounds: Bounds) => {
  if (!boundsOverlap(routeBounds, trackBounds)) {
    return []
  }

  let swcpIndex: number | undefined = undefined
  return track.filter(p => {
    const { ok, index } = isPointWithinBufferIndex(route, p, routeBounds, BUFFER_DISTANCE, swcpIndex)
    if (ok) {
      swcpIndex = index
    }
    return ok
  })
}

const amountOfTrackPointsOnRoute: (track: Track, intersection: Track) => number = (track, intersection) => {
  return intersection.length / track.length
}

const trackLength = (track: Track) => {
  let length = 0
  for (let i = 0; i < track.length - 1; i++) {
    length += distance(track[i], track[i + 1])
  }
  return length
}

// Finds the smallest rectangle that contains all points of track
const boundingBox: (track: Track) => Bounds = (track) => {
  const min = {
    lat: Number.MAX_SAFE_INTEGER,
    lon: Number.MAX_SAFE_INTEGER
  }
  const max = {
    lat: Number.MIN_SAFE_INTEGER,
    lon: Number.MIN_SAFE_INTEGER
  }
  track.forEach(p => {
    if (p.lat < min.lat) {
      min.lat = p.lat
    }
    if (p.lon < min.lon) {
      min.lon = p.lon
    }
    if (p.lat > max.lat) {
      max.lat = p.lat
    }
    if (p.lon > max.lon) {
      max.lon = p.lon
    }
  })
  return {
    min,
    max
  }
}

// Increase the size of bounds by the bufferDistance.
const bufferBounds: (bounds: Bounds, bufferDistance: number) => Bounds = (bounds, bufferDistance) => {
  return {
    min: {
      lat: bounds.min.lat - bufferDistance,
      lon: bounds.min.lon - bufferDistance
    },
    max: {
      lat: bounds.max.lat + bufferDistance,
      lon: bounds.max.lon + bufferDistance
    }
  }
}

// Returns true if the two bounding boxes overlap
const boundsOverlap: (bb1: Bounds, bb2: Bounds) => boolean = (bb1, bb2) => {
  return !(
    bb1.min.lat > bb2.max.lat ||
    bb1.min.lon > bb2.max.lon ||
    bb2.min.lat > bb1.max.lat ||
    bb2.min.lon > bb1.max.lon
  )
}

const metersReadable = (metres: number) => {
  if (metres < 1000) {
    return `${metres}m`
  } else {
    return `${(metres / 1000).toFixed(3)}km`
  }
}

const applyTrack = (visitableRoute: VisitableTrack, track: Track) => {
  const route = visitableToTrack(visitableRoute)

  const routeBounds = boundingBox(route)
  const trackBounds = boundingBox(track)
  const pointsOnRoute = trackRouteIntersectionWithIndexOptimisation(route, track, routeBounds, trackBounds)

  const closestStart = closestPoint(route, pointsOnRoute[0], routeBounds)
  const closestEnd = closestPoint(route, pointsOnRoute[pointsOnRoute.length - 1], routeBounds)

  let start = 0, end = 0
  if (closestStart.index > closestEnd.index) {
    start = closestEnd.index
    end = closestStart.index
  } else {
    start = closestStart.index
    end = closestEnd.index
  }

  visitableRoute.forEach((p, i) => {
    if (i >= start && i <= end) {
      p.visited = true
    }
  })
  return visitableRoute
}

const printTrackInfo = (name: string, track: Track) => {
  console.log('Track')
  console.log('  name: ', name)
  console.log('  points: ', track.length)
  console.log('  length: ', metersReadable(trackLength(track)))
  console.log('  center of track: ', trackCenter(track))
  console.log('  bounding box: ', boundingBox(track))
  console.log()
}

const printTrackComparison = (routeName: string, route: Track, trackName: string, track: Track) => {
  const s = performance.now()

  const visitableRoute = trackToVisitable(route)
  const applied = applyTrack(visitableRoute, track)

  const routeBounds = boundingBox(route)
  const trackBounds = boundingBox(track)

  // TODO: applyTrack and trackRouteIntersection both calculate an
  // intersection that could be shared.
  const pointsOnRoute = trackRouteIntersection(route, track, routeBounds, trackBounds)

  console.log('Track comparison')
  console.log('  route: ', routeName)
  console.log('  track: ', trackName)
  console.log('  overlap: ', boundsOverlap(routeBounds, trackBounds) ? '✅' : '❌')
  console.log('  pointsOnRoute: ', amountOfTrackPointsOnRoute(track, pointsOnRoute) * 100, '%')
  console.log('  intersectionLength: ', metersReadable(trackLength(pointsOnRoute)))
  console.log('  trackRouteCoverage: ', trackLength(pointsOnRoute) / trackLength(route) * 100, '%')
  console.log('  swcpDistance: ', metersReadable(distanceCovered(applied)))
  console.log('  swcpDistancePercent: ', distanceCovered(applied) / trackLength(route) * 100, '%')

  const e = performance.now()
  console.log('  execution time: ', (e - s).toFixed(3), 'ms')

  console.log()
}


//--- Main ---

import lizardJSON from './data/lizard_hike.json'
const lizardRoute = parseArrays(lizardJSON)

const swcpGPX = fs.readFileSync('hacking/data/SWCP-elev.gpx')
const swcpRoute = parseGPX(swcpGPX)

printTrackInfo('SWCP Route', swcpRoute)
printTrackInfo('SWCP Route (Simplified)', simplify(swcpRoute))
printTrackInfo('Lizard Activity', lizardRoute)
printTrackInfo('Lizard Activity (Simplified)', simplify(lizardRoute))

// printTrackComparison('SWCP Route', swcpRoute, 'Lizard Activity', lizardRoute)
printTrackComparison('SWCP Route (Simplified)', simplify(swcpRoute), 'Lizard Activity (Simplified)', simplify(lizardRoute))


// outputTrack(trackRouteIntersection(swcpRoute, lizardRoute), 'hacking/data/intersection.json')

// // Should not overlap
// const peaksGPX = fs.readFileSync('hacking/data/peaks_hike.gpx')
// const peaksRoute = parseGPX(peaksGPX)
// printTrackInfo('Peaks Activity', peaksRoute)
// printTrackComparison('SWCP Route', swcpRoute, 'Peaks Activity', peaksRoute)
