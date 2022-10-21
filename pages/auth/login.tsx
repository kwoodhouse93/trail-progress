import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import useStrava from 'hooks/useStrava'
import SplashLayout from 'components/layouts/SplashLayout'
import SetupProgress from 'components/SetupProgress'
import StravaLogin from 'components/StravaLogin'
import { cn } from 'lib/styles'

import styles from 'styles/Login.module.scss'

export default function Login() {
  const { authed } = useStrava()
  const router = useRouter()

  if (!authed) {
    return <div className={cn('pageWrapper', styles.wrapper)}>
      <SetupProgress state='connecting' />
      <p className={cn('para', styles.connectPara)}>
        Connect your Strava account to use <strong>Trail Tracker</strong>
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
