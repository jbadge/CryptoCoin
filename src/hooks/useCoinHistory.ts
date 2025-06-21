import { useEffect, useState } from 'react'
import coinAssets from '../data/index.json'
import { resolveCoinId } from '../lib/coinUtils'
import { Interval } from '../types/CoinTypes'
import { debugMode } from '../lib/config'

export function useCoinHistory(
  symbol: string,
  rank: string,
  name: string,
  interval: Interval,
  onLoad: () => void,
  onError: () => void
) {
  const [history, setHistory] = useState<
    { symbol: string; time: string; value: number; rank: string }[]
  >([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchAndLoadHistory() {
      try {
        const resolvedId = resolveCoinId(symbol, coinAssets)
        if (!resolvedId) {
          if (debugMode) {
            console.warn(`No matching history for ${name}`)
          }
          setHistory([])
          setIsDataLoaded(true)
          return
        }

        let response

        if (interval === 'h1') {
          // Fetch 7-day history from getHistory7d Netlify function
          response = await fetch(
            `/.netlify/functions/getCoins?id=${resolvedId}&interval=h1`
          )
        } else if (interval === 'h6') {
          // Fetch 1-day history from getCoins (which reads from blob)
          response = await fetch(
            `/.netlify/functions/getCoins?id=${resolvedId}&interval=h6`
          )
        } else {
          onError()
          return
        }

        if (response.ok) {
          const { data } = await response.json()
          const mapData = data.map((coin: any) => ({
            symbol,
            time: `${coin.time}`,
            value: Number(coin.priceUsd),
            rank,
          }))
          if (isMounted) {
            setHistory(mapData)
            setIsDataLoaded(true)
            onLoad()
          }
        } else {
          onError()
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        onError()
      }
    }

    fetchAndLoadHistory()

    return () => {
      isMounted = false
    }
  }, [symbol, rank, name, interval, onLoad, onError])

  return { history, isDataLoaded }
}
