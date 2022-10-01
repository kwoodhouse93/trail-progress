import { useEffect, useState } from 'react'

import { Route } from 'lib/types'
import useStrava from 'hooks/useStrava'
import TrailSummary from 'components/TrailSummary'

import styles from 'styles/TrailList.module.scss'

const TrailList = () => {
  const { strava } = useStrava()
  const [trails, setTrails] = useState<Route[]>([])
  const [unprocessed, setUnprocessed] = useState<string[]>([])
  const [dirty, setDirty] = useState(true)

  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setTrails(data))
  }, [])

  useEffect(() => {
    if (trails === undefined || strava === undefined) return
    const athlete = strava.getAthlete()
    if (athlete === undefined) return
    if (!dirty) return

    setDirty(false)
    fetch(`/api/user/processing?id=${athlete.id}`)
      .then(res => res.json())
      .then(data => {
        setUnprocessed(data.map((s: { route_id: string, unprocessed_count: number }) => s.route_id))
        if (data.length > 0) {
          setTimeout(() => setDirty(true), 2000)
        }
      })
  }, [trails, strava, dirty])

  if (trails.length === 0) {
    return null
  }

  return <ul className={styles.list}>
    {trails.map(t => <li className={styles.el} key={t.id}>
      <TrailSummary pending={unprocessed.includes(t.id)} className={styles.summary} trail={t} />
    </li>)}
  </ul>
}

export default TrailList
