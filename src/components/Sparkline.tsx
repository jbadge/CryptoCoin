import React from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'

export default function BasicSparkLineCustomization() {
  return (
    <Stack direction="row" sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <SparkLineChart
          data={[1, 4, 2, 5, 7, 2, 4, 6]}
          xAxis={{
            scaleType: 'time',
            data: [
              new Date(2022, 5, 1),
              new Date(2022, 5, 2),
              new Date(2022, 5, 5),
              new Date(2022, 5, 6),
              new Date(2022, 5, 7),
              new Date(2022, 5, 8),
              new Date(2022, 5, 11),
              new Date(2022, 5, 12),
            ],
            valueFormatter: (value) => value.toISOString().slice(0, 10),
          }}
          height={60}
          showTooltip
          showHighlight
        />
      </Box>
    </Stack>
  )
}
