import { Coins } from '../types/CoinTypes'

export function currencyFormatter(price: number | string, digits: number = 2) {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  })
  if (typeof price === 'string') return formattedNumber.format(Number(price))
  return formattedNumber.format(price)
}

// Helper function currently unused
export function generateTimestamp(): string {
  let dt = new Date()
  let hour = (dt.getHours() < 10 ? '0' : '') + dt.getHours()
  let minute = (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes()
  let second = (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds()
  const timestamp = `${hour}:${minute}:${second}`
  return timestamp
}

export function holdData(data: Coins[]) {
  for (let i = 0; i < data.length; i++) {
    let tempPriceUsd = parseFloat(data[i].priceUsd)
    let temp24Hr = parseFloat(data[i].changePercent24Hr)
    data[i].transformedPriceUsd = tempPriceUsd
    data[i].transformed24Hr = temp24Hr
  }
}

import React from 'react'
import { useDatasetContext } from '../context/DatasetContext'

const PriceUpdater = ({
  transformedPriceUsd,
}: {
  transformedPriceUsd: number
}) => {
  const datasetContext = useDatasetContext()

  React.useEffect(() => {
    datasetContext.setDataset((prevDataset) => [
      ...prevDataset,
      transformedPriceUsd,
    ])
  }, [transformedPriceUsd])

  return null
}

export default PriceUpdater
