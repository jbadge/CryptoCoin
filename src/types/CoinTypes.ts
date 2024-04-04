export type Coins = {
  id: string
  rank: string
  symbol: string
  name: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  transformedPriceUsd: number
  changePercent24Hr: string
  transformed24Hr: number
  data: Coins[]
  explorer: string | null
  sparkline: string[]
}

export type CoinChartProps = {
  transformedPriceUsd: number
}
