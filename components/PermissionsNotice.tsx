import { useState } from 'react'

const PermissionsNotice = () => {
  const [show, setShow] = useState(false)

  return <>
    <a onClick={() => setShow(s => !s)}>
      <h3>
        Strava permissions are needed to use this app.
      </h3>
      {show
        ? <div>
          <p>
            On the next page, we'll ask for permission to view your activity data.
            This lets us match where you've been to the trail you're looking at.
            Without it, we cannot get your activity data and TrailTracker will not work.
            We don't store any of this data - the app fetches it from Strava and after that, it nevers leaves your device.
          </p>
          <p>
            We also ask for permission to view your private activities.
            This is optional, but we recommend allowing it.
            If you don't allow access to your private activities, we cannot use any activities that you have set as visible to 'Only Me' when calculating your stats.
            Further, if you have used Strava's map visibility privacy tools to hide start and end points, we cannot use the hidden data without this optional permission.
          </p>
        </div>
        : <p>
          Click to see more.
        </p>
      }
    </a>
  </>
}

export default PermissionsNotice
