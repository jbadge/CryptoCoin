export async function initializeBlobStore() {
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
