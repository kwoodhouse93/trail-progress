import { ReactElement } from 'react'
import { useRouter } from 'next/router'

import SplashLayout from 'components/layouts/SplashLayout'
import StravaLogin from 'components/StravaLogin'
import useStrava from 'hooks/useStrava'
import { cn } from 'lib/styles'

import styles from 'styles/Login.module.scss'

export default function Login() {
  const { authed } = useStrava()
  const router = useRouter()

  if (!authed) {
    return <div className={cn('pageWrapper', styles.wrapper)}>
      <p className='para'>
        Connect your Strava account to use TrailTracker.
      </p>
      <StravaLogin />
    </div>
  }

  router.push('/')
  return null
}

Login.getLayout = function getLayout(page: ReactElement) {
  return <SplashLayout>
    {page}
  </SplashLayout>
}
