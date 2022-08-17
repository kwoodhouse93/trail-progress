const fs = require('fs')
const xml2js = require('xml2js')

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
          ele: p.ele[0]
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

const printTrackInfo = (name, track) => {
  console.log('Track')
  console.log('  name: ', name)
  console.log('  points: ', track.length)
  console.log('  center of track: ', trackCenter(track))
}

// Load JSON Strava data
const sample = require('./sampletrack.json')

// Load route GPX
const gpx = fs.readFileSync('./SWCP-elev.gpx')
const swcpRoute = parseGPX(gpx)

printTrackInfo('SWCP Route', swcpRoute)
printTrackInfo('Lizard Activity', sample)
