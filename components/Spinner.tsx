import styles from 'styles/Spinner.module.scss'

type SpinnerProps = {
  impulse?: boolean
}

const Spinner = ({ impulse }: SpinnerProps) => {
  return <div className={styles.wrapper}>
    <div className={styles.inner} />
    {impulse && <div className={styles.impulse} />}
    <div className={styles.needleRotator}>
      <div className={styles.needle} />
    </div>
  </div>
}

export default Spinner
