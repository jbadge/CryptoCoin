import React from 'react'

export type GraphContextType = {
  checked: boolean
  setChecked: React.Dispatch<React.SetStateAction<boolean>>
}

export const GraphContext = React.createContext<null | GraphContextType>(null)

type Props = {
  children: React.ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [checked, setChecked] = React.useState<boolean>(true)

  const memoizedContextValue = React.useMemo(() => {
    return { checked, setChecked }
  }, [checked])

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
