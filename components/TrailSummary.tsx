import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { Route } from 'lib/types'
import useStrava from 'hooks/useStrava'
import activities from 'pages/api/strava/activities'

type TrailSummaryProps = {
  routeName: 'swcp'
}

type acti = {
  id: number,
  name: string,
  polyline: string,
  intersection_polyline: string,
  intersection_polylines: string[],
  substrings: string[],
}

const TrailSummary = ({ routeName }: TrailSummaryProps) => {
  const SummaryMap = useMemo(() => dynamic(
    () => import('components/SummaryMap'),
    { loading: () => <p>Loading map...</p>, ssr: false, },
  ), [])

  const { strava } = useStrava()
  const [route, setRoute] = useState<Route | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [relevantActivities, setRelevantActivities] = useState<acti[]>([])

  // TODO: Get this route info as static props, for a page per trail
  useEffect(() => {
    setLoading(true)

    if (routeName === undefined) {
      setLoading(false)
      return
    }

    fetch(`/api/route?name=${routeName}`)
      .then(res => res.json())
      .then(data => setRoute(data))

    const athleteId = strava?.getAthlete()?.id

    if (athleteId === undefined) {
      setLoading(false)
      return
    }

    fetch(`/api/user/route?name=${routeName}&id=${athleteId}`)
      .then(res => res.json())
      .then(data => setRelevantActivities(data))
      .finally(() => setLoading(false))
  }, [routeName, strava])

  if (route === undefined) {
    return null
  }

  if (loading) {
    return <p>Loading...</p>
  }

  const allSubstrings = relevantActivities.reduce((acc: string[], a) => {
    return acc.concat(a.substrings)
  }, [])

  return <>
    <h1>{route.display_name}</h1>
    {/* TODO: Use a special map type as the main display map */}
    <SummaryMap polyline={route.polyline} overlayPolylines={allSubstrings} />
    {relevantActivities.length < 1 ? <p>No relevant activities found</p> : <>
      <p>Basing calculations on:</p>
      <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
        {relevantActivities.map(a => {
          if (a === undefined) return null
          return <li key={a.id} >
            {a.name}
            {/* {a.name} {a.substrings} */}
            {/* <SummaryMap polyline={a.polyline} overlayPolylines={a.intersection_polylines} /> */}
            <SummaryMap polyline={a.polyline} overlayPolylines={a.substrings} />
          </li>
        })}
      </ul>
    </>}
  </>
}

export default TrailSummary
