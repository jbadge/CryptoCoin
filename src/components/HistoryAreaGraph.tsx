import React, { useEffect, useState } from 'react'
import { holdData } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts'

export default function Chart({ id, rank, symbol }: CoinChartProps) {
  const [history, setHistory] = useState<
    {
      rank: string
      symbol: string
      time: string
      value: number
    }[]
  >([])
  const [firstValue, setFirstValue] = useState(0)
  const [lastValue, setLastValue] = useState(0)
  const colorChart =
    history[0]?.value > history.at(-1)?.value! ? '#EA3943' : '#16C784'

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

  // 7 day Area Chart
  function loadChartData() {
    async function fetchChart() {
      const response = await fetch(
        `https://api.coincap.io/v2/assets/${id}/history?interval=m15`
      )
      if (response.ok) {
        const { data } = await response.json()
        let tempData = [...data]
        holdData(tempData)
        const mapData = tempData.flatMap((coin) => [
          {
            rank: rank,
            symbol: symbol,
            time: `${coin.time}`,
            value: Number(coin.transformedPriceUsd),
          },
        ])
        setHistory(mapData)
      }
    }
    fetchChart()
  }

  useEffect(() => {
    loadChartData()
  }, [])

  useEffect(() => {
    if (
      // symbol === 'BTC' &&
      firstValue !== 0 &&
      lastValue !== 0
    ) {
      // console.log(minValue)
      // console.log(maxValue)
      // console.log(history)
      // if (firstValue > lastValue) {
      //   console.log(`Rank: ${rank}, ${symbol} is going down`)
      // } else if (lastValue > firstValue) {
      //   console.log(`Rank: ${rank}, ${symbol} is going up`)
      // }
    }
  }, [firstValue, lastValue])

  useEffect(() => {
    // console.log(history)
    findMinPrice(history)
    findMaxPrice(history)
  }, [history])

  return (
    <ResponsiveContainer width="100%" height={70}>
      <AreaChart
        data={history}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id={`color${colorChart}`} x1={0} y1={0} x2={0} y2={1}>
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
        <Tooltip contentStyle={{ borderRadius: 20 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
