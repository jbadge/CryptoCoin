import React from 'react'

export type GraphContextType = {
  checked: boolean
  setChecked: React.Dispatch<React.SetStateAction<boolean>>
  preloadDataForRealTimeView: () => void
  updateHistoryData: (_id: string, _data: any[]) => void
  historyData: Record<string, any[]>
}

export const GraphContext = React.createContext<null | GraphContextType>(null)

type Props = {
  children: React.ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = React.useState<boolean>(true)
  const [historyData, setHistoryData] = React.useState<Record<string, any[]>>(
    {}
  )

  const updateHistoryData = React.useCallback((id: string, data: any[]) => {
    setHistoryData((prev) => ({
      ...prev,
      [id]: data,
    }))
  }, [])

  const preloadDataForRealTimeView = React.useCallback(async () => {
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

  const memoizedContextValue = React.useMemo(() => {
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
  const graphContext = React.useContext(GraphContext)

  if (!graphContext) {
    throw new Error('You need to use this context inside a Provider')
  }
  return graphContext
}
