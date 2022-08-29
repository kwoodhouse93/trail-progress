import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import AthleteSummary from 'components/AthleteSummary'
import StravaLogin from 'components/StravaLogin'
import useStrava from 'hooks/useStrava'
import styles from 'styles/Home.module.css'

export default function Login() {
  const { strava, authed } = useStrava()

  return (
    <div className={styles.container}>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Connect your Strava
        </h1>

        <p className={styles.description}>
          Connect your Strava account to use TrailTracker.
        </p>

        <div className={styles.grid}>
          <div>
            {authed
              ? <div>
                <p>Your account is connected</p>
                <AthleteSummary athlete={strava?.getAthlete()} />
                <h1><Link href="/swcp">Ready?</Link></h1>
              </div>
              : <StravaLogin />}
          </div>
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
