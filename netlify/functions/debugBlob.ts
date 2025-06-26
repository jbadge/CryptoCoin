import {
  initializeBlobStore,
  getJsonBlob,
  CACHE_HISTORY_BLOB_KEY,
} from '../../src/lib'

export async function handler() {
  const blobStore = await initializeBlobStore()

  if (!blobStore) {
    console.error('[❌] Failed to initialize blobStore')
    return {
      statusCode: 500,
      body: 'BlobStore init failed',
    }
  }

  const cached = await getJsonBlob(blobStore, CACHE_HISTORY_BLOB_KEY)

  console.log('[🐛] Full blob content:', JSON.stringify(cached, null, 2))
  console.log('[📅] Timestamp:', cached?.timestamp)
  console.log('[📦] 1d keys:', Object.keys(cached?.['1d'] || {}))
  console.log('[📦] 7d keys:', Object.keys(cached?.['7d'] || {}))

  const keys = cached ? Object.keys(cached['1d'] || {}) : []
  console.log('[🔑] Top-level coin IDs:', keys)

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalCoins: Object.keys(cached?.['1d'] || {}).length,
      example: Object.keys(cached?.['1d'] || {}).slice(0, 5),
      timestamp: cached?.timestamp,
    }),
  }
}
