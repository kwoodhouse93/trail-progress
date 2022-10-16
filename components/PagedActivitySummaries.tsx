import { useEffect, useState } from 'react'

import ActivitySummary from 'components/ActivitySummary'
import { Activity } from 'lib/strava/types'

const pageSize = 10

type PagedActivitySummariesProps = {
  activities: Activity[],
}

const PagedActivitySummaries = ({ activities }: PagedActivitySummariesProps) => {
  const [pagedActivities, setPagedActivities] = useState<Activity[]>([])
  const [page, setPage] = useState(0)


  const prevPage = () => {
    setPage(p => {
      if (p <= 0) return 0
      return p - 1
    })
  }

  const nextPage = () => {
    const pages = pageCount(activities.length, pageSize)
    setPage(p => {
      if (p >= pages - 1) return pages - 1
      return p + 1
    })
  }

  useEffect(() => {
    const pages = pageCount(activities.length, pageSize)
    if (page < 0) {
      setPage(0)
      return
    }
    if (page >= pages - 1) {
      setPage(pages - 1)
      return
    }
  }, [activities, page])

  useEffect(() => {
    setPagedActivities(activities
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(page * pageSize, (page + 1) * pageSize))
  }, [activities, page])

  if (activities === undefined) {
    return null
  }

  if (activities.length < 1) {
    return <p>No activities found.</p>
  }

  return <>
    <ul>
      {pagedActivities.map((a, i) => <li key={i}>
        <ActivitySummary activity={a} />
      </li>)}

      <p>
        <button onClick={prevPage}>&larr;</button>
        {page + 1} / {pageCount(activities.length, pageSize)}
        <button onClick={nextPage}>&rarr;</button>
      </p>
    </ul>
  </>
}

export default PagedActivitySummaries

const pageCount = (activityCount: number, pageSize: number) => {
  return Math.ceil(activityCount / pageSize)
}
