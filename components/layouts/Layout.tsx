import Head from 'next/head'
import TitleBar from 'components/TitleBar'
import React from 'react'

const Layout = ({ children }: React.PropsWithChildren<any>) => {
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
    </>
  )
}

export default Layout
