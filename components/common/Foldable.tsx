import React, { useState } from 'react'

import Button from 'components/common/Button'

import styles from 'styles/Foldable.module.scss'

type FoldableProps = {
  buttonText?: string
  openButtonText?: string
}

const Foldable = ({ buttonText, openButtonText, children }: React.PropsWithChildren<FoldableProps>) => {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)

  const bt = (open ? openButtonText || buttonText : buttonText) || 'Toggle'

  return (
    <div>
      <div className={styles.wrapper}>
        <Button
          buttonStyle='outline'
          onClick={toggle}
          className={styles.button}
        >
          {bt}
        </Button>
        {open &&
          <div className={styles.childWrapper}>
            {children}
          </div>
        }
      </div>
    </div>
  )
}

export default Foldable
