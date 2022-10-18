import Link from 'next/link'
import React from 'react'

import { useSummaryMap } from 'hooks/useSummaryMap'
import { metersReadable } from 'lib/strava/types'
import { cn } from 'lib/styles'
import { Route } from 'lib/types'

import styles from 'styles/TrailSummary.module.scss'

type TrailSummaryProps = {
  trail: Route
  ready: boolean
  completion?: number
}

const TrailSummary = ({ trail, ready, completion, className }: TrailSummaryProps & React.HTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => {
  const SummaryMap = useSummaryMap()

  if (!ready) {
    return <div className={cn(className, styles.wrapper, styles.pending)}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>{trail.display_name}</h3>
      </div>
      <SummaryMap polyline={trail.polyline} />
      <div className={styles.spinner} />
      <div className={cn(styles.captionWrapper, styles.withProgress)}>
        <p className={styles.caption}>Still calculating...</p>
      </div>
      {completion !== undefined && <div className={styles.progress} style={{ width: completion * 100 + '%' }} />}
    </div>
  }

  let caption = null
  if (trail.length !== undefined && trail.covered_length !== undefined) {
    const percent = Math.round(trail.covered_length / trail.length * 100)
    caption = <div className={styles.captionWrapper}>
      <p className={styles.caption}>{percent}% complete</p>
    </div>
    if (trail.covered_length === 0) {
      caption = <div className={styles.captionWrapper}>
        <p className={styles.caption}>Not visited</p>
      </div>
    }
  }
  return (
    <Link href={`/trails/${trail.id}`} passHref>
      <a className={cn(className, styles.wrapper)}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{trail.display_name}</h3>
          {trail.length !== undefined && <p className={styles.subtitle}>{metersReadable(trail.length)}</p>}
        </div>
        <SummaryMap polyline={trail.polyline} />
        {caption}
      </a>
    </Link>
  )
}

export default TrailSummary
