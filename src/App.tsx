import React from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
import { holdData } from './lib/functions'
// Context
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'

export function App() {
  const [coins, setCoins] = React.useState<Coins[]>([])

  function generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-')
  }

  function loadAllCoins() {
    async function fetchCoins() {
      try {
        const response = await fetch('/api/coinList')

        if (response.ok) {
          const json = await response.json()
          const tempCoins = json.data.map((coin: any) => ({
            ...coin,
            id: generateId(coin.name),
          }))

          // const tempCoins = [...json.data]
          holdData(tempCoins)
          setCoins(tempCoins)
        }
      } catch (error) {
        console.error('Error fetching data from API:', error)
      }
    }
    fetchCoins()
  }

  React.useEffect(() => {
    loadAllCoins()
    const interval = setInterval(() => {
      loadAllCoins()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  if (!coins || coins.length === 0) {
    return <p>Loading...</p>
  }

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
            {coins.map(
              (cryptoItem, _index) => (
                // cryptoItem.id && cryptoItem.symbol && cryptoItem.rank ? (
                <CryptoCurrency
                  key={cryptoItem.rank}
                  id={cryptoItem.id}
                  rank={cryptoItem.rank}
                  name={cryptoItem.name}
                  symbol={cryptoItem.symbol}
                  price={cryptoItem.price}
                  transformedPriceUsd={cryptoItem.transformedPriceUsd}
                  change24h={cryptoItem.change24h}
                  transformed24Hr={cryptoItem.transformed24Hr}
                  marketcap={cryptoItem.marketcap}
                  volume24h={cryptoItem.volume24h}
                  explorer={null}
                />
              )
              // ) : null
            )}
          </tbody>
        </table>
      </DatasetContextProvider>
    </GraphContextProvider>
  )
}
