import { useEffect, useState } from 'react'

type AfterDelayProps = {
  delay: number
}

const AfterDelay = ({ delay, children }: React.PropsWithChildren<AfterDelayProps>) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  return show ? <>{children}</> : null
}

export default AfterDelay
