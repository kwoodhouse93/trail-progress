import { ReactElement } from 'react'

import AthleteLayout from 'components/layouts/AthleteLayout'
import ButtonLink from 'components/common/ButtonLink'
import { cn } from 'lib/styles'

import styles from 'styles/Pending.module.scss'

export default function Pending() {
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
