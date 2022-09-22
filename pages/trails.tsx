import { ReactElement } from 'react'

import AthleteLayout from 'components/layouts/AthleteLayout'
import TrailList from 'components/TrailList'
import { cn } from 'lib/styles'

import styles from 'styles/Trails.module.scss'

export default function Home() {
  return <div className={cn('pageWrapper', styles.wrapper)}>
    <h2>Choose a trail</h2>
    <TrailList />
  </div>
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
