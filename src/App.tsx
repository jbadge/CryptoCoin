import React, { useEffect, useState } from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
import { holdData } from './lib/functions'
// Context
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])

  function loadAllCoins() {
    async function fetchCoins() {
      try {
        const response = await fetch('/.netlify/functions/getCoins')

        if (response.ok) {
          const data = await response.json()
          const tempCoins = [...data]
          holdData(tempCoins)
          setCoins(tempCoins)
        }
      } catch (error) {
        console.error('Error fetching data from API:', error)
      }
    }
    fetchCoins()
  }

  useEffect(() => {
    loadAllCoins()
    const interval = setInterval(() => {
      loadAllCoins()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  window.addEventListener('load', () => {
    const table = document.querySelector('table')
    table?.classList.add('loaded')
  })

  return (
    <GraphContextProvider>
      <DatasetContextProvider>
        <table className="crypto-list">
          <caption className="table-heading">
            <h1>CryptoCoin</h1>
            <div className="sub-heading">A CryptoCurrency Tracker</div>
          </caption>
          <thead>
            <HeadingLabels />
          </thead>
          <tbody>
            {coins.map((cryptoItem, _index) => (
              <CryptoCurrency
                key={cryptoItem.rank}
                rank={cryptoItem.rank}
                name={cryptoItem.name}
                symbol={cryptoItem.symbol}
                price={cryptoItem.price}
                transformedPriceUsd={cryptoItem.transformedPriceUsd}
                change24h={cryptoItem.change24h}
                transformed24Hr={cryptoItem.transformed24Hr}
                marketcap={cryptoItem.marketcap}
                volume24h={cryptoItem.volume24h}
              />
            ))}
          </tbody>
        </table>
      </DatasetContextProvider>
    </GraphContextProvider>
  )
}
