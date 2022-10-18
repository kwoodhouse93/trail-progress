import { useEffect, useState } from 'react'

import TrailSummary from 'components/TrailSummary'
import { useAuthContext } from 'context/auth'
import { allProcessed, completion, mapProcessingData, processedRouteIDs, ProcessingStats, ready } from 'lib/processing'
import { Route } from 'lib/types'

import styles from 'styles/TrailList.module.scss'


const TrailList = () => {
  const authContext = useAuthContext()

  const [trails, setTrails] = useState<Route[]>([])
  const [processingStats, setProcessingStats] = useState<ProcessingStats[]>([])
  const [processedRoutes, setProcessedRoutes] = useState<string[]>([])
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
    if (trails === undefined || trails.length === 0) return

    setPollProcessing(false)
    authContext.token().then(token => {
      fetch(`/api/user/processing?id=${authContext.athlete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(mapProcessingData)
        .then(data => {
          if (data === null) return

          setProcessingStats(data)
          if (!allProcessed(data)) {
            // If there are still unprocessed routes, poll again in a bit
            setTimeout(() => setPollProcessing(true), 2000)
          }

          const nowDone = processedRouteIDs(data)
          if (nowDone.length > processedRoutes.length) {
            setProcessedRoutes(nowDone)
          }
        })
    })
  }, [trails, authContext, pollProcessing, processedRoutes])

  // Set fetchRoutes if nowDone has changed
  useEffect(() => {
    if (processedRoutes.length === 0) return
    // Make sure we fetch routes again as they should now have correct covered_length stats
    setFetchRoutes(true)
  }, [processedRoutes.length])

  if (trails?.length === 0) {
    return null
  }

  return <ul className={styles.list}>
    {trails.map(t => <li className={styles.el} key={t.id}>
      <TrailSummary ready={ready(t, processedRoutes)} completion={completion(t, processingStats)} className={styles.summary} trail={t} />
    </li>)}
  </ul>
}

export default TrailList
