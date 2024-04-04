import React, { useEffect, useState } from 'react'
import { HeadingLabels } from './components/HeadingLabels'
import { CryptoCurrency } from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
import { holdData } from './lib/functions'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])

  function loadAllCoins() {
    async function fetchCoins() {
      const response = await fetch('https://api.coincap.io/v2/assets')
      if (response.ok) {
        const { data } = await response.json()
        const tempCoins = [...data]
        holdData(tempCoins)
        setCoins(tempCoins)
      }
    }
    fetchCoins()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadAllCoins()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadAllCoins()
  }, [])

  return (
    <table className="crypto-list">
      <caption className="table-heading">
        CryptoCoin
        <div className="sub-heading">A CryptoCurrency Tracker</div>
      </caption>
      <thead>
        <HeadingLabels />
      </thead>
      <tbody>
        {coins.map((cryptoItem, _index, data) => (
          <CryptoCurrency
            key={cryptoItem.rank}
            id={cryptoItem.id}
            rank={cryptoItem.rank}
            name={cryptoItem.name}
            symbol={cryptoItem.symbol}
            priceUsd={cryptoItem.priceUsd}
            transformedPriceUsd={cryptoItem.transformedPriceUsd}
            changePercent24Hr={cryptoItem.changePercent24Hr}
            transformed24Hr={cryptoItem.transformed24Hr}
            marketCapUsd={cryptoItem.marketCapUsd}
            volumeUsd24Hr={cryptoItem.volumeUsd24Hr}
            data={data}
            explorer={null}
            sparkline={[]}
          />
        ))}
      </tbody>
    </table>
  )
}
