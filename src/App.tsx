import React, { useEffect, useState } from 'react'
import { HeadingLabels } from './components/HeadingLabels'
import { Coins, CryptoCurrency } from './components/CryptoCurrency'
import Decimal from 'decimal.js'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])

  function loadAllCoins() {
    async function fetchCoins() {
      const response = await fetch('https://api.coincap.io/v2/assets')
      if (response.ok) {
        const { data } = await response.json()
        const tempCoins = [...data]
        holdData(tempCoins)
        setCoins(tempCoins)
      }
    }
    fetchCoins()
  }

  function holdData(data: Coins[]) {
    for (let i = 0; i < data.length; i++) {
      let tempDecimal = new Decimal(data[i].priceUsd)
      // let lastDigits = tempDecimal.toString().slice(-16)
      let lastDigits = tempDecimal.toString()
      let tempPriceUsd = parseFloat(lastDigits)
      data[i].transformedPriceUsd = tempPriceUsd
    }
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
              {coins.map((cryptoItem, index, data) => (
                <CryptoCurrency
                  key={cryptoItem.rank}
                  id={cryptoItem.id}
                  rank={cryptoItem.rank}
                  name={cryptoItem.name}
                  symbol={cryptoItem.symbol}
                  priceUsd={cryptoItem.priceUsd}
                  transformedPriceUsd={cryptoItem.transformedPriceUsd}
                  changePercent24Hr={cryptoItem.changePercent24Hr}
                  marketCapUsd={cryptoItem.marketCapUsd}
                  volumeUsd24Hr={cryptoItem.volumeUsd24Hr}
                  data={data}
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
