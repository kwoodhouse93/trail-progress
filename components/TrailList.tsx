import { useEffect, useState } from 'react'

import { Route } from 'lib/types'
import TrailSummary from 'components/TrailSummary'

import styles from 'styles/TrailList.module.scss'

const TrailList = () => {
  const [trails, setTrails] = useState<Route[]>([])

  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setTrails(data))
  })

  if (trails.length === 0) {
    return null
  }

  return <ul className={styles.list}>
    {trails.map(t => <li key={t.id}>
      <TrailSummary trail={t} />
    </li>)}
  </ul>
}

export default TrailList
