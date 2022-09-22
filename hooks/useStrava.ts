import { useEffect, useState } from 'react'
import { Activity, Athlete } from 'lib/strava/types'
import { checkErrors } from 'lib/strava/api'

export const requiredScopes = ['read', 'activity:read']

type StravaAuth = {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: any
}

const isAuthed = async () => {
  const auth = getAuth()
  if (auth === undefined) {
    return false
  }

  // Refresh expired access tokens
  if (auth.expires_at < Date.now() / 1000) {
    if (auth.refresh_token !== undefined && auth.refresh_token !== '') {
      const e = await refresh(auth)
      if (e === undefined) {
        return true
      }
      console.error(e)
    }
    return false
  }

  // If something looks wrong with access_token, bail out
  if (auth.access_token === undefined || auth.access_token === '') {
    return false
  }

  return true
}

const getAuth = () => {
  const auth = localStorage.getItem('strava_auth')
  if (auth === null) {
    return undefined
  }
  const authData: StravaAuth = JSON.parse(auth)
  return authData
}

export const exchangeCode = (code: string) => {
  return fetch(`/api/strava/auth/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code,
    }),
  })
    .then(checkErrors)
    .then(data => data.json())
    .then(data => {
      localStorage.setItem('strava_auth', JSON.stringify(data))
    })
    .catch(e => e)
}

const refresh = (auth: StravaAuth) => {
  return fetch(`/api/strava/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: auth.refresh_token,
    }),
  })
    .then(checkErrors)
    .then(data => data.json())
    .then(data => {
      localStorage.setItem('strava_auth', JSON.stringify({ ...auth, ...data }))
    })
    .catch(e => e)
}

const activities = async () => {
  const auth = getAuth()
  if (auth === undefined) {
    return undefined
  }

  const data = await fetch('/api/strava/activities', { headers: { 'Authorization': `Bearer ${auth.access_token}` } })
    .then(checkErrors)
    .then(data => data.json())

  return data
}

const signOut = () => {
  localStorage.removeItem('strava_auth')
}

interface StravaAPI {
  isAuthed: () => Promise<boolean>
  getAthlete: () => Athlete
  activities: () => Promise<Activity[]>
  signOut: () => void
}

const strava: StravaAPI = {
  isAuthed: isAuthed,
  getAthlete: () => getAuth()?.athlete,
  activities: activities,
  signOut: signOut,
}

const useStrava = () => {
  // Async check for SSR
  const [isSSR, setIsSSR] = useState(true)
  useEffect(() => {
    setIsSSR(false)
  }, [])

  // Async check for authed
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    if (!isSSR) return
    strava.isAuthed().then(a => setAuthed(a))
  }, [isSSR])

  // Cannot use on server side as depends on localStorage
  if (isSSR) return { strava: undefined, authed: false }

  // Return API and authed state
  return { strava, authed }
}

export default useStrava
