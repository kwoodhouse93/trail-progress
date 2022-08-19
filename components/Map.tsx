import { MapContainer, Polyline, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'


const Map = () => {
  const positions = require('../hacking/data/swcp.json')
  const activity = require('../hacking/data/lizard_hike.json')
  const intersection = require('../hacking/data/intersection.json')
  return (
    <MapContainer center={[50.51, -4.06]} zoom={8} scrollWheelZoom={false} style={{ height: '80vh', width: "60%" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} />
      <Polyline positions={activity} color='red' />
      <Polyline positions={intersection} color='green' />
    </MapContainer>
  )
}

export default Map
