"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var xml2js = __importStar(require("xml2js"));
//--- Constants ---
// const DEG_TO_MET = 111_139 // Very approximate but good enough for us for now
// const MET_TO_DEG = 1 / DEG_TO_MET
//--- Tuning params ---
var BUFFER_DISTANCE = 150; /* meters */
//--- Helper functions ---
var parseGPX = function (gpx) {
    var outputTrack = [];
    xml2js.parseString(gpx, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var track = result.gpx.trk.map(function (t) {
            return t.trkseg[0].trkpt.map(function (p) {
                return {
                    lat: parseFloat(p.$.lat),
                    lon: parseFloat(p.$.lon)
                };
            });
        }).flat();
        outputTrack = track;
    });
    return outputTrack;
};
var parseArrays = function (a) {
    return a.map(function (_a) {
        var lat = _a[0], lon = _a[1];
        return {
            lat: lat,
            lon: lon
        };
    });
};
var trackToVisitable = function (track) {
    return track.map(function (p) {
        return {
            point: p,
            visited: false
        };
    });
};
var visitableToTrack = function (visitable) {
    return visitable.map(function (p) {
        return p.point;
    });
};
var coverage = function (track) {
    return track.filter(function (p) { return p.visited; }).length / track.length;
};
var distanceCovered = function (track) {
    var length = 0;
    for (var i = 0; i < track.length - 1; i++) {
        if (track[i].visited && track[i + 1].visited) {
            length += distance(track[i].point, track[i + 1].point);
        }
    }
    return length;
};
var trackCenter = function (track) {
    var sum = track.reduce(function (acc, cur) {
        acc.lat += cur.lat;
        acc.lon += cur.lon;
        return acc;
    }, { lat: 0, lon: 0 });
    return {
        lat: sum.lat / track.length,
        lon: sum.lon / track.length
    };
};
var outputTrack = function (track, filename) {
    var latlong = track.map(function (r) { return "[".concat(r.lat, ", ").concat(r.lon, "]"); }).join(',');
    fs.writeFile(filename, "[".concat(latlong, "]"), function (err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('wrote track to file ', filename);
    });
};
// Haversine distance
var distance = function (p1, p2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var r = 6371; // Earth radius in kilometers
    var c = Math.cos;
    var a = 0.5 - c((p2.lat - p1.lat) * p) / 2 +
        c(p1.lat * p) * c(p2.lat * p) *
            (1 - c((p2.lon - p1.lon) * p)) / 2;
    return 2 * r * Math.asin(Math.sqrt(a)) * 1000; // *1000 to convert to meters
};
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
var inBufferedBounds = function (point, bounds, bufferDistance) {
    var bufferedBounds = bufferBounds(bounds, bufferDistance);
    return !(point.lat < bufferedBounds.min.lat ||
        point.lat > bufferedBounds.max.lat ||
        point.lon < bufferedBounds.min.lon ||
        point.lon > bufferedBounds.max.lon);
};
// Find the closest point to `point` on `route`
// This is *very* slow.
var closestPoint = function (route, point, routeBounds) {
    var closest = {
        distance: Number.MAX_SAFE_INTEGER,
        point: undefined,
        index: -1
    };
    // Discard points not within route bounds (plus a buffer)
    if (routeBounds !== undefined) {
        if (!inBufferedBounds(point, routeBounds, BUFFER_DISTANCE)) {
            return closest;
        }
    }
    route.forEach(function (p, i) {
        var d = distance(p, point);
        if (d < closest.distance) {
            closest.distance = d;
            closest.point = p;
            closest.index = i;
        }
    });
    return closest;
};
// Returns true if point is within the buffer distance of a route point.
// Short circuits after finding a matching point.
var isPointWithinBuffer = function (route, point, routeBounds, bufferDistance) {
    // Discard points not within route bounds (plus a buffer)
    if (routeBounds !== undefined) {
        if (!inBufferedBounds(point, routeBounds, bufferDistance)) {
            return false;
        }
    }
    return route.some(function (p) {
        var d = distance(p, point);
        if (d < bufferDistance) {
            return true;
        }
    });
};
var isOnRoute = function (route, point, routeBounds, bufferDistance) {
    return isPointWithinBuffer(route, point, routeBounds, bufferDistance);
};
var fullTrackRouteIntersection = function (route, track) {
    var routeBounds = boundingBox(route);
    var trackBounds = boundingBox(track);
    return trackRouteIntersection(route, track, routeBounds, trackBounds);
};
var trackRouteIntersection = function (route, track, routeBounds, trackBounds) {
    if (!boundsOverlap(routeBounds, trackBounds)) {
        return [];
    }
    return track.filter(function (p) { return isOnRoute(route, p, routeBounds, BUFFER_DISTANCE); });
};
var amountOfTrackPointsOnRoute = function (track, intersection) {
    return intersection.length / track.length;
};
var trackLength = function (track) {
    var length = 0;
    for (var i = 0; i < track.length - 1; i++) {
        length += distance(track[i], track[i + 1]);
    }
    return length;
};
// Finds the smallest rectangle that contains all points of track
var boundingBox = function (track) {
    var min = {
        lat: Number.MAX_SAFE_INTEGER,
        lon: Number.MAX_SAFE_INTEGER
    };
    var max = {
        lat: Number.MIN_SAFE_INTEGER,
        lon: Number.MIN_SAFE_INTEGER
    };
    track.forEach(function (p) {
        if (p.lat < min.lat) {
            min.lat = p.lat;
        }
        if (p.lon < min.lon) {
            min.lon = p.lon;
        }
        if (p.lat > max.lat) {
            max.lat = p.lat;
        }
        if (p.lon > max.lon) {
            max.lon = p.lon;
        }
    });
    return {
        min: min,
        max: max
    };
};
// Increase the size of bounds by the bufferDistance.
var bufferBounds = function (bounds, bufferDistance) {
    return {
        min: {
            lat: bounds.min.lat - bufferDistance,
            lon: bounds.min.lon - bufferDistance
        },
        max: {
            lat: bounds.max.lat + bufferDistance,
            lon: bounds.max.lon + bufferDistance
        }
    };
};
// Returns true if the two bounding boxes overlap
var boundsOverlap = function (bb1, bb2) {
    return !(bb1.min.lat > bb2.max.lat ||
        bb1.min.lon > bb2.max.lon ||
        bb2.min.lat > bb1.max.lat ||
        bb2.min.lon > bb1.max.lon);
};
var metersReadable = function (metres) {
    if (metres < 1000) {
        return "".concat(metres, "m");
    }
    else {
        return "".concat((metres / 1000).toFixed(3), "km");
    }
};
var applyTrack = function (visitableRoute, track) {
    var route = visitableToTrack(visitableRoute);
    var routeBounds = boundingBox(route);
    var trackBounds = boundingBox(track);
    var pointsOnRoute = trackRouteIntersection(route, track, routeBounds, trackBounds);
    var closestStart = closestPoint(route, pointsOnRoute[0], routeBounds);
    var closestEnd = closestPoint(route, pointsOnRoute[pointsOnRoute.length - 1], routeBounds);
    console.log('Closest point to start of intersection:', closestStart);
    console.log('Closest point to end of intersection:', closestEnd);
    var start = 0, end = 0;
    if (closestStart.index > closestEnd.index) {
        start = closestEnd.index;
        end = closestStart.index;
    }
    else {
        start = closestStart.index;
        end = closestEnd.index;
    }
    visitableRoute.forEach(function (p, i) {
        if (i >= start && i <= end) {
            p.visited = true;
        }
    });
    return visitableRoute;
};
var printTrackInfo = function (name, track) {
    console.log('Track');
    console.log('  name: ', name);
    console.log('  points: ', track.length);
    console.log('  length: ', metersReadable(trackLength(track)));
    console.log('  center of track: ', trackCenter(track));
    console.log('  bounding box: ', boundingBox(track));
    console.log();
};
var printTrackComparison = function (routeName, route, trackName, track) {
    var visitableRoute = trackToVisitable(route);
    var applied = applyTrack(visitableRoute, track);
    var routeBounds = boundingBox(route);
    var trackBounds = boundingBox(track);
    // TODO: applyTrack and trackRouteIntersection both calculate an
    // intersection that could be shared.
    var pointsOnRoute = trackRouteIntersection(route, track, routeBounds, trackBounds);
    console.log('Track comparison');
    console.log('  route: ', routeName);
    console.log('  track: ', trackName);
    console.log('  overlap: ', boundsOverlap(routeBounds, trackBounds) ? '✅' : '❌');
    console.log('  pointsOnRoute: ', amountOfTrackPointsOnRoute(track, pointsOnRoute) * 100, '%');
    console.log('  intersectionLength: ', metersReadable(trackLength(pointsOnRoute)));
    console.log('  trackRouteCoverage: ', trackLength(pointsOnRoute) / trackLength(route) * 100, '%');
    console.log('  swcpDistance: ', metersReadable(distanceCovered(applied)));
    console.log('  swcpDistancePercent: ', distanceCovered(applied) / trackLength(route) * 100, '%');
    console.log();
};
//--- Main ---
var lizard_hike_json_1 = __importDefault(require("./data/lizard_hike.json"));
var lizardRoute = parseArrays(lizard_hike_json_1["default"]);
var swcpGPX = fs.readFileSync('hacking/data/SWCP-elev.gpx');
var swcpRoute = parseGPX(swcpGPX);
printTrackInfo('SWCP Route', swcpRoute);
printTrackInfo('Lizard Activity', lizardRoute);
printTrackComparison('SWCP Route', swcpRoute, 'Lizard Activity', lizardRoute);
// outputTrack(trackRouteIntersection(swcpRoute, lizardRoute), 'hacking/data/intersection.json')
// // Should not overlap
// const peaksGPX = fs.readFileSync('hacking/data/peaks_hike.gpx')
// const peaksRoute = parseGPX(peaksGPX)
// printTrackInfo('Peaks Activity', peaksRoute)
// printTrackComparison('SWCP Route', swcpRoute, 'Peaks Activity', peaksRoute)
