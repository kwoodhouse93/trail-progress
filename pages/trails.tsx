import { ReactElement } from 'react'

import Layout from 'components/layouts/Layout'
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
  return <Layout>
    {page}
  </Layout>
}
