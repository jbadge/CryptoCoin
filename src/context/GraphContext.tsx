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
  fetch7dHistoryData: () => void
  cachedHistory: CachedHistoryType
  setCachedHistory: Dispatch<SetStateAction<CachedHistoryType>>
}

export const GraphContext = createContext<null | GraphContextType>(null)

type Props = {
  children: ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [cachedHistory, setCachedHistory] = useState<CachedHistoryType>(null)
  const [checked, setChecked] = useState<boolean>(false)

  const fetch7dHistoryData = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/getCoins?interval=h6')
      const data = await response.json()

      if (
        !data?.timestamp ||
        !data?.['7d'] ||
        Object.keys(data['7d']).length === 0
      ) {
        return
      }
      setCachedHistory((prev) => {
        const has7d = !!Object.keys(prev?.['7d'] || {}).length
        if (has7d) return prev // Already have 7d; skip overwrite

        return {
          timestamp: data.timestamp,
          '1d': prev?.['1d'] || {},
          '7d': data['7d'],
        }
      })
    } catch (error) {
      console.error('Error fetching 7-day data:', error)
    }
  }, [])

  const memoizedContextValue = useMemo(() => {
    return {
      checked,
      setChecked,
      fetch7dHistoryData,
      cachedHistory,
      setCachedHistory,
    }
  }, [checked, setChecked, fetch7dHistoryData, cachedHistory, setCachedHistory])

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
