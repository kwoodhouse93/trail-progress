import { useRouter } from 'next/router'
import Link from 'next/link'
import { ReactElement, useEffect, useState } from 'react'

import AthleteLayout from 'components/layouts/AthleteLayout'
import AfterDelay from 'components/AfterDelay'
import SetupProgress from 'components/SetupProgress'
import Spinner from 'components/Spinner'
import { useAuthContext } from 'context/auth'
import useAthlete from 'hooks/useAthlete'
import useStrava from 'hooks/useStrava'

import styles from 'styles/Backfill.module.scss'
import { activityCount, allProcessed, mapProcessingData, processed, ProcessingStats, total } from 'lib/processing'
import CoverageBar from 'components/CoverageBar'
import ProgressBar from 'components/common/ProgressBar'

type Status = 'default' | 'backfill' | 'process' | 'done'

export default function Backfill() {
  const authContext = useAuthContext()
  const { strava } = useStrava()
  const athlete = useAthlete()
  const router = useRouter()

  const [status, setStatus] = useState<Status>('default')
  const [dirty, setDirty] = useState(false)
  const [processingStats, setProcessingStats] = useState<ProcessingStats[]>([])
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const backfillActivities = async () => {
      if (strava === undefined) return
      if (athlete === undefined || athlete === null) return
      if (authContext === undefined || authContext === null) return

      const token = await authContext.token()
      if (token === undefined) return

      try {
        for (let page = 1, done = false; !done; page++) {
          const activities = await strava.activities(page)

          // Stop if there are no activities left.
          if (activities.length === 0) {
            done = true
            athlete.completeBackfill()
            return
          }

          // Dispatch storing in DB asynchronously so we can fetch more activities in parallel.
          // TODO: Handle errors here. We mark as backfill complete if we fetch them all from Strava,
          // without caring whether they got inserted into the DB.
          fetch('/api/user/activities', {
            method: 'POST',
            body: JSON.stringify(activities),
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => {
            if (!res.ok) {
              setError('Something went wrong.')
              return
            }
          })
        }
      } catch (e: any) {
        setError(e.message)
      }
    }

    if (strava === undefined) return
    if (athlete === undefined || athlete === null) return
    if (authContext === undefined || authContext === null) return

    switch (athlete.backfill_status) {
      case 'not_started':
        athlete.startBackfill()
        break
      case 'started':
        setStatus('backfill')
        backfillActivities()
        break
      case 'complete':
        setDirty(true)
        setStatus('process')
        break
    }
    // TODO: Check what happens if account has 0 activities
  }, [strava, authContext, athlete?.id, athlete?.backfill_status, router])

  useEffect(() => {
    if (!dirty) return
    if (authContext === undefined || authContext === null) return

    authContext.token().then(token => {
      setDirty(false)
      fetch(`/api/user/processing?id=${authContext.athlete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(mapProcessingData)
        .then(data => {
          if (data === null) return
          setProcessingStats(data)
          if (allProcessed(data)) {
            router.push('/trails')
            return
          }
          setTimeout(() => setDirty(true), 2000)
        })
    })
  }, [authContext, dirty, router])

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
      case 'backfill':
        return <p>Fetching your activities from Strava...</p>
      case 'process':
        return <>
          <p>Loaded {activityCount(processingStats)} activities.</p>
          <p>Just crunching the numbers...</p>
          <ProgressBar className={styles.progressBar} total={total(processingStats)} completed={processed(processingStats)} />
          <AfterDelay delay={2000}>
            <p>This can take a minute. <Link href="/trails">Skip ahead?</Link></p>
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
      case 'backfill':
        return 'backfill'
      case 'process':
        return 'processing'
      case 'done':
        return 'processing'
      default:
        return 'connecting'
    }
  }

  return <div className="pageWrapper">
    <SetupProgress state={statusToState(status)} />
    <Spinner impulse={status === 'process' || status === 'done'} />
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
