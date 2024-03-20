import React from 'react'
import stock_growth from '../images/stock_growth.jpg'
import green_triangle from '../images/green_triangle.png'
import red_triangle from '../images/red_triangle.png'
import btc from '../images/btc.png'
import eth from '../images/eth.png'
import apt from '../images/apt.png'
import hft from '../images/hft.png'
import idia from '../images/idia.png'

export function App() {
  return (
    <div>
      <main>
        <h1>CryptoTracker</h1>
        <section className="tracker-area">
          <div className="cryptos">
            <ul className="crypto-list">
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
