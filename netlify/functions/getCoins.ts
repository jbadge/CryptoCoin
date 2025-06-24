import {
  CACHE_HISTORY_BLOB_KEY,
  debugMode,
  getBlobStore,
  SOURCE_COINCAP,
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
  if (debugMode) {
    console.log('🔥 getCoins.ts: LIVE HANDLER RUNNING')
  }
  const blobStore = await getBlobStore()

  if (!blobStore) {
    console.warn('[⚠️] BlobStore unavailable; skipping cache')
  }

  const coinId = event.queryStringParameters?.id
  const interval = event.queryStringParameters?.interval
  const isSingleCoinHistoryRequest =
    !!coinId && (interval === 'h1' || interval === 'h6')

  // Main handler, not fetching a single coin`
  if (!isSingleCoinHistoryRequest) {
    return await handleCoinAssetRequest(event, blobStore, now, notifyAdmin)
  }
  // Determine cache key based on interval: 1 Day or 7 Day history
  const intervalKey = interval === 'h1' ? '1d' : '7d'
  console.log('######## DEBUG ######## getCoins intervalKey: ', intervalKey)

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

    if (
      !cachedHistory ||
      typeof cachedHistory !== 'object' ||
      !cachedHistory[intervalKey] ||
      typeof cachedHistory.timestamp !== 'number'
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

    // May need to do more with this if using single coin fetching
    return successResponse(
      cachedHistory[intervalKey][coinId],
      SOURCE_COINCAP,
      cachedHistory.timestamp,
      cachedHistory?.[intervalKey]
      // `history (${intervalKey}) (cached)`
    )
  } catch (error) {
    console.error(
      `[❌] Error serving ${intervalKey} history for ${coinId}:`,
      error
    )
    return errorResponse(500, `Failed to get ${intervalKey} history`)
  }
}
