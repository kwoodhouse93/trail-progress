import type { NextApiResponse } from 'next'

export class StravaError extends Error {
  code: number
  detail: any

  constructor(code: number, message: string, detail: any) {
    super(message)
    this.name = 'StravaError'
    this.code = code
    this.detail = detail
  }
}

export const checkErrors = async (response: Response) => {
  if (!response.ok) {
    throw new StravaError(response.status, response.statusText, await response.json())
  }
  return response
}

export const logRateLimits = async (response: Response) => {
  let usage15m, usage1d, limit15m, limit1d

  const usage = response.headers.get('X-RateLimit-Usage')
  if (usage !== null) {
    [usage15m, usage1d] = usage.split(',')
  }

  const limit = response.headers.get('X-RateLimit-Limit')
  if (limit !== null) {
    [limit15m, limit1d] = limit.split(',')
  }

  console.log(`Strava rate limits: 15m (${usage15m} / ${limit15m}), 1d (${usage1d} / ${limit1d})`)

  return response
}

export const logData = (data: any) => {
  console.log(data)
  return data
}
