import { useEffect, useState } from 'react'

import useStrava from 'hooks/useStrava'
import { Activity, Athlete } from 'lib/strava/types'

import styles from 'styles/AthleteActivitiesSummary.module.scss'

type AthleteActivitiesSummaryProps = {
  athlete: Athlete
}

const AthleteActivitiesSummary = ({ athlete }: AthleteActivitiesSummaryProps) => {
  const { strava } = useStrava()
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => {
    if (strava === undefined) return
    fetch(`/api/user/activities?id=${athlete.id}`, {
      headers: { 'Authorization': `Bearer ${strava.getToken()}` }
    })
      .then(res => res.json())
      .then(data => setActivities(data))
  }, [athlete, strava])

  let content = <p>Loading your activities...</p>
  if (activities.length > 0) {
    content = <p><strong>{activities.length}</strong> activities</p>
  }

  return <div className={styles.wrapper}>
    {content}
  </div>
}

export default AthleteActivitiesSummary
