import { Handler } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { BLOB_KEYS_TO_DELETE, BLOB_PREFIXES_TO_DELETE } from '../../src/lib'

export const handler: Handler = async (event) => {
  const blobStore = getStore({
    name: 'default',
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_BLOB_STORE_TOKEN,
  })

  const results: Record<string, string> = {}

  const secret = event.queryStringParameters?.secret
  if (secret !== 'supersecret') {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' }),
    }
  }

  // Delete exact keys
  for (const key of BLOB_KEYS_TO_DELETE) {
    try {
      await blobStore.delete(key)
      results[key] = '✅ Deleted'
    } catch (err) {
      results[key] = `⚠️ Error: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`
    }
  }

  let allKeys: string[] = []

  try {
    const listResult = await blobStore.list()
    allKeys = listResult.blobs.map((blob) => blob.key)
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to list blobs: ${err}` }),
    }
  }

  // Delete keys matching any prefix in PREFIXES_TO_DELETE
  for (const prefix of BLOB_PREFIXES_TO_DELETE) {
    const keysToDelete = allKeys.filter((key) => key.startsWith(prefix))
    for (const key of keysToDelete) {
      try {
        await blobStore.delete(key)
        results[key] = '✅ Deleted'
      } catch (err) {
        results[key] = `⚠️ Error deleting ${key}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Reset complete',
      results,
    }),
  }
}
