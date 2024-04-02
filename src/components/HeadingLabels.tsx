import React from 'react'

export function HeadingLabels() {
  return (
    <li className="crypto-container heading-info">
      <div className="coin-info-heading">
        <div className="col-heading rank-heading">Rank</div>
        <div className="icon"></div>
        <div className="col-heading name-heading">Name</div>
        <div className="col-heading symbol-heading">Symbol</div>
      </div>
      <div className="data-info-heading">
        <div className="col-heading price-heading">Price</div>
        <div className="col-heading change-24Hr-heading">24h</div>
        <div className="col-heading volumeUsd24Hr-heading">Volume 24h</div>
        <div className="col-heading market-cap-heading">Market Cap</div>
      </div>
      <div className="graph-info-heading">
        {/* Real-time */}
        <div className="col-heading graph-heading">Real-time</div>
      </div>
    </li>
  )
}
