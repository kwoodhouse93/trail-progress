import { Athlete } from '../strava/types'

type AthleteSummaryProps = {
  athlete?: Athlete
}

const AthleteSummary = ({ athlete }: AthleteSummaryProps) => {
  if (athlete === undefined) {
    return null
  }
  return <div>
    <img width={62} height={62} src={athlete.profile_medium} alt={`Profile image for ${athlete.firstname} ${athlete.lastname}`} />
    <h3>{athlete.firstname} {athlete.lastname}</h3>
    <p>{athlete.city}, {athlete.country}</p>
    <a href={`https://www.strava.com/athletes/${athlete.id}`}>View on Strava</a>
  </div>
}

export default AthleteSummary
