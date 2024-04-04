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

export function generateTimestamps(): string[] {
  const currentHour = new Date().getHours()
  const timestamps = []

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24
    const timestamp = `${hour}:00`
    timestamps.push(timestamp)
  }
  return timestamps
}

export function holdData(data: Coins[]) {
  for (let i = 0; i < data.length; i++) {
    let tempPriceUsd = parseFloat(data[i].priceUsd)
    let temp24Hr = parseFloat(data[i].changePercent24Hr)
    data[i].transformedPriceUsd = tempPriceUsd
    data[i].transformed24Hr = temp24Hr
  }
}
