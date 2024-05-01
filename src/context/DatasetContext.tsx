import React from 'react'

export type DatasetContextType = {
  dataset: number[]
  setDataset: React.Dispatch<React.SetStateAction<number[]>>
}

export const DatasetContext = React.createContext<null | DatasetContextType>(
  null
)

type Props = {
  children: React.ReactNode
}

export const DatasetContextProvider = ({ children }: Props) => {
  const [dataset, setDataset] = React.useState<number[]>([])

  const memoizedContextValue = React.useMemo(() => {
    return { dataset, setDataset }
  }, [dataset, setDataset])

  return (
    <DatasetContext.Provider value={memoizedContextValue}>
      {children}
    </DatasetContext.Provider>
  )
}

export const useDatasetContext = () => {
  const datasetContext = React.useContext(DatasetContext)

  if (!datasetContext) {
    throw new Error('You need to use this context inside a Provider')
  }
  return datasetContext
}
