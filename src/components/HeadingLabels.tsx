import React from 'react'

export function HeadingLabels() {
  return (
    <li className="crypto-container">
      <div className="item-container coin-info">
        <div className="col-header rank-heading">Rank</div>
        <div className="icon-heading"></div>
        <div className="col-header name-heading">Name</div>
        <div className="col-header symbol-heading">Symbol</div>
      </div>
      <div className="item-container data-info">
        <div className="col-header price-heading">Price</div>
        <div className="col-header change-24hr-heading">24h</div>
      </div>
      <div className="col-header graph-heading">Price per 10 seconds</div>
      {/* <div className="col-header graph-heading">Prior 7 Days</div> */}
    </li>
  )
}
