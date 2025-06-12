import React, { useCallback, useEffect, useState } from 'react'
import Icon from './Icon'
import { Coins } from '../types/CoinTypes'
import { currencyFormatter } from '../lib'
import HistoryAreaGraph from './HistoryAreaGraph'
// Context
import { useGraphContext } from '../context/GraphContext'

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
  const [previousPrice, setPreviousPrice] = useState(0)
  const [posOrNegPrice, setPosOrNegPrice] = useState('')
  const [posOrNeg24Hr, setPosOrNeg24Hr] = useState('')
  const [previous24h, setPrevious24h] = useState(0)
  const [checkPosOrNeg, setCheckPosOrNeg] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  void error

  const graphContext = useGraphContext()

  const checkPosOrNegPrice = useCallback(() => {
    if (previousPrice === 0 || price === previousPrice) {
      setPreviousPrice(price)
      setPosOrNegPrice('no-change')
      return
    } else if (price < previousPrice) {
      setPreviousPrice(price)
      setPosOrNegPrice('positive')
      return
    } else if (price > previousPrice) {
      setPreviousPrice(price)
      setPosOrNegPrice('negative')
      return
    }
  }, [previousPrice, price])

  const checkPosOrNeg24Hr = useCallback(() => {
    if (previous24h === 0 || change24h === previous24h) {
      setPrevious24h(change24h)
      setPosOrNeg24Hr('no-change')
      return
    } else if (change24h < previous24h) {
      setPrevious24h(change24h)
      setPosOrNeg24Hr('positive')
      setCheckPosOrNeg(1)
      return
    } else if (change24h > previous24h) {
      setPrevious24h(change24h)
      setPosOrNeg24Hr('negative')
      setCheckPosOrNeg(0)
    }
  }, [previous24h, change24h])

  useEffect(() => {
    checkPosOrNegPrice()
  }, [checkPosOrNegPrice])

  useEffect(() => {
    checkPosOrNeg24Hr()
  }, [checkPosOrNeg24Hr])

  useEffect(() => {
    setPosOrNegPrice('no-change')
    setPosOrNeg24Hr('no-change')
  }, [])

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setError(true)
  }, [])

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
            height={10}
          />
        </picture>
        <span className={'change-amount ' + `${posOrNeg24Hr}`}>
          {(change24h * 100).toFixed(2)}
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
