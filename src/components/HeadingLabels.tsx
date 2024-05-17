import React from 'react'
// Context
import { useGraphContext } from '../context/GraphContext'

function HeadingLabels() {
  const graphContext = useGraphContext()

  const handleClick = React.useCallback(() => {
    graphContext.setChecked((prev) => !prev)
    if (!graphContext.checked) {
      graphContext.preloadDataForRealTimeView()
    }
  }, [graphContext])

  const heading = React.useMemo(() => {
    return (
      <div className="graph-heading-switch">
        <h5 className="switch real-time">Real-Time</h5>
        <label className="switch">
          <input
            type="checkbox"
            onChange={handleClick}
            checked={graphContext.checked}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleClick()
              }
            }}
            tabIndex={0}
            width={140}
            aria-label="Toggle Real-Time and 7-Day Graph"
            role="button"
          />
          <span className="slider round"></span>
        </label>
        <h5 className="switch seven-day">7-Day</h5>
      </div>
    )
  }, [handleClick])

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
        {heading}
      </th>
    </tr>
  )
}

export default HeadingLabels
