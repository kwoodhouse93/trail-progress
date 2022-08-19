export interface Athlete {
  id: number
  resource_state: number
}

export interface Map {
  id: string
  summary_polyline: string
  resource_state: number
}

export interface Activity {
  resource_state: number
  athlete: Athlete
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  id: any
  start_date: Date
  start_date_local: Date
  timezone: string
  utc_offset: number
  location_city?: any
  location_state?: any
  location_country: string
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: Map
  trainer: boolean
  commute: boolean
  manual: boolean
  private: boolean
  visibility: string
  flagged: boolean
  gear_id: string
  start_latlng: number[]
  end_latlng: number[]
  average_speed: number
  max_speed: number
  average_cadence: number
  average_temp: number
  has_heartrate: boolean
  average_heartrate: number
  max_heartrate: number
  heartrate_opt_out: boolean
  display_hide_heartrate_option: boolean
  elev_high: number
  elev_low: number
  upload_id: any
  upload_id_str: string
  external_id: string
  from_accepted_tag: boolean
  pr_count: number
  total_photo_count: number
  has_kudoed: boolean
  workout_type?: number
  average_watts?: number
  kilojoules?: number
  device_watts?: boolean
}

export const activityTypeToIcon = (type: string) => {
  switch (type) {
    case 'AlpineSki':
      return '⛷️​'
    case 'BackcountrySki':
      return '⛷️​'
    case 'Canoeing':
      return '​🛶'
    case 'Crossfit':
      return '🏋️​'
    case 'EBikeRide':
      return '🚴​'
    // case 'Elliptical':
    // return ''
    case 'Golf':
      return '🏌️​'
    // case 'Handcycle':
    // return ''
    case 'Hike':
      return '🚶'
    case 'IceSkate':
      return '⛸️​'
    case 'InlineSkate':
      return '​🛼'
    case 'Kayaking':
      return '​🛶'
    // case 'Kitesurf':
    // return ''
    case 'NordicSki':
      return '⛷️​'
    case 'Ride':
      return '🚴'
    case 'RockClimbing':
      return '🧗​'
    // case 'RollerSki':
    // return ''
    case 'Rowing':
      return '🚣​'
    case 'Run':
      return '🏃'
    case 'Sail':
      return '⛵​'
    case 'Skateboard':
      return '🛹​'
    case 'Snowboard':
      return '🏂​'
    // case 'Snowshoe':
    // return ''
    case 'Soccer':
      return '⚽​'
    // case 'StairStepper':
    // return ''
    // case 'StandUpPaddling':
    // return ''
    case 'Surfing':
      return '🏄​'
    case 'Swim':
      return '🏊​'
    // case 'Velomobile':
    // return ''
    case 'VirtualRide':
      return '🚴​'
    case 'VirtualRun':
      return '​🏃'
    case 'Walk':
      return '🚶'
    case 'WeightTraining':
      return '🏋️'
    case 'Wheelchair':
      return '🦽​'
    // case 'Windsurf':
    // return ''
    case 'Workout':
      return '⚡​'
    case 'Yoga':
      return '🧘'
    default:
      return '⚡​'
  }
}

export const metersReadable = (metres: number) => {
  if (metres < 1000) {
    return `${metres}m`
  } else {
    return `${(metres / 1000).toFixed(1)}km`
  }
}

export const timeReadable = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h < 1) {
    return m.toString() + 'm ' + s.toString().padStart(2, '0') + 's'
  }
  return h.toString() + 'h ' + m.toString().padStart(2, '0') + 'm '
}
