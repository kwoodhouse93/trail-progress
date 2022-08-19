import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'

//--- Constants ---
// const DEG_TO_MET = 111_139 // Very approximate but good enough for us for now
// const MET_TO_DEG = 1 / DEG_TO_MET

//--- Tuning params ---
const BUFFER_DISTANCE = 150 /* meters */

//--- Types ---
type Point = {
  lat: number
  lon: number
}

type Track = Point[]

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
// TODO: This is *very* slow - can we optimise?
const closestPoint = (route: Track, point: Point, routeBounds: Bounds) => {
  let closest: { distance: number, point?: Point } = {
    distance: Number.MAX_SAFE_INTEGER,
    point: undefined,
  }

  // Discard points not within route bounds (plus a buffer)
  if (routeBounds !== undefined) {
    if (!inBufferedBounds(point, routeBounds, BUFFER_DISTANCE)) {
      return closest
    }
  }

  route.forEach(p => {
    const d = distance(p, point)
    if (d < closest.distance) {
      closest.distance = d
      closest.point = p
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
  const routeBounds = boundingBox(route)
  const trackBounds = boundingBox(track)
  const pointsOnRoute = trackRouteIntersection(route, track, routeBounds, trackBounds)

  console.log('Track comparison')
  console.log('  route: ', routeName)
  console.log('  track: ', trackName)
  console.log('  overlap: ', boundsOverlap(routeBounds, trackBounds) ? '✅' : '❌')
  console.log('  pointsOnRoute: ', amountOfTrackPointsOnRoute(track, pointsOnRoute)) // Disable if not needed as it's a bit slow
  console.log('  intersectionLength: ', metersReadable(trackLength(pointsOnRoute)))
  console.log('  trackRouteCoverage: ', trackLength(pointsOnRoute) / trackLength(route) * 100, '%')
  console.log()
}


//--- Main ---

import lizardJSON from './data/lizard_hike.json'
const lizardRoute = parseArrays(lizardJSON)

const swcpGPX = fs.readFileSync('hacking/data/SWCP-elev.gpx')
const swcpRoute = parseGPX(swcpGPX)

printTrackInfo('SWCP Route', swcpRoute)
printTrackInfo('Lizard Activity', lizardRoute)

printTrackComparison('SWCP Route', swcpRoute, 'Lizard Activity', lizardRoute)



// outputTrack(trackRouteIntersection(swcpRoute, lizardRoute), 'hacking/data/intersection.json')

// // Should not overlap
// const peaksGPX = fs.readFileSync('hacking/data/peaks_hike.gpx')
// const peaksRoute = parseGPX(peaksGPX)
// printTrackInfo('Peaks Activity', peaksRoute)
// printTrackComparison('SWCP Route', swcpRoute, 'Peaks Activity', peaksRoute)
