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

const CACHE_BLOB_KEY = 'cache_coins_data'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const CACHE_HISTORY_BLOB_KEY = 'cache_history_h1'

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

function mapCryptoRates(data: RawCryptoRatesType[]): Coins[] {
  return data
    .map(({ price, change24h, marketcap, volume24h, rank, symbol, name }) => {
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

async function cacheCryptoRates(coins, blobStore, now) {
  if (blobStore) {
    try {
      await blobStore.setJSON(CACHE_BLOB_KEY, { timestamp: now, coins })
      console.log('[💾] Cached CryptoRates data in blob storage')
    } catch (e) {
      console.warn('[⚠️] Failed to write CryptoRates cache blob:', e)
    }
  } else {
    console.log('[⚠️] Skipping cache: CryptoRates data not stored')
  }
}

export async function handler(event) {
  const allowCachingFallback = false
  let blobStore
  const now = Date.now()

  // Initialize store
  try {
    const { getStore } = await import('@netlify/blobs')
    blobStore = getStore({
      name: 'default',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOB_STORE_TOKEN,
    })
    console.log('[ℹ️] Initialized Netlify Blob Store')
  } catch (e) {
    console.warn('[⚠️] Failed to initialize Netlify Blob Store:', e)
  }

  const coinId = event.queryStringParameters?.id
  const interval = event.queryStringParameters?.interval
  const isHistoryRequest = !!coinId && interval === 'h1'

  if (!isHistoryRequest) {
    // Get assets. Determine whether to use CryptoRates or not based on param or fallback flag
    try {
      const useCryptoRates =
        USE_CRYPTORATES ||
        event?.queryStringParameters?.source === 'cryptorates'

      if (!useCryptoRates) {
        let cachedData: { timestamp: number; coins: Coins[] } | null = null
        if (blobStore) {
          try {
            // Import cache
            // Read coins cache blob as JSON
            cachedData = await blobStore.get(CACHE_BLOB_KEY, { type: 'json' })
          } catch (e) {
            console.warn('[⚠️] Failed to read cache blob:', e)
          }
        } else {
          console.warn('[⚠️] Netlify blobs API not available')
        }

        const cacheIsFresh =
          cachedData !== null &&
          cachedData.timestamp !== undefined &&
          now - cachedData.timestamp < ONE_DAY_MS

        // If fresh cache
        if (cacheIsFresh && !useCryptoRates) {
          console.log('[📦] Using cached data from blob storage')
          return successResponse(cachedData!.coins, 'cache')
        }

        // Fetch fresh asset list from CoinCap because cache is stale and CryptoRates is not forced
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
            await notifyAdmin(
              'CoinCap API returned 403. Check API key or usage.'
            )
            throw new Error('CoinCap 403 - Access denied')
          }

          if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`CoinCap error: ${response.status} - ${errorBody}`)
          }

          const { data } = await response.json()
          const coins = mapCoinCap(data)

          // Fetch 1-day price history for each coin from CoinCap and save it in blob storage
          if (blobStore) {
            const historyBlob: Record<string, any[]> = {}
            const start = now - ONE_DAY_MS

            await Promise.all(
              coins.map(async (coin) => {
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
            )
            if (blobStore) {
              try {
                // Write history blob as JSON
                await blobStore.setJSON(CACHE_HISTORY_BLOB_KEY, {
                  timestamp: now,
                  history: historyBlob,
                })
                console.log('[💾] Cached 1-day history for all coins')
              } catch (e) {
                console.warn('[⚠️] Failed to cache 1-day history:', e)
              }
            }
            if (blobStore) {
              try {
                // Write coins cache blob as JSON
                await blobStore.setJSON(CACHE_BLOB_KEY, {
                  timestamp: now,
                  coins,
                })
                console.log('[💾] Cached CoinCap data in blob storage')
              } catch (e) {
                console.warn('[⚠️] Failed to write cache blob:', e)
              }
            }
          }
          console.log('[✅] Successfully fetched from CoinCap')
          return successResponse(coins, 'coincap')
        } catch (error) {
          console.warn('[⚠️] CoinCap failed — Falling back to CryptoRates')
          const fallbackRes = await fetch('https://cryptorates.ai/v1/coins/100')
          const fallbackData = await fallbackRes.json()
          const coins = mapCryptoRates(fallbackData)

          // If CoinCap fails, fallback data from CryptoRates is fetched and cached
          if (allowCachingFallback) {
            await cacheCryptoRates(coins, blobStore, now)
          }
          return successResponse(coins, 'cryptorates (fallback)')
        }
      } else {
        // If using CryptoRates, then no need to worry about CoinCap Histories or assets
        console.log('[🔄] Using CryptoRates (param or fallback mode)')
        const response = await fetch('https://cryptorates.ai/v1/coins/100')
        const data = await response.json()
        const coins = mapCryptoRates(data)

        // If CoinCap fails, fallback data from CryptoRates is fetched and cached
        if (allowCachingFallback) {
          await cacheCryptoRates(coins, blobStore, now)
        }
        return successResponse(coins, 'cryptorates')
      }
    } catch (error) {
      console.error('[❌] Handler crashed:', error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }
  // Get 1 Day history from cache
  try {
    if (!blobStore) throw new Error('Netlify Blobs unavailable')

    // Read 1-day history blob as JSON
    const cachedHistory = await blobStore.get(CACHE_HISTORY_BLOB_KEY, {
      type: 'json',
    })
    if (
      !cachedHistory ||
      !cachedHistory.history ||
      !cachedHistory.history[coinId]
    ) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `No 1-day history found for ${coinId}` }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: cachedHistory.history[coinId] }),
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

// Utility function, returns JSON response
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
