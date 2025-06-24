import {
  BlobStore,
  Coins,
  WriteCoinsProps,
  WriteHistoryProps,
} from '../types/CoinTypes'
import { CACHE_BLOB_KEY, debugMode } from './config'
import { initializeBlobStore } from './initBlobStore'

let blobStorePromise: Promise<BlobStore | null> | null = null

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

export async function getBlobStore(): Promise<BlobStore | null> {
  if (!blobStorePromise) {
    blobStorePromise = initializeBlobStore().catch((error) => {
      console.error('[❌] Blob Store init failed:', error)
      blobStorePromise = null
      return null
    })
  }
  return blobStorePromise
}

export async function getJsonBlob(
  blobStore: BlobStore | null,
  key: string
): Promise<any | null> {
  if (!blobStore) {
    console.warn('[⚠️] BlobStore unavailable')
    return null
  }

  try {
    const data = await blobStore.get(key, { type: 'json' })
    if (debugMode) {
      console.log(`[✅] Successfully loaded blob: ${key}`)
    }
    return data
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
    if (debugMode) {
      console.log('[💾] Cached CoinCap asset list in blob storage')
    }
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
      ...historyBlob,
    })
    if (debugMode) {
      console.log('[💾] Cached 1-day history for all coins')
    }
  } catch (error) {
    console.warn('[⚠️] Failed to cache 1-day history:', error)
  }
}

export async function cacheCryptoRates(
  coins: Coins[],
  blobStore: BlobStore,
  now: number
) {
  if (blobStore) {
    try {
      await blobStore.setJSON(`${CACHE_BLOB_KEY}`, { timestamp: now, coins })
      if (debugMode) {
        console.log('[💾] Cached CryptoRates data in blob storage')
      }
    } catch (error) {
      console.warn('[⚠️] Failed to write CryptoRates cache blob:', error)
    }
  } else {
    if (debugMode) {
      console.log('[⚠️] Skipping cache: CryptoRates data not stored')
    }
  }
}
