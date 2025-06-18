import {
  CACHE_HISTORY_BLOB_KEY_1D,
  CACHE_HISTORY_BLOB_KEY_7D,
  initializeBlobStore,
} from '../../src/lib'
import {
  errorResponse,
  getJsonBlob,
  handleCoinAssetRequest,
  successResponse,
} from '../../src/lib'

export async function handler(event) {
  const now = Date.now()

  // Initialize store
  const blobStore = await initializeBlobStore()

  if (!blobStore) {
    console.warn('[⚠️] BlobStore unavailable; proceeding without cache writes')
  }

  const coinId = event.queryStringParameters?.id
  const interval = event.queryStringParameters?.interval
  const isHistoryRequest = !!coinId && (interval === 'h1' || interval === 'h6')

  if (!isHistoryRequest) {
    return await handleCoinAssetRequest(event, blobStore, now)
  }

  // Determine cache key based on interval: 1 Day or 7 Day history
  const cacheKey =
    interval === 'h6' ? CACHE_HISTORY_BLOB_KEY_7D : CACHE_HISTORY_BLOB_KEY_1D

  // Get 1 Day history from cache
  try {
    if (!blobStore) {
      console.error('[❌] Netlify Blobs unavailable')
      return errorResponse(500, 'Netlify Blobs unavailable')
    }

    // Read cached history blob as JSON for interval (1d or 7d)
    const cachedHistory = await getJsonBlob(blobStore, cacheKey)

    if (
      !cachedHistory ||
      !cachedHistory.history ||
      !cachedHistory.history[coinId]
    ) {
      return errorResponse(
        404,
        `No ${
          interval === 'h6' ? '7-day' : '1-day'
        } history found for ${coinId}`
      )
    }
    return successResponse(
      cachedHistory.history[coinId],
      `history (${interval === 'h6' ? '7-day' : '1-day'}) (cached)`
    )
  } catch (error) {
    console.error(
      `[❌] Error serving ${
        interval === 'h6' ? '7-day' : '1-day'
      } history for ${coinId}:`,
      error
    )
    return errorResponse(
      500,
      `Failed to get ${interval === 'h6' ? '7-day' : '1-day'} history`
    )
  }
}
