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

export type GraphContextType = {
  checked: boolean
  setChecked: Dispatch<SetStateAction<boolean>>
  preloadDataForRealTimeView: () => void
  preloadDataForSevenDayView: () => void
}

export const GraphContext = createContext<null | GraphContextType>(null)

type Props = {
  children: ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = useState<boolean>(false)

  const preloadDataForRealTimeView = useCallback(async () => {
    try {
      const response = await fetch('/netlify/functions/getCoins')
      await response.json()
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  //better name
  const preloadDataForSevenDayView = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/getHistoryH6')
      await response.json()
    } catch (error) {
      console.error('Error preloading 7-day data:', error)
    }
  }, [])

  const memoizedContextValue = useMemo(() => {
    return {
      checked,
      setChecked,
      preloadDataForRealTimeView,
      preloadDataForSevenDayView,
    }
  }, [
    checked,
    setChecked,
    preloadDataForRealTimeView,
    preloadDataForSevenDayView,
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
