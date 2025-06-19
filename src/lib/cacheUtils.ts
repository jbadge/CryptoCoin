import {
  BlobStore,
  Coins,
  WriteCoinsProps,
  WriteHistoryProps,
} from '../types/CoinTypes'

export function isCacheFresh(
  timestamp: number | undefined,
  now: number,
  ttl: number
): boolean {
  return typeof timestamp === 'number' && now - timestamp < ttl
}

export function logCacheStatus(useCryptoRates: boolean, isFresh: boolean) {
  console.log(
    `[📡] Source: ${useCryptoRates ? 'cryptorates' : 'coincap'}  | Cache: ${
      isFresh ? 'HIT' : 'MISS'
    }`
  )
}

export async function cacheCryptoRates(
  coins: Coins[],
  blobStore: BlobStore,
  now: number
) {
  if (blobStore) {
    try {
      await blobStore.setJSON('cache_coins_data', { timestamp: now, coins })
      console.log('[💾] Cached CryptoRates data in blob storage')
    } catch (error) {
      console.warn('[⚠️] Failed to write CryptoRates cache blob:', error)
    }
  } else {
    console.log('[⚠️] Skipping cache: CryptoRates data not stored')
  }
}

export async function getJsonBlob(
  blobStore: BlobStore,
  key: string
): Promise<any | null> {
  if (!blobStore) {
    console.warn('[⚠️] BlobStore unavailable')
    return null
  }

  try {
    return await blobStore.get(key, { type: 'json' })
  } catch (error) {
    console.warn(`[⚠️] Failed to read blob: ${key}`, error)
    return null
  }
}

export async function writeCoinCache({
  blobStore,
  CACHE_BLOB_KEY,
  now,
  coins,
}: WriteCoinsProps): Promise<void> {
  if (!blobStore) {
    console.warn('[⚠️] No blob store available, skipping caching')
    return
  }

  try {
    await blobStore.setJSON(CACHE_BLOB_KEY, {
      timestamp: now,
      coins,
    })
    console.log('[💾] Cached CoinCap data in blob storage')
  } catch (error) {
    console.warn('[⚠️] Failed to write cache blob:', error)
  }
}

export async function writeHistoryCache({
  blobStore,
  CACHE_HISTORY_BLOB_KEY,
  now,
  historyBlob,
}: WriteHistoryProps): Promise<void> {
  if (!blobStore) {
    console.warn('[⚠️] No blob store available, skipping caching')
    return
  }

  try {
    await blobStore.setJSON(CACHE_HISTORY_BLOB_KEY, {
      timestamp: now,
      history: historyBlob,
    })
    console.log('[💾] Cached 1-day history for all coins')
  } catch (error) {
    console.warn('[⚠️] Failed to cache 1-day history:', error)
  }
}
