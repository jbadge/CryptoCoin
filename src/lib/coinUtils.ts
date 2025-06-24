import { debugMode } from './config'

export function resolveCoinId(
  symbol: string,
  jsonHistory: Record<string, any>
): string | null {
  const symbolLc = symbol.toLowerCase()
  for (const coin of jsonHistory.data) {
    if (coin.symbol.toLowerCase() === symbolLc) {
      return coin.id
    }
  }
  if (debugMode) {
    console.log(`No matching ID found for ${symbol}`)
  }
  return null
}
