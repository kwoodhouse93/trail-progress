import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import SplashLayout from 'components/layouts/SplashLayout'
import StravaLogin from 'components/StravaLogin'
import { exchangeCode } from 'hooks/useStrava'

const AuthStrava = () => {
  const router = useRouter()
  const { redir, code, scope } = router.query

  const redirPath = Array.isArray(redir) ? redir[0] : redir
  const authCode = Array.isArray(code) ? code[0] : code
  const scopes = Array.isArray(scope) ? scope[0]?.split(',') : scope?.split(',')

  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (redirPath === undefined || authCode === undefined || scopes === undefined) {
      setError("Something went wrong.")
      return
    }

    // Check scopes
    if (!scopes?.includes('read') || !scopes?.includes('activity:read')) {
      setError('You need to grant us permission to view your activities.')
      return
    }

    // Exchange code
    exchangeCode(authCode)
      .then(e => {
        if (e !== undefined) {
          setError('Something went wrong!')
        } else {
          // Redirect on success
          router.push(redirPath)
        }
      })

    // router.push(redirPath)
  }, [router, redirPath, authCode, scopes])

  return (
    <div className='pageWrapper'>
      <p className='para'>
        Connecting your account...
      </p>

      <div >
        {error !== undefined && <>
          <p>{error} Please try again.</p>
          <StravaLogin />
        </>
        }
      </div>
    </div>
  )
}

export default AuthStrava

AuthStrava.getLayout = function getLayout(page: ReactElement) {
  return <SplashLayout>
    {page}
  </SplashLayout>
}
