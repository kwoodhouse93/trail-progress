import Head from 'next/head'
import TitleBar from 'components/TitleBar'
import React from 'react'
import useStrava from 'hooks/useStrava'
import AthleteFooter from 'components/AthleteFooter'

const Layout = ({ children }: React.PropsWithChildren<any>) => {
  const { strava } = useStrava()
  const athlete = strava?.getAthlete()

  return (
    <>
      <Head>
        <title>TrailTracker</title>
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

export default Layout
