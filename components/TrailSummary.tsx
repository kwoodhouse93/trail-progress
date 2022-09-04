import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { Route } from 'lib/types'
import useStrava from 'hooks/useStrava'
import activities from 'pages/api/strava/activities'
import { Stats } from 'fs'
import { metersReadable } from 'lib/strava/types'

type TrailSummaryProps = {
  routeName: 'swcp'
}

type acti = {
  id: number,
  name: string,
  polyline: string,
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
  const [union, setUnion] = useState<{ polyline: string }[]>([])
  const [stats, setStats] = useState<{ length: number } | undefined>(undefined)

  // TODO: Get this route info as static props, for a page per trail
  useEffect(() => {
    setLoading(true)

    const athleteId = strava?.getAthlete()?.id
    if (routeName === undefined || athleteId === undefined) {
      setLoading(false)
      return
    }

    fetch(`/api/route?name=${routeName}`)
      .then(res => res.json())
      .then(data => setRoute(data))

    fetch(`/api/user/route?name=${routeName}&id=${athleteId}`)
      .then(res => res.json())
      .then(data => {
        setRelevantActivities(data.relevantActivities)
        setUnion(data.union)
        setStats(data.stats)
      })
      .finally(() => setLoading(false))

  }, [routeName, strava])

  if (route === undefined) {
    return null
  }

  if (loading) {
    return <p>Loading...</p>
  }

  const allSubstrings = union.reduce((acc: string[], s) => {
    return acc.concat(s.polyline)
  }, [])
  console.log(union)

  return <>
    <h1>{route.display_name}</h1>
    {route.description && <p>{route.description}</p>}
    {stats !== undefined && route.length !== undefined
      ?
      <>
        <p>
          {metersReadable(stats.length)} / {metersReadable(route.length)} total
        </p>
        <p>
          {((stats.length / route.length) * 100).toFixed(1)}% complete
        </p>
      </>
      : null}
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
