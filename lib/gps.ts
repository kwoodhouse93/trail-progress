const BUFFER_DISTANCE = 150 /* meters */

type Point = {
  lat: number
  lon: number
}

type Track = Point[]

type Bounds = {
  min: Point
  max: Point
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

// Returns true if the two bounding boxes overlap
const boundsOverlap: (bb1: Bounds, bb2: Bounds) => boolean = (bb1, bb2) => {
  return !(
    bb1.min.lat > bb2.max.lat ||
    bb1.min.lon > bb2.max.lon ||
    bb2.min.lat > bb1.max.lat ||
    bb2.min.lon > bb1.max.lon
  )
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

const isOnRoute = (route: Track, point: Point, routeBounds: Bounds, bufferDistance: number) => {
  return isPointWithinBuffer(route, point, routeBounds, bufferDistance)
}

const inBufferedBounds = (point: Point, bounds: Bounds, bufferDistance: number) => {
  const bufferedBounds = bufferBounds(bounds, bufferDistance)
  return !(
    point.lat < bufferedBounds.min.lat ||
    point.lat > bufferedBounds.max.lat ||
    point.lon < bufferedBounds.min.lon ||
    point.lon > bufferedBounds.max.lon
  )
}

const trackRouteIntersection = (route: Track, track: Track, routeBounds: Bounds, trackBounds: Bounds) => {
  if (!boundsOverlap(routeBounds, trackBounds)) {
    return []
  }
  return track.filter(p => isOnRoute(route, p, routeBounds, BUFFER_DISTANCE))
}

export const fullTrackRouteIntersection = (route: Track, track: Track) => {
  const routeBounds = boundingBox(route)
  const trackBounds = boundingBox(track)
  return trackRouteIntersection(route, track, routeBounds, trackBounds)
}

export const parseArrays = (a: number[][]) => {
  return a.map(p => {
    return {
      lat: p[0],
      lon: p[1],
    }
  })
}

export const trackLength = (track: Track) => {
  let length = 0
  for (let i = 0; i < track.length - 1; i++) {
    length += distance(track[i], track[i + 1])
  }
  return length
}
