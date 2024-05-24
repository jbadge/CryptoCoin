import React from 'react'
import Icon from './Icon'
import { Coins } from '../types/CoinTypes'
import { currencyFormatter } from '../lib/functions'
import HistoryAreaGraph from './HistoryAreaGraph'
import RealTimeAreaGraph from './RealTimeAreaGraph'
// Context
import { useGraphContext } from '../context/GraphContext'
import PriceUpdater from '../lib/functions'

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
  const [newPriceToCompare, setNewPriceToCompare] = React.useState(0)
  const [posOrNegPrice, setPosOrNegPrice] = React.useState('')
  const [posOrNeg24Hr, setPosOrNeg24Hr] = React.useState('')
  const [new24HrToCompare, setNew24HrToCompare] = React.useState(0)
  const [checkPosOrNeg, setCheckPosOrNeg] = React.useState(0)

  const graphContext = useGraphContext()
  const redTriangleLM = new Image()
  redTriangleLM.src = '/red_triangle_lm.png'
  const greenTriangleLM = new Image()
  greenTriangleLM.src = '/green_triangle_lm.png'
  const redTriangleDM = new Image()
  redTriangleDM.src = '/red_triangle_dm.png'
  const greenTriangleDM = new Image()
  greenTriangleDM.src = '/green_triangle_dm.png'
  const changeArrayLM = [redTriangleLM.src, greenTriangleLM.src]
  const changeArrayDM = [redTriangleDM.src, greenTriangleDM.src]

  function checkPosOrNegPrice() {
    if (newPriceToCompare === 0 || transformedPriceUsd === newPriceToCompare) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('no-change')
      return
    } else if (transformedPriceUsd < newPriceToCompare) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('positive')
      return
    } else if (transformedPriceUsd > newPriceToCompare) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('negative')
      return
    }
  }

  function checkPosOrNeg24Hr() {
    if (new24HrToCompare === 0 || transformed24Hr === new24HrToCompare) {
      setNew24HrToCompare(transformed24Hr)
      setPosOrNeg24Hr('no-change')
      return
    } else if (transformed24Hr < new24HrToCompare) {
      setNew24HrToCompare(transformed24Hr)
      setPosOrNeg24Hr('positive')
      setCheckPosOrNeg(1)
      return
    } else if (transformed24Hr > new24HrToCompare) {
      setNew24HrToCompare(transformed24Hr)
      setPosOrNeg24Hr('negative')
      setCheckPosOrNeg(0)
    }
  }

  React.useEffect(() => {
    checkPosOrNegPrice()
  }, [transformedPriceUsd])

  React.useEffect(() => {
    checkPosOrNeg24Hr()
  }, [transformed24Hr])

  React.useEffect(() => {
    setPosOrNegPrice('no-change')
    setPosOrNeg24Hr('no-change')
  }, [])

  return (
    <tr key={rank} className={`coin-container ${id}`}>
      <td className="rank">{rank}</td>
      <td className="icon-container">
        <Icon key={rank} name={name} symbol={symbol} />
        <div className="placeholder"></div>
      </td>
      <td scope="row" className="name">
        {name}
      </td>
      <td className="ticker">{symbol}</td>
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
                key={rank}
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

export default CryptoCurrency
