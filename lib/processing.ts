import { Route } from 'lib/types'

export type ProcessingStats = {
  route_id: string
  unprocessed: number
  processed: number
  total: number
}

export const mapProcessingData = (data: {
  route_id: string,
  unprocessed: string,
  processed: string,
  total: string
}[]) => {
  if (!Array.isArray(data)) return null
  return data.map((d: { route_id: string, unprocessed: string, processed: string, total: string }) => {
    // Make sure string values are parsed as int
    return {
      route_id: d.route_id,
      unprocessed: parseInt(d.unprocessed),
      processed: parseInt(d.processed),
      total: parseInt(d.total),
    }
  })
}

export const ready = (route: Route, processedRoutes: string[]) => {
  return processedRoutes.includes(route.id)
}

export const completion = (route: Route, processingStats: ProcessingStats[]) => {
  const stats = processingStats.find(s => s.route_id === route.id)
  if (stats === undefined) return 0
  return stats.processed / stats.total
}

export const processedRouteIDs = (processingStats: ProcessingStats[]) => {
  return processingStats.filter(d => d.unprocessed === 0).map(r => r.route_id)
}

export const allProcessed = (processingStats: ProcessingStats[]) => {
  return processingStats.every(d => d.unprocessed === 0)
}

export const total = (processingStats: ProcessingStats[]) => {
  return processingStats.reduce((acc, d) => acc + d.total, 0)
}

export const processed = (processingStats: ProcessingStats[]) => {
  return processingStats.reduce((acc, d) => acc + d.processed, 0)
}

export const activityCount = (processingStats: ProcessingStats[]) => {
  return processingStats.reduce((acc, d) => acc + d.total, 0) / processingStats.length
}
