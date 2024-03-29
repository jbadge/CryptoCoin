import React from 'react'
import SparkLine from './Sparkline'
import green_triangle from '../../images/green_triangle.png'
import red_triangle from '../../images/red_triangle.png'
import { Icon } from './Icon'

export type Coins = {
  id: string
  rank: string | number
  symbol: string
  name: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
  explorer: string | null
}

export function CryptoCurrency({
  id,
  rank,
  name,
  symbol,
  // marketCapUsd,
  // volumeUsd24Hr,
  priceUsd,
  changePercent24Hr,
}: Coins) {
  const changeArray = [red_triangle, green_triangle]

  return (
    <li key={rank} className={`crypto-container ${id}`}>
      <div className="item-container coin-info">
        <div className="crypto-rank">{rank}</div>
        <Icon key={rank} name={name} symbol={symbol} />
        <div className="ticker-symbol">{name}</div>
        <div className="ticker-symbol">{symbol}</div>
      </div>
      <div className="item-container data-info">
        <div className="price">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(parseFloat(priceUsd))}
        </div>
        <div className="change-24hr">
          <img
            className="change-direction"
            src={changeArray[parseFloat(changePercent24Hr) > 0 ? 1 : 0]}
            alt="change of direction"
          />
          <div
            className={
              'change-amount ' +
              (parseFloat(changePercent24Hr) > 0 ? 'positive' : 'negative')
            }
          >
            {parseFloat(changePercent24Hr).toFixed(2)}
          </div>
        </div>
      </div>
      <SparkLine />
    </li>
  )
}
