import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useMemo } from 'react'

export default function MapPage() {
  const Map = useMemo(() => dynamic(
    () => import('../components/Map'),
    { loading: () => <p>Loading map...</p>, ssr: false, },
  ), [])

  return (
    <div className={styles.container}>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Map />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
