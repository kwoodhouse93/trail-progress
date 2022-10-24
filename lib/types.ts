export type Route = {
  id: string
  display_name: string
  geojson?: string // Parse to GeoJSON.LineString
  thumbnail?: string
  description?: string
  length?: number
  covered_length?: number
}
