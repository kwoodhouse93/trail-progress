import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { useAuthContext } from 'context/auth'
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

const startBackfill = async (athlete: Athlete, setAthlete: SetAthleteFn, token?: string) => {
  if (token === undefined) throw new Error('invalid token')

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

const completeBackfill = async (athlete: Athlete, setAthlete: SetAthleteFn, token?: string) => {
  if (token === undefined) throw new Error('invalid token')

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
  const authContext = useAuthContext()
  const { strava } = useStrava()
  const [athlete, setAthlete] = useState<Athlete | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    if (strava === undefined) return
    const stravaAthlete = strava.getAthlete()
    if (stravaAthlete === undefined) {
      setAthlete(null)
      return
    }

    const fetchAthlete = async () => {
      const token = await authContext?.token()
      if (token === undefined) return
      try {
        const res = await fetch(`/api/user/athlete?id=${stravaAthlete.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) {
          localStorage.removeItem('strava_auth')
          setAthlete(null)
          router.push('/')
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
  }, [authContext])

  if (strava === undefined) return undefined
  if (athlete === null) return null
  if (athlete === undefined) return undefined
  if (authContext === undefined) return undefined
  if (authContext === null) return null

  return {
    ...athlete,
    startBackfill: () => authContext.token().then(t => startBackfill(athlete, setAthlete, t)),
    completeBackfill: () => authContext.token().then(t => completeBackfill(athlete, setAthlete, t)),
  }
}

export default useAthlete
