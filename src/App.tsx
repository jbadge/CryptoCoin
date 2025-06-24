import React, { useEffect, useRef, useState } from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
// Context

/////////// Debug
import { debugMode } from './lib'
import { useGraphContext } from './context/GraphContext'

//something is running twice, getting 440 credits on api instead of 220
export function App() {
  const [coins, setCoins] = useState<Coins[]>([])
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const hasFetchedOnce = useRef(false)

  const { setCachedHistory } = useGraphContext()

  async function fetchCoins(useCryptoRatesOnly = false) {
    if (debugMode) {
      console.log(
        'fetchCoins called with useCryptoRatesOnly:',
        useCryptoRatesOnly
      )
    }

    try {
      const response = await fetch(
        useCryptoRatesOnly
          ? '/.netlify/functions/getCoins?source=cryptorates'
          : '/.netlify/functions/getCoins'
      )

      if (!response.ok) {
        if (!useCryptoRatesOnly && response.status === 403) {
          console.warn('CoinCap API access denied.')
        }
      }

      if (response.ok) {
        const {
          data,
          source,
          timestamp,
          ['1d']: oneDayHistory,
        } = await response.json()

        if (debugMode) {
          console.log('Data source:', source)
        }
        const tempCoins = [...data]
        setCoins(tempCoins)

        if (!useCryptoRatesOnly) {
          if (timestamp && oneDayHistory) {
            setCachedHistory({
              timestamp,
              '1d': oneDayHistory,
              '7d': {},
            })
          }

          setInitialLoadDone(true)
        }
      }
    } catch (error) {
      console.error('Error fetching data from API:', error)
    }
  }

  useEffect(() => {
    if (initialLoadDone) {
      // After initial load, fetch from CryptoRates at 10 second intervals
      const interval = setInterval(() => {
        fetchCoins(true)
      }, 10000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadDone])

  useEffect(() => {
    if (hasFetchedOnce.current) return
    hasFetchedOnce.current = true
    // debugMode, caches and reads from localCache instead of blob
    if (debugMode) {
      try {
        const localData = localStorage.getItem('coins')
        const localHistory = localStorage.getItem('coin_history_cache')

        if (localData && localHistory) {
          console.log('🧪 Using localStorage fallback')
          setCoins(JSON.parse(localData))
          setCachedHistory(JSON.parse(localHistory))
          setInitialLoadDone(true)
          return
        }
      } catch (error) {
        console.warn('🧪 Failed to parse localStorage fallback:', error)
      }
    }

    // Should this look to blob instead? is all this being handled in backend now?
    if (!initialLoadDone) {
      fetchCoins(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load table after all elements are ready, preventing skipping/jumping elements
  useEffect(() => {
    const handleLoad = () => {
      const table = document.querySelector('table')
      table?.classList.add('loaded')
    }

    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <table className="crypto-list">
      <caption className="table-heading">
        <h1>CryptoCoin</h1>
        <div className="sub-heading">A CryptoCurrency Tracker</div>
      </caption>
      <thead>
        <HeadingLabels />
      </thead>
      <tbody>
        {coins.map((cryptoItem) => (
          <CryptoCurrency
            key={cryptoItem.rank}
            rank={String(cryptoItem.rank)}
            name={cryptoItem.name}
            symbol={cryptoItem.symbol}
            price={cryptoItem.price}
            change24h={cryptoItem.change24h}
            marketCap={cryptoItem.marketCap}
            volume24h={cryptoItem.volume24h}
          />
        ))}
      </tbody>
    </table>
  )
}
