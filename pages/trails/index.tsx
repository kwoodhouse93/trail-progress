import { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'

import useAthlete from 'hooks/useAthlete'
import AthleteLayout from 'components/layouts/AthleteLayout'
import TrailList from 'components/TrailList'
import { cn } from 'lib/styles'

import styles from 'styles/Trails.module.scss'

export default function Trails() {
  const router = useRouter()
  const athlete = useAthlete()

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
