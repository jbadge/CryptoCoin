import { useEffect } from 'react'
import { useDatasetContext } from '../context/DatasetContext'

type PriceUpdaterProps = {
  transformedPriceUsd: number
}

const PriceUpdater = ({ transformedPriceUsd }: PriceUpdaterProps) => {
  const datasetContext = useDatasetContext()

  useEffect(() => {
    if (!datasetContext?.setDataset) return

    datasetContext.setDataset((prevDataset) => [
      ...prevDataset,
      transformedPriceUsd,
    ])
  }, [datasetContext, transformedPriceUsd])

  return null
}

export default PriceUpdater
