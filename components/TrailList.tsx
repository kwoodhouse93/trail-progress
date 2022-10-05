import { useEffect, useState } from 'react'

import useStrava from 'hooks/useStrava'
import { Route } from 'lib/types'
import TrailSummary from 'components/TrailSummary'

import styles from 'styles/TrailList.module.scss'

const TrailList = () => {
  const { strava } = useStrava()
  const [trails, setTrails] = useState<Route[]>([])
  const [unprocessed, setUnprocessed] = useState<string[]>([])
  const [pollProcessing, setPollProcessing] = useState(true)
  const [fetchRoutes, setFetchRoutes] = useState(true)

  useEffect(() => {
    if (!fetchRoutes) return

    if (strava === undefined) return
    const stravaAthlete = strava.getAthlete()
    if (stravaAthlete === undefined) return

    setFetchRoutes(false)
    fetch(`/api/user/routes?id=${stravaAthlete.id}`, {
      headers: { 'Authorization': `Bearer ${strava.getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        Array.isArray(data) && setTrails(data)
      })
  }, [strava, fetchRoutes])

  useEffect(() => {
    if (!pollProcessing) return
    if (trails === undefined || strava === undefined) return
    const athlete = strava.getAthlete()
    if (athlete === undefined) return

    setPollProcessing(false)
    fetch(`/api/user/processing?id=${athlete.id}`, {
      headers: { 'Authorization': `Bearer ${strava.getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setUnprocessed(data.map((s: { route_id: string, unprocessed_count: number }) => s.route_id))
        if (data.length > 0) {
          // If there are still unprocessed routes, poll again in a bit
          setTimeout(() => setPollProcessing(true), 2000)
        } else {
          // Make sure we fetch routes again as they should now have correct covered_length stats
          setFetchRoutes(true)
        }
      })
  }, [trails, strava, pollProcessing])

  if (trails?.length === 0) {
    return null
  }

  return <ul className={styles.list}>
    {trails.map(t => <li className={styles.el} key={t.id}>
      <TrailSummary pending={unprocessed.includes(t.id)} className={styles.summary} trail={t} />
    </li>)}
  </ul>
}

export default TrailList
