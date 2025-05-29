import React, { useEffect, useRef } from 'react'
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
  const [checkPosOrNeg, setCheckPosOrNeg] = React.useState(0)
  const [posOrNeg24Hr, setPosOrNeg24Hr] = React.useState('no-change')
  const [posOrNegPrice, setPosOrNegPrice] = React.useState('no-change')

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

  useEffect(() => {
    setPosOrNegPrice('no-change')
    setPosOrNeg24Hr('no-change')
  }, [])
  // console.timeEnd(`Render: ${id}`)
  ////////////////
  // console.log(`Rendering ${coins.length} graphs`)
  //////////////////

  return (
    <tr className={`coin-container ${id}`}>
      <td className="rank">{rank}</td>
      <td className="icon-container">
        <Icon name={name} symbol={symbol} />
        <div className="placeholder"></div>
      </td>
      <td scope="row" className="name">
        {name}
      </td>
      <td className="ticker">{symbol}</td>
      {/* <td className="name-container">
        <div className="name1">{name}</div>
        <div className="ticker1">{symbol}</div>
      </td> */}
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

// export default CryptoCurrency
export default React.memo(CryptoCurrency)
