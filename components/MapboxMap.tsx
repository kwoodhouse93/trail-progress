import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from 'styles/MapboxMap.module.scss'
import Spinner from './Spinner'

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

type MapboxMapProps = {
  id: string
  geojson?: GeoJSON.LineString
  coverage?: GeoJSON.MultiLineString
}

const MapboxMap = ({ id, geojson, coverage }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const node = mapContainer.current
    if (typeof window === "undefined" || node === null) return
    if (geojson === undefined) return
    setLoading(true)

    // otherwise, create a map instance
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: mapboxToken,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [0.1276, 51.5072],
      zoom: 9,
    })

    mapboxMap.on('load', () => {
      mapboxMap.addSource('route', {
        'type': 'geojson' as const,
        'data': `/api/geojson?id=${id}`
      })
      mapboxMap.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#04292a',
          'line-width': 3,
        }
      })

      console.log(coverage)
      mapboxMap.addSource('coverage', {
        'type': 'geojson' as const,
        'data': coverage
      })
      mapboxMap.addLayer({
        'id': 'coverage-highlight',
        'type': 'line',
        'source': 'coverage',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#fff',
          'line-width': 6,
        }
      })
      mapboxMap.addLayer({
        'id': 'coverage',
        'type': 'line',
        'source': 'coverage',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#fc4e03',
          'line-width': 4,
        }
      })

      const bounds = new mapboxgl.LngLatBounds()
      geojson.coordinates.forEach(c => bounds.extend(c as [number, number]))
      mapboxMap.fitBounds(bounds, {
        padding: 50,
        animate: false,
      })
      setLoading(false)
    })

    return () => {
      mapboxMap.remove()
    }
  }, [id, geojson, coverage])

  return <div className={styles.outer}>
    {loading && <div className={styles.spinner}>
      <Spinner small />
    </div>}
    <div ref={mapContainer} className={styles.wrapper} />
  </div>
}

export default MapboxMap
