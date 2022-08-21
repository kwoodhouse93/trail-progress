import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { fullTrackRouteIntersection, parseArrays, trackLength } from '../utils/gps'
import { Activity, activityTypeToIcon, metersReadable, timeReadable } from '../strava/types'

type ActivitySummaryProps = {
  activity: Activity
}

const ActivitySummary = ({ activity }: ActivitySummaryProps) => {
  const SummaryMap = useMemo(() => dynamic(
    () => import('../components/SummaryMap'),
    { loading: () => <p>Loading map...</p>, ssr: false, },
  ), [])

  const [track, setTrack] = useState<number[][]>([])
  const [routePercentage, setRoutePercentage] = useState(0)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   if (activity === undefined) {
  //     return
  //   }

  //   if (!trailTypes.includes(activity.type)) {
  //     return
  //   }

  //   fetch(`/api/positions?id=${activity.id}&token=${token}`)
  //     .then(res => res.json())
  //     .then(data => setTrack(data[0].data))
  // }, [activity, token, trailTypes])

  // useEffect(() => {
  //   setLoading(true)
  //   if (track.length < 1) {
  //     return
  //   }
  //   const r = parseArrays(require('../hacking/data/swcp.json'))
  //   const t = parseArrays(track)
  //   const pointsOnRoute = fullTrackRouteIntersection(t, r)
  //   setRoutePercentage(trackLength(pointsOnRoute) / trackLength(r) * 100)
  //   setLoading(false)
  // }, [track])

  if (activity === undefined) {
    return null
  }

  return <div>
    <h3>{activityTypeToIcon(activity.type)} {activity.name}</h3>
    <p>{metersReadable(activity.distance)}, {timeReadable(activity.moving_time)}</p>
    {/* {loading && <p>Calculating route coverage...</p>} */}
    {/* {(track.length > 0) && <p>Covers <em>{routePercentage.toFixed(2)}%</em> of the SWCP</p>} */}
    {activity.map.summary_polyline !== null && <SummaryMap polyline={activity.map.summary_polyline} />}
    <a href={`https://www.strava.com/activities/${activity.id}`}>View on Strava</a>
  </div>
}

export default ActivitySummary
