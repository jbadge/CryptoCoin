import React, { useEffect, useMemo, useState } from 'react'
import { generateTimestamps } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Chart({
  transformedPriceUsd,
  sparkline,
}: CoinChartProps) {
  const [newDataSet, setNewDataSet] = useState<number[]>([])
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)
  const [colorChart, setColorChart] = useState('')

  function makeDataArray() {
    if (transformedPriceUsd < newDataSet.at(-1)!) {
      setMinValue(transformedPriceUsd)
    } else if (transformedPriceUsd > newDataSet.at(-1)!) {
      setMaxValue(transformedPriceUsd)
    }
    const tempArray = [...newDataSet]
    if (newDataSet.length < 1000) {
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    } else if (newDataSet.length >= 1000) {
      tempArray.shift()
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    }
    setColorChart(
      newDataSet[0] > newDataSet[newDataSet.length - 1] ? '#EA3943' : '#16C784'
    )
  }

  const coinChartData = useMemo(() => {
    return newDataSet.map((price, index) => {
      return {
        hour: generateTimestamps()[index],
        value: price,
      }
    })
  }, [sparkline])

  useEffect(() => {
    const interval = setInterval(() => {
      makeDataArray()
    }, 10000)
    return () => clearInterval(interval)
  }, [newDataSet])

  useEffect(() => {
    makeDataArray()
  }, [])

  return (
    <div className="item-container graph-info">
      <div className="graph">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={coinChartData}>
            <YAxis hide domain={[minValue, maxValue]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colorChart}
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
