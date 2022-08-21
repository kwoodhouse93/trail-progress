import PermissionsNotice from './PermissionsNotice'

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

const StravaLogin = () => {
  return <>
    <a href={`http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/auth/strava?redir=/auth/login&scope=read,activity:read,activity:read_all`}>Log in with Strava &rarr;</a>
    <PermissionsNotice />
  </>
}

export default StravaLogin
