import React from 'react'
import styles from 'styles/Footer.module.scss'

const Footer = ({ children }: React.PropsWithChildren<any>) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.innerWrapper}>
        {children}
      </div>
    </footer>
  )
}

export default Footer
