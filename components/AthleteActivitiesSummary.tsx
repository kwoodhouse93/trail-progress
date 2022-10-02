import { useEffect, useState } from 'react'

import { Activity, Athlete } from 'lib/strava/types'

import styles from 'styles/AthleteActivitiesSummary.module.scss'

type AthleteActivitiesSummaryProps = {
  athlete: Athlete
}

const AthleteActivitiesSummary = ({ athlete }: AthleteActivitiesSummaryProps) => {
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => {
    fetch(`/api/user/activities?id=${athlete.id}`)
      .then(res => res.json())
      .then(data => setActivities(data))
  }, [activities, athlete])

  let content = <p>Loading your activities...</p>
  if (activities.length > 0) {
    content = <p><strong>{activities.length}</strong> activities</p>
  }

  return <div className={styles.wrapper}>
    {content}
  </div>
}

export default AthleteActivitiesSummary
