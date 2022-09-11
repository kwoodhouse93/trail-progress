import { cn } from 'lib/styles'
import styles from 'styles/Button.module.scss'

type ButtonProps = {
  buttonStyle?: 'fill' | 'outline'
  strava?: boolean
}

type FullButtonProps = ButtonProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

const Button = ({ buttonStyle, strava, className, disabled, onClick, children }: FullButtonProps) => {
  const classes = [styles.button]
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

  return <button disabled={disabled} className={cn(className, ...classes)} onClick={onClick}>
    {children}
  </button>
}

export default Button
