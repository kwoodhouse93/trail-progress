import ProgressBar from 'components/common/ProgressBar'

import styles from 'styles/CoverageBar.module.scss'

type CoverageBarProps = {
  totalLength: number
  coveredLength: number
}

const CoverageBar = ({ totalLength, coveredLength }: CoverageBarProps) => {
  return <div className={styles.wrapper}>
    <p className={styles.caption}>You’ve completed</p>
    <ProgressBar total={totalLength} completed={coveredLength} />
  </div>
}

export default CoverageBar
