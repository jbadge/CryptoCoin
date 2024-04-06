// @ts-nocheck
import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { CoinChartProps } from '../types/CoinTypes'

export default function SparkLine({ transformedPriceUsd }: CoinChartProps) {
  const [newDataSet, setNewDataSet] = useState<number[]>([])
  function makeDataArray() {
    const tempArray = [...newDataSet]
    if (newDataSet.length < 1000) {
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    } else if (newDataSet.length >= 1000) {
      tempArray.shift()
      tempArray.push(transformedPriceUsd)
      setNewDataSet([...tempArray])
    }
  }

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
