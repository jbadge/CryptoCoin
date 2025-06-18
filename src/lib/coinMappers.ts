import { Coins, RawCoinCapType, RawCryptoRatesType } from '../types/CoinTypes'
import { isValidNumber } from './formatters'

export function mapCoinCap(data: RawCoinCapType[]): Coins[] {
  return data
    .map(
      ({
        rank,
        symbol,
        name,
        priceUsd,
        changePercent24Hr,
        marketCapUsd,
        volumeUsd24Hr,
      }) => {
        const price = Number(priceUsd)
        const change24h = Number(changePercent24Hr)
        const marketCap = Number(marketCapUsd)
        const volume24h = Number(volumeUsd24Hr)

        if (!isValidNumber(price, change24h, marketCap, volume24h)) return null

        return {
          rank: String(rank),
          symbol,
          name,
          marketCap,
          volume24h,
          price,
          change24h: change24h / 100,
        }
      }
    )
    .filter((coin): coin is Coins => coin !== null)
}

export function mapCryptoRates(data: RawCryptoRatesType[]): Coins[] {
  return data
    .map(({ price, change24h, marketcap, volume24h, rank, symbol, name }) => {
      if (!isValidNumber(price, change24h, marketcap, volume24h)) return null

      return {
        rank: String(rank),
        symbol,
        name,
        marketCap: marketcap,
        volume24h,
        price,
        change24h,
      }
    })
    .filter((coin): coin is Coins => coin !== null)
}
