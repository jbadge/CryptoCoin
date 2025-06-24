import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import { App } from './App'
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'

ReactDOM.render(
  // <React.StrictMode>
  <GraphContextProvider>
    <DatasetContextProvider>
      <App />
    </DatasetContextProvider>
  </GraphContextProvider>,
  document.getElementById('root')
)
{
  /* </React.StrictMode>, */
}
