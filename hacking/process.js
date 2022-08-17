const fs = require('fs')
const xml2js = require('xml2js')

// Tuning params
const bufferDistance = 150 // meters

// Helper functions
const parseGPX = (gpx) => {
  let outputTrack = []
  xml2js.parseString(gpx, (err, result) => {
    if (err) {
      console.log(err)
      return
    }
    const track = result.gpx.trk.map(t => {
      return t.trkseg[0].trkpt.map(p => {
        return {
          lat: p.$.lat,
          lon: p.$.lon,
          ele: p.ele[0] // We have elevation data, whether we want to use it or not 🤷
        }
      })
    }).flat()
    outputTrack = track
  })
  return outputTrack
}

const trackCenter = (track) => {
  const sum = track.reduce((acc, cur) => {
    acc.lat += parseFloat(cur.lat)
    acc.lon += parseFloat(cur.lon)
    return acc
  }, { lat: 0, lon: 0 })
  return {
    lat: sum.lat / track.length,
    lon: sum.lon / track.length
  }
}

const outputTrack = (track, filename) => {
  const latlong = track.map(r => `[${r.lat}, ${r.lon}]`).join(',')
  fs.writeFile('filename', `[${latlong}]`, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('wrote track to file ', filename)
  })
}

// Find the closest point to `point` on `route`
const closestPoint = (track, point) => {
  let closest = {
    distance: Number.MAX_SAFE_INTEGER,
    point: null
  }
  track.forEach(p => {
    const distance = Math.sqrt(
      Math.pow(
        Math.abs(p.lat - point.lat),
        2,
      ) + Math.pow(
        Math.abs(p.lon - point.lon),
        2,
      ))
    if (distance < closest.distance) {
      closest.distance = distance
      closest.point = p
    }
  })
  return closest
}

// This is a horribly slow brute force that finds, for each point in track, the closest point in route
const closestPoints = (route, track) => {
  const closestPoints = []
  track.forEach(p => {
    const closest = closestPoint(route, p)
    closestPoints.push(closest)
  })
  return closestPoints
}

const boundingBox = (track) => {
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

const boundsOverlap = (track1, track2) => {
  const bb1 = boundingBox(track1)
  const bb2 = boundingBox(track2)
  return (bb1.min.lat > bb2.max.lat || bb1.max.lat < bb2.min.lat || bb1.min.lon > bb2.max.lon || bb1.max.lon < bb2.min.lon)
}


const printTrackInfo = (name, track) => {
  console.log('Track')
  console.log('  name: ', name)
  console.log('  points: ', track.length)
  console.log('  center of track: ', trackCenter(track))
  console.log('  bounding box: ', boundingBox(track))
}

// Load JSON Strava data
const sample = require('./sampletrack.json').map(p => {
  return {
    lat: p[0],
    lon: p[1],
  }
})

// Load route GPX
const gpx = fs.readFileSync('./SWCP-elev.gpx')
const swcpRoute = parseGPX(gpx)

printTrackInfo('SWCP Route', swcpRoute)
printTrackInfo('Lizard Activity', sample)

console.log('Tracks overlap: ', boundsOverlap(swcpRoute, sample) ? '✅' : '❌')


// console.log('Closest points on route to activity points: ', closestPoints(swcpRoute, sample))
