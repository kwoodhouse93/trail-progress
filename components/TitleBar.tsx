import { useRouter } from 'next/router'
import Link from 'next/link'

import { cn } from 'lib/styles'

import styles from 'styles/TitleBar.module.scss'
import ButtonLink from 'components/common/ButtonLink'

import InfoIcon from 'icons/info.svg'
import CloseIcon from 'icons/close.svg'
import Button from './common/Button'


type TitleBarProps = {
  type: 'large' | 'small'
  button?: 'info' | 'close' | 'none'
}

const TitleBar = ({ type, button }: TitleBarProps) => {
  const router = useRouter()
  const goBack = () => router.back()

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

      {button === 'info' && <ButtonLink className={styles.button} href='/info'>
        <InfoIcon height="24px" width="24px" />
      </ButtonLink>}
      {button === 'close' && <Button className={styles.button} onClick={() => goBack()}>
        <CloseIcon height="24px" width="24px" />
      </Button>}
    </div>
  </div>
}

export default TitleBar
