import React from 'react'
import { CoinChartProps } from '../types/CoinTypes'
import { YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useDatasetContext } from '../context/DatasetContext'

const RealTimeAreaGraph = ({
  rank,
  symbol,
  transformedPriceUsd,
}: CoinChartProps) => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [minValue, setMinValue] = React.useState<number>(0)
  const [maxValue, setMaxValue] = React.useState<number>(0)
  const [openingValue, setOpeningValue] = React.useState<number>(0)
  const [closingValue, setClosingValue] = React.useState<number>(0)
  const [minMaxEtcLoaded, setMinMaxEtcLoaded] = React.useState(false)
  const [sessionDataLoaded, setSessionDataLoaded] = React.useState(false)
  const colorChart = openingValue > closingValue ? '#EA3943' : '#16C784'
  const numOfDataPoints = 672
  const datasetContext = useDatasetContext()

  function loadMinMaxEtc(dataset: number[]) {
    setMinValue(Math.min(...dataset))
    setMaxValue(Math.max(...dataset))
    setOpeningValue(dataset[0])
    setClosingValue(dataset.at(-1)!)
  }

  function findMinMaxEtc() {
    if (datasetContext.dataset.at(-1) !== transformedPriceUsd) {
      if (datasetContext.dataset.length === 0) {
        setMinValue(transformedPriceUsd)
        setMaxValue(transformedPriceUsd)
      } else if (transformedPriceUsd < minValue) {
        setMinValue(transformedPriceUsd)
      } else if (transformedPriceUsd > maxValue) {
        setMaxValue(transformedPriceUsd)
      }
    }
  }

  function makeDataArray() {
    if (datasetContext.dataset.at(-1) !== transformedPriceUsd) {
      const updatedDataset = [...datasetContext.dataset]
      findMinMaxEtc()
      // Add Data
      if (updatedDataset.length === 0) {
        updatedDataset.push(transformedPriceUsd)
        updatedDataset.push(transformedPriceUsd)
      } else if (
        updatedDataset.length > 1 &&
        updatedDataset.length < numOfDataPoints
      ) {
        updatedDataset.push(transformedPriceUsd)
      } else if (updatedDataset.length === numOfDataPoints) {
        updatedDataset.shift()
        updatedDataset.push(transformedPriceUsd)
      }
      // Update the state and sessionStorage with the new data
      datasetContext.setDataset(updatedDataset)
      saveToSessionStorage(updatedDataset, symbol)
      // Set opening and closing values
      setOpeningValue(updatedDataset[0])
      setClosingValue(updatedDataset.at(-1)!)
    }
  }

  const coinChartData = React.useMemo(() => {
    return datasetContext.dataset.map((price) => {
      return {
        symbol: symbol,
        value: price,
      }
    })
  }, [datasetContext.dataset])

  function saveToSessionStorage(dataArray: number[], symbol: string) {
    try {
      const key = `${rank}_${symbol}`
      sessionStorage.setItem(key, JSON.stringify(dataArray))
    } catch (error) {
      console.error('Error saving data to sessionStorage:', error)
    }
  }

  function loadSessionStorage() {
    const key = `${rank}_${symbol}`
    const storedData = sessionStorage.getItem(key)
    if (storedData) {
      const storedDataset = JSON.parse(storedData) as number[]
      datasetContext.setDataset(storedDataset)
      loadMinMaxEtc(storedDataset)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    if (sessionDataLoaded) {
      loadSessionStorage()
      setMinMaxEtcLoaded(true)
    } else {
      setTimeout(() => {
        loadSessionStorage()
        setMinMaxEtcLoaded(true)
      }, 1000)
    }
  }, [sessionDataLoaded])

  React.useEffect(() => {
    loadSessionStorage()
    setSessionDataLoaded(true)
  }, [])

  React.useEffect(() => {
    let isMounted = true
    async function loadMinMaxEtcOnce() {
      if (sessionDataLoaded) {
        loadMinMaxEtc(datasetContext.dataset)
        setMinMaxEtcLoaded(true)
      } else {
        setTimeout(loadMinMaxEtcOnce, 1000)
      }
    }
    if (!minMaxEtcLoaded && isMounted) {
      loadMinMaxEtcOnce()
    }
    return () => {
      isMounted = false
    }
  }, [sessionDataLoaded, minMaxEtcLoaded])

  React.useEffect(() => {
    if (!loading && sessionDataLoaded) {
      makeDataArray()
    }
  }, [transformedPriceUsd])

  return (
    <ResponsiveContainer width="100%" height={70}>
      <AreaChart
        data={coinChartData}
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
        <YAxis hide domain={[minValue, maxValue]} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default RealTimeAreaGraph
