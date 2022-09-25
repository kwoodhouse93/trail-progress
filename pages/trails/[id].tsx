import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Route } from 'lib/types'
import { Activity, metersReadable } from 'lib/strava/types'
import { useSummaryMap } from 'hooks/useSummaryMap'
import useStrava from 'hooks/useStrava'
import AthleteLayout from 'components/layouts/AthleteLayout'
import CoverageBar from 'components/CoverageBar'

import styles from 'styles/TrailPage.module.scss'
import ActivitySummary from 'components/ActivitySummary'

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
  const SummaryMap = useSummaryMap()

  const router = useRouter()
  const { id } = router.query

  const { strava } = useStrava()

  const [trail, setTrail] = useState<Route | undefined>(undefined)
  const [coverage, setCoverage] = useState<string[] | undefined>(undefined)
  const [stats, setStats] = useState<Stats | undefined>(undefined)
  const [activities, setActivities] = useState<CoverageActivity[]>([])

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
    fetch(`/api/user/route?route_id=${id}&athlete_id=${strava.getAthlete().id}`)
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
        <SummaryMap polyline={trail.polyline} overlayPolylines={coverage} />
      </div>
    </div>

    {trail.length !== undefined &&
      <>
        <p>
          You have covered <span className={styles.strong}>{metersReadable(stats.length)}</span>!
        </p>
        <CoverageBar totalLength={trail.length} coveredLength={stats.length} />
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
