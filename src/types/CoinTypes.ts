// ---------------------
// Coin Types
// ---------------------

export type Coins = {
  rank: string
  symbol: string
  name: string
  marketCap: number
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

// ---------------------
// Chart & History
// ---------------------

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
  name?: string
  symbol?: string
}

export type CoinHistoryEntry = {
  price: string
  time: number
  date: string
}

export type RawHistoryItem = {
  id: string
  entries: CoinHistoryEntry[]
}

/// Make into
export type CachedHistoryType = {
  timestamp: number
  '1d': Record<string, CoinHistoryEntry[]>
  '7d': Record<string, CoinHistoryEntry[]>
} | null

// ---------------------
// Fetch / Cache Types
// ---------------------

export type BlobStore = ReturnType<
  typeof import('@netlify/blobs').getStore
> | null

type FetchAndCacheProps = {
  now: number
  start?: number
  API_KEY: string
  blobStore: BlobStore
}

type BlobKeys = {
  CACHE_BLOB_KEY: string
  CACHE_HISTORY_BLOB_KEY: string
}

export type FetchAndCacheHistoryProps = FetchAndCacheProps & {
  coins: Coins[]
  CACHE_HISTORY_BLOB_KEY: string
  // interval?: string
  // count?: number
}

export type FetchAndCacheAllProps = FetchAndCacheProps & BlobKeys

type WriteProps = {
  blobStore: BlobStore
  now: number
}

export type WriteHistoryProps = WriteProps & {
  CACHE_HISTORY_BLOB_KEY: string
  historyBlob: Record<string, any[]>
}

export type WriteCoinsProps = WriteProps & {
  CACHE_BLOB_KEY: string
  coins: Coins[]
}

// ---------------------
// API / Event Types
// ---------------------

export type MinimalEvent = {
  queryStringParameters?: {
    id?: string
    interval?: string
    source?: string
  }
}

export type NotifyAdminFn = (_message: string) => Promise<boolean | void>
