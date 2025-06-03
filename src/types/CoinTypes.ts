export type Coins = {
  // id: string
  rank: number
  symbol: string
  name: string
  marketcap: number
  volume24h: number
  price: number
  transformedPriceUsd: number
  change24h: number
  // change7d: number
  transformed24Hr: number
  explorer: string | null
}

export type CoinChartProps = {
  // id: string
  rank: number
  symbol: string
  transformedPriceUsd: number
}

export type IconProps = {
  name: string | undefined
  symbol: string | undefined
}
