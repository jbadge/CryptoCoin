import React from 'react'

export type GraphContextType = {
  contentType: string
  setContentType: React.Dispatch<React.SetStateAction<string>>
}

export const GraphContext = React.createContext<null | GraphContextType>(null)

type Props = {
  children: React.ReactNode
}

export const GraphContextProvider = ({ children }: Props) => {
  const [contentType, setContentType] = React.useState<string>('b1')

  const memoizedContextValue = React.useMemo(() => {
    return { contentType, setContentType }
  }, [contentType])

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
