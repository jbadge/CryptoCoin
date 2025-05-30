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
  updateHistoryData: (_id: string, _data: any[]) => void
  historyData: Record<string, any[]>
}

export const GraphContext = createContext<null | GraphContextType>(null)

type Props = {
  children: ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = useState<boolean>(true)
  const [historyData, setHistoryData] = useState<Record<string, any[]>>({})

  const updateHistoryData = useCallback((id: string, data: any[]) => {
    setHistoryData((prev) => ({
      ...prev,
      [id]: data,
    }))
  }, [])

  const preloadDataForRealTimeView = useCallback(async () => {
    try {
      const response = await fetch(
        `https://rest.coincap.io/v3/assets?apiKey=${
          import.meta.env.VITE_API_KEY
        }`
      )
      await response.json()
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  const memoizedContextValue = useMemo(() => {
    return {
      checked,
      setChecked,
      preloadDataForRealTimeView,
      updateHistoryData,
      historyData,
    }
  }, [
    checked,
    setChecked,
    preloadDataForRealTimeView,
    updateHistoryData,
    historyData,
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
