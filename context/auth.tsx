import React, { createContext, useContext, useEffect, useState } from 'react'

import { checkErrors } from 'lib/strava/api'
import { Athlete } from 'lib/strava/types'

type AuthContextData = {
  access_token: string
  refresh_token: string
  expires_at: Date
  athlete: Athlete
}

type AuthContextAccessor = {
  token: () => Promise<string | undefined>
  athlete: Athlete
}

type StravaAuth = {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: Athlete
}

const validateStravaAuth = (auth: StravaAuth) => {
  if (auth.access_token === undefined) return false
  if (auth.refresh_token === undefined) return false
  if (auth.expires_at === undefined) return false
  if (auth.athlete === undefined) return false

  if (auth.access_token === '') return false
  if (auth.refresh_token === '') return false

  return true
}

const AuthContext = createContext<AuthContextAccessor | null | undefined>(undefined)

// TODO: Refresh token if expired
export const AuthContextProvider = ({ children }: React.PropsWithChildren<any>) => {
  let localAuth: string | null | undefined = undefined
  if (typeof window !== 'undefined') {
    localAuth = localStorage.getItem('strava_auth')
  }

  const [auth, setAuth] = useState<AuthContextData | null | undefined>(undefined)
  useEffect(() => {
    // The server can never be authed as a user, and we don't want it to try accessing
    // localStorage or it will error.
    if (typeof window === 'undefined' || localAuth === undefined) {
      setAuth(undefined)
      return
    }

    // If the user doesn't have anything in localStorage, they're not authed.
    if (localAuth === null) {
      setAuth(null)
      return
    }

    const authData: StravaAuth = JSON.parse(localAuth)
    const valid = validateStravaAuth(authData)
    if (!valid) return

    if (authData.expires_at * 1000 < Date.now()) {
      refresh(authData)
        .then(data => {
          if (validateStravaAuth(data)) {
            setAuth({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: new Date(data.expires_at * 1000),
              athlete: data.athlete,
            })
          }
        })

      return
    }

    setAuth({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: new Date(authData.expires_at * 1000),
      athlete: authData.athlete,
    })
  }, [localAuth])

  let value = undefined
  if (auth === undefined) {
    value = undefined
  } else if (auth === null) {
    value = null
  } else {
    value = {
      token: () => getToken(auth, setAuth),
      athlete: auth.athlete,
    }
  }

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)

const refresh = (auth: StravaAuth) => {
  return fetch(`/api/strava/auth/refresh?id=${auth.athlete.id}`, {
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
      const newAuth = { ...auth, ...data }
      localStorage.setItem('strava_auth', JSON.stringify(newAuth))
      return newAuth
    })
    .catch(() => {
      localStorage.removeItem('strava_auth')
    })
}

const getToken = async (
  auth: AuthContextData | null | undefined,
  setAuth: React.Dispatch<React.SetStateAction<AuthContextData | null | undefined>>,
) => {
  if (auth === undefined) return undefined
  if (auth === null) return undefined

  if (auth.expires_at.valueOf() < Date.now()) {
    const ref = await refresh({
      access_token: auth.access_token,
      refresh_token: auth.refresh_token,
      expires_at: auth.expires_at.valueOf() / 1000,
      athlete: auth.athlete,
    })
      .then((data: StravaAuth) => {
        if (validateStravaAuth(data)) {
          setAuth({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: new Date(data.expires_at * 1000),
            athlete: data.athlete,
          })
          return data
        }
      })
    return ref?.access_token
  }

  return auth.access_token
}
