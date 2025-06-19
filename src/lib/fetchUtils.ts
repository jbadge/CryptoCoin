import coinAssets from '../../src/data/index.json'
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

export async function fetchCoinCapData(
  API_KEY: string,
  notifyAdmin?: NotifyAdminFn
) {
  console.log('[🔄] Fetching from CoinCap...')
  const response = await fetch(`https://rest.coincap.io/v3/assets`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  // if (response.status === 403) {
  //   console.warn('[🚫] CoinCap 403: Access Denied — quota or key issue')
  //   await notifyAdmin('CoinCap API returned 403. Check API key or usage.')
  //   throw new Error('CoinCap 403 - Access denied')
  // }
  if (response.status === 403) {
    if (notifyAdmin)
      await notifyAdmin('CoinCap API returned 403. Check API key or usage.')
    throw new Error('CoinCap 403 - Access denied')
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`CoinCap error: ${response.status} - ${errorBody}`)
  }

  const { data } = await response.json()
  return data
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
  console.log('[✅] Successfully fetched from CoinCap')
  return coins
}

// Make one for fetchCoinCapList
export async function fetchAndCacheHistory({
  coins,
  now,
  start,
  API_KEY,
  blobStore,
  CACHE_HISTORY_BLOB_KEY,
}: FetchAndCacheHistoryProps): Promise<Record<string, any[]>> {
  const historyBlob: Record<string, any[]> = {}

  if (blobStore) {
    await Promise.all(
      coins.map(async (coin) => {
        const resolvedId = resolveCoinId(coin.symbol, coinAssets)
        if (!resolvedId) {
          return
        }
        try {
          const response = await fetch(
            `https://rest.coincap.io/v3/assets/${resolvedId}/history?interval=h1&start=${start}&end=${now}`,
            {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
            }
          )
          if (response.ok) {
            const json = await response.json()
            historyBlob[resolvedId] = json.data
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch history for ${resolvedId}:`, error)
        }
      })
    )
  }
  await writeHistoryCache({
    blobStore,
    CACHE_HISTORY_BLOB_KEY,
    now,
    historyBlob,
  })

  return historyBlob
}

export async function fetchFallbackFromCryptoRates(
  blobStore: BlobStore,
  now: number,
  allowCaching: boolean
): Promise<Coins[]> {
  const response = await fetch('https://cryptorates.ai/v1/coins/100')
  const data = await response.json()
  const coins = mapCryptoRates(data)

  // If CoinCap fails, fallback data from CryptoRates is fetched and cached
  if (allowCaching) {
    await cacheCryptoRates(coins, blobStore, now)
  }
  return coins
}
