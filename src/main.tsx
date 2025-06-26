import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import { App } from './App'
// Context
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'

ReactDOM.render(
  <React.StrictMode>
    <GraphContextProvider>
      <DatasetContextProvider>
        <App />
      </DatasetContextProvider>
    </GraphContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
