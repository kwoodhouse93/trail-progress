import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import Trail from 'components/_Trail'
import useStrava from 'hooks/useStrava'
import styles from 'styles/Home.module.css'

export default function TrailPage() {
  const { authed } = useStrava()

  return (
    <div className={styles.container}>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          South West Coast Path
        </h1>

        <p className={styles.description}>
          The UK’s longest and best-loved National Trail!<br />
          <a href="https://www.southwestcoastpath.org.uk/">Learn more &rarr;</a>
        </p>

        {authed ?
          <div className={styles.app}>
            <Trail />
          </div>
          :
          <p>Before using TrailTracker, you need to connect your Strava account. <Link href="/auth/login">Log in with Strava</Link></p>

        }
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
