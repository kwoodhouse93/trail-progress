import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Route } from 'lib/types'
import { Activity, metersReadable } from 'lib/strava/types'
import { useDetailMap } from 'hooks/useDetailMap'
import useStrava from 'hooks/useStrava'
import AthleteLayout from 'components/layouts/AthleteLayout'
import CoverageBar from 'components/CoverageBar'

import styles from 'styles/TrailPage.module.scss'
import ActivitySummary from 'components/ActivitySummary'
import useAthlete from 'hooks/useAthlete'

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
  const DetailMap = useDetailMap()

  const router = useRouter()
  const { id } = router.query

  const athlete = useAthlete()
  const { strava } = useStrava()

  const [trail, setTrail] = useState<Route | undefined>(undefined)
  const [coverage, setCoverage] = useState<string[] | undefined>(undefined)
  const [stats, setStats] = useState<Stats | undefined>(undefined)
  const [activities, setActivities] = useState<CoverageActivity[]>([])

  useEffect(() => {
    if (athlete === undefined) return
    if (athlete === null) {
      router.push('/')
      return
    }
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
    if (id === undefined || strava === undefined) {
      return
    }
    const stravaAthlete = strava.getAthlete()
    if (stravaAthlete === undefined) return

    fetch(`/api/user/route?route_id=${id}&athlete_id=${stravaAthlete.id}`)
      .then(res => res.json())
      .then(data => {
        setCoverage(data.union.map((u: { polyline: string }) => u.polyline))
        setStats(data.stats)
        setActivities(data.relevantActivities)
      })
  }, [id, strava])

  if (trail === undefined || stats === undefined) return null

  return <div className='pageWrapper'>
    <h3>
      {trail.display_name}
    </h3>
    <p>
      {trail.description}
    </p>
    {trail.length && <p>The {trail.display_name} is {metersReadable(trail.length)} long.</p>}

    <div className={styles.mapWrapper}>
      <div className={styles.map}>
        <DetailMap polyline={trail.polyline} overlayPolylines={coverage} />
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
          It looks you haven’t been to the {trail.display_name} yet.
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
