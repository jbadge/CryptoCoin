import { ONE_DAY_MS, SOURCE_CRYPTORATES } from './config'

const isServer = typeof process !== 'undefined' && !!process.env

export const API_KEY = isServer ? process.env.COINCAP_API_KEY : undefined
// Must have both these to false to stay false on runtime
export const USE_CRYPTORATES = isServer
  ? process.env.USE_CRYPTORATES !== 'false'
  : false
export const CACHE_TTL_MS = isServer
  ? parseInt(process.env.CACHE_TTL_MS ?? '', 10) || ONE_DAY_MS
  : ONE_DAY_MS

export function shouldUseCryptoRates(
  envDefault: boolean,
  paramSource?: string
) {
  return envDefault || paramSource === SOURCE_CRYPTORATES
}
