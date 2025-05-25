import React from 'react'

export type GraphContextType = {
  checked: boolean
  setChecked: React.Dispatch<React.SetStateAction<boolean>>
  preloadDataForRealTimeView: () => void

  nameToIdMap: Record<string, string>
  loadNameToIdMap: () => Promise<void>
}

export const GraphContext = React.createContext<null | GraphContextType>(null)

type Props = {
  children: React.ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = React.useState<boolean>(true)
  const [nameToIdMap, setNameToIdMap] = React.useState<Record<string, string>>(
    {}
  )

  const preloadDataForRealTimeView = React.useCallback(async () => {
    try {
      const response = await fetch('/api/coinList')

      await response.json()
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  const loadNameToIdMap = React.useCallback(async () => {
    try {
      const response = await fetch('https://price.mycryptoapi.com/')
      if (response.ok) {
        const data = await response.json()
        setNameToIdMap(data)
      }
    } catch (error) {
      console.error('Failed to load coin name-to-ID map:', error)
    }
  }, [])

  React.useEffect(() => {
    loadNameToIdMap()
  }, [loadNameToIdMap])

  const memoizedContextValue = React.useMemo(() => {
    return {
      checked,
      setChecked,
      preloadDataForRealTimeView,
      nameToIdMap,
      loadNameToIdMap,
    }
  }, [
    checked,
    setChecked,
    preloadDataForRealTimeView,
    nameToIdMap,
    loadNameToIdMap,
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
