import dynamic from 'next/dynamic'
import { useMemo } from 'react'

export const useDetailMap = () => useMemo(() => dynamic(
  () => import('components/DetailMap'),
  { loading: () => <p>Loading map...</p>, ssr: false, },
), [])
