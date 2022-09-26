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

type SetAthleteFn = React.Dispatch<React.SetStateAction<Athlete | undefined>>

const startBackfill = async (athlete: Athlete, setAthlete: SetAthleteFn) => {
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
  })
  const data = await res.json()
  setAthlete(data)
}

const completeBackfill = async (athlete: Athlete, setAthlete: SetAthleteFn) => {
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
  })
  const data = await res.json()
  setAthlete(data)
}

const useAthlete: () => AthleteAPI | undefined = () => {
  const { strava } = useStrava()
  const [athlete, setAthlete] = useState<Athlete | undefined>(undefined)

  useEffect(() => {
    if (strava === undefined) return
    const stravaAthlete = strava.getAthlete()

    const fetchAthlete = async () => {
      const res = await fetch(`/api/user/athlete?id=${stravaAthlete.id}`)
      const data = await res.json()
      setAthlete(data)
    }
    fetchAthlete()
  }, [strava])

  if (athlete === undefined) return undefined

  return {
    ...athlete,
    startBackfill: () => startBackfill(athlete, setAthlete),
    completeBackfill: () => completeBackfill(athlete, setAthlete),
  }
}

export default useAthlete
