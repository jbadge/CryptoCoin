import React, { useEffect, useMemo, useState } from 'react'
import { generateTimestamp } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Chart({
  rank,
  symbol,
  transformedPriceUsd,
}: CoinChartProps) {
  const [dataset, setDataset] = useState<number[]>([])
  // const [arrayIsFull, setArrayIsFull] = useState(0)
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)
  const [count, setCount] = useState(0)
  const colorChart = dataset[0] > dataset.at(-1)! ? '#EA3943' : '#16C784'
  const tempDataset = [...dataset]
  const numOfDataPoints = 144 //672

  function makeDataArray() {
    // Set min and max values
    if (dataset.length === 0 || transformedPriceUsd < minValue) {
      setMinValue(transformedPriceUsd)
    } else if (transformedPriceUsd > maxValue) {
      setMaxValue(transformedPriceUsd)
    }

    // Add Data
    if (dataset.length === 0) {
      tempDataset.push(transformedPriceUsd)
      tempDataset.push(transformedPriceUsd)
    } else if (dataset.length >= 1 && dataset.length < numOfDataPoints) {
      tempDataset.push(transformedPriceUsd)
    } else if (dataset.length === numOfDataPoints) {
      tempDataset.shift()
      tempDataset.push(transformedPriceUsd)
      // setArrayIsFull(1)
    }
    setDataset([...tempDataset])
  }

  const coinChartData = useMemo(() => {
    return dataset.map((price) => {
      return {
        rank: rank,
        symbol: symbol,
        hour: generateTimestamp().slice(0, 8),
        value: price,
      }
    })
  }, [dataset])

  // Counter
  useEffect(() => {
    if (symbol === 'BTC') {
      console.log(`The count is ${count}`)
    }
  }, [count])

  useEffect(() => {
    // if (arrayIsFull === 0) {
    makeDataArray()
    setCount((currCount) => currCount + 1)
    console.log(coinChartData)
    // }
    // else if (arrayIsFull === 1) {
    //   console.log('Array is full, running every 10 minutes')
    //   const interval = setInterval(() => {
    //     makeDataArray()
    //   }, 6000)
    //   return () => clearInterval(interval)
    // }
  }, [transformedPriceUsd])

  // useEffect(() => {
  //   if (arrayIsFull === 1) {
  //     console.log('Array is full, running every 10 minutes')
  //     const interval = setInterval(() => {
  //       makeDataArray()
  //     }, 6000)
  //     return () => clearInterval(interval)
  //   }
  // }, [arrayIsFull])

  return (
    <div className="item-container graph-info">
      <div className="graph">
        <ResponsiveContainer
          width="100%"
          // height={60}
          height={70}
        >
          <AreaChart
            data={coinChartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
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
              fill={`url(#color${colorChart})`}
              format={'number'}
            />
            <YAxis hide domain={[minValue, maxValue]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
