const fs = require('fs')
const xml2js = require('xml2js')

var parseGPX = function (gpx) {
  var outputTrack = []
  xml2js.parseString(gpx, function (err, result) {
    if (err) {
      console.error(err)
      return
    }
    var track = result.gpx.trk.map(function (t) {
      return t.trkseg[0].trkpt.map(function (p) {
        return {
          lat: parseFloat(p.$.lat),
          lon: parseFloat(p.$.lon)
        }
      })
    }).flat()
    outputTrack = track
  })
  return outputTrack
}

var outputWKT = function (track, filename) {
  var points = track.map(function (r) { return r.lon + " " + r.lat }).join(', ')
  fs.writeFile(filename, "LINESTRING(".concat(points, ")"), function (err) {
    if (err) {
      console.error(err)
      return
    }
    console.log('wrote track to file ', filename)
  })
}

const btgpx = fs.readFileSync('hacking/data/Bruce_Trail.gpx')
const bt = parseGPX(btgpx)
outputWKT(bt, 'hacking/data/Bruce_Trail.wkt')
