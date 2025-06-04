import React, { useEffect, useState } from 'react'
import {
  CoinChartProps,
  CoinHistoryData,
  RawHistoryItem,
} from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

// Helper function (unchanged)
function resolveCoinId(
  symbol: string,
  name: string,
  jsonHistory: Record<string, any>
): string | null {
  const symbolLc = symbol.toLowerCase()
  const nameLc = name.toLowerCase()
  const firstWord = nameLc.split(' ')[0]

  for (const id in jsonHistory) {
    if (
      id === symbolLc ||
      id === nameLc.replace(/\s+/g, '-') ||
      id.includes(symbolLc) ||
      id.includes(firstWord)
    ) {
      return id
    }
  }

  return null
}

const HistoryAreaGraph = ({ name, rank, symbol }: CoinChartProps) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [lastValue, setLastValue] = useState<number | null>(null)
  const [history, setHistory] = useState<
    {
      symbol: string
      time: string
      value: number
      rank: number
    }[]
  >([])

  // Safely compute colorChart only if we have enough data
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
    async function fetchAndLoadHistory() {
      try {
        const response = await fetch('/coin_history.json') // correct path in public root
        if (!response.ok) throw new Error('Failed to load history JSON')
        const rawHistory: RawHistoryItem[] = await response.json()

        const jsonHistory: CoinHistoryData = rawHistory.reduce((acc, item) => {
          acc[item.id.toLowerCase()] = item.entries
          return acc
        }, {} as CoinHistoryData)

        const resolvedId = resolveCoinId(symbol, name, jsonHistory)
        if (!resolvedId) {
          console.warn(`No matching history for ${symbol} (${name})`)
          setHistory([])
          setIsDataLoaded(true)
          return
        }

        const coinData = jsonHistory[resolvedId]
        if (!coinData || !Array.isArray(coinData)) {
          setHistory([])
          setIsDataLoaded(true)
          return
        }

        // First 10 entries: set immediately
        const first10 = coinData.slice(0, 10).map((entry) => ({
          symbol,
          time: `${entry.time}`,
          value: Number(entry.priceUsd),
          rank,
        }))
        setHistory(first10)
        setIsDataLoaded(true)

        // Then append the rest asynchronously, so UI updates quickly
        if (coinData.length > 10) {
          setTimeout(() => {
            const rest = coinData.slice(10).map((entry) => ({
              symbol,
              time: `${entry.time}`,
              value: Number(entry.priceUsd),
              rank,
            }))
            setHistory((prev) => [...prev, ...rest])
          }, 50) // delay 50ms to yield rendering first batch
        }
      } catch (error) {
        console.error(error)
        setIsDataLoaded(true)
      }
    }

    fetchAndLoadHistory()
  }, [symbol, name, rank])

  useEffect(() => {
    findMinPrice(history)
    findMaxPrice(history)
  }, [history])

  return (
    <ResponsiveContainer width="100%" height={70}>
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
