import type { Coins } from '../../src/types/CoinTypes'

const API_KEY =
  process.env.API_KEY ||
  process.env.REACT_APP_API_KEY ||
  process.env.VITE_API_KEY

const CACHE_BLOB_KEY = 'cache_coins_data'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SEVEN_DAY_MS = 7 * ONE_DAY_MS
const CACHE_HISTORY_BLOB_KEY = 'cache_history_h6_7d'

export async function handler(event) {
  let blobStore

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

  if (
    event.queryStringParameters?.id &&
    event.queryStringParameters?.interval === 'h6'
  ) {
    const coinId = event.queryStringParameters.id
    try {
      if (blobStore) {
        // Read 7-day h6 history blob as JSON
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
            body: JSON.stringify({
              error: `No 7-day h6 history found for ${coinId}`,
            }),
          }
        }

        // Return cached history
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: cachedHistory.history[coinId] }),
        }
      } else {
        throw new Error('Netlify Blobs unavailable')
      }
    } catch (err) {
      console.error(`[❌] Error serving 7-day h6 history for ${coinId}:`, err)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Failed to get 7-day h6 history for ${coinId}`,
        }),
      }
    }
  }

  try {
    let cachedData: { timestamp: number; coins: Coins[] } | null = null
    try {
      if (blobStore) {
        cachedData = await blobStore.get(CACHE_BLOB_KEY, { type: 'json' })
      } else {
        console.warn('[⚠️] Netlify blobs API not available')
      }
    } catch (e) {
      console.warn('[⚠️] Failed to read cache blob:', e)
    }

    if (!cachedData || !cachedData.coins) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'No cached coins data available to fetch history',
        }),
      }
    }

    const now = Date.now()
    const cacheIsFresh =
      cachedData.timestamp !== undefined &&
      now - cachedData.timestamp < SEVEN_DAY_MS

    if (cacheIsFresh) {
      try {
        // Try to return cached 7-day history if exists & fresh
        const cachedHistory = await blobStore.get(CACHE_HISTORY_BLOB_KEY, {
          type: 'json',
        })
        if (cachedHistory && cachedHistory.history) {
          console.log('[📦] Returning fresh cached 7-day h6 history')
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: cachedHistory.history }),
          }
        }
      } catch (e) {
        console.warn('[⚠️] Failed to read cached 7-day history blob:', e)
      }
    }

    // If we get here, need to fetch fresh history for all coins
    const historyBlob: Record<string, any[]> = {}
    const start = now - SEVEN_DAY_MS

    const historyFetches = cachedData.coins.map(async (coin) => {
      const id = coin.name.toLowerCase().replace(/\s+/g, '-')
      try {
        const res = await fetch(
          `https://rest.coincap.io/v3/assets/${id}/history?interval=h6&start=${start}&end=${now}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        )
        if (res.ok) {
          const json = await res.json()
          // Expecting ~28 entries for 7d at h6 interval
          historyBlob[id] = json.data
        } else {
          console.warn(
            `[⚠️] Failed to fetch history for ${id}, status: ${res.status}`
          )
        }
      } catch (e) {
        console.warn(`⚠️ Failed to fetch history for ${id}:`, e)
      }
    })

    await Promise.all(historyFetches)

    if (blobStore) {
      try {
        await blobStore.setJSON(CACHE_HISTORY_BLOB_KEY, {
          timestamp: now,
          history: historyBlob,
        })
        console.log('[💾] Cached 7-day h6 history for all coins')
      } catch (e) {
        console.warn('[⚠️] Failed to cache 7-day h6 history:', e)
      }
    }

    // Return fresh history blob data
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: historyBlob }),
    }
  } catch (error) {
    console.error('[❌] Handler crashed:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export async function handler(event) {
  let blobStore

  try {
    const { getStore } = await import('@netlify/blobs')
    // blobStore = getStore('default')
    blobStore = getStore({
      name: 'default',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOB_STORE_TOKEN,
    })
    console.log('[ℹ️] Initialized Netlify Blob Store')
  } catch (e) {
    console.warn('[⚠️] Failed to initialize Netlify Blob Store:', e)
  }

  if (
    event.queryStringParameters?.id &&
    event.queryStringParameters?.interval === 'h1'
  ) {
    const coinId = event.queryStringParameters.id
    try {
      if (blobStore) {
        // Read 7-day history blob as JSON
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
          body: JSON.stringify({ data: cachedHistory.history[coinId] }),
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
    let cachedData: { timestamp: number; coins: Coins[] } | null = null
    try {
      if (blobStore) {
        // Read coins cache blob as JSON
        cachedData = await blobStore.get(CACHE_BLOB_KEY, { type: 'json' })
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

      if (blobStore) {
        try {
          // Write fresh data as JSON blob
          await blobStore.setJSON(CACHE_BLOB_KEY, { timestamp: now, coins })
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

      if (blobStore) {
        try {
          const historyBlob: Record<string, any[]> = {}
          const start = now - ONE_DAY_MS

          const historyFetches = coins.map(async (coin) => {
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

          // Write history blob as JSON
          await blobStore.setJSON(CACHE_HISTORY_BLOB_KEY, {
            timestamp: now,
            history: historyBlob,
          })
          console.log('[💾] Cached 1-day history for all coins')
        } catch (e) {
          console.warn('[⚠️] Failed to cache 1-day history:', e)
        }

        try {
          // Write coins cache blob as JSON
          await blobStore.setJSON(CACHE_BLOB_KEY, { timestamp: now, coins })
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

      if (blobStore) {
        try {
          await blobStore.setJSON(CACHE_BLOB_KEY, { timestamp: now, coins })
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
