import React, { CSSProperties, useEffect, useState } from 'react'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
import coinAssets from '../test/assets.slim.json'
const API_KEY = import.meta.env.VITE_API_KEY

function resolveCoinId(
  name: string,
  jsonHistory: Record<string, any>
): string | null {
  const nameLc = name.toLowerCase()
  const firstWord = nameLc.split(' ')[0]

  for (const coin of jsonHistory.data) {
    const coinId = coin.id.toLowerCase()

    if (coinId === nameLc.replace(/\s+/g, '-') || coinId.includes(firstWord)) {
      return coin.id
    }
  }
  console.log('No matching ID found')
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
      try {
        const resolvedId = resolveCoinId(name, coinAssets)
        if (!resolvedId) {
          console.warn(`No matching history for ${name}`)
          setHistory([])
          setIsDataLoaded(true)
          return
        }

        let response
        if (resolvedId === 'bitcoin') {
          response = await fetch(`
              https://rest.coincap.io/v3/assets/bitcoin/history?interval=m15&apiKey=${API_KEY}&limit=30`)
        } else {
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
