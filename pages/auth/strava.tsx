import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import StravaLogin from 'components/StravaLogin'
import { exchangeCode } from 'hooks/useStrava'
import styles from 'styles/Home.module.css'


const AuthStrava = () => {
  const router = useRouter()
  const { redir, code, scope } = router.query

  const redirPath = Array.isArray(redir) ? redir[0] : redir
  const authCode = Array.isArray(code) ? code[0] : code
  const scopes = Array.isArray(scope) ? scope[0].split(',') : scope?.split(',')

  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (redirPath === undefined || authCode === undefined || scopes === undefined) {
      setError("Something went wrong.")
      return
    }

    // Check scopes
    if (!scopes?.includes('read') || !scopes?.includes('activity:read')) {
      setError('You must grant read and activity:read permissions to access your Strava data.')
      return
    }

    // Exchange code
    exchangeCode(authCode)
      .then(e => {
        if (e !== undefined) {
          setError('Something went wrong!')
        } else {
          // Redirect on success
          router.push(redirPath)
        }
      })

    // router.push(redirPath)
  }, [router, redirPath, authCode, scopes])

  return (
    <div className={styles.container}>
      <Head>
        <title>TrailTracker</title>
        <meta name="description" content="Choose a trail, and connect your Strava account to see your progress!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Connecting your account...
        </h1>

        <div className={styles.description}>
          {error !== undefined && <>
            <p>{error} Please try again.</p>
            <StravaLogin />
          </>
          }
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

export default AuthStrava
