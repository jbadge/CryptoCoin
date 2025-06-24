import React, { CSSProperties, useEffect, useState } from 'react'

import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { CoinChartProps, CoinHistoryEntry } from '../types/CoinTypes'
import { resolveCoinId } from '../lib'
import coinAssets from '../data/index.json'
import { useGraphContext } from '../context/GraphContext'

const HistoryAreaGraph = ({
  name,
  rank,
  symbol,
  interval,
  onLoad,
  onError,
  style,
}: CoinChartProps & {
  onLoad: () => void
  onError: () => void
  style: CSSProperties
}) => {
  const { cachedHistory } = useGraphContext()
  const [history, setHistory] = useState<
    { symbol: string; time: string; value: number; rank: string }[]
  >([])
  const [isBlobLoaded, setIsBlobLoaded] = useState(false)

  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [lastValue, setLastValue] = useState<number | null>(null)

  useEffect(() => {
    const resolvedId = resolveCoinId(symbol, coinAssets)

    if (!resolvedId || !cachedHistory) {
      onError()
      return
    }

    const intervalKey = interval === 'h1' ? '1d' : '7d'

    const entries = cachedHistory[intervalKey]?.[resolvedId] || []

    if (entries.length === 0) {
      onError()
      return
    }

    const mapped = entries.map((coin: CoinHistoryEntry) => ({
      symbol,
      time: `${coin.time}`,
      value: Number(coin.price),
      rank,
    }))
    setHistory(mapped)
    setIsBlobLoaded(true)
    onLoad()
  }, [symbol, rank, name, interval, onLoad, onError, cachedHistory])

  useEffect(() => {
    if (history.length === 0) {
      setFirstValue(null)
      setLastValue(null)
    } else {
      setFirstValue(history[0].value)
      setLastValue(history[history.length - 1].value)
    }
  }, [history])

  const colorChart =
    history.length > 1 && history[0].value > history[history.length - 1].value
      ? '#e84f50'
      : '#1c9860'

  return (
    <ResponsiveContainer width="100%" height={70} style={style}>
      {isBlobLoaded &&
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
              <stop offset="25%" stopColor={colorChart} stopOpacity={0.4} />
              <stop offset="75%" stopColor={colorChart} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorChart}
            fill={`url(#color${colorChart})`}
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
