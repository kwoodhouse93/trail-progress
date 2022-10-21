import React from 'react'
import Head from 'next/head'

import TitleBar from 'components/TitleBar'

const Layout = ({ children }: React.PropsWithChildren<any>) => {
  const title = process.env.NODE_ENV === 'development' ? '[DEV] Trail Tracker' : 'Trail Tracker'
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
    </>
  )
}

export default Layout
