import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { CachedHistoryType } from '../types/CoinTypes'

export type GraphContextType = {
  checked: boolean
  setChecked: Dispatch<SetStateAction<boolean>>
  preloadDataForRealTimeView: () => void
  fetch7dHistoryData: () => void
}

export const GraphContext = createContext<null | GraphContextType>(null)

type Props = {
  children: ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [cachedHistory, setCachedHistory] = useState<CachedHistoryType>(null)
  const [checked, setChecked] = useState<boolean>(false)

  const preloadDataForRealTimeView = useCallback(async () => {
    try {
      const response = await fetch('/netlify/functions/getCoins')
      await response.json()
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  const fetch7dHistoryData = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/getCoins?interval=h6')
      const data = await response.json()
      if (data?.timestamp && (data?.['1d'] || data?.['7d'])) {
        setCachedHistory({
          timestamp: data.timestamp,
          '1d': data['1d'] || {},
          '7d': data['7d'] || {},
        })
      }
    } catch (error) {
      console.error('Error fetching 7-day data:', error)
    }
  }, [])

  const memoizedContextValue = useMemo(() => {
    return {
      checked,
      setChecked,
      preloadDataForRealTimeView,
      fetch7dHistoryData,
      cachedHistory,
    }
  }, [
    checked,
    setChecked,
    preloadDataForRealTimeView,
    fetch7dHistoryData,
    cachedHistory,
  ])

  return (
    <GraphContext.Provider value={memoizedContextValue}>
      {children}
    </GraphContext.Provider>
  )
}

export const useGraphContext = () => {
  const graphContext = useContext(GraphContext)

  if (!graphContext) {
    throw new Error('You need to use this context inside a Provider')
  }
  return graphContext
}
