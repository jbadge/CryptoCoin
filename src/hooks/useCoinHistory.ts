import { useEffect, useState } from 'react'
import { Interval } from '../types/CoinTypes'
import coinAssets from '../data/index.json'
import { calculateStartTime, debugMode, getFileId, resolveCoinId } from '../lib'

const API_KEY =
  import.meta.env.VITE_API_KEY || import.meta.env.REACT_APP_API_KEY

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
      let fetchUrl = ''
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
        const fileId = getFileId(symbol, resolvedId)
        const numericRank = Number(rank)

        if (resolvedId === 'bitcoi') {
          if (debugMode) {
            console.log('rank:', rank, 'name:', name)
            console.log(typeof rank)
          }
          const currentTime = Date.now()
          const count = 28 // or adjust as needed
          const startTime = calculateStartTime(interval, count)

          response = await fetch(
            `https://rest.coincap.io/v3/assets/bitcoin/history?interval=${interval}&start=${startTime}&end=${currentTime}`,
            {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
            }
          )
        } else if (interval && numericRank >= 1 && numericRank <= 13) {
          if (debugMode) {
            if (symbol === 'BNB' || symbol === 'bnb') {
              console.log(
                `Symbol is ${symbol} and ID is ${resolvedId} and rank is ${rank}`
              )
              console.log(`/data/${interval}/${fileId}.json`)
            }
          }
          fetchUrl = `/data/${interval}/${fileId}.json`
          response = await fetch(fetchUrl)
        } else {
          fetchUrl = `/data/${fileId}.json`
          response = await fetch(fetchUrl)
        }

        if (response.ok) {
          const { data } = await response.json()
          const mapData = data.flatMap((coin: any) => [
            {
              symbol,
              time: `${coin.time}`,
              value: Number(coin.priceUsd),
              rank,
            },
          ])
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
        console.log(fetchUrl)
        onError()
      }
    }

    fetchAndLoadHistory()
    return () => {
      isMounted = false
    }
  }, [symbol, rank, name, interval])

  return { history, isDataLoaded }
}
