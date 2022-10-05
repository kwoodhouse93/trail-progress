import React from 'react'

import { Athlete } from 'lib/strava/types'
import Button from 'components/common/Button'
import AthleteActivitiesSummary from 'components/AthleteActivitiesSummary'

import styles from 'styles/Athlete.module.scss'

type AthleteProps = {
  athlete?: Athlete
  signOut?: () => void
  deleteAthlete?: React.MouseEventHandler<HTMLAnchorElement>
}

const Athlete = ({ athlete, signOut, deleteAthlete }: AthleteProps) => {

  if (athlete === undefined) return null

  const loc = []
  if (athlete.city !== undefined) loc.push(athlete.city)
  if (athlete.state !== undefined) loc.push(athlete.state)
  if (athlete.country !== undefined) loc.push(athlete.country)
  const location = loc.join(', ')

  return (
    <div className={styles.wrapper}>
      <p>You are signed in as</p>
      <h3 className={styles.name}>{athlete?.firstname} {athlete?.lastname}</h3>
      <img
        className={styles.profileImage}
        src={athlete?.profile}
        width={128}
        height={128}
        alt={`Profile image for ${athlete?.firstname} ${athlete?.lastname}`}
      />
      <p>{location}</p>
      <AthleteActivitiesSummary athlete={athlete} />
      <p className={styles.link}>
        <a href={`https://www.strava.com/athletes/${athlete?.id}`}>View on Strava</a>
      </p>
      {signOut && <Button className={styles.button} strava onClick={signOut}>
        Sign out
      </Button>}
      {deleteAthlete && <a className={styles.deleteLink} onClick={deleteAthlete} href="#">
        Delete account
      </a>}
    </div>
  )
}

export default Athlete
