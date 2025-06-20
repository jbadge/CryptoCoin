import { CACHE_HISTORY_BLOB_KEY, initializeBlobStore } from '../../src/lib'
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
  console.log('🔥 getCoins.ts: LIVE HANDLER RUNNING')

  // Initialize store
  const blobStore = await initializeBlobStore()

  if (!blobStore) {
    console.warn('[⚠️] BlobStore unavailable; proceeding without cache writes')
  }

  const coinId = event.queryStringParameters?.id
  const interval = event.queryStringParameters?.interval
  const isGraphRequest = !!coinId && (interval === 'h1' || interval === 'h6')

  console.log('This is a history request:', isGraphRequest)
  console.log('coinId: ', coinId)
  console.log('interval: ', interval)
  // If
  if (!isGraphRequest) {
    return await handleCoinAssetRequest(event, blobStore, now, notifyAdmin)
  }
  // Determine cache key based on interval: 1 Day or 7 Day history
  // const cacheKey =
  //   interval === 'h1' ? CACHE_HISTORY_BLOB_KEY_1D : CACHE_HISTORY_BLOB_KEY_7D
  const intervalKey = interval === 'h1' ? '1d' : '7d'

  console.log(`Checking for ${intervalKey} history in unified cache`)
  console.log('BlobStore: ', blobStore)

  // Get history from cache
  try {
    if (!blobStore) {
      console.error('[❌] Netlify Blobs unavailable')
      return errorResponse(500, 'Netlify Blobs unavailable')
    }

    // Read cached history blob as JSON for interval (1d or 7d)
    const cachedHistory = await getJsonBlob(blobStore, CACHE_HISTORY_BLOB_KEY)

    if (!cachedHistory || typeof cachedHistory !== 'object') {
      console.error('⚠️ getJsonBlob result is invalid:', cachedHistory)
    }
    console.log(
      '[🔑] Cached keys for',
      interval,
      ':',
      Object.keys(cachedHistory?.history || {})
    )

    if (
      !cachedHistory ||
      typeof cachedHistory !== 'object' ||
      !cachedHistory[intervalKey] ||
      !cachedHistory.timestamp ||
      typeof cachedHistory.timestamp[intervalKey] !== 'number'
    ) {
      console.error(
        '⚠️ Cached history blob is missing required interval data or timestamps:',
        cachedHistory
      )
      return errorResponse(
        404,
        `No cached ${intervalKey} history or timestamp found`
      )
    }
    if (!cachedHistory[intervalKey][coinId]) {
      return errorResponse(
        404,
        `No ${intervalKey} history found for coin ${coinId}`
      )
    }
    return successResponse(
      cachedHistory[intervalKey][coinId],
      `history (${intervalKey}) (cached)`
    )
  } catch (error) {
    console.error(
      `[❌] Error serving ${intervalKey} history for ${coinId}:`,
      error
    )
    return errorResponse(500, `Failed to get ${intervalKey} history`)
  }
}
