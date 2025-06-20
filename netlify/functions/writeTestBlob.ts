import type { Handler } from '@netlify/functions'
import { initializeBlobStore } from '../../src/lib/initBlobStore'
import { CACHE_HISTORY_BLOB_KEY } from '../../src/lib/config'

export const handler: Handler = async () => {
  const store = await initializeBlobStore()

  await store?.setJSON(`${CACHE_HISTORY_BLOB_KEY}.json`, {
    id: 'bitcoin',
    entries: [
      { priceUsd: '67000', time: 1720000000000, date: '2024-06-01T00:00:00Z' },
    ],
  })

  return {
    statusCode: 200,
    body: '✅ Test blob written.',
  }
}
