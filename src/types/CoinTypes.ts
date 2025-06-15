export type Coins = {
  rank: string
  symbol: string
  name: string
  marketcap: number
  volume24h: number
  price: number
  change24h: number
}

export type RawCoinCapType = {
  rank: string | number
  symbol: string
  name: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
}

export type RawCryptoRatesType = {
  rank: string | number
  symbol: string
  name: string
  marketcap: number
  volume24h: number
  price: number
  change24h: number
}

export type Interval =
  | 'm1'
  | 'm5'
  | 'm15'
  | 'm30'
  | 'h1'
  | 'h2'
  | 'h6'
  | 'h12'
  | 'd1'

export type CoinChartProps = {
  name: string
  rank: string
  symbol: string
  interval: Interval
  price: number
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

/////// NEEDED?
export type HistoryPoint = {
  time: number
  priceUsd: number
}
