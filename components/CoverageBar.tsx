import styles from 'styles/CoverageBar.module.scss'

type CoverageBarProps = {
  totalLength: number
  coveredLength: number
}

const CoverageBar = ({ totalLength, coveredLength }: CoverageBarProps) => {
  const percent = Math.round(coveredLength / totalLength * 100)

  const labelStyle = { left: `calc(${percent}%)`, transform: 'translateX(-50%)' }

  return <div className={styles.wrapper}>
    <p className={styles.caption}>You’ve completed</p>
    <div className={styles.barWrapper}>
      <div className={styles.bar} style={{ width: `${percent}%` }} />
    </div>
    <div className={styles.labelWrapper}>
      <p className={styles.label} style={labelStyle}>{percent}%</p>
    </div>
  </div>
}

export default CoverageBar
