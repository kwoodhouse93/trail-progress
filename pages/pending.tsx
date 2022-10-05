import { ReactElement } from 'react'
import { useRouter } from 'next/router'

import useAthlete from 'hooks/useAthlete'
import { cn } from 'lib/styles'
import ButtonLink from 'components/common/ButtonLink'
import AthleteLayout from 'components/layouts/AthleteLayout'

import styles from 'styles/Pending.module.scss'

export default function Pending() {
  const athlete = useAthlete()
  const router = useRouter()
  if (athlete === null) {
    router.push('/')
    return
  }

  return <div className={cn('pageWrapper', styles.wrapper)}>
    <h2>Setup required</h2>
    <p>We still need to finish setting up your account.</p>
    <ButtonLink href="/backfill" className={styles.button}>Continue</ButtonLink>
  </div>
}

Pending.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
