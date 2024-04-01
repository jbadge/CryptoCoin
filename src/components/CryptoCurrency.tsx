import React, { useEffect, useState } from 'react'
import { Icon } from './Icon'
import LineGraph from './LineGraph'
import { Coins } from '../types/CoinTypes'
import { currencyFormatter } from '../lib/functions'
import red_triangle from '../../images/red_triangle.png'
import green_triangle from '../../images/green_triangle.png'

export function CryptoCurrency({
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
  const changeArray = [red_triangle, green_triangle]
  const [posOrNegPrice, setPosOrNegPrice] = useState('')
  const [newPriceToCompare, setNewPriceToCompare] = useState(0)
  const [posOrNeg24Hr, setPosOrNeg24Hr] = useState('')
  const [new24HrToCompare, setNew24HrToCompare] = useState(0)
  const [checkPosOrNeg, setCheckPosOrNeg] = useState(0)

  useEffect(() => {
    if (newPriceToCompare === 0) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('no-change')
    }
    if (transformedPriceUsd === newPriceToCompare) {
      setPosOrNegPrice('no-change')
      return
    } else if (transformedPriceUsd < newPriceToCompare) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('positive')
      return
    } else if (transformedPriceUsd > newPriceToCompare) {
      setNewPriceToCompare(transformedPriceUsd)
      setPosOrNegPrice('negative')
    }
  }, [transformedPriceUsd])

  useEffect(() => {
    if (new24HrToCompare === 0) {
      setNew24HrToCompare(transformed24Hr)
      setPosOrNeg24Hr('no-change')
    }
    if (transformed24Hr === new24HrToCompare) {
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
  }, [changePercent24Hr])

  useEffect(() => {
    // setNewPriceToCompare(transformedPriceUsd)
    setPosOrNegPrice('no-change')
    setPosOrNeg24Hr('no-change')
    // setCheckPosOrNeg(2)
  }, [])

  return (
    <li key={rank} className={`crypto-container ${id}`}>
      <div className="item-container coin-info">
        <div className="crypto-rank">{rank}</div>
        <Icon key={rank} name={name} symbol={symbol} />
        <div className="ticker-symbol">{name}</div>
        <div className="ticker-symbol">{symbol}</div>
      </div>
      <div className="item-container data-info">
        <div className={'price ' + `${posOrNegPrice}`}>
          {currencyFormatter(priceUsd)}
        </div>
        <div className="change-24Hr">
          <img
            className={'change-direction ' + `${posOrNeg24Hr}`}
            src={changeArray[checkPosOrNeg]}
            alt="change of direction"
          />
          <div className={'change-amount ' + `${posOrNeg24Hr}`}>
            {parseFloat(changePercent24Hr).toFixed(2)}
          </div>
        </div>
        <div className="volumeUsd24Hr">
          {currencyFormatter(volumeUsd24Hr, 0)}
        </div>
        <div className="market-cap">{currencyFormatter(marketCapUsd, 0)}</div>
      </div>
      <LineGraph
        key={rank}
        transformedPriceUsd={transformedPriceUsd}
        sparkline={[]}
      />
    </li>
  )
}
