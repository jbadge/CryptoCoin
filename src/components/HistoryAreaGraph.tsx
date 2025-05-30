import React, { useEffect, useState } from 'react'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

const HistoryAreaGraph = ({ id, rank, symbol }: CoinChartProps) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [firstValue, setFirstValue] = useState(0)
  const [lastValue, setLastValue] = useState(0)
  const [history, setHistory] = useState<
    {
      symbol: string
      time: string
      value: number
      rank: string
    }[]
  >([])

  const colorChart =
    history[0]?.value > history.at(-1)?.value! ? '#e84f50' : '#1c9860'

  useEffect(() => {
    const storedHistory = localStorage.getItem('coinHistory')
    if (!storedHistory) return

    const parsed = JSON.parse(storedHistory)
    const entry = parsed[id]

    if (!entry) return
    const historyArray = Array.isArray(entry.history) ? entry.history : entry

    const formatted = historyArray.map((coin: any) => ({
      symbol,
      time: `${coin.time}`,
      value: Number(coin.transformedPriceUsd ?? coin.priceUsd),
      rank,
    }))

    setHistory(formatted)
    setIsDataLoaded(true)
  }, [id, rank, symbol])

  useEffect(() => {
    if (history.length) {
      setFirstValue(history[0].value)
      setLastValue(history.at(-1)?.value || 0)
    }
  }, [history])

  return (
    <ResponsiveContainer width="100%" height={70}>
      {isDataLoaded ? (
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
        <></>
      )}
    </ResponsiveContainer>
  )
}

export default HistoryAreaGraph
