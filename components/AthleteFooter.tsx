import { Athlete } from 'lib/strava/types'
import React from 'react'
import styles from 'styles/AthleteFooter.module.scss'

type AthleteFooterProps = {
  athlete?: Athlete
}

const AthleteFooter = ({ athlete }: AthleteFooterProps) => {
  if (athlete === undefined) return null

  return (
    <footer className={styles.footer}>
      <div className={styles.innerWrapper}>
        <>
          <h3 className={styles.name}>{athlete?.firstname} {athlete?.lastname}</h3>
        </>
      </div>
      <img
        className={styles.profileImage}
        src={athlete?.profile_medium}
        width={64}
        height={64}
        alt={`Profile image for ${athlete?.firstname} ${athlete?.lastname}`}
      />
    </footer>
  )
}

export default AthleteFooter
