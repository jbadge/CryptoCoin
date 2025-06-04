import React, { useEffect, useState } from 'react'
// import { holdData } from '../lib/functions'
import {
  CoinChartProps,
  CoinHistoryData,
  // CoinHistoryEntry,
  RawHistoryItem,
} from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
// import rawHistory from '../data/coin_history.json'
// import rawHistoryJson from '../data/coin_history.json'
import rawHistoryJson from '../data/coin_history.json'
// import { CoinHistoryData } from '../types/CoinTypes'
// import jsonHistory from '../data/coin_history.json'

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

  // try {
  //       // const response = await fetch('/.netlify/functions/getCoins')
  //       // if (response.ok && isMounted) {
  //       if (isMounted) {
  //         const data = jsonHistory
  //         // const data = await response.json()
  //         console.log('HistoryAreaGraph: ', data)
  //         // let tempData = [...data]
  //         let tempData = [...jsonHistory]
  //         holdData(tempData)
  //         const mapData = tempData.flatMap((coin) => [
  //           {
  //             symbol: symbol,
  //             time: `${coin.time}`,
  //             value: Number(coin.transformedPriceUsd),
  //             rank: rank,
  //           },
  //         ])

  // React.useEffect(() => {
  //   let isMounted = true
  //   async function fetchChart() {
  //     try {
  //       const response = await fetch(
  //         `https://rest.coincap.io/v3/assets/${id}/history?interval=m15`
  //       )
  //       if (response.ok && isMounted) {
  //         const { data } = await response.json()
  //         let tempData = [...data]
  //         holdData(tempData)
  //         const mapData = tempData.flatMap((coin) => [
  //           {
  //             symbol: symbol,
  //             time: `${coin.time}`,
  //             value: Number(coin.transformedPriceUsd),
  //             rank: rank,
  //           },
  //         ])
  //         if (isMounted) {
  //           setHistory(mapData)
  //           onLoad()
  //         }
  //       } else {
  //         onError()
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //       onError()
  //     }
  //   }
  //   fetchChart()
  //   return () => {
  //     isMounted = false
  //   }
  // }, [])

  //  useEffect(() => {
  //   let id = '2'
  //   const storedHistory = localStorage.getItem('coinHistory')
  //   if (!storedHistory || !id) return

  //   const parsed = JSON.parse(storedHistory)
  //   const entry = parsed[id]

  //   if (!entry) return
  //   const historyArray = Array.isArray(entry.history) ? entry.history : entry

  //   const formatted = historyArray.map((coin: any) => ({
  //     symbol,
  //     time: `${coin.time}`,
  //     value: Number(coin.transformedPriceUsd ?? coin.priceUsd),
  //     rank,
  //   }))

  //   setHistory(formatted)
  //   setIsDataLoaded(true)
  // }, [id, rank, symbol])

  // React.useEffect(() => {
  //   let isMounted = true
  //   let id = 'bitcoin'
  //   async function fetchChart() {
  //     try {
  //       const response = await fetch(
  //         `https://rest.coincap.io/v3/assets/${id}/history?interval=m15`,
  //         {
  //           headers: {
  //             Authorization:
  //               'Bearer 3919c128fecce8b38bf9567d0989ab160b034e2fe3287ee58fc895a9b522a1c0',
  //             Accept: 'application/json',
  //           },
  //         }
  //       )
  //       console.log(response)

  //       if (response.ok && isMounted) {
  //         const { data } = await response.json()
  //         console.log('DATA: ', data)
  //         2
  //         let tempData = [...data]
  //         holdData(tempData)

  //         const mapData = tempData.map((coin) => ({
  //           symbol: symbol,
  //           time: `${coin.time}`,
  //           value: Number(coin.priceUsd), // Use 'priceUsd' from API response
  //           rank: rank,
  //         }))

  //         if (isMounted) {
  //           setHistory(mapData)
  //           // onLoad();
  //         }
  //       } else {
  //         console.error('Fetch error:', await response.text())
  //         // onError();
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //       // onError();
  //     }
  //   }

  //   fetchChart()

  //   return () => {
  //     isMounted = false
  //   }
  // }, [])

  const rawHistory = rawHistoryJson as RawHistoryItem[]

  //   const jsonHistory = rawHistory.reduce((acc, coin) => {
  //   acc[coin.id] = { data: coin.entries }
  //   return acc
  // }, {} as { [key: string]: { data: typeof rawHistory[0]['entries'] } })

  function resolveCoinId(symbol: string, name: string): string | null {
    const symbolLc = symbol.toLowerCase()
    const nameLc = name.toLowerCase()
    const firstWord = nameLc.split(' ')[0]

    for (const id in jsonHistory) {
      if (
        id === symbolLc ||
        id === nameLc.replace(/\s+/g, '-') || // e.g., "binance coin" => "binance-coin"
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
    // { data: item.entries }
    return acc
    // }, {} as Record<string, { data: CoinHistoryEntry[] }>)
  }, {} as CoinHistoryData)

  // const jsonHistory = rawHistory as CoinHistoryData

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
