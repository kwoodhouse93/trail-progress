import React from 'react'
import Link from 'next/link'

import { cn } from 'lib/styles'
import { Route } from 'lib/types'
import { useSummaryMap } from 'hooks/useSummaryMap'

import styles from 'styles/TrailSummary.module.scss'

type TrailSummaryProps = {
  trail: Route
  pending?: boolean
}

const TrailSummary = ({ trail, pending, className }: TrailSummaryProps & React.HTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => {
  const SummaryMap = useSummaryMap()

  if (pending) {
    return <div className={cn(className, styles.wrapper, styles.pending)}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>{trail.display_name}</h3>
      </div>
      <SummaryMap polyline={trail.polyline} />
      <div className={styles.spinner} />
      <div className={styles.captionWrapper}>
        <p className={styles.caption}>Still calculating...</p>
      </div>
    </div>
  }

  return (
    <Link href={`/trails/${trail.id}`} passHref>
      <a className={cn(className, styles.wrapper)}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{trail.display_name}</h3>
        </div>
        <SummaryMap polyline={trail.polyline} />
      </a>
    </Link>
  )
}

export default TrailSummary
