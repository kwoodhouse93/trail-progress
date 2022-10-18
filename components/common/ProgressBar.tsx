import { cn } from 'lib/styles'
import React from 'react'
import styles from 'styles/ProgressBar.module.scss'

type ProgressBarProps = {
  total: number
  completed: number
}

type FullProgressBarProps = ProgressBarProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const ProgressBar = ({ className, total, completed }: FullProgressBarProps) => {
  let percent = Math.round(completed / total * 100)
  if (total === 0) percent = 0

  const labelStyle = { left: `calc(${percent}%)`, transform: 'translateX(-50%)' }

  return <div className={cn(className, styles.wrapper)}>
    <div className={styles.barWrapper}>
      <div className={styles.bar} style={{ width: `${percent}%` }} />
    </div>
    <div className={styles.labelWrapper}>
      <p className={styles.label} style={labelStyle}>{percent}%</p>
    </div>
  </div>
}

export default ProgressBar
