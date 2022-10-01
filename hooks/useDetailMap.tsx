import { useMemo } from 'react'
import dynamic from 'next/dynamic'

export const useDetailMap = () => useMemo(() => dynamic(
  () => import('components/DetailMap'),
  { loading: () => <p>Loading map...</p>, ssr: false, },
), [])
