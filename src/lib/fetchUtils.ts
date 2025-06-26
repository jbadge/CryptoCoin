import coinAssets from '../../src/data/index.json'
import { calculateStartTime } from './timeUtils'
import {
  BlobStore,
  Coins,
  FetchAndCacheAllProps,
  FetchAndCacheHistoryProps,
  NotifyAdminFn,
} from '../types/CoinTypes'
import {
  cacheCryptoRates,
  writeCoinCache,
  writeHistoryCache,
} from './cacheUtils'
import { mapCoinCap, mapCryptoRates } from './coinMappers'
import { resolveCoinId } from './coinUtils'
import { CACHE_TTL_MS } from './env'
import { debugMode } from './config'
let isFetchingCoins = false
let isFetchingHistory = false
let isFetchingFreshData = false
let isFetchingFallbackFromCryptoRates = false

export async function fetchCoinCapData(
  API_KEY: string,
  notifyAdmin?: NotifyAdminFn
) {
  if (isFetchingCoins) {
    console.log(
      '[⚠️] fetchCoinCapData already running — skipping duplicate call'
    )
    return []
  }
  isFetchingCoins = true

  try {
    const response = await fetch(`https://rest.coincap.io/v3/assets`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (response.status === 403) {
      if (notifyAdmin)
        await notifyAdmin('CoinCap API returned 403. Check API key or usage.')
      throw new Error('fetchCoinCapData: CoinCap 403 - Access denied')
    }

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `fetchCoinCapData: CoinCap error: ${response.status} - ${errorBody}`
      )
    }

    const { data } = await response.json()
    return data
  } finally {
    isFetchingCoins = false
  }
}

export async function fetchFreshCoinCapData({
  now,
  API_KEY,
  blobStore,
  CACHE_BLOB_KEY,
  CACHE_HISTORY_BLOB_KEY,
  notifyAdmin,
}: FetchAndCacheAllProps & {
  notifyAdmin?: NotifyAdminFn
}): Promise<Coins[]> {
  if (isFetchingFreshData) {
    console.log(
      '[⚠️] fetchFreshCoinCapData already running — skipping duplicate call'
    )
    return []
  }
  isFetchingFreshData = true

  try {
    const data = await fetchCoinCapData(API_KEY, notifyAdmin)
    const coins = mapCoinCap(data)

    const start = now - CACHE_TTL_MS

    await fetchAndCacheHistory({
      coins,
      now,
      start,
      API_KEY,
      blobStore,
      CACHE_HISTORY_BLOB_KEY,
    })

    await writeCoinCache({
      blobStore,
      CACHE_BLOB_KEY,
      now,
      coins,
    })

    return coins
  } finally {
    isFetchingFreshData = false
  }
}

// Make one for fetchCoinCapList
export async function fetchAndCacheHistory({
  coins,
  now,
  API_KEY,
  blobStore,
  CACHE_HISTORY_BLOB_KEY,
  interval = 'h1',
  count = 24,
}: FetchAndCacheHistoryProps & { interval?: 'h1' | 'h6'; count?: number }) {
  if (isFetchingHistory) {
    console.log(
      '[⚠️] fetchAndCacheHistory already running — skipping duplicate call'
    )
    return
  }
  isFetchingHistory = true

  try {
    const start = calculateStartTime(interval, count)

    const intervalKey = interval === 'h1' ? '1d' : '7d'
    const isFullFetch = interval === 'h1'
    const historyBlob: Record<string, any[]> = {}

    const existing = await blobStore?.get(CACHE_HISTORY_BLOB_KEY, {
      type: 'json',
    })

    if (
      intervalKey === '7d' &&
      existing &&
      typeof existing === 'object' &&
      existing['7d'] &&
      typeof existing['7d'] === 'object' &&
      Object.keys(existing['7d']).length > 0
    ) {
      isFetchingHistory = false
      return
    }

    await Promise.all(
      coins.map(async (coin) => {
        const resolvedId = resolveCoinId(coin.symbol, coinAssets)
        if (!resolvedId) return

        // Skip all coins except bitcoin when debugging
        if (debugMode && resolvedId !== 'bitcoin') {
          return
        }

        let retries = 3
        while (retries-- > 0) {
          try {
            const response = await fetch(
              `https://rest.coincap.io/v3/assets/${resolvedId}/history?interval=${interval}&start=${start}&end=${now}`,
              {
                headers: {
                  Authorization: `Bearer ${API_KEY}`,
                },
              }
            )

            if (!response.ok) {
              console.warn(
                `⚠️ fetchAndCacheHistory: CoinCap history fetch failed for ${resolvedId} status: ${response.status}`
              )
            }

            if (response.ok) {
              const { data } = await response.json()
              historyBlob[resolvedId] = data.map((coin: any) => ({
                price: coin.priceUsd,
                time: coin.time,
                date: coin.date,
              }))
              break
            }
          } catch (error) {
            if (retries === 0)
              console.warn(
                `⚠️ fetchAndCacheHistory: Final fail for ${resolvedId}`,
                error
              )
          }
        }
      })
    )

    const is7dDataExists =
      existing?.['7d'] && Object.keys(existing['7d']).length > 0

    const payload = {
      timestamp: isFullFetch ? now : existing?.timestamp,

      '1d': intervalKey === '1d' ? historyBlob : existing?.['1d'] || {},

      '7d':
        intervalKey === '1d'
          ? {}
          : intervalKey === '7d'
          ? is7dDataExists
            ? existing['7d']
            : historyBlob
          : existing?.['7d'] || {},
    }

    await writeHistoryCache({
      blobStore,
      CACHE_HISTORY_BLOB_KEY,
      now,
      historyBlob: payload,
    })
  } finally {
    isFetchingHistory = false
  }
}

export async function fetchFallbackFromCryptoRates(
  blobStore: BlobStore,
  now: number,
  allowCaching: boolean
): Promise<Coins[]> {
  if (isFetchingFallbackFromCryptoRates) {
    console.log(
      '[⚠️] fetchFallbackFromCryptoRates already running — skipping duplicate call'
    )
    return []
  }
  isFetchingFallbackFromCryptoRates = true

  try {
    const response = await fetch('https://cryptorates.ai/v1/coins/100')
    const data = await response.json()
    const coins = mapCryptoRates(data)

    // If CoinCap fails, fallback data from CryptoRates is fetched and cached
    if (allowCaching) {
      await cacheCryptoRates(coins, blobStore, now)
    }
    console.log(
      '[✅] fetchFallbackFromCryptoRates: Successfully fetched from CryptoRates'
    )
    return coins
  } finally {
    isFetchingFallbackFromCryptoRates = false
  }
}
