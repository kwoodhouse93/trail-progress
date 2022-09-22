import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import AthleteLayout from 'components/layouts/AthleteLayout'
import { Route } from 'lib/types'
import { useSummaryMap } from 'hooks/useSummaryMap'

import styles from 'styles/TrailPage.module.scss'

export default function TrailPage() {
  const router = useRouter()
  const { id } = router.query

  const [trail, setTrail] = useState<Route | undefined>(undefined)

  const SummaryMap = useSummaryMap()

  useEffect(() => {
    if (id === undefined) {
      return
    }
    fetch('/api/route?id=' + id)
      .then(res => res.json())
      .then(data => setTrail(data))
  }, [id])

  if (trail === undefined) return null

  return <div className='pageWrapper'>
    <h3>
      {trail.display_name}
    </h3>
    <p>
      {trail.description}
    </p>

    <div className={styles.mapWrapper}>
      <div className={styles.map}>
        <SummaryMap polyline={trail.polyline} />
      </div>
    </div>
  </div>
}

TrailPage.getLayout = function getLayout(page: ReactElement) {
  return <AthleteLayout>
    {page}
  </AthleteLayout>
}
