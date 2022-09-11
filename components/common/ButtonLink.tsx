import Link from 'next/link'
import { cn } from 'lib/styles'

import styles from 'styles/Button.module.scss'

type ButtonLinkProps = {
  buttonStyle?: 'fill' | 'outline'
  strava?: boolean
  href: string
}
type FullButtonProps = React.PropsWithChildren<ButtonLinkProps> & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>

const ButtonLink = ({ buttonStyle, strava, href, className, children }: FullButtonProps) => {
  const classes = [styles.button, className]
  switch (buttonStyle) {
    case 'fill':
      classes.push(styles.fill)
      break
    case 'outline':
      classes.push(styles.outline)
      break
  }
  if (strava) {
    classes.push(styles.strava)
  }

  return <Link href={href} passHref>
    <a className={cn(...classes)}>
      {children}
    </a>
  </Link>
}

export default ButtonLink
