import React, { memo, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { Coins } from '../types/CoinTypes'
import { currencyFormatter } from '../lib/functions'
import HistoryAreaGraph from './HistoryAreaGraph'
import RealTimeAreaGraph from './RealTimeAreaGraph'
// Context
import { useGraphContext } from '../context/GraphContext'
import PriceUpdater from '../lib/functions'

const redTriangleLM = '/red_triangle_lm.png'
const greenTriangleLM = '/green_triangle_lm.png'
const redTriangleDM = '/red_triangle_dm.png'
const greenTriangleDM = '/green_triangle_dm.png'

const changeArrayLM = [redTriangleLM, greenTriangleLM]
const changeArrayDM = [redTriangleDM, greenTriangleDM]

const CryptoCurrency = ({
  id,
  rank,
  name,
  symbol,
  priceUsd,
  transformedPriceUsd,
  changePercent24Hr,
  transformed24Hr,
  marketCapUsd,
  volumeUsd24Hr,
}: Coins) => {
  const graphContext = useGraphContext()
  const prev24HrRef = useRef<number | null>(null)
  const prevPriceRef = useRef<number | null>(null)
  const [checkPosOrNeg, setCheckPosOrNeg] = useState(0)
  const [posOrNeg24Hr, setPosOrNeg24Hr] = useState('no-change')
  const [posOrNegPrice, setPosOrNegPrice] = useState('no-change')

  useEffect(() => {
    const prevPrice = prevPriceRef.current

    if (prevPrice === null || transformedPriceUsd === prevPrice) {
      setPosOrNegPrice('no-change')
    } else if (transformedPriceUsd < prevPrice) {
      setPosOrNegPrice('positive')
    } else if (transformedPriceUsd > prevPrice) {
      setPosOrNegPrice('negative')
    }

    prevPriceRef.current = transformedPriceUsd
  }, [transformedPriceUsd])

  useEffect(() => {
    const prev24Hr = prev24HrRef.current
    console.log(prev24Hr)
    if (prev24Hr === null || transformed24Hr === prev24Hr) {
      setPosOrNeg24Hr('no-change')
      setCheckPosOrNeg(0)
    } else if (transformed24Hr < prev24Hr) {
      setPosOrNeg24Hr('positive')
      setCheckPosOrNeg(1)
    } else if (transformed24Hr > prev24Hr) {
      setPosOrNeg24Hr('negative')
      setCheckPosOrNeg(0)
    }

    prev24HrRef.current = transformed24Hr
  }, [transformed24Hr])

  return (
    <tr className={`coin-container ${id}`}>
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
        {currencyFormatter(priceUsd, 2)}
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
          {parseFloat(changePercent24Hr).toFixed(2)}
        </span>
      </td>
      <td className="volume-24">{currencyFormatter(volumeUsd24Hr, 0)}</td>
      <td className="market-cap">{currencyFormatter(marketCapUsd, 0)}</td>
      <td className="graph-info">
        <>
          {graphContext.checked ? (
            <HistoryAreaGraph
              id={id}
              rank={rank}
              symbol={symbol}
              transformedPriceUsd={transformedPriceUsd}
            />
          ) : (
            <>
              <PriceUpdater transformedPriceUsd={transformedPriceUsd} />
              <RealTimeAreaGraph
                id={''}
                rank={rank}
                symbol={symbol}
                transformedPriceUsd={transformedPriceUsd}
              />
            </>
          )}
        </>
      </td>
    </tr>
  )
}

export default memo(CryptoCurrency)
