import { useEffect, useState } from 'react'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import useStrava from 'hooks/useStrava'
import { Activity } from 'lib/strava/types'
import ActivitySummary from 'components/ActivitySummary'
import TrailSummary from 'components/_TrailDetail'
import PagedActivitySummaries from 'components/PagedActivitySummaries'

const Trail = () => {
  const { strava } = useStrava()

  const [includeHikes, setIncludeHikes] = useState(true)
  const [includeRuns, setIncludeRuns] = useState(true)
  const [includeRides, setIncludeRides] = useState(false)

  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])

  // Get the user's activities
  useEffect(() => {
    const athleteId = strava?.getAthlete()?.id
    if (athleteId === undefined) {
      return
    }
    getActivities(athleteId)
  }, [strava])

  const getActivities = (athleteId: number) => {
    fetch(`/api/user/activities?id=${athleteId}`)
      .then(res => res.json())
      .then(data => setActivities(data))
  }

  const backfill = () => {
    console.log('Starting backfill')
    strava?.activities()
      .then(activities => {
        setActivities(activities)
        fetch('/api/user/activities', {
          method: 'POST',
          body: JSON.stringify(activities),
        })
      })
      .catch(e => console.error(e))
  }

  const callStrava = () => {
    strava?.activities().then(d => console.log(d)).catch(e => console.error(e))
  }

  useEffect(() => {
    if (activities === undefined) return

    setFilteredActivities(activities.filter(a =>
      (includeHikes && a.type === 'Hike') ||
      (includeRuns && a.type === 'Run') ||
      (includeRides && a.type === 'Ride')
    ))
  }, [activities, includeHikes, includeRuns, includeRides])



  return <>
    <button onClick={backfill}>Backfill</button><br />
    <button onClick={callStrava}>Call Strava API</button>
    <br /><br />
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

    <br /><br />

    {(activities === undefined || activities.length < 1) ? <div>No activities fetched</div> : <>
      <TrailSummary routeName='swcp' />

      <h1>Latest activity</h1>
      <ActivitySummary activity={activities[0]} />

      <h1>Your chosen activities</h1>
      <PagedActivitySummaries activities={filteredActivities} />

      <h1>Your activities</h1>
      <PagedActivitySummaries activities={activities} />
    </>}
  </>
}

export default Trail
