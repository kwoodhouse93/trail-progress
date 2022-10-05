import { cn } from 'lib/styles'

import styles from 'styles/SetupProgress.module.scss'

type SetupStates = 'connecting' | 'backfill' | 'processing'

type SetupProgressProps = {
  state: SetupStates
}
const SetupProgress = ({ state }: SetupProgressProps) => {
  const connectClasses = [styles.pip]
  const backfillClasses = [styles.pip]
  const processingClasses = [styles.pip]

  switch (state) {
    case 'connecting':
      connectClasses.push(styles.active, styles.last)
      break
    case 'backfill':
      backfillClasses.push(styles.active, styles.last)
      connectClasses.push(styles.active)
      break
    case 'processing':
      processingClasses.push(styles.active, styles.last)
      backfillClasses.push(styles.active)
      connectClasses.push(styles.active)
      break
  }

  return <div className={styles.wrapper}>
    <div className={cn(...connectClasses)}>
      <p>Connect</p>
      <p className={styles.number}>1</p>
    </div>
    <div className={cn(...backfillClasses)}>
      <p>Load</p>
      <p className={styles.number}>2</p>
    </div>
    <div className={cn(...processingClasses)}>
      <p>Calculate</p>
      <p className={styles.number}>3</p>
    </div>
  </div>
}

export default SetupProgress
