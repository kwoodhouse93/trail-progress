import Link from 'next/link'
import { cn } from 'lib/styles'
import styles from 'styles/TitleBar.module.scss'

type TitleBarProps = {
  type: 'large' | 'small'
}

const TitleBar = ({ type }: TitleBarProps) => {
  const divStyles = [styles.wrapper]
  const titleStyles = [styles.title]

  if (type === 'small') {
    divStyles.push(styles.small)
    titleStyles.push(styles.small)
  }

  return <div className={cn(...divStyles)}>
    <div className={styles.innerWrapper}>
      <Link href='/' passHref>
        <a>
          <h1 className={cn(...titleStyles)}>Trail Tracker</h1>
        </a>
      </Link>
    </div>
  </div>
}

export default TitleBar
