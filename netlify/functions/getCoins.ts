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
import { NotifyAdminFn } from '../../src/types/CoinTypes'

const notifyAdmin: NotifyAdminFn = async (message) => {
  const { Client, GatewayIntentBits } = await import('discord.js')

  const userId = process.env.MY_DISCORD_USER_ID
  const token = process.env.DISCORD_BOT_TOKEN

  if (!userId || !token) {
    console.error('❌ Missing Discord credentials in environment variables.')
    return
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
  })

  return new Promise((resolve) => {
    client.once('ready', async () => {
      try {
        const user = await client.users.fetch(userId)
        await user.send(`⚠️ Admin Alert: ${message}`)
        console.log('✅ Discord DM sent')
        client.destroy()
        resolve(true)
      } catch (err) {
        console.error('❌ Failed to send Discord DM', err)
        client.destroy()
        resolve(false)
      }
    })

    client.login(token)
  })
}

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

  console.log('This is a history request:', isHistoryRequest)
  console.log('coinId: ', coinId)
  console.log('interval: ', interval)

  if (!isHistoryRequest) {
    return await handleCoinAssetRequest(event, blobStore, now, notifyAdmin)
  }
  // Determine cache key based on interval: 1 Day or 7 Day history
  const cacheKey =
    interval === 'h1' ? CACHE_HISTORY_BLOB_KEY_1D : CACHE_HISTORY_BLOB_KEY_7D
  console.log(`Checking for ${interval === 'h1' ? '1-day' : '7-day'} history`)
  console.log('BlobStore: ', blobStore)

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
          interval === 'h1' ? '1-day' : '7-day'
        } history found for ${coinId}`
      )
    }
    return successResponse(
      cachedHistory.history[coinId],
      `history (${interval === 'h1' ? '1-day' : '7-day'}) (cached)`
    )
  } catch (error) {
    console.error(
      `[❌] Error serving ${
        interval === 'h1' ? '1-day' : '7-day'
      } history for ${coinId}:`,
      error
    )
    return errorResponse(
      500,
      `Failed to get ${interval === 'h1' ? '1-day' : '7-day'} history`
    )
  }
}
