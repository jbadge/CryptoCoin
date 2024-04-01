import { Coins } from '../types/CoinTypes'

export function currencyFormatter(price: number | string, digits: number = 2) {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })

  if (typeof price === 'string') return formattedNumber.format(Number(price))
  // parseFloat(price).toFixed(2)

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
    // let tempDecimal = new Decimal(data[i].priceUsd)
    // let lastDigits = tempDecimal.toString().slice(-16)
    // let lastDigits = tempDecimal.toString()
    // let tempPriceUsd = parseFloat(lastDigits)
    data[i].transformedPriceUsd = tempPriceUsd
    data[i].transformed24Hr = temp24Hr
  }
}
