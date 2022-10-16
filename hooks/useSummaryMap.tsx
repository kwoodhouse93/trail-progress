import dynamic from 'next/dynamic'
import { useMemo } from 'react'

export const useSummaryMap = () => useMemo(() => dynamic(
  () => import('components/SummaryMap'),
  { loading: () => <p>Loading map...</p>, ssr: false, },
), [])
