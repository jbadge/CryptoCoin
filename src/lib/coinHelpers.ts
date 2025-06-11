import coinAssets from '../data/index.json'
import { debugMode } from './config'

export function resolveCoinId(
  symbol: string,
  jsonHistory: Record<string, any>
): string | null {
  const symbolLc = symbol.toLowerCase()
  for (const coin of jsonHistory.data) {
    if (coin.symbol.toLowerCase() === symbolLc) {
      if (debugMode && (symbol === 'BNB' || symbol === 'bnb')) {
        console.log(
          `Symbol is ${symbolLc} and ID is ${coin.id} and rank is ${coin.rank}`
        )
      }
      return coin.id
    }
  }
  if (debugMode) {
    console.log(`No matching ID found for ${symbol}`)
  }
  return null
}

export function getFileId(symbol: string, resolvedId: string): string {
  const coinMeta = coinAssets.data.find(
    (coin) => coin.symbol.toLowerCase() === symbol.toLowerCase()
  )
  return coinMeta?.filename || resolvedId
}
