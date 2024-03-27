import React, { useEffect, useState } from 'react'

import axios from 'axios'
import {
  CryptoCurrencyProps,
  CryptoCurrency,
} from './components/CryptoCurrency'

//  Need to handle these?
// icon: { src: btc },
// change: 1,
// graph: { src: stock_growth },

export function App() {
  const [cryptoItems, setCryptoItems] = useState<CryptoCurrencyProps[]>([])

  function loadAllCurrencies() {
    async function fetchListOfCurrencies() {
      const response = await axios.get('https://api.coincap.io/v2/assets')

      if (response.status === 200) {
        setCryptoItems(response.data.data)
      }
    }
    fetchListOfCurrencies()
  }

  useEffect(() => {
    loadAllCurrencies()
  }, [])

  return (
    <div>
      <main>
        <h1>CryptoTracker</h1>
        <section className="tracker-area">
          <div className="cryptos">
            <ul className="crypto-list">
              <li className="crypto-container column-headers">
                <div className="col-header">Coin</div>
                <div className="col-header">Price</div>
                <div className="col-header">Prior 7 Days</div>
              </li>
              {cryptoItems.map((cryptoItem) => (
                <CryptoCurrency
                  key={cryptoItem.rank}
                  id={cryptoItem.id}
                  rank={cryptoItem.rank}
                  name={cryptoItem.name}
                  symbol={cryptoItem.symbol}
                  priceUsd={cryptoItem.priceUsd}
                  changePercent24Hr={cryptoItem.changePercent24Hr}
                  marketCapUsd={''}
                  volumeUsd24Hr={''}
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
