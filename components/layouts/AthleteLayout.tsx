import React from 'react'
import Head from 'next/head'

import useStrava from 'hooks/useStrava'
import AthleteFooter from 'components/AthleteFooter'
import TitleBar from 'components/TitleBar'

const AthleteLayout = ({ children }: React.PropsWithChildren<any>) => {
  const { strava } = useStrava()
  const athlete = strava?.getAthlete()
  const title = process.env.NODE_ENV === 'development' ? '[DEV] TrailTracker' : 'TrailTracker'

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TitleBar type='small' />
      <main>
        {children}
      </main>
      <AthleteFooter athlete={athlete} />
    </>
  )
}

export default AthleteLayout
