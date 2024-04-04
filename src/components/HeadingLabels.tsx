import React from 'react'

export function HeadingLabels() {
  return (
    <tr className="coin-heading">
      <th scope="col" className="rank-heading">
        Rank
      </th>
      <th scope="col" className="icon-heading">
        Icon
      </th>
      <th scope="col" className="name-heading">
        Name
      </th>
      <th scope="col" className="ticker-heading">
        Symbol
      </th>
      <th scope="col" className="price-heading">
        Price
      </th>
      <th scope="col" className="change-amount-heading">
        24h
      </th>
      <th scope="col" className="volume-24-heading">
        Volume 24h
      </th>
      <th scope="col" className="market-cap-heading">
        Market Cap
      </th>
      <th scope="col" className="graph-heading">
        Real-time
      </th>
    </tr>
  )
}
