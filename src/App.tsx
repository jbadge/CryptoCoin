import React, { useState } from 'react'
import stock_growth from '../images/stock_growth.jpg'
import green_triangle from '../images/green_triangle.png'
import red_triangle from '../images/red_triangle.png'
import btc from '../images/btc.png'
import eth from '../images/eth.png'
import apt from '../images/apt.png'
import hft from '../images/hft.png'
import idia from '../images/idia.png'

// type CryptoItem = {
//   id: number
//   icon: string
//   name: string
//   symbol: string
//   change: string
//   changeDifference: number
//   price: number
//   graph: string
// }

const changeArray = [red_triangle, green_triangle]

export function App() {
  const [cryptoItems, setCryptoItems] = useState([
    {
      id: 1,
      icon: { src: btc },
      name: 'bitcoin',
      symbol: 'BTC',
      change: 1,
      changeDifference: 0.35,
      price: 16125.0,
      graph: { src: stock_growth },
    },
    {
      id: 1,
      icon: { src: eth },
      name: 'etherium',
      symbol: 'ETH',
      change: 0,
      changeDifference: 0.35,
      price: 16125.0,
      graph: { src: stock_growth },
    },
    {
      id: 1,
      icon: { src: apt },
      name: 'Aptos',
      symbol: 'ATP',
      change: 1,
      changeDifference: 0.35,
      price: 16125.0,
      graph: { src: stock_growth },
    },
    {
      id: 1,
      icon: { src: hft },
      name: 'Hashflow',
      symbol: 'HFT',
      change: 1,
      changeDifference: 0.35,
      price: 16125.0,
      graph: { src: stock_growth },
    },
    {
      id: 1,
      icon: { src: idia },
      name: 'International Finance Launchpad',
      symbol: 'IDIA',
      change: 0,
      changeDifference: 0.35,
      price: 16125.0,
      graph: { src: stock_growth },
    },
  ])

  return (
    <div>
      <main>
        <h1>CryptoTracker</h1>
        <section className="tracker-area">
          <div className="cryptos">
            <ul className="crypto-list">
              {cryptoItems.map((cryptoItem) => (
                <li
                  key={cryptoItem.id}
                  className={`crypto-container ${cryptoItem.name}`}
                >
                  <div className="item-container">
                    <img
                      className="icon"
                      src={cryptoItem.icon.src}
                      alt={`image of ${cryptoItem.name} icon`}
                    />
                  </div>
                  <div className="item-container">
                    <div className="name">
                      {cryptoItem.name.charAt(0).toUpperCase() +
                        cryptoItem.name.slice(1)}
                    </div>
                    <div className="info">
                      <div className="ticker-symbol">{cryptoItem.symbol}</div>
                      <img
                        className="change-direction"
                        src={changeArray[cryptoItem.change]}
                        alt="change of direction"
                      />
                      <div
                        className={
                          'change-amount ' +
                          (cryptoItem.change ? 'positive' : 'negative')
                        }
                      >
                        {cryptoItem.changeDifference}
                      </div>
                    </div>
                  </div>
                  <div className="item-container line-graph">
                    <img
                      className="graph"
                      src={cryptoItem.graph.src}
                      alt="static pic of stocks"
                    />
                    <div className="graph-price">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(cryptoItem.price)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="change-direction"></div>
          <div className="change-amount"></div>
        </section>
      </main>
    </div>
  )
}
