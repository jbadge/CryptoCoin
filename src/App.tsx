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
  ])

  // function upOrDown() {
  //   console.log(cryptItems.icon)
  //   if (cryptoItems.change === 0) {
  //     return 'red_triangle'
  //   } else if (cryptoItems.change === 1) {
  //     return 'green_triangle'
  //   }
  // }

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
                      {/* may need change to be 1/0, true/false */}
                      <img
                        className="change-direction"
                        src={changeArray[cryptoItem.change]}
                        alt="change of direction"
                      />
                      {/* Classname needs to have positive/negative be dynamic */}
                      <div className="change-amount positive">
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

              <li className="crypto-container bitcoin">
                <div className="item-container">
                  <img className="icon" src={btc} alt="image of bitcoin icon" />
                </div>
                <div className="item-container">
                  <div className="name">Bitcoin</div>
                  <div className="info">
                    <div className="ticker-symbol">BTC</div>
                    <img
                      className="change-direction"
                      src={green_triangle}
                      alt="change of direction"
                    />
                    <div className="change-amount positive">0.35%</div>
                  </div>
                </div>
                <div className="item-container line-graph">
                  <img
                    className="graph"
                    src={stock_growth}
                    alt="static pic of stocks"
                  />
                  <div className="graph-price">$16,125.00</div>
                </div>
              </li>

              <li className="crypto-container etherium">
                <div className="item-container">
                  <img
                    className="icon"
                    src={eth}
                    alt="image of etherium icon"
                  />
                </div>
                <div className="item-container">
                  <div className="name">Etherium</div>
                  <div className="info">
                    <div className="ticker-symbol">ETH</div>
                    <img
                      className="change-direction"
                      src={red_triangle}
                      alt="change of direction"
                    />
                    <div className="change-amount negative">0.35%</div>
                  </div>
                </div>
                <div className="item-container line-graph">
                  <img
                    className="graph"
                    src={stock_growth}
                    alt="static pic of stocks"
                  />
                  <div className="graph-price">$1,380.00</div>
                </div>
              </li>

              <li className="crypto-container aptos">
                <div className="item-container">
                  <img className="icon" src={apt} alt="image of aptos icon" />
                </div>
                <div className="item-container">
                  <div className="name">Aptos</div>
                  <div className="info">
                    <div className="ticker-symbol">APT</div>
                    <img
                      className="change-direction"
                      src={green_triangle}
                      alt="change of direction"
                    />
                    <div className="change-amount positive">0.35%</div>
                  </div>
                </div>
                <div className="item-container line-graph">
                  <img
                    className="graph"
                    src={stock_growth}
                    alt="static pic of stocks"
                  />
                  <div className="graph-price">$1,380.00</div>
                </div>
              </li>

              <li className="crypto-container hashflow">
                <div className="item-container">
                  <img
                    className="icon"
                    src={hft}
                    alt="image of hashflow icon"
                  />
                </div>
                <div className="item-container">
                  <div className="name">Hashflow</div>
                  <div className="info">
                    <div className="ticker-symbol">HFT</div>
                    <img
                      className="change-direction"
                      src={green_triangle}
                      alt="change of direction"
                    />
                    <div className="change-amount positive">0.35%</div>
                  </div>
                </div>
                <div className="item-container line-graph">
                  <img
                    className="graph"
                    src={stock_growth}
                    alt="static pic of stocks"
                  />
                  <div className="graph-price">$1,380.00</div>
                </div>
              </li>

              <li className="crypto-container impossible">
                <div className="item-container">
                  <img
                    className="icon"
                    src={idia}
                    alt="image of impossible icon"
                  />
                </div>
                <div className="item-container">
                  <div className="name">Impossible Finance Launchpad</div>
                  <div className="info">
                    <div className="ticker-symbol">IADA</div>
                    <img
                      className="change-direction"
                      src={red_triangle}
                      alt="change of direction"
                    />
                    <div className="change-amount negative">0.35%</div>
                  </div>
                </div>
                <div className="item-container line-graph">
                  <img
                    className="graph"
                    src={stock_growth}
                    alt="static pic of stocks"
                  />
                  <div className="graph-price">$1,380.00</div>
                </div>
              </li>
            </ul>
          </div>
          <div className="change-direction"></div>
          <div className="change-amount"></div>
        </section>
      </main>
    </div>
  )
}
