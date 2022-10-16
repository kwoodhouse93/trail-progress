import React from 'react'
import Head from 'next/head'

import AthleteFooter from 'components/AthleteFooter'
import TitleBar from 'components/TitleBar'
import { useAuthContext } from 'context/auth'

const AthleteLayout = ({ children }: React.PropsWithChildren<any>) => {
  const authContext = useAuthContext()

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
      <AthleteFooter athlete={authContext?.athlete} />
    </>
  )
}

export default AthleteLayout
