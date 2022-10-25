import { ReactElement } from 'react'

import { cn } from 'lib/styles'

import styles from 'styles/Info.module.scss'
import Kofi from 'components/common/Kofi'
import InfoLayout from 'components/layouts/InfoLayout'

export default function Info() {
  return <div className={cn('pageWrapper', styles.wrapper)}>
    <img src="me.jpeg" className={styles.me} alt="Photo of Trail Tracker’s creator - Kieron Woodhouse" />
    <p>Hi! I’m Kieron, the creator of Trail Tracker.</p>
    <p>Trail Tracker came about because I wanted to know how much of the South West Coast Path I’d already done.</p>
    <p>It answers that for me, and I hope you find it useful too!</p>

    <h3>Enjoying Trail Tracker?</h3>
    <p>Why not support me by buying me a coffee? Every donation helps me keep working on cool stuff like this.</p>
    <div className={styles.kofi}>
      <Kofi type='button' />
    </div>

    <h3>Need help?</h3>
    <p>I hope everything works smoothly for you. But if you do get stuck, feel free to <a href="mailto:kieron.woodhouse@yahoo.co.uk">send me an email</a> and I’ll do my best to get back to you.</p>
  </div>
}

Info.getLayout = function getLayout(page: ReactElement) {
  return <InfoLayout>
    {page}
  </InfoLayout>
}
