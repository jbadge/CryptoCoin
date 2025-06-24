import { BlobStore, Coins } from '../types/CoinTypes'
import { allowCachingFallback, SOURCE_CRYPTORATES } from './config'
import { fetchFallbackFromCryptoRates } from './fetchUtils'

// Returns JSON response
export function successResponse(
  data: Coins[],
  source: string,
  timestamp?: number,
  history?: Record<string, any>,
  intervalKey: '1d' | '7d' = '1d'
) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, source, timestamp, [intervalKey]: history }),
  }
}

// Returns JSON error
export function errorResponse(statusCode: number, message: string) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: message }),
  }
}

export async function fallbackResponse(blobStore: BlobStore, now: number) {
  const coins = await fetchFallbackFromCryptoRates(
    blobStore,
    now,
    allowCachingFallback
  )
  return successResponse(coins, SOURCE_CRYPTORATES)
}
