import Link from 'next/link'
import React from 'react'

import { Athlete } from 'lib/strava/types'

import styles from 'styles/AthleteFooter.module.scss'

type AthleteFooterProps = {
  athlete?: Athlete
}

const AthleteFooter = ({ athlete }: AthleteFooterProps) => {
  if (athlete === undefined) return null

  return (
    <footer className={styles.footer}>
      <div className={styles.innerWrapper}>
        <Link href="/account" passHref>
          <a className={styles.nameAnchor}>
            <h3 className={styles.name}>{athlete?.firstname} {athlete?.lastname}</h3>
          </a>
        </Link>
      </div>
      <Link href="/account" passHref>
        <a>
          <img
            className={styles.profileImage}
            src={athlete?.profile_medium}
            width={64}
            height={64}
            alt={`Profile image for ${athlete?.firstname} ${athlete?.lastname}`}
          />
        </a>
      </Link>
    </footer>
  )
}

export default AthleteFooter
