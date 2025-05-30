import { useEffect } from 'react'
import { useGraphContext } from '../context/GraphContext'
import { slowFetchHistory, fetchAllAssets } from '../lib/dataCollector'
import { Coins } from '../types/CoinTypes'

export function HistoryLoader() {
  const { updateHistoryData } = useGraphContext()

  useEffect(() => {
    async function load() {
      try {
        const coins: Coins[] = await fetchAllAssets()
        await slowFetchHistory(coins, updateHistoryData)
        // saveHistoryToFile(data)
      } catch (error) {
        console.error('Failed to load coin history', error)
      }
    }

    load()
  }, [updateHistoryData])

  return null
}
