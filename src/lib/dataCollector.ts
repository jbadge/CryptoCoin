import { Coins } from '../types/CoinTypes'
import { holdData } from './functions'
type DataCallback = (_id: string, _data: any[]) => void

// let apiKey = process.env.REACT_APP_API_KEY
let collectedData: Record<string, any[]> = {}

export function resetCollector() {
  collectedData = {}
}

export function addEntryForId(id: string, entries: any[]) {
  if (collectedData[id]) {
    return
  }

  collectedData[id] = entries
}

export async function fetchAllAssets(
  setCoins?: (_coins: Coins[]) => void
): Promise<Coins[]> {
  // const limit = 2341
  // let offset = 0
  const batchSize = 20
  const pauseMs = 100 //5000
  let offset = 0
  let moreData = true
  const allAssets: any[] = []

  while (moreData) {
    const response = await fetch(
      `/.netlify/functions/coinList?limit=${batchSize}&offset=${offset}`
    )
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const { data } = await response.json()

    if (!data || data.length === 0) break

    holdData(data)
    allAssets.push(...data)

    if (setCoins) {
      setCoins([...allAssets])
    }

    if (data.length < batchSize) {
      moreData = false
    } else {
      offset += batchSize
      await new Promise((res) => setTimeout(res, pauseMs))
    }
  }

  return allAssets
}

export async function fetchHistory(id: string) {
  try {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const start = now - 30 * dayMs
    const end = now

    const response = await fetch(
      `https://rest.coincap.io/v3/assets/${id}/history?interval=d1&start=${start}&end=${end}&apiKey=${process.env.API_KEY}`
    )
    if (response.ok) {
      const { data } = await response.json()
      return data
    } else {
      console.warn(`Failed to fetch history for ${id}`)
      return null
    }
  } catch (error) {
    console.error('Error fetching history for', id, error)
    return null
  }
}

export async function slowFetchHistory(
  coins: Coins[],
  updateHistoryData: DataCallback
): Promise<Record<string, any[]>> {
  const collectedData: Record<string, any[]> = {}
  let failCount = 0

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    try {
      const data = await fetchHistory(coin.id)
      if (data) {
        collectedData[coin.id] = data
        updateHistoryData(coin.id, data)
        addEntryForId(coin.id, data)

        failCount = 0
      } else {
        failCount++
      }

      if (failCount >= 10) {
        console.warn('Too many consecutive failures. Aborting.')
        break
      }
    } catch (err) {
      console.error(`Error fetching ${coin.id}`, err)
      failCount++
    }

    await new Promise((r) => setTimeout(r, 500))

    if (i + 1 === 10 || (i + 1 > 10 && (i + 1 - 10) % 20 === 0)) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  return collectedData
}
