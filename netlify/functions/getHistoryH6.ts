import type { HistoryPoint } from '../../src/types/CoinTypes'
import { getStore } from '@netlify/blobs'

const API_KEY =
  process.env.API_KEY ||
  process.env.REACT_APP_API_KEY ||
  process.env.VITE_API_KEY

const CACHE_H6_KEY = 'history_h6_data'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Initialize blob store once
let blobStore

try {
  blobStore = getStore('default')
  console.log('[ℹ️] Initialized Netlify Blob Store in getHistoryh6')
} catch (e) {
  console.warn(
    '[⚠️] Failed to initialize Netlify Blob Store in getHistoryh6:',
    e
  )
}

function getStartEndTimestamps(): { start: number; end: number } {
  const end = Date.now()
  const start = end - 7 * 24 * 60 * 60 * 1000
  return { start, end }
}

export async function handler() {
  try {
    let cached: { timestamp: number; history: HistoryPoint[] } | null = null

    if (blobStore) {
      const blobText = await blobStore.getText(CACHE_H6_KEY)
      cached = blobText ? JSON.parse(blobText) : null
    }

    const now = Date.now()
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log('[📦] Using cached h6 data')
      return {
        statusCode: 200,
        body: JSON.stringify({ data: cached.history, source: 'cache' }),
      }
    }

    // Fetch from CoinCap
    console.log('[🔄] Fetching 7-day history from CoinCap...')
    const { start, end } = getStartEndTimestamps()
    const url = `https://api.coincap.io/v2/assets/bitcoin/history?interval=h6&start=${start}&end=${end}`

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`CoinCap H6 error: ${res.status} — ${errText}`)
    }

    const { data } = await res.json()
    const history: HistoryPoint[] = data.map((point) => ({
      time: Number(point.time),
      priceUsd: Number(point.priceUsd),
    }))

    if (blobStore) {
      await blobStore.putText(
        CACHE_H6_KEY,
        JSON.stringify({ timestamp: now, history })
      )
      console.log('[💾] Cached h6 history data in blob store')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: history, source: 'coincap' }),
    }
  } catch (err) {
    console.error('[❌] getHistoryH6 failed:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load 7-day history' }),
    }
  }
}
