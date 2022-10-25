import Script from 'next/script'

type KofiProps = {
  type: 'button' | 'panel'
}

declare global {
  interface Window {
    kofiWidgetOverlay: any
  }
}

const Kofi = ({ type }: KofiProps) => {
  if (type === 'button') {
    return <a href='https://ko-fi.com/P5P2FWP9K' target='_blank' rel='noreferrer' >
      <img
        height='48'
        style={{
          border: '0px',
          height: '48px',
          margin: '24px auto 0',
        }}
        src='https://storage.ko-fi.com/cdn/kofi2.png?v=3'
        alt='Buy Me a Coffee at ko-fi.com' />
    </a>
  }

  if (type === 'panel') {
    return <iframe
      id='kofiframe'
      src='https://ko-fi.com/kwoodhouse/?hidefeed=true&widget=true&embed=true&preview=true'
      style={{ border: 'none', width: '100%', padding: '4px', background: '#fcfcfc' }}
      height={712}
      title='kwoodhouse' />
  }

  return null
}

export default Kofi
