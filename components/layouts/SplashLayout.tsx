import Head from 'next/head'
import TitleBar from 'components/TitleBar'
import React from 'react'
import Footer from 'components/Footer'
import StravaCTA from 'components/StravaCTA'

const SplashLayout = ({ children }: React.PropsWithChildren<any>) => {
  return (
    <>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TitleBar type='large' />
      <main>
        {children}
      </main>
    </>
  )
}

export default SplashLayout
