import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import ButtonLink from 'components/common/ButtonLink'
import AthleteLayout from 'components/layouts/AthleteLayout'
import { useAuthContext } from 'context/auth'
import { cn } from 'lib/styles'

import styles from 'styles/Pending.module.scss'

export default function Pending() {
  const router = useRouter()
  const authContext = useAuthContext()
  if (authContext === null) {
    router.push('/')
    return null
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
