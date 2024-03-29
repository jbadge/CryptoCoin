import React, { useEffect, useState } from 'react'
import { HeadingLabels } from './components/HeadingLabels'
import { Coins, CryptoCurrency } from './components/CryptoCurrency'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])

  function loadAllCoins() {
    async function fetchCoins() {
      const response = await fetch('https://api.coincap.io/v2/assets')
      if (response.ok) {
        const { data } = await response.json()
        setCoins(data)
      }
    }
    fetchCoins()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadAllCoins()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadAllCoins()
  }, [])

  return (
    <div>
      <main>
        <h1>CryptoTracker</h1>
        <section className="tracker-area">
          <div className="cryptos">
            <ul className="crypto-list">
              <HeadingLabels />
              {coins.map((cryptoItem) => (
                <CryptoCurrency
                  key={cryptoItem.rank}
                  id={cryptoItem.id}
                  rank={cryptoItem.rank}
                  name={cryptoItem.name}
                  symbol={cryptoItem.symbol}
                  priceUsd={cryptoItem.priceUsd}
                  changePercent24Hr={cryptoItem.changePercent24Hr}
                  marketCapUsd={cryptoItem.marketCapUsd}
                  volumeUsd24Hr={cryptoItem.volumeUsd24Hr}
                  explorer={null}
                />
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
