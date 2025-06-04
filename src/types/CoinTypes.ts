export type Coins = {
  rank: number
  symbol: string
  name: string
  marketcap: number
  volume24h: number
  price: number
  transformedPriceUsd: number
  change24h: number
  transformed24Hr: number
}

export type CoinChartProps = {
  name: string
  rank: number
  symbol: string
  transformedPriceUsd: number
}

export type IconProps = {
  name: string | undefined
  symbol: string | undefined
}

export type CoinHistoryEntry = {
  priceUsd: string
  time: number
  date: string
}

export type RawHistoryItem = {
  id: string
  entries: CoinHistoryEntry[]
}

export type CoinHistoryData = {
  [symbol: string]: CoinHistoryEntry[]
}
