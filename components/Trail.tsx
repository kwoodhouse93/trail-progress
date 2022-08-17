import { useEffect, useState } from 'react'
import { Activity } from '../strava/types'

type TrailProps = {
  token: string
}

const Trail = ({ token }: TrailProps) => {
  const [activities, setActivities] = useState<Activity[]>([])

  // Get the user's activities
  useEffect(() => {
    fetch(`/api/activities?token=${token}`)
      .then(res => res.json())
      .then(data => setActivities(data))
  }, [token])

  useEffect(() => {
    if (activities.length < 1) {
      return
    }
    fetch(`/api/positions?id=${activities[0].id}&token=${token}`)
      .then(res => res.json())
      .then(data => console.log(data))
  }, [activities, token])

  return <>
    <h1>Latest activity</h1>
    <p>{activities[0]?.name}, {activities[0]?.distance}m, {activities[0]?.moving_time}s</p>

    <h1>Your activities</h1>
    <ul>
      {activities.map(a => <li key={a.id}>
        {a.name}, {a.distance}m, {a.moving_time}s
      </li>)}
    </ul>
  </>
}

export default Trail
