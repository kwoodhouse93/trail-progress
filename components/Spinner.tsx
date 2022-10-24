import { cn } from 'lib/styles'

import styles from 'styles/Spinner.module.scss'

type SpinnerProps = {
  impulse?: boolean
  small?: boolean
}

const Spinner = ({ impulse, small }: SpinnerProps) => {
  let wrapperClasses = [styles.wrapper]
  if (small) {
    wrapperClasses.push(styles.small)
  }
  return <div className={cn(...wrapperClasses)}>
    <div className={styles.inner} />
    {impulse && <div className={styles.impulse} />}
    <div className={styles.needleRotator}>
      <div className={styles.needle} />
    </div>
  </div>
}

export default Spinner
