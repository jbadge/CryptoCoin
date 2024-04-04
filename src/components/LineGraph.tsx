// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react'
import { generateTimestamps } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Chart({ transformedPriceUsd }: CoinChartProps) {
  const [newDataSet, setNewDataSet] = useState<number[]>([])
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)
  const [colorChart, setColorChart] = useState('')
  const [arrayIsFull, setArrayIsFull] = useState(0)

  function makeDataArray() {
    if (transformedPriceUsd < newDataSet.at(-1)!) {
      setMinValue(transformedPriceUsd)
    } else if (transformedPriceUsd > newDataSet.at(-1)!) {
      setMaxValue(transformedPriceUsd)
    }
    const tempArray = [...newDataSet]
    if (newDataSet.length < 144) {
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    } else if (newDataSet.length >= 144) {
      tempArray.shift()
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
      setArrayIsFull(1)
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
  }, [newDataSet])

  useEffect(() => {
    if (arrayIsFull === 0) {
      console.log('Array is not full, running every 10 seconds')
      const interval = setInterval(() => {
        makeDataArray()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [newDataSet])

  useEffect(() => {
    if (arrayIsFull === 1) {
      console.log('Array is full, running every 10 minutes')
      const interval = setInterval(() => {
        makeDataArray()
      }, 600000)
      return () => clearInterval(interval)
    }
  }, [arrayIsFull])

  useEffect(() => {
    makeDataArray()
  }, [])

  return (
    <div className="item-container graph-info">
      <div className="graph">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart
            data={coinChartData}
            margin={{ top: 10, right: 5, left: 5, bottom: 10 }}
          >
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
