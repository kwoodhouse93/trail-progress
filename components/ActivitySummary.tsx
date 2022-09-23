import { Activity, activityTypeToIcon, metersReadable, timeReadable } from 'lib/strava/types'

import styles from 'styles/ActivitySummary.module.scss'

type ActivitySummaryProps = {
  activity: Activity
  coveredLength?: number
}

const ActivitySummary = ({ activity, coveredLength }: ActivitySummaryProps) => {
  if (activity === undefined) {
    return null
  }

  return <div className={styles.wrapper}>
    <h3 className={styles.title}>
      {activity.name}
      <span className={styles.icon}>{activityTypeToIcon(activity.type)}</span>
    </h3>
    <p>{metersReadable(activity.distance)}, {timeReadable(activity.moving_time)}</p>
    {coveredLength !== undefined && <p>Covered {metersReadable(coveredLength)} of this trail</p>}
    <a href={`https://www.strava.com/activities/${activity.id}`}>View on Strava</a>
  </div>
}

export default ActivitySummary
