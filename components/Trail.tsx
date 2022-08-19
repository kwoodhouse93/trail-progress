import { useEffect, useState } from 'react'
import { Activity } from '../strava/types'
import ActivitySummary from './ActivitySummary'

import Toggle from 'react-toggle'
import 'react-toggle/style.css'

type TrailProps = {
  token: string
}

const Trail = ({ token }: TrailProps) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivies] = useState<Activity[]>([])
  const [includeHikes, setIncludeHikes] = useState(true)
  const [includeRuns, setIncludeRuns] = useState(true)
  const [includeRides, setIncludeRides] = useState(false)

  // Get the user's activities
  useEffect(() => {
    fetch(`/api/activities?token=${token}`)
      .then(res => res.json())
      .then(data => setActivities(data))
  }, [token])

  // useEffect(() => {
  //   if (activities.length < 1) {
  //     return
  //   }
  //   fetch(`/api/positions?id=${activities[0].id}&token=${token}`)
  //     .then(res => res.json())
  //     .then(data => console.log(data))
  // }, [activities, token])

  useEffect(() => {
    setFilteredActivies(activities.filter(a =>
      (includeHikes && a.type === 'Hike') ||
      (includeRuns && a.type === 'Run') ||
      (includeRides && a.type === 'Ride')
    ))
  }, [activities, includeHikes, includeRuns, includeRides])

  const types: string[] = []
  if (includeHikes) {
    types.push('Hike')
  }
  if (includeRuns) {
    types.push('Run')
  }
  if (includeRides) {
    types.push('Ride')
  }

  return <>

    <Toggle
      id='include-hikes'
      defaultChecked={includeHikes}
      onChange={(e) => setIncludeHikes(e.target.checked)} />
    <label htmlFor='include-hikes'>Include hikes 🚶</label>

    <Toggle
      id='include-runs'
      defaultChecked={includeRuns}
      onChange={(e) => setIncludeRuns(e.target.checked)} />
    <label htmlFor='include-runs'>Include runs 🏃</label>

    <Toggle
      id='include-rides'
      defaultChecked={includeRides}
      onChange={(e) => setIncludeRides(e.target.checked)} />
    <label htmlFor='include-rides'>Include rides 🚴</label>

    <h1>Your chosen activities</h1>
    <ul>
      {/* {filteredActivities.map(a => <li key={a.id}>
        <ActivitySummary activity={a} token={token} trailTypes={types} />
      </li>)} */}
    </ul>

    <h1>Latest activity</h1>
    <ActivitySummary activity={activities[1]} token={token} trailTypes={types} />

    <h1>Your activities</h1>
    <ol>
      {/* {activities.map(a => <li key={a.id}>
        <ActivitySummary activity={a} token={token} trailTypes={types} />
      </li>)} */}
    </ol>
  </>
}

export default Trail
