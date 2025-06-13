import React, { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { Coins } from '../types/CoinTypes'
import { currencyFormatter } from '../lib'
import HistoryAreaGraph from './HistoryAreaGraph'
// Context
import { useGraphContext } from '../context/GraphContext'

// LM - Light Mode, DM - Dark Mode
const redTriangleLM = '/red_triangle_lm.png'
const greenTriangleLM = '/green_triangle_lm.png'
const redTriangleDM = '/red_triangle_dm.png'
const greenTriangleDM = '/green_triangle_dm.png'

const changeArrayLM = [redTriangleLM, greenTriangleLM]
const changeArrayDM = [redTriangleDM, greenTriangleDM]

const CryptoCurrency = ({
  rank,
  name,
  symbol,
  price,
  change24h,
  marketcap,
  volume24h,
}: Coins) => {
  const previousPrice = useRef(0)
  const [posOrNegPrice, setPosOrNegPrice] = useState('')
  const [posOrNeg24Hr, setPosOrNeg24Hr] = useState('')
  const [checkPosOrNeg, setCheckPosOrNeg] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  void error

  const graphContext = useGraphContext()

  useEffect(() => {
    const prev = previousPrice.current
    if (prev === 0 || price === prev) {
      setPosOrNegPrice('no-change')
    } else if (price > prev) {
      setPosOrNegPrice('positive')
    } else {
      setPosOrNegPrice('negative')
    }
    previousPrice.current = price
  }, [price])

  useEffect(() => {
    if (change24h > 0) {
      setPosOrNeg24Hr('positive')
      setCheckPosOrNeg(1)
    } else if (change24h < 0) {
      setPosOrNeg24Hr('negative')
      setCheckPosOrNeg(0)
    } else {
      setPosOrNeg24Hr('no-change')
    }
  }, [change24h])

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setError(true)
  }, [])

  if (typeof price !== 'number' || isNaN(price)) return null
  if (typeof change24h !== 'number' || isNaN(change24h)) return null

  return (
    <tr className={`coin-container ${rank}`}>
      <td className="rank">{rank}</td>
      <td className="icon-container">
        <Icon name={name} symbol={symbol} />
        <div className="placeholder"></div>
      </td>
      <td className="name-container">
        <div className="name">{name}</div>
        <div className="ticker">{symbol}</div>
      </td>
      <td className={'price ' + `${posOrNegPrice}`}>
        {currencyFormatter(price, 2)}
      </td>
      <td className="change-24">
        <picture>
          <source
            srcSet={changeArrayDM[checkPosOrNeg]}
            media="(prefers-color-scheme: dark)"
          />
          <img
            className={'change-direction ' + `${posOrNeg24Hr}`}
            src={changeArrayLM[checkPosOrNeg]}
            alt="change of direction"
          />
        </picture>
        <span className={'change-amount ' + `${posOrNeg24Hr}`}>
          {(change24h * 100).toFixed(2)}%
        </span>
      </td>
      <td className="volume-24">{currencyFormatter(volume24h, 0)}</td>
      <td className="market-cap">{currencyFormatter(marketcap, 0)}</td>
      <td className="graph-info">
        <div style={{ width: '200px', marginLeft: 'auto' }}>
          {graphContext.checked ? (
            <HistoryAreaGraph
              name={name}
              rank={rank}
              symbol={symbol}
              interval={'h6'}
              price={price}
              onLoad={handleLoad}
              onError={handleError}
              style={loaded ? { display: 'inline-block' } : { display: 'none' }}
            />
          ) : (
            <HistoryAreaGraph
              name={name}
              rank={rank}
              symbol={symbol}
              interval={'h1'}
              price={price}
              onLoad={handleLoad}
              onError={handleError}
              style={loaded ? { display: 'inline-block' } : { display: 'none' }}
            />
          )}
        </div>
      </td>
    </tr>
  )
}

export default CryptoCurrency
