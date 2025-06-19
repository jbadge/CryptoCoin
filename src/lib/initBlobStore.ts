export async function initializeBlobStore() {
  const isServer = typeof process !== 'undefined' && !!process.env

  if (!isServer) {
    console.warn(
      '[⚠️] Skipping Blob Store initialization: not running in server environment'
    )
    return null
  }

  try {
    const { getStore } = await import('@netlify/blobs')

    const blobStore = getStore({
      name: 'default',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOB_STORE_TOKEN,
    })

    console.log('[ℹ️] Initialized Netlify Blob Store')
    return blobStore
  } catch (error) {
    console.warn('[⚠️] Failed to initialize Netlify Blob Store:', error)
    return null
  }
}
