// @ts-ignore
import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { CoinChartProps } from '../types/CoinTypes'

export default function SparkLine({
  transformedPriceUsd,
  sparkline,
}: CoinChartProps) {
  const [newDataSet, setNewDataSet] = useState<number[]>([])
  console.log(sparkline)
  function makeDataArray() {
    const tempArray = [...newDataSet]
    // for (let i = 0; i < data.length; i++) {
    if (newDataSet.length < 1000) {
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    } else if (newDataSet.length >= 1000) {
      tempArray.shift()
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    }
  }

  // Does this need a useEffect? Winds up running 100 times on load
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
    <Stack direction="row" sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <SparkLineChart
          data={newDataSet}
          height={60}
          showTooltip
          showHighlight
        />
      </Box>
    </Stack>
  )
}
