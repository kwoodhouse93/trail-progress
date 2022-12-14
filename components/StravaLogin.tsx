import ButtonLink from 'components/common/ButtonLink'
import PermissionsNotice from 'components/PermissionsNotice'

import styles from 'styles/StravaLogin.module.scss'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
let hostname = ''
if (typeof window !== 'undefined') {
  hostname = window.location.hostname
}
if (hostname === 'localhost') {
  hostname = 'localhost:3000'
}
const loginURI = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://${hostname}/auth/strava?redir=/backfill&scope=read,activity:read,activity:read_all`

const StravaLogin = () => {
  return <>
    <ButtonLink
      href={loginURI}
      className={styles.button}
      strava>
      Connect with Strava
    </ButtonLink>
    <PermissionsNotice />
  </>
}

export default StravaLogin
