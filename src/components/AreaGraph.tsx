// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react'
import { generateTimestamps } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Chart({ transformedPriceUsd }: CoinChartProps) {
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
  }, [newDataSet])

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
          <AreaChart
            data={coinChartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="color" x1={0} y1={0} x2={0} y2={1}>
                <stop offset={'25%'} stopColor={colorChart} stopOpacity={0.4} />
                <stop
                  offset={'75%'}
                  stopColor={colorChart}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={colorChart}
              fill="url(#color)"
              format={'number'}
            />
            <YAxis hide domain={[minValue, maxValue]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
