import { ReactElement } from 'react'
import { useRouter } from 'next/router'

import Layout from 'components/layouts/Layout'

import Athlete from 'components/Athlete'
import useStrava from 'hooks/useStrava'
import Button from 'components/common/Button'

export default function Home() {
  const { strava } = useStrava()
  const router = useRouter()

  const signOut = () => {
    if (strava === undefined) return

    strava.signOut()
    router.push('/')
  }

  return <div className="pageWrapper">
    <Athlete athlete={strava?.getAthlete()} signOut={signOut} />
  </div>
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>
    {page}
  </Layout>
}
