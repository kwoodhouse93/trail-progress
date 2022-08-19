import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Trail from '../components/Trail'
import styles from '../styles/Home.module.css'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

type TrailPageProps = {
  token: string | null
  authError: string | null
}

export default function TrailPage({ token, authError }: TrailPageProps) {
  // TODO: Separate out this auth error logic
  if (token && authError) {
    return <div>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h3>Error signing into Strava</h3>
        <p>{authError}</p>
        <p>Please try signing in again:</p>
        <div className={styles.strava}>
          <a href={`http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/swcp&approval_prompt=force&scope=read,activity:read`}>Log in with Strava &rarr;</a>
        </div>
      </main>
    </div>
  }
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

        {token === null ?
          <div className={styles.strava}>
            {/* TODO: Look into using a read_all scope to get private activities */}
            <a href={`http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/swcp&approval_prompt=force&scope=read,activity:read`}>Log in with Strava &rarr;</a>
          </div>
          :
          <div className={styles.app}>
            <Trail token={token} />
          </div>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code, scope } = context.query

  let authError = null
  let token = null

  const scopes = Array.isArray(scope) ? scope[0]?.split(',') : scope?.split(',')
  if (!scopes?.includes('read') || !scopes?.includes('activity:read')) {
    authError = 'You must grant read and activity:read permissions to access your Strava data'
  }

  if (code) {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: context.query.code,
        grant_type: 'authorization_code',
      }),
    })

    // TODO: Store the token somewhere, check expiry, refresh, etc. Libraries for this?
    token = (await res.json()).access_token || null
  }
  return {
    props: {
      token: token,
      authError: authError,
    },
  }
}
