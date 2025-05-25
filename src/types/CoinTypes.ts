export type Coins = {
  id: string
  rank: string
  symbol: string
  name: string
  marketcap: string
  volume24h: string
  price: string
  transformedPriceUsd: number
  change24h: string
  transformed24Hr: number
  explorer: string | null
}

export type CoinChartProps = {
  id?: string
  rank: string
  symbol: string
  transformedPriceUsd: number
}

export type IconProps = {
  name: string | undefined
  symbol: string | undefined
}

export type CoinEntry = {
  coinCapId?: string
  coinGeckoId?: string
  cryptoCompareId?: string
  cryptoCurrencyIconName?: string
  dexAgId?: string
}

export type CoinIdMap = {
  [uuid: string]: CoinEntry
}
