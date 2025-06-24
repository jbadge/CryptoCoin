import React, { useCallback, useMemo } from 'react'
// Context
import { useGraphContext } from '../context/GraphContext'

function HeadingLabels() {
  const graphContext = useGraphContext()
  const { checked, setChecked, fetch7dHistoryData } = graphContext

  /////// NEED TO CHECK THIS
  const handleClick = useCallback(() => {
    setChecked((prev) => !prev)
    if (!checked) {
      fetch7dHistoryData()
    }
  }, [checked, setChecked, fetch7dHistoryData])

  const heading = useMemo(() => {
    return (
      <div className="graph-heading-switch">
        <h2 className="graph-switch real-time">1-Day</h2>
        <label
          className="graph-switch"
          role="toggle-switch"
          aria-checked={checked}
        >
          <input
            type="checkbox"
            onChange={handleClick}
            checked={checked}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleClick()
              }
            }}
            tabIndex={0}
            width={140}
            aria-label="Toggle 1-Day and 7-Day Graph"
            role="button"
          />
          <span className="slider round"></span>
        </label>
        <h2 className="graph-switch seven-day">7-Day</h2>
      </div>
    )
  }, [checked, handleClick])

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
