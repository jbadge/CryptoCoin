// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react'
import { generateTimestamp } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, LineChart, Line, XAxis } from 'recharts'

export default function Chart({
  rank,
  symbol,
  transformedPriceUsd,
}: CoinChartProps) {
  const [newDataSet, setNewDataSet] = useState<number[]>([])
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)
  const [count, setCount] = useState(0)
  const tempDataSet = [...newDataSet]

  function makeDataArray() {
    // Set min and max values
    if (newDataSet.length === 0 || transformedPriceUsd < minValue) {
      setMinValue(transformedPriceUsd)
    } else if (transformedPriceUsd > maxValue) {
      setMaxValue(transformedPriceUsd)
    }

    // Add Data
    if (newDataSet.length === 0) {
      tempDataSet.push(transformedPriceUsd)
      tempDataSet.push(transformedPriceUsd)
    } else if (newDataSet.length >= 1 && newDataSet.length < 144) {
      tempDataSet.push(transformedPriceUsd)
    } else if (newDataSet.length === 144) {
      tempDataSet.shift()
      tempDataSet.push(transformedPriceUsd)
    }
    setNewDataSet([...tempDataSet])
  }

  const coinChartData = useMemo(() => {
    return newDataSet.map((price) => {
      return {
        rank: rank,
        symbol: symbol,
        hour: generateTimestamp().slice(0, 8),
        value: price,
      }
    })
  }, [newDataSet])

  // Counter
  useEffect(() => {
    if (symbol === 'BTC') {
      console.log(`The count is ${count}`)
    }
  }, [count])

  useEffect(() => {
    makeDataArray()
    setCount((currCount) => currCount + 1)
    console.log(coinChartData)
  }, [transformedPriceUsd])

  return (
    <div className="item-container graph-info">
      <div className="graph">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart
            data={[...coinChartData]}
            margin={{ top: 10, right: 5, left: 5, bottom: 10 }}
          >
            <XAxis hide tick={false} axisLine={false} tickLine={false} />
            <YAxis hide domain={[minValue, maxValue]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={
                newDataSet[0] > newDataSet.at(-1)! ? '#EA3943' : '#16C784'
              }
              fill="url(#color)"
              format={'number'}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
