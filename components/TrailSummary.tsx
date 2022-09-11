import Link from 'next/link'

import { Route } from 'lib/types'
import { useSummaryMap } from 'hooks/useSummaryMap'

import styles from 'styles/TrailSummary.module.scss'

type TrailSummaryProps = {
  trail: Route
}

const TrailSummary = ({ trail }: TrailSummaryProps) => {
  const SummaryMap = useSummaryMap()

  return (
    <Link href={`/trails/${trail.id}`} passHref>
      <a className={styles.wrapper}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{trail.display_name}</h3>
        </div>
        <SummaryMap polyline={trail.polyline} />
      </a>
    </Link>
  )
}

export default TrailSummary
