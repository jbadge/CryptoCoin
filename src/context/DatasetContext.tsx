import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

export type DatasetContextType = {
  dataset: number[]
  setDataset: Dispatch<SetStateAction<number[]>>
}

export const DatasetContext = createContext<null | DatasetContextType>(null)

type Props = {
  children: ReactNode
}

export const DatasetContextProvider = ({ children }: Props) => {
  const [dataset, setDataset] = useState<number[]>([])

  const memoizedContextValue = useMemo(() => {
    return { dataset, setDataset }
  }, [dataset, setDataset])

  return (
    <DatasetContext.Provider value={memoizedContextValue}>
      {children}
    </DatasetContext.Provider>
  )
}

export const useDatasetContext = () => {
  const datasetContext = useContext(DatasetContext)

  if (!datasetContext) {
    throw new Error('You need to use this context inside a Provider')
  }
  return datasetContext
}
