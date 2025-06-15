import { Handler } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

import type {
  Coins,
  RawCoinCapType,
  RawCryptoRatesType,
} from '../../src/types/CoinTypes'

const API_KEY =
  process.env.API_KEY ||
  process.env.REACT_APP_API_KEY ||
  process.env.VITE_API_KEY
const USE_CRYPTORATES = process.env.USE_CRYPTORATES === 'true'

// Safe global scope detection for environments without globalThis
// const globalScope =
//   typeof globalThis !== 'undefined'
//     ? /* eslint-disable-next-line no-undef */
//       globalThis
//     : typeof global !== 'undefined'
//     ? global
//     : typeof self !== 'undefined'
//     ? self
//     : {}

// Removed old netlifyBlobs assignment
// const netlifyBlobs = (globalScope as any).netlify?.blobs

const CACHE_BLOB_KEY = 'cache_coins_data'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Added new cache key for 1-day history blob
const CACHE_HISTORY_BLOB_KEY = 'cache_history_h1'

// --- New blob store initialization ---

// Your Netlify Site/Project ID from UI > Project settings > General > Project information
// const SITE_ID = process.env.NETLIFY_SITE_ID || 'your-site-id-here' // <-- Replace or set env var

// Optionally set your token here (if needed for permissions)
// const BLOB_STORE_TOKEN = process.env.NETLIFY_BLOB_STORE_TOKEN || '########' // <-- Replace as needed

let blobStore

try {
  // Initialize the Netlify Blob Store once on module load
  blobStore = getStore('default') // Open store named "default"
  console.log('[ℹ️] Initialized Netlify Blob Store')
} catch (e) {
  console.warn('[⚠️] Failed to initialize Netlify Blob Store:', e)
}

// --- End new blob store init ---

// Map CoinCap API response to expected shape
function mapCoinCap(data: RawCoinCapType[]): Coins[] {
  return data
    .map(
      ({
        rank,
        symbol,
        name,
        priceUsd,
        changePercent24Hr,
        marketCapUsd,
        volumeUsd24Hr,
      }) => {
        const price = Number(priceUsd)
        const change24h = Number(changePercent24Hr)
        const marketcap = Number(marketCapUsd)
        const volume24h = Number(volumeUsd24Hr)

        // Guard against invalid numbers
        if (
          isNaN(price) ||
          isNaN(change24h) ||
          isNaN(marketcap) ||
          isNaN(volume24h)
        ) {
          return null
        }

        return {
          rank: String(rank),
          symbol,
          name,
          marketcap,
          volume24h,
          price,
          change24h: change24h / 100,
        }
      }
    )
    .filter((coin): coin is Coins => coin !== null)
}

// Map CryptoRates API response to expected shape
function mapCryptoRates(data: RawCryptoRatesType[]): Coins[] {
  return data
    .map(({ price, change24h, marketcap, volume24h, rank, symbol, name }) => {
      // Guard against invalid numbers
      if (
        typeof price !== 'number' ||
        isNaN(price) ||
        typeof change24h !== 'number' ||
        isNaN(change24h) ||
        typeof marketcap !== 'number' ||
        isNaN(marketcap) ||
        typeof volume24h !== 'number' ||
        isNaN(volume24h)
      ) {
        return null
      }

      return {
        rank: String(rank),
        symbol,
        name,
        marketcap,
        volume24h,
        price,
        change24h,
      }
    })
    .filter((coin): coin is Coins => coin !== null)
}

