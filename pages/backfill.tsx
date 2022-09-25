import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import AthleteLayout from 'components/layouts/AthleteLayout'
import SetupProgress from 'components/SetupProgress'
import useStrava from 'hooks/useStrava'

import styles from 'styles/Backfill.module.scss'
import Spinner from 'components/Spinner'

type Status = 'default' | 'strava' | 'postgres' | 'done'

export default function Backfill() {
  const { strava } = useStrava()
  const router = useRouter()

  const [status, setStatus] = useState<Status>('default')
  const [activityCount, setActivityCount] = useState<number>(0)

  useEffect(() => {
    if (strava === undefined) return

    setStatus('strava')
    strava?.activities()
      .then(activities => {
        setActivityCount(activities.length)
        setStatus('postgres')
        return activities
      })
      .then(activities => {
        fetch('/api/user/activities', {
          method: 'POST',
          body: JSON.stringify(activities),
        })
          .then(() => {
            setStatus('done')
            router.push('/trails')
          })
      })
      .catch(e => console.error(e))
  }, [strava])


  const content = (status: Status) => {
    switch (status) {
      case 'default':
        return <p>Connecting to your Strava account...</p>
      case 'strava':
        return <p>Fetching your activities from Strava...</p>
      case 'postgres':
        return <>
          <p>Loaded {activityCount} activities.</p>
          <p>Just crunching the numbers...</p>
          <p>This can take a few minutes.</p>
        </>
      case 'done':
        return <p>Almost done!</p>
    }
  }

  const statusToState = (status: Status) => {
    switch (status) {
      case 'default':
        return 'connecting'
      case 'strava':
        return 'backfill'
      case 'postgres':
        return 'processing'
      case 'done':
        return 'processing'
      default:
        return 'connecting'
    }
  }

  return <div className="pageWrapper">
    <SetupProgress state={statusToState(status)} />
    <Spinner impulse={status === 'postgres' || status === 'done'} />
    <div className={styles.contentWrapper}>
      {content(status)}
    </div>
  </div>
}

Backfill.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
