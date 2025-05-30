import React, { useEffect, useState } from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
// Context
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'
import { HistoryLoader } from './components/HistoryLoader'
import { fetchAllAssets } from './lib/dataCollector'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])

  async function loadCoins() {
    try {
      await fetchAllAssets(setCoins)
    } catch (error) {
      console.error('Error fetching data from API:', error)
    }
  }

  useEffect(() => {
    loadCoins()
    const interval = setInterval(() => {
      loadCoins()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <GraphContextProvider>
      <DatasetContextProvider>
        <HistoryLoader />
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
                key={cryptoItem.id}
                id={cryptoItem.id}
                rank={cryptoItem.rank}
                name={cryptoItem.name}
                symbol={cryptoItem.symbol}
                priceUsd={cryptoItem.priceUsd}
                transformedPriceUsd={cryptoItem.transformedPriceUsd}
                changePercent24Hr={cryptoItem.changePercent24Hr}
                transformed24Hr={cryptoItem.transformed24Hr}
                marketCapUsd={cryptoItem.marketCapUsd}
                volumeUsd24Hr={cryptoItem.volumeUsd24Hr}
                explorer={null}
              />
            ))}
          </tbody>
        </table>
      </DatasetContextProvider>
    </GraphContextProvider>
  )
}
