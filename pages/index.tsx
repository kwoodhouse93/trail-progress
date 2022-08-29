import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from 'styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          TrailTracker 🗺️🧭
        </h1>

        <p className={styles.description}>
          Choose a trail, and connect your Strava account to see your progress!
        </p>

        <div className={styles.grid}>
          <Link href="/swcp" passHref>
            <a className={styles.card}>
              <h2>South West Cost Path</h2>
              <p>The UK’s longest and best-loved National Trail!</p>
            </a>
          </Link>
        </div>
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
