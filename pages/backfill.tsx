import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import AthleteLayout from 'components/layouts/AthleteLayout'
import SetupProgress from 'components/SetupProgress'
import useStrava from 'hooks/useStrava'

import styles from 'styles/Backfill.module.scss'
import Spinner from 'components/Spinner'
import useAthlete from 'hooks/useAthlete'
import AfterDelay from 'components/AfterDelay'

type Status = 'default' | 'strava' | 'postgres' | 'done'

export default function Backfill() {
  const { strava } = useStrava()
  const athlete = useAthlete()
  const router = useRouter()

  const [status, setStatus] = useState<Status>('default')
  const [activityCount, setActivityCount] = useState<number>(0)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (strava === undefined) return
    if (athlete === undefined) return
    if (athlete === null) {
      router.push('/')
      return
    }

    switch (athlete.backfill_status) {
      case 'not_started':
        athlete.startBackfill()
        break
      case 'started':
        setStatus('strava')
        strava?.activities()
          .then(activities => {
            setActivityCount(activities.length)
            setStatus('postgres')
            fetch('/api/user/activities', {
              method: 'POST',
              body: JSON.stringify(activities),
            })
              .then(response => {
                if (response.ok) {
                  athlete.completeBackfill()
                } else {
                  setError('Something went wrong.')
                }
              })
          })
          .catch(e => setError(e.message))
        break
      case 'complete':
        router.push('/trails')
        setStatus('done')
        break
    }
    // TODO: Check what happens if account has 0 activities
  }, [strava, athlete?.id, athlete?.backfill_status, router])


  const content = (status: Status) => {
    switch (status) {
      case 'default':
        return <>
          <p>Connecting to your Strava account...</p>
          <AfterDelay delay={3000}>
            <p className={styles.error}>
              There seems to be a problem. <Link href="/">Please try again.</Link>
            </p>
          </AfterDelay>
        </>
      case 'strava':
        return <p>Fetching your activities from Strava...</p>
      case 'postgres':
        return <>
          <p>Loaded {activityCount} activities.</p>
          <p>Just crunching the numbers...</p>
          <AfterDelay delay={2000}>
            <p>This can take a few minutes.</p>
          </AfterDelay>
          <AfterDelay delay={10000}>
            <p>There’s a lot of calculations involved!</p>
          </AfterDelay>
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
      {error && <p className={styles.error}>{error} <Link href="/">Please try again.</Link></p>}
    </div>
  </div>
}

Backfill.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
