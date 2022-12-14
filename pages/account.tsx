import { ReactElement } from 'react'
import { useRouter } from 'next/router'

import Layout from 'components/layouts/Layout'
import Athlete from 'components/Athlete'
import { useAuthContext } from 'context/auth'
import useStrava from 'hooks/useStrava'

export default function Home() {
  const { strava } = useStrava()

  const router = useRouter()
  const authContext = useAuthContext()
  if (authContext === null) {
    router.push('/')
    return null
  }

  const signOut = () => {
    if (strava === undefined) return

    strava.signOut()
    router.push('/')
  }

  const deleteAthlete: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()

    if (strava === undefined) return

    const sure = window.confirm("Are you sure you want to delete your account?\n\nSo you know, we'll delete all of your data. If you choose to sign in again, we'll have fetch it from Strava again and re-run our calculations.")
    if (!sure) return

    strava.deleteAthlete()
    // Yes, this is gross. But it's the laziest way to improve the odds we've
    // actually deleted the athlete before redirecting to `/`.
    setTimeout(() => {
      router.push('/')
    }, 500)
  }

  return <div className="pageWrapper">
    <Athlete athlete={strava?.getAthlete()} signOut={signOut} deleteAthlete={deleteAthlete} />
  </div>
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>
    {page}
  </Layout>
}
