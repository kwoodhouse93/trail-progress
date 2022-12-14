import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import AthleteLayout from 'components/layouts/AthleteLayout'
import ActivitySummary from 'components/ActivitySummary'
import CoverageBar from 'components/CoverageBar'
import { useAuthContext } from 'context/auth'
import useAthlete from 'hooks/useAthlete'
import { Activity, metersReadable } from 'lib/strava/types'
import { Route } from 'lib/types'

import styles from 'styles/TrailPage.module.scss'
import MapboxMap from 'components/MapboxMap'

type Stats = {
  length: number
}

type CoverageActivity = {
  activity: Activity
  polyline: string
  coveredSections: string[]
  coveredLength: number
}

export default function TrailPage() {
  const authContext = useAuthContext()

  const router = useRouter()
  const { id } = router.query

  const athlete = useAthlete()

  const [trail, setTrail] = useState<Route | undefined>(undefined)
  const [coverage, setCoverage] = useState<GeoJSON.MultiLineString | undefined>(undefined)
  const [stats, setStats] = useState<Stats | undefined>(undefined)
  const [activities, setActivities] = useState<CoverageActivity[]>([])

  useEffect(() => {
    if (athlete === undefined || athlete === null) return
    if (athlete.backfill_status !== 'complete') {
      router.push('/pending')
      return
    }
  }, [athlete, router])

  useEffect(() => {
    if (id === undefined) {
      return
    }
    fetch('/api/route?id=' + id)
      .then(res => res.json())
      .then(data => setTrail(data))
  }, [id])

  useEffect(() => {
    if (id === undefined) return
    if (authContext === undefined || authContext === null) return

    authContext.token().then(token => {
      fetch(`/api/user/route?route_id=${id}&athlete_id=${authContext.athlete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data === undefined) return
          console.log('data', data)
          setCoverage(data.coveredGeoJSON)
          setStats(data.stats)
          Array.isArray(data.relevantActivities) && setActivities(data.relevantActivities)
        })
    })
  }, [id, authContext])

  if (authContext === null) {
    router.push('/')
    return null
  }

  if (trail === undefined || stats === undefined) return null

  return <div className='pageWrapper'>
    <h3 className={styles.title}>
      {trail.display_name}
    </h3>
    <p className={styles.description}>
      {trail.description}
    </p>
    {trail.length && <p>The {trail.display_name} is {metersReadable(trail.length)} long.</p>}

    <div className={styles.mapWrapper}>
      <div className={styles.map}>
        <MapboxMap
          id={trail.id}
          geojson={trail.geojson !== undefined ? JSON.parse(trail.geojson) : undefined}
          coverage={coverage}
        />
      </div>
    </div>

    {trail.length !== undefined && stats.length > 0 ?
      <>
        <p>
          You have covered <span className={styles.strong}>{metersReadable(stats.length)}</span>!
        </p>
        <CoverageBar totalLength={trail.length} coveredLength={stats.length} />
      </>
      :
      <>
        <p>
          It looks like you haven???t been to the {trail.display_name} yet.
          Why not plan a trip?
        </p>
      </>
    }

    {activities.length > 0 && <div className={styles.activitySection}>
      <h3>
        Your activities on this trail
      </h3>
      <ul className={styles.activityList}>
        {activities.sort((a, b) => b.coveredLength - a.coveredLength).map(ca => <li key={ca.activity.id}>
          <ActivitySummary activity={ca.activity} coveredLength={ca.coveredLength} />
        </li>)}
      </ul>
    </div>
    }
  </div>
}

TrailPage.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
