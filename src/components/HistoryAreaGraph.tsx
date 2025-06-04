import React, { useEffect, useState } from 'react'
import {
  CoinChartProps,
  CoinHistoryData,
  RawHistoryItem,
} from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
import rawHistoryJson from '../data/coin_history.json'

const HistoryAreaGraph = ({ name, rank, symbol }: CoinChartProps) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [firstValue, setFirstValue] = useState(0)
  const [lastValue, setLastValue] = useState(0)
  const [history, setHistory] = useState<
    {
      symbol: string
      time: string
      value: number
      rank: number
    }[]
  >([])

  const colorChart =
    history[0]?.value > history.at(-1)?.value! ? '#e84f50' : '#1c9860'

  function findMinPrice(arrayOfObjects: any): number | undefined {
    if (arrayOfObjects.length === 0) {
      return undefined
    }
    setFirstValue(arrayOfObjects[0].value)
  }

  function findMaxPrice(arrayOfObjects: any): number | undefined {
    if (arrayOfObjects.length === 0) {
      return undefined
    }
    setLastValue(arrayOfObjects.at(-1).value)
  }

  const rawHistory = rawHistoryJson as RawHistoryItem[]

  function resolveCoinId(symbol: string, name: string): string | null {
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

  const jsonHistory: CoinHistoryData = rawHistory.reduce((acc, item) => {
    acc[item.id.toLowerCase()] = item.entries
    return acc
  }, {} as CoinHistoryData)

  useEffect(() => {
    const resolvedId = resolveCoinId(symbol, name)
    // console.log('resolveId: ', resolvedId)

    if (!resolvedId) {
      console.warn(`No matching history for ${symbol} (${name})`)
      return
    }

    const coinData = jsonHistory[resolvedId]
    // console.log('coinData: ', coinData)

    if (!coinData || !Array.isArray(coinData)) return

    const formatted = coinData.map((entry) => ({
      symbol,
      time: `${entry.time}`,
      value: Number(entry.priceUsd),
      rank,
    }))
    // console.log('formatted: ', formatted)

    setHistory(formatted)
    setIsDataLoaded(true)
  }, [symbol, name, rank])

  useEffect(() => {
    findMinPrice(history)
    findMaxPrice(history)
  }, [history])

  return (
    <ResponsiveContainer width="100%" height={70}>
      {isDataLoaded && history.length > 0 ? (
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
