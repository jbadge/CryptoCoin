import React, { useEffect, useRef, useState } from 'react'
import green_triangle from '../images/green_triangle.png'
import red_triangle from '../images/red_triangle.png'
import btc from '../images/btc.png'
import axios from 'axios'
import BasicSparkLineCustomization from './components/Sparkline'

type CryptoCurrency = {
  id: string
  rank: string | number
  symbol: string
  name: string
  // supply: string
  // maxSupply: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
  // vwap24Hr: string
  explorer: string | null
}
//  Need to handle these?
// icon: { src: btc },
// change: 1,
// graph: { src: stock_growth },

const changeArray = [red_triangle, green_triangle]

export function App() {
  const [cryptoItems, setCryptoItems] = useState<CryptoCurrency[]>([])

  function loadAllCurrencies() {
    async function fetchListOfCurrencies() {
      const response = await axios.get('https://api.coincap.io/v2/assets')

      if (response.status === 200) {
        console.log(response.data.data)
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
        <table className="cryptos">
          <caption>CryptoTracker</caption>
          <thead>
            <tr>
              <th scope="col">Coin</th>
              <th scope="col">Price</th>
              <th scope="col">Graph</th>
            </tr>
          </thead>
          <tbody className="crypto-list">
            {cryptoItems.map((cryptoItem) => (
              <tr
                key={cryptoItem.rank}
                className={`crypto-container ${cryptoItem.id}`}
              >
                <td className="item-container coin-info">
                  <img
                    className="icon"
                    src={btc}
                    alt={`image of ${cryptoItem.name} icon`}
                  />
                  <div className="ticker-symbol">{cryptoItem.name}</div>
                  <div className="ticker-symbol">{cryptoItem.symbol}</div>
                </td>

                <td className="item-container data-info">
                  <div className="price">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(parseFloat(cryptoItem.priceUsd))}
                  </div>
                  <div className="change-24hr">
                    <img
                      className="change-direction"
                      src={
                        changeArray[
                          parseFloat(cryptoItem.changePercent24Hr) > 0 ? 1 : 0
                        ]
                      }
                      alt="change of direction"
                    />
                    <div
                      className={
                        'change-amount ' +
                        (parseFloat(cryptoItem.changePercent24Hr) > 0
                          ? 'positive'
                          : 'negative')
                      }
                    >
                      {parseFloat(cryptoItem.changePercent24Hr).toFixed(2)}
                    </div>
                  </div>
                </td>
                <td className="item-container graph-info">
                  <BasicSparkLineCustomization />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
