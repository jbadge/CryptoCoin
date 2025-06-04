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
