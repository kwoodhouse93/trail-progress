import { MapContainer, Polyline, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'


const Map = () => {
  const positions = require('../hacking/swcp.json')
  const activity = require('../hacking/sampletrack.json')
  return (
    <MapContainer center={[50.51, -4.06]} zoom={8} scrollWheelZoom={false} style={{ height: '80vh', width: "60%" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} />
      <Polyline positions={activity} color='red' />
    </MapContainer>
  )
}

export default Map
