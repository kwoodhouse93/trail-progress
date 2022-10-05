import { ReactElement } from 'react'
import { useRouter } from 'next/router'

import useAthlete from 'hooks/useAthlete'
import Footer from 'components/Footer'
import SplashLayout from 'components/layouts/SplashLayout'
import StravaCTA from 'components/StravaCTA'

import styles from 'styles/Splash.module.scss'

export default function Home() {
  const athlete = useAthlete()
  const router = useRouter()

  if (athlete !== undefined && athlete !== null) {
    router.push('/trails')
    return null
  }

  return <>
    <p className={styles.body}>
      Have you ever walked part of a long distance trail, and wondered...
    </p>
    <p className={styles.blockquote}>
      How much have I completed?
    </p>

    <Footer>
      <StravaCTA caption='Find out now.' />
    </Footer>
  </>
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <SplashLayout>
    {page}
  </SplashLayout>
}
