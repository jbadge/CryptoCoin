import React, { useEffect, useState } from 'react'
import HeadingLabels from './components/HeadingLabels'
import CryptoCurrency from './components/CryptoCurrency'
import { Coins } from './types/CoinTypes'
// Context
import { GraphContextProvider } from './context/GraphContext'
import { DatasetContextProvider } from './context/DatasetContext'
/////////// Debug
import { debugMode } from './lib'

export function App() {
  const [coins, setCoins] = useState<Coins[]>([])
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [apiAccessIssue, setApiAccessIssue] = useState(false)

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
          setApiAccessIssue(true)
          console.warn('CoinCap API access denied.')
        }
      }

      if (response.ok) {
        const { data, source } = await response.json()
        console.log('Fetched coins:', data)
        if (debugMode) {
          console.log('Data source:', source)
        }
        const tempCoins = [...data]
        setCoins(tempCoins)

        if (source === 'coincap') {
          // Only CoinCap results are cached
          localStorage.setItem('coins', JSON.stringify(tempCoins))
          setInitialLoadDone(true)
        } else if (source === 'cryptorates (fallback)') {
          // CryptoRates fallback used — don’t cache
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
  }, [initialLoadDone])

  useEffect(() => {
    const cachedCoins = localStorage.getItem('coins')

    if (!cachedCoins) {
      // Inital loading from CoinCap. Caches
      fetchCoins(false)
    } else if (!initialLoadDone) {
      // If CoinCap cache exists, load from it once
      if (debugMode) {
        console.log('Data source: cache')
      }
      setCoins(JSON.parse(cachedCoins))
      setInitialLoadDone(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <GraphContextProvider>
      <DatasetContextProvider>
        {apiAccessIssue && (
          <div className="alert alert-warning">
            ⚠️ CoinCap API access is currently restricted. Showing fallback
            data.
          </div>
        )}

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
      </DatasetContextProvider>
    </GraphContextProvider>
  )
}
