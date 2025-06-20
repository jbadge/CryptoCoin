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

  console.log('[🐛] Full blob content:', cached)

  const keys = cached?.history ? Object.keys(cached.history) : []
  console.log('[🔑] Top-level coin IDs:', keys)

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalCoins: keys.length,
      example: keys.slice(0, 5),
    }),
  }
}
