import PermissionsNotice from 'components/PermissionsNotice'
import ButtonLink from './common/ButtonLink'
import styles from 'styles/StravaLogin.module.scss'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
const loginURI = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/auth/strava?redir=/&scope=read,activity:read,activity:read_all`

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
