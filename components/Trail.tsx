import { useEffect, useState } from 'react'
import { Activity } from '../strava/types'
import ActivitySummary from './ActivitySummary'

import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import useStrava from '../hooks/useStrava'

const Trail = () => {
  const { strava, authed } = useStrava()

  const [includeHikes, setIncludeHikes] = useState(true)
  const [includeRuns, setIncludeRuns] = useState(true)
  const [includeRides, setIncludeRides] = useState(false)

  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])

  // Get the user's activities
  useEffect(() => {
    strava?.activities()
      .then(activities => setActivities(activities))
      .catch(e => console.error(e))
  }, [strava])

  useEffect(() => {
    if (activities === undefined) return

    setFilteredActivities(activities.filter(a =>
      (includeHikes && a.type === 'Hike') ||
      (includeRuns && a.type === 'Run') ||
      (includeRides && a.type === 'Ride')
    ))
  }, [activities, includeHikes, includeRuns, includeRides])

  if (activities === undefined || activities.length < 2) {
    return <p>Loading...</p>
  }

  return <>
    <div>
      <Toggle
        id='include-hikes'
        defaultChecked={includeHikes}
        onChange={e => setIncludeHikes(e.target.checked)} />
      <label htmlFor='include-hikes'>Include hikes 🚶</label>
      <br />
      <Toggle
        id='include-runs'
        defaultChecked={includeRuns}
        onChange={(e) => setIncludeRuns(e.target.checked)}
      />
      <label htmlFor='include-runs'>Include runs 🏃</label>
      <br />
      <Toggle
        id='include-rides'
        defaultChecked={includeRides}
        onChange={(e) => setIncludeRides(e.target.checked)}
      />
      <label htmlFor='include-rides'>Include rides 🚴</label>
    </div>

    <h1>Your chosen activities</h1>
    <ul>
      {filteredActivities.map(a => <li key={a.id}>
        <ActivitySummary activity={a} />
      </li>)}
    </ul>

    <h1>Latest activity</h1>
    <ActivitySummary activity={activities[1]} />

    <h1>Your activities</h1>
    <ol>
      {activities.map(a => <li key={a.id}>
        <ActivitySummary activity={a} />
      </li>)}
    </ol>
  </>
}

export default Trail
