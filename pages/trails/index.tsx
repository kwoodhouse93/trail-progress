import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'

import AthleteLayout from 'components/layouts/AthleteLayout'
import TrailList from 'components/TrailList'
import { useAuthContext } from 'context/auth'
import useAthlete from 'hooks/useAthlete'
import { cn } from 'lib/styles'

import styles from 'styles/Trails.module.scss'

export default function Trails() {
  const athlete = useAthlete()

  const router = useRouter()
  const authContext = useAuthContext()

  useEffect(() => {
    if (athlete === undefined) return
    if (athlete === null) return
    if (athlete.backfill_status !== 'complete') {
      router.push('/pending')
      return
    }
  }, [athlete, router])

  if (authContext === null) {
    router.push('/')
    return null
  }

  return <div className={cn('pageWrapper', styles.wrapper)}>
    <h2>Choose a trail</h2>
    <TrailList />
  </div>
}

Trails.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
