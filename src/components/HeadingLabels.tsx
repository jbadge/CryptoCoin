import React from 'react'

export function HeadingLabels() {
  return (
    <li className="crypto-container">
      <div className="item-container coin-info">
        <div className="col-header rank-heading">Rank</div>
        <div className="icon"></div>
        <div className="col-header name-heading">Name</div>
        <div className="col-header symbol-heading">Symbol</div>
      </div>
      <div className="item-container data-info">
        <div className="col-header price-heading">Price</div>
        <div className="col-header change-24Hr-heading">24h</div>
        <div className="col-header volumeUsd24Hr-heading">Volume 24h</div>
        <div className="col-header market-cap-heading">Market Cap</div>
      </div>
      <div className="item-container graph-info">
        {/* Real-time */}
        <div className="col-header graph-heading">Real-time</div>
      </div>
    </li>
  )
}
