import ButtonLink from 'components/common/ButtonLink'

import styles from 'styles/StravaCTA.module.scss'

type StravaCTAProps = {
  caption: string
}

const StravaCTA = ({ caption }: StravaCTAProps) => {
  return <div className={styles.wrapper}>
    <p className={styles.caption}>{caption}</p>
    <ButtonLink href='/auth/login' strava>Connect with Strava</ButtonLink>
  </div>
}

export default StravaCTA
