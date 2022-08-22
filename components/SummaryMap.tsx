import { MapContainer, Polyline, TileLayer } from 'react-leaflet'
import * as gPolyline from 'google-polyline'
import 'leaflet/dist/leaflet.css'
import { useCallback, useRef } from 'react'
import { Map, Polyline as PolylineType } from 'leaflet'

type SummaryMapProps = {
  polyline: string
}

const SummaryMap = ({ polyline }: SummaryMapProps) => {
  const mapRef = useRef<Map>(null)

  // Auto-set zoom based on polyline
  const fitRef = useCallback((polyline: PolylineType) => {
    if (polyline !== null && mapRef.current !== null) {
      mapRef.current.fitBounds(polyline.getBounds())
    }
  }, [])

  if (polyline === undefined || polyline === null) {
    return null
  }

  const points = gPolyline.decode(polyline)
  const center = points.reduce((acc, p) => {
    acc[0] += p[0]
    acc[1] += p[1]
    return acc
  }, [0, 0])
  center[0] /= points.length
  center[1] /= points.length

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={10}
      style={{ height: '200px', width: "100%" }}
      // Disable interactions
      zoomControl={false}
      scrollWheelZoom={false}
      zoomAnimation={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      dragging={false}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline ref={fitRef} positions={points} />
    </MapContainer>
  )
}

export default SummaryMap