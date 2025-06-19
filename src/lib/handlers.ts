import { BlobStore, MinimalEvent, NotifyAdminFn } from '../types/CoinTypes'
import {
  // getJsonBlob,
  isCacheFresh,
  logCacheStatus,
  tryReadFromCache,
} from './cacheUtils'
import {
  API_KEY,
  CACHE_TTL_MS,
  shouldUseCryptoRates,
  USE_CRYPTORATES,
} from './env'
import { errorResponse, successResponse } from './responses'
import {
  fetchFallbackFromCryptoRates,
  fetchFreshCoinCapData,
} from './fetchUtils'
import {
  allowCachingFallback,
  CACHE_BLOB_KEY,
  CACHE_HISTORY_BLOB_KEY_1D,
  SOURCE_COINCAP,
  SOURCE_CRYPTORATES,
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

    // Get cache
    if (!useCryptoRates) {
      const cachedData = await tryReadFromCache(
        blobStore,
        CACHE_BLOB_KEY,
        'coins'
      )
      // const cachedData = await getJsonBlob(blobStore, CACHE_BLOB_KEY)

      const cacheIsFresh = isCacheFresh(
        cachedData?.timestamp,
        now,
        CACHE_TTL_MS
      )

      logCacheStatus(useCryptoRates, cacheIsFresh)

      // If fresh cache
      if (cacheIsFresh && !useCryptoRates) {
        console.log('[📦] Using cached data from blob storage')
        return successResponse(cachedData!.coins, 'cache')
      }

      // Fetch fresh asset list from CoinCap because cache is stale and CryptoRates is not forced
      try {
        if (!API_KEY) {
          console.error('[❌] Missing API_KEY; cannot fetch from CoinCap')
          // return {
          //   statusCode: 500,
          //   body: JSON.stringify({ error: 'Missing API Key' }),
          // }
          return errorResponse(500, 'Missing API Key')
        }

        const CACHE_HISTORY_BLOB_KEY = CACHE_HISTORY_BLOB_KEY_1D
        // Fetch 1-day price history for each coin from CoinCap and save it in blob storage
        const coins = await fetchFreshCoinCapData({
          now,
          API_KEY,
          blobStore,
          CACHE_BLOB_KEY,
          CACHE_HISTORY_BLOB_KEY,
          notifyAdmin,
        })

        return successResponse(coins, SOURCE_COINCAP)
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
      console.log('[🔄] Using CryptoRates (param or fallback mode)')
      const coins = await fetchFallbackFromCryptoRates(
        blobStore,
        now,
        allowCachingFallback
      )
      return successResponse(coins, SOURCE_CRYPTORATES)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('[❌] Handler crashed:', error.message)
      // return {
      //   statusCode: 500,
      //   body: JSON.stringify({ error: error.message }),
      // }
      return errorResponse(500, `${error.message}`)
    } else {
      console.error('[❌] Handler crashed with unknown error:', error)
      // return {
      //   statusCode: 500,
      //   body: JSON.stringify({ error: 'Unknown error occurred' }),
      // }
      return errorResponse(500, 'Unknown error occurred')
    }
  }
}
