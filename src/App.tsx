import React from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
import { holdData } from './lib/functions'
// Context
import { GraphContextProvider } from './context/GraphContext'

export function App() {
  const [coins, setCoins] = React.useState<Coins[]>([])

  function loadAllCoins() {
    async function fetchCoins() {
      try {
        const response = await fetch('https://api.coincap.io/v2/assets')
        if (response.ok) {
          const { data } = await response.json()
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

  React.useEffect(() => {
    loadAllCoins()
    const interval = setInterval(() => {
      loadAllCoins()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <GraphContextProvider>
      <table className="crypto-list">
        <caption className="table-heading">
          <h2>CryptoCoin</h2>
          <div className="sub-heading">A CryptoCurrency Tracker</div>
        </caption>
        <thead>
          <HeadingLabels />
        </thead>
        <tbody>
          {coins.map((cryptoItem, _index) => (
            <CryptoCurrency
              key={cryptoItem.rank}
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
    </GraphContextProvider>
  )
}
