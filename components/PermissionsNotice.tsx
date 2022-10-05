import Foldable from 'components/common/Foldable'

import styles from 'styles/PermissionsNotice.module.scss'

const PermissionsNotice = () => {
  return <>
    <h3 className={styles.title}>Strava permissions are needed to use this app.</h3>
    <Foldable
      buttonText='Learn more'
      openButtonText='Hide'
    >
      <div className={styles.body}>
        <p>
          We ask for permission to read your activity data. We need this to see which parts of a trail you’ve been on.
        </p>
        <p>
          We also ask for permission to view your private activities. This is <strong>optional</strong>, but without it, we won’t be able to see any activities that you have set to ‘Only Me’.
        </p>
      </div>
    </Foldable>
  </>
}

export default PermissionsNotice
