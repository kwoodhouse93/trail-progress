import React, { useEffect, useState } from 'react'

import useStrava from 'hooks/useStrava'

type Status = 'not_started' | 'started' | 'complete'

type Athlete = {
  id: number
  backfill_status: Status
}

type AthleteAPI = {
  id: number
  backfill_status: Status
  startBackfill: () => void
  completeBackfill: () => void
}

type SetAthleteFn = React.Dispatch<React.SetStateAction<Athlete | null | undefined>>

const startBackfill = async (athlete: Athlete, token: string, setAthlete: SetAthleteFn) => {
  if (athlete.backfill_status === 'started') {
    return
  }

  if (athlete.backfill_status !== 'not_started') {
    throw new Error('cannot start backfill, already started')
  }

  const res = await fetch(`/api/user/athlete/state`, {
    method: 'POST',
    body: JSON.stringify({
      id: athlete.id,
      status: 'started',
    }),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await res.json()
  setAthlete(data)
}

const completeBackfill = async (athlete: Athlete, token: string, setAthlete: SetAthleteFn) => {
  if (athlete.backfill_status === 'complete') {
    return
  }

  if (athlete.backfill_status !== 'started') {
    throw new Error('cannot complete backfill, not started')
  }

  const res = await fetch(`/api/user/athlete/state`, {
    method: 'POST',
    body: JSON.stringify({
      id: athlete.id,
      status: 'complete',
    }),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await res.json()
  setAthlete(data)
}

const useAthlete: () => AthleteAPI | null | undefined = () => {
  const { strava } = useStrava()
  const [athlete, setAthlete] = useState<Athlete | null | undefined>(undefined)

  useEffect(() => {
    if (strava === undefined) return
    const stravaAthlete = strava.getAthlete()
    if (stravaAthlete === undefined) {
      setAthlete(null)
      return
    }

    const fetchAthlete = async () => {
      try {
        const res = await fetch(`/api/user/athlete?id=${stravaAthlete.id}`, {
          headers: { 'Authorization': `Bearer ${strava.getToken()}` },
        })
        if (!res.ok) {
          localStorage.removeItem('strava_auth')
          setAthlete(null)
          return
        }
        const data = await res.json()
        setAthlete(data)
      } catch (e) {
        console.error(e)
        // The logged in athlete and our own records aren't in sync.
        // Try forcing the user back through Strava OAuth.
        localStorage.removeItem('strava_auth')
      }
    }
    fetchAthlete()
  }, [strava])

  if (strava === undefined) return undefined
  if (athlete === null) return null
  if (athlete === undefined) return undefined
  const token = strava.getToken()
  if (token === undefined) return undefined

  return {
    ...athlete,
    startBackfill: () => startBackfill(athlete, token, setAthlete),
    completeBackfill: () => completeBackfill(athlete, token, setAthlete),
  }
}

export default useAthlete