async function notifyAdmin(message: string): Promise<boolean | void> {
  const { Client, GatewayIntentBits } = await import('discord.js')

  const userId = process.env.MY_DISCORD_USER_ID
  const token = process.env.DISCORD_BOT_TOKEN

  // 🔐 Type safety check
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

export const handler: Handler = async (event) => {
  // Handler for 1-day history query param: ?id=coinId&interval=h1
  if (
    event.queryStringParameters?.id &&
    event.queryStringParameters?.interval === 'h1'
  ) {
    const coinId = event.queryStringParameters.id
    try {
      if (blobStore) {
        // Replaced netlifyBlobs with blobStore
        const blobText = await blobStore.getText(CACHE_HISTORY_BLOB_KEY)
        if (!blobText) throw new Error('History blob is missing')
        const { history } = JSON.parse(blobText)

        if (!history?.[coinId]) {
          return {
            statusCode: 404,
            body: JSON.stringify({
              error: `No 1-day history found for ${coinId}`,
            }),
          }
        }

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: history[coinId] }),
        }
      } else {
        throw new Error('Netlify Blobs unavailable')
      }
    } catch (err) {
      console.error(`[❌] Error serving 1-day history for ${coinId}:`, err)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Failed to get 1-day history for ${coinId}`,
        }),
      }
    }
  }

  try {
    const useCryptoRates =
      USE_CRYPTORATES || event?.queryStringParameters?.source === 'cryptorates'

    // Try to read cached data from Netlify Blob storage
    let cachedData: { timestamp: number; coins: Coins[] } | null = null
    try {
      if (blobStore) {
        // Replaced netlifyBlobs with blobStore
        const blobText = await blobStore.getText(CACHE_BLOB_KEY)
        cachedData = blobText ? JSON.parse(blobText) : null
      } else {
        console.warn('[⚠️] Netlify blobs API not available')
      }
    } catch (e) {
      console.warn('[⚠️] Failed to read cache blob:', e)
    }

    const now = Date.now()
    const cacheIsFresh =
      cachedData !== null &&
      cachedData.timestamp !== undefined &&
      now - cachedData.timestamp < ONE_DAY_MS

    if (cacheIsFresh && !useCryptoRates) {
      console.log('[📦] Using cached data from blob storage')
      return successResponse(cachedData!.coins, 'cache')
    }

    if (useCryptoRates) {
      console.log('[🔄] Using CryptoRates (param or fallback mode)')
      const response = await fetch('https://cryptorates.ai/v1/coins/100')
      const data = await response.json()
      const coins = mapCryptoRates(data)

      // Cache updated data
      if (blobStore) {
        try {
          // Replaced netlifyBlobs with blobStore
          await blobStore.putText(
            CACHE_BLOB_KEY,
            JSON.stringify({ timestamp: now, coins })
          )
          console.log('[💾] Cached CryptoRates data in blob storage')
        } catch (e) {
          console.warn('[⚠️] Failed to write cache blob:', e)
        }
      }
      return successResponse(coins, 'cryptorates')
    }

    try {
      console.log('[🔄] Fetching from CoinCap...')
      const response = await fetch(`https://rest.coincap.io/v3/assets`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      })

      if (response.status === 403) {
        console.warn('[🚫] CoinCap 403: Access Denied — quota or key issue')
        await notifyAdmin('CoinCap API returned 403. Check API key or usage.')
        throw new Error('CoinCap 403 - Access denied')
      }

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`CoinCap error: ${response.status} - ${errorBody}`)
      }

      const { data } = await response.json()
      const coins = mapCoinCap(data)

      // Fetch 1-day history for each coin and cache it in a separate blob
      if (blobStore) {
        try {
          const historyBlob: Record<string, any[]> = {}
          const now = Date.now()
          const start = now - ONE_DAY_MS

          // CoinCap allows fetching hourly history by coin ID
          const historyFetches = coins.map(async (coin) => {
            // Create coin id slug (same as CoinCap expects)
            const id = coin.name.toLowerCase().replace(/\s+/g, '-')
            try {
              const res = await fetch(
                `https://rest.coincap.io/v3/assets/${id}/history?interval=h1&start=${start}&end=${now}`,
                {
                  headers: {
                    Authorization: `Bearer ${API_KEY}`,
                  },
                }
              )
              if (res.ok) {
                const json = await res.json()
                historyBlob[id] = json.data
              }
            } catch (e) {
              console.warn(`⚠️ Failed to fetch history for ${id}:`, e)
            }
          })

          await Promise.all(historyFetches)

          // Replaced netlifyBlobs with blobStore
          await blobStore.putText(
            CACHE_HISTORY_BLOB_KEY,
            JSON.stringify({ timestamp: now, history: historyBlob })
          )

          console.log('[💾] Cached 1-day history for all coins')
        } catch (e) {
          console.warn('[⚠️] Failed to cache 1-day history:', e)
        }

        // Cache coins data as usual
        try {
          // Replaced netlifyBlobs with blobStore
          await blobStore.putText(
            CACHE_BLOB_KEY,
            JSON.stringify({ timestamp: now, coins })
          )
          console.log('[💾] Cached CoinCap data in blob storage')
        } catch (e) {
          console.warn('[⚠️] Failed to write cache blob:', e)
        }
      }

      console.log('[✅] Successfully fetched from CoinCap')
      return successResponse(coins, 'coincap')
    } catch (error) {
      console.warn('[⚠️] CoinCap failed — Falling back to CryptoRates')
      const fallbackRes = await fetch('https://cryptorates.ai/v1/coins/100')
      const fallbackData = await fallbackRes.json()
      const coins = mapCryptoRates(fallbackData)

      // Cache fallback data
      if (blobStore) {
        try {
          // Replaced netlifyBlobs with blobStore
          await blobStore.putText(
            CACHE_BLOB_KEY,
            JSON.stringify({ timestamp: now, coins })
          )
          console.log('[💾] Cached fallback CryptoRates data in blob storage')
        } catch (e) {
          console.warn('[⚠️] Failed to write fallback cache blob:', e)
        }
      }

      return successResponse(coins, 'cryptorates (fallback)')
    }
  } catch (error) {
    console.error('[❌] Handler crashed:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

function successResponse(data: Coins[], source: string) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, source }),
  }
}
