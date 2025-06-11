import React, { CSSProperties, useEffect, useState } from 'react'
import { CoinChartProps, Interval } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
import coinAssets from '../test/assets.slim.json'
const API_KEY = import.meta.env.REACT_APP_API_KEY
/////////// Debug
const debugMode = false
const apiCallRef = { current: 0 }

function resolveCoinId(
  symbol: string,
  jsonHistory: Record<string, any>
): string | null {
  const symbolLc = symbol.toLowerCase()

  for (const coin of jsonHistory.data) {
    const coinSymbol = coin.symbol.toLowerCase()

    if (coinSymbol === symbolLc) {
      if (debugMode) {
        if (symbol === 'BNB' || symbol === 'bnb') {
          console.log(
            `Symbol is ${coinSymbol} and ID is ${coin.id} and rank is ${coin.rank}`
          )
        }
      }
      return coin.id
    }
  }
  if (debugMode) {
    console.log(`No matching ID found for ${symbol}`)
  }
  return null
}

const HistoryAreaGraph = ({
  name,
  rank,
  symbol,
  onLoad,
  onError,
  style,
}: CoinChartProps & {
  onLoad: () => void
  onError: () => void
  style: CSSProperties
}) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [lastValue, setLastValue] = useState<number | null>(null)
  const [history, setHistory] = useState<
    {
      symbol: string
      time: string
      value: number
      rank: string
    }[]
  >([])

  const colorChart =
    history.length > 1 && history[0].value > history[history.length - 1].value
      ? '#e84f50'
      : '#1c9860'

  function findMinPrice(arrayOfObjects: any): void {
    if (arrayOfObjects.length === 0) {
      setFirstValue(null)
      return
    }
    setFirstValue(arrayOfObjects[0].value)
  }

  function findMaxPrice(arrayOfObjects: any): void {
    if (arrayOfObjects.length === 0) {
      setLastValue(null)
      return
    }
    setLastValue(arrayOfObjects[arrayOfObjects.length - 1].value)
  }

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
        const interval = 'h1' as Interval

        // RENAMED to Bitcoi on purpose to limit actual API calls for monthly limit
        const numericRank = Number(rank)
        // if (numericRank >= 1 && numericRank <= 13) {
        if (resolvedId === 'bitcoi') {
          if (debugMode) {
            console.log('rank: ', rank, 'name: ', name)
            console.log(typeof rank)
          }
          const currentTime = Date.now()
          const count = 24
          let startTime = 0

          switch (interval) {
            case 'm1':
              startTime = currentTime - count * 1 * 60 * 1000
              break
            case 'm5':
              startTime = currentTime - count * 5 * 60 * 1000
              break
            case 'm15':
              startTime = currentTime - count * 15 * 60 * 1000
              break
            case 'm30':
              startTime = currentTime - count * 30 * 60 * 1000
              break
            case 'h1':
              startTime = currentTime - count * 60 * 60 * 1000
              break
            case 'h2':
              startTime = currentTime - count * 2 * 60 * 60 * 1000
              break
            case 'h6':
              startTime = currentTime - count * 6 * 60 * 60 * 1000
              break
            case 'h12':
              startTime = currentTime - count * 12 * 60 * 60 * 1000
              break
            case 'd1':
              startTime = currentTime - count * 24 * 60 * 60 * 1000
              break
            default:
              if (debugMode) {
                console.warn(`Unknown interval: ${interval}, defaulting to m15`)
              }
              startTime = currentTime - count * 15 * 60 * 1000
              break
          }
          if (debugMode) {
            apiCallRef.current += 1
            console.log(`API Call #${apiCallRef.current}`)
          }

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
              console.log(`/data/${interval}/${resolvedId}.json`)
            }
          }
          fetchUrl = `/data/${interval}/${resolvedId}.json`
          response = await fetch(`/data/${interval}/${resolvedId}.json`)
        } else {
          fetchUrl = `/data/${resolvedId}.json`
          response = await fetch(`/data/${resolvedId}.json`)
        }
        if (response.ok) {
          const { data } = await response.json()
          const mapData = data.flatMap((coin: any) => [
            {
              symbol: symbol,
              time: `${coin.time}`,
              value: Number(coin.priceUsd),
              rank: rank,
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
  }, [name])

  useEffect(() => {
    findMinPrice(history)
    findMaxPrice(history)
  }, [history])

  return (
    <ResponsiveContainer width={200} height={70} style={style}>
      {isDataLoaded &&
      history.length > 0 &&
      firstValue !== null &&
      lastValue !== null ? (
        <AreaChart
          data={history}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient
              id={`color${colorChart}`}
              x1={0}
              y1={0}
              x2={0}
              y2={1}
            >
              <stop offset={'25%'} stopColor={colorChart} stopOpacity={0.4} />
              <stop offset={'75%'} stopColor={colorChart} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorChart}
            fill={`url(#color${colorChart})`}
            format={'number'}
          />
          <YAxis hide domain={[firstValue, lastValue]} />
        </AreaChart>
      ) : (
        <div
          style={{
            height: '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
            fontSize: '14px',
          }}
        >
          No data available
        </div>
      )}
    </ResponsiveContainer>
  )
}

export default HistoryAreaGraph
