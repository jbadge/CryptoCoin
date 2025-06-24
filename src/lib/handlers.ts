import { BlobStore, MinimalEvent, NotifyAdminFn } from '../types/CoinTypes'
import { getJsonBlob, isCacheFresh, logCacheStatus } from './cacheUtils'
import {
  API_KEY,
  CACHE_TTL_MS,
  shouldUseCryptoRates,
  USE_CRYPTORATES,
} from './env'
import { errorResponse, fallbackResponse, successResponse } from './responses'
import {
  fetchAndCacheHistory,
  fetchFallbackFromCryptoRates,
  fetchFreshCoinCapData,
} from './fetchUtils'
import {
  allowCachingFallback,
  CACHE_BLOB_KEY,
  CACHE_HISTORY_BLOB_KEY,
  debugMode,
  NETLIFY_DEV,
  SOURCE_COINCAP,
} from './config'

export async function handleCoinAssetRequest(
  event: MinimalEvent,
  blobStore: BlobStore,
  now: number,
  notifyAdmin: NotifyAdminFn
): Promise<
  | {
      statusCode: number
      body: string
    }
  | ReturnType<typeof successResponse>
  | void
> {
  // Get assets. Determine whether to use CryptoRates or not based on param or fallback flag
  try {
    const useCryptoRates = shouldUseCryptoRates(
      USE_CRYPTORATES,
      event?.queryStringParameters?.source
    )
    const interval = event.queryStringParameters?.interval ?? 'h1'
    const is7dRequest = interval === 'h6'
    const intervalKey = interval === 'h1' ? '1d' : '7d'

    // Fetch cache
    if (!useCryptoRates) {
      const cachedCoinData = await getJsonBlob(blobStore, CACHE_BLOB_KEY)
      const cachedCoins = cachedCoinData?.coins || []

      const cacheIsFresh = isCacheFresh(
        cachedCoinData?.timestamp,
        now,
        CACHE_TTL_MS
      )

      // Require API key only if calling CoinCap (not for CryptoRates)
      if (!API_KEY) {
        console.error('[❌] Missing API_KEY; cannot fetch from CoinCap')
        return errorResponse(500, 'Missing API Key')
      }

      // 7d toggle: fetch and cache only 7d history, no coin list or 1d fetch
      if (is7dRequest) {
        await fetchAndCacheHistory({
          coins: cachedCoins,
          now,
          API_KEY,
          blobStore,
          CACHE_HISTORY_BLOB_KEY,
          interval: 'h6',
          count: 28,
        })

        // After 7d fetch, read cached history to return it
        const cachedHistory = await getJsonBlob(
          blobStore,
          CACHE_HISTORY_BLOB_KEY
        )

        return successResponse(
          cachedCoins,
          SOURCE_COINCAP,
          cachedHistory?.timestamp,
          cachedHistory?.[intervalKey],
          intervalKey
        )
      }

      // If fresh cache
      // REMOVE AFTER WORKING
      // IGNORE COMBINING THESE TWO IFs. I AM DELETING TOP ONE SOON SO NOT COMBINING
      if (!NETLIFY_DEV) {
        if (cacheIsFresh) {
          const cachedHistory = await getJsonBlob(
            blobStore,
            CACHE_HISTORY_BLOB_KEY
          )

          if (debugMode) {
            console.log('[📦] Using cached data from blob storage')
            logCacheStatus(useCryptoRates, cacheIsFresh)
          }

          return successResponse(
            cachedCoins,
            'cache',
            cachedHistory.timestamp,
            cachedHistory?.[intervalKey],
            intervalKey
          )
        }
      }

      // Fetch fresh asset list from CoinCap
      // Fetch coins & 1-day price history from CoinCap. Save to blob storage.
      try {
        const coins = await fetchFreshCoinCapData({
          now,
          API_KEY,
          blobStore,
          CACHE_BLOB_KEY,
          CACHE_HISTORY_BLOB_KEY,
          notifyAdmin,
        })

        const cachedHistory = await getJsonBlob(
          blobStore,
          CACHE_HISTORY_BLOB_KEY
        )
        return successResponse(
          coins,
          SOURCE_COINCAP,
          cachedHistory?.timestamp,
          cachedHistory?.[intervalKey],
          intervalKey
        )
      } catch (error) {
        // If CoinCap fails, fallback data from CryptoRates is fetched and cached
        console.warn('[⚠️] CoinCap failed — Falling back to CryptoRates')
        const coins = await fetchFallbackFromCryptoRates(
          blobStore,
          now,
          allowCachingFallback
        )
        return successResponse(coins, 'cryptorates (fallback)')
      }
    } else {
      // If using CryptoRates, then no need to worry about CoinCap Histories or assets
      if (debugMode) {
        console.log('[🔄] Using CryptoRates (param or fallback mode)')
      }
      return fallbackResponse(blobStore, now)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('[❌] Handler crashed:', error.message)
      return errorResponse(500, `${error.message}`)
    } else {
      console.error('[❌] Handler crashed with unknown error:', error)
      return errorResponse(500, 'Unknown error occurred')
    }
  }
}
