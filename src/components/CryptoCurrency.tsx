import React, { useEffect, useState } from 'react'
import { currencyFormatter } from '../lib/functions'
import { Coins } from '../types/CoinTypes'
import { Icon } from './Icon'
import RealTimeAreaGraph from './RealTimeAreaGraph'
import HistoryAreaGraph from './HistoryAreaGraph'
// Context
import { useGraphContext } from '../context/GraphContext'

function CryptoCurrency({
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
}: Coins) {
  const changeArrayLM = [`/red_triangle_lm.png`, `/green_triangle_lm.png`]
  const changeArrayDM = [`/red_triangle_dm.png`, `/green_triangle_dm.png`]
  const [newPriceToCompare, setNewPriceToCompare] = useState(0)
  const [new24HrToCompare, setNew24HrToCompare] = useState(0)
  const [posOrNegPrice, setPosOrNegPrice] = useState('')
  const [checkPosOrNeg, setCheckPosOrNeg] = useState(0)
  const [posOrNeg24Hr, setPosOrNeg24Hr] = useState('')
  const graphContext = useGraphContext()

  const AreaGraph1 = () => (
    <RealTimeAreaGraph
      id={''}
      rank={rank}
      symbol={symbol}
      transformedPriceUsd={transformedPriceUsd}
    />
  )

  const AreaGraph2 = () => (
    <HistoryAreaGraph
      id={id}
      rank={rank}
      symbol={symbol}
      transformedPriceUsd={transformedPriceUsd}
    />
  )

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

  useEffect(() => {
    checkPosOrNegPrice()
  }, [transformedPriceUsd])

  useEffect(() => {
    checkPosOrNeg24Hr()
  }, [transformed24Hr])

  useEffect(() => {
    setPosOrNegPrice('no-change')
    setPosOrNeg24Hr('no-change')
  }, [])

  const graphs = React.useMemo(() => {
    return (
      <>
        {graphContext.contentType === 'b1' && <AreaGraph1 />}
        {graphContext.contentType === 'b2' && <AreaGraph2 />}
      </>
    )
  }, [graphContext])

  return (
    <tr key={rank} className={`coin-container ${id}`}>
      <td className="rank">{rank}</td>
      <td className="icon-container">
        <Icon key={rank} name={name} symbol={symbol} />
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
          />
        </picture>
        <span className={'change-amount ' + `${posOrNeg24Hr}`}>
          {parseFloat(changePercent24Hr).toFixed(2)}
        </span>
      </td>
      <td className="volume-24">{currencyFormatter(volumeUsd24Hr, 0)}</td>
      <td className="market-cap">{currencyFormatter(marketCapUsd, 0)}</td>
      <td className="graph-info">{graphs}</td>
    </tr>
  )
}

export default CryptoCurrency
