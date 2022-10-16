import { useEffect, useState } from 'react'

import { useAuthContext } from 'context/auth'
import { Activity, Athlete } from 'lib/strava/types'

import styles from 'styles/AthleteActivitiesSummary.module.scss'

type AthleteActivitiesSummaryProps = {
  athlete: Athlete
}

const AthleteActivitiesSummary = ({ athlete }: AthleteActivitiesSummaryProps) => {
  const authContext = useAuthContext()
  const [activities, setActivities] = useState<Activity[] | undefined>(undefined)

  useEffect(() => {
    if (authContext === undefined || authContext === null) return

    authContext.token()
      .then(token => {
        fetch(`/api/user/activities?id=${athlete.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setActivities(data))
      })
  }, [athlete, authContext])

  let content = <p>Loading your activities...</p>
  if (activities !== undefined) {
    let noun = 'activities'
    if (activities.length === 1) {
      noun = 'activity'
    }
    content = <p><strong>{activities.length}</strong> {noun}</p>
  }

  return <div className={styles.wrapper}>
    {content}
  </div>
}

export default AthleteActivitiesSummary
