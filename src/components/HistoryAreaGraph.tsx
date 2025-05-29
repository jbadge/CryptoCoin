import React from 'react'
// import { holdData } from '../lib/functions'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

const HistoryAreaGraph = ({ id, rank, symbol }: CoinChartProps) => {
  const [isDataLoaded, setIsDataLoaded] = React.useState(false)
  const [firstValue, setFirstValue] = React.useState(0)
  const [lastValue, setLastValue] = React.useState(0)
  const [history, setHistory] = React.useState<
    {
      symbol: string
      time: string
      value: number
      rank: string
    }[]
  >([])

  const colorChart =
    history[0]?.value > history.at(-1)?.value! ? '#e84f50' : '#1c9860'

  ////////////////// MAYBE REPLACE WITH COMMENTED OUT CODE BELOW
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

  ////////////MAYBE REPLACE ABOVE WITH THIS?
  //   React.useEffect(() => {
  //   if (history.length > 0) {
  //     setFirstValue(history[0].value)
  //     setLastValue(history.at(-1)?.value || 0)
  //   }
  // }, [history])
  ///////////////////////////////

  React.useEffect(() => {
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

  React.useEffect(() => {
    findMinPrice(history)
    findMaxPrice(history)
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
