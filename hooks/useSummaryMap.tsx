import { useMemo } from 'react'
import dynamic from 'next/dynamic'

export const useSummaryMap = () => useMemo(() => dynamic(
  () => import('components/SummaryMap'),
  { loading: () => <p>Loading map...</p>, ssr: false, },
), [])
