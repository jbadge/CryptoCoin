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

// // Make one for fetchCoinCapList
// export async function fetchAndCacheHistory({
//   coins,
//   now,
//   start,
//   API_KEY,
//   blobStore,
//   CACHE_HISTORY_BLOB_KEY,
// }: FetchAndCacheHistoryProps): Promise<Record<string, any[]>> {
//   const historyBlob: Record<string, any[]> = {}

//   if (blobStore) {
//     await Promise.all(
//       coins.map(async (coin) => {
//         const resolvedId = resolveCoinId(coin.symbol, coinAssets)
//         if (!resolvedId) {
//           return
//         }

//         let retries = 3
//         let success = false

//         while (retries > 0 && !success) {
//           try {
//             const response = await fetch(
//               `https://rest.coincap.io/v3/assets/${resolvedId}/history?interval=h1&start=${start}&end=${now}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${API_KEY}`,
//                 },
//               }
//             )
//             if (response.ok) {
//               const json = await response.json()
//               historyBlob[resolvedId] = json.data
//               success = true
//             } else {
//               retries--
//             }
//           } catch (error) {
//             console.warn(`⚠️ Failed to fetch history for ${resolvedId}:`, error)
//           }
//         }
//       })
//     )
//   }
//   await writeHistoryCache({
//     blobStore,
//     CACHE_HISTORY_BLOB_KEY,
//     now,
//     historyBlob,
//   })

//   return historyBlob
// }

export async function fetchAndCacheHistory({
  coins,
  now,
  API_KEY,
  blobStore,
  CACHE_HISTORY_BLOB_KEY,
  interval = 'h1',
  count = 24,
}: FetchAndCacheHistoryProps & { interval?: 'h1' | 'h6'; count?: number }) {
  const start = calculateStartTime(interval, count)

  const intervalKey = interval === 'h1' ? '1d' : '7d'
  const historyBlob: Record<string, any[]> = {}

  await Promise.all(
    coins.map(async (coin) => {
      const resolvedId = resolveCoinId(coin.symbol, coinAssets)
      if (!resolvedId) return

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
          if (response.ok) {
            const { data } = await response.json()
            historyBlob[resolvedId] = data.map((coin: any) => ({
              value: Number(coin.priceUsd),
              time: `${coin.time}`,
              date: `${coin.date}`,
            }))
            break
          }
        } catch (err) {
          if (retries === 0)
            console.warn(`⚠️ Final fail for ${resolvedId}`, err)
        }
      }
    })
  )

  const existing =
    (await blobStore?.get(CACHE_HISTORY_BLOB_KEY, { type: 'json' })) || {}

  await writeHistoryCache({
    blobStore,
    CACHE_HISTORY_BLOB_KEY,
    now,
    historyBlob: {
      ...existing,
      timestamp: now,
      [intervalKey]: {
        ...(existing?.[intervalKey] || {}),
        ...historyBlob,
      },
    },
  })
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
