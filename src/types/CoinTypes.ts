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
  explorer: string | null
}

export type CoinChartProps = {
  id: string
  rank: string
  symbol: string
  transformedPriceUsd: number
}

export type IconProps = {
  name: string | undefined
  symbol: string | undefined
}
