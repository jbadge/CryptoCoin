import { ONE_DAY_MS, SOURCE_CRYPTORATES } from './config'

export const API_KEY = process.env.COINCAP_API_KEY
export const USE_CRYPTORATES = process.env.USE_CRYPTORATES === 'false'
export const CACHE_TTL_MS =
  parseInt(process.env.CACHE_TTL_MS ?? '', 10) || ONE_DAY_MS

export function shouldUseCryptoRates(
  envDefault: boolean,
  paramSource?: string
) {
  return envDefault || paramSource === SOURCE_CRYPTORATES
}
