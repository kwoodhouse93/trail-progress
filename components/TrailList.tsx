import { useEffect, useState } from 'react'

import TrailSummary from 'components/TrailSummary'
import { useAuthContext } from 'context/auth'
import { Route } from 'lib/types'

import styles from 'styles/TrailList.module.scss'

const TrailList = () => {
  const authContext = useAuthContext()

  const [trails, setTrails] = useState<Route[]>([])
  const [unprocessed, setUnprocessed] = useState<string[]>([])
  const [pollProcessing, setPollProcessing] = useState(true)
  const [fetchRoutes, setFetchRoutes] = useState(true)

  useEffect(() => {
    if (!fetchRoutes) return
    if (authContext === undefined || authContext === null) return

    setFetchRoutes(false)
    authContext.token().then(token => {
      fetch(`/api/user/routes?id=${authContext.athlete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          Array.isArray(data) && setTrails(data)
        })
    })
  }, [authContext, fetchRoutes])

  useEffect(() => {
    if (!pollProcessing) return
    if (authContext === undefined || authContext === null) return
    if (trails === undefined) return

    setPollProcessing(false)
    authContext.token().then(token => {
      fetch(`/api/user/processing?id=${authContext.athlete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    })
  }, [trails, authContext, pollProcessing])

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
