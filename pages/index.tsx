import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import SplashLayout from 'components/layouts/SplashLayout'
import Footer from 'components/Footer'
import StravaCTA from 'components/StravaCTA'
import { useAuthContext } from 'context/auth'

import styles from 'styles/Splash.module.scss'

export default function Home() {
  const router = useRouter()
  const authContext = useAuthContext()

  if (authContext !== undefined && authContext !== null) {
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
