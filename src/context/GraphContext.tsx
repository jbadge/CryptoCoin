import React from 'react'

export type GraphContextType = {
  checked: boolean
  setChecked: React.Dispatch<React.SetStateAction<boolean>>
  preloadDataForRealTimeView: () => void
}

export const GraphContext = React.createContext<null | GraphContextType>(null)

type Props = {
  children: React.ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = React.useState<boolean>(true)

  const preloadDataForRealTimeView = React.useCallback(async () => {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets')
      await response.json()
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  const memoizedContextValue = React.useMemo(() => {
    return { checked, setChecked, preloadDataForRealTimeView }
  }, [checked, setChecked, preloadDataForRealTimeView])

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
