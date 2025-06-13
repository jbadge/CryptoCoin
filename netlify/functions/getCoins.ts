import type {
  Coins,
  RawCoinCapType,
  RawCryptoRatesType,
} from '../../src/types/CoinTypes'

const API_KEY =
  process.env.API_KEY ||
  process.env.REACT_APP_API_KEY ||
  process.env.VITE_API_KEY
const USE_CRYPTORATES = process.env.USE_CRYPTORATES === 'true'

//  Map CoinCap API response to expected shape
function mapCoinCap(data: RawCoinCapType[]): Coins[] {
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
        const marketcap = Number(marketCapUsd)
        const volume24h = Number(volumeUsd24Hr)

        // Guard against invalid numbers
        if (
          isNaN(price) ||
          isNaN(change24h) ||
          isNaN(marketcap) ||
          isNaN(volume24h)
        ) {
          return null
        }

        return {
          rank: String(rank),
          symbol,
          name,
          marketcap,
          volume24h,
          price,
          change24h: change24h / 100,
        }
      }
    )
    .filter((coin): coin is Coins => coin !== null)
}

// Map CryptoRates API response to expected shape
function mapCryptoRates(data: RawCryptoRatesType[]): Coins[] {
  return data
    .map(({ price, change24h, marketcap, volume24h, rank, symbol, name }) => {
      // Guard against invalid numbers
      if (
        typeof price !== 'number' ||
        isNaN(price) ||
        typeof change24h !== 'number' ||
        isNaN(change24h) ||
        typeof marketcap !== 'number' ||
        isNaN(marketcap) ||
        typeof volume24h !== 'number' ||
        isNaN(volume24h)
      ) {
        return null
      }

      return {
        rank: String(rank),
        symbol,
        name,
        marketcap,
        volume24h,
        price,
        change24h,
      }
    })
    .filter((coin): coin is Coins => coin !== null)
}

async function notifyAdmin(message: string): Promise<boolean | void> {
  const { Client, GatewayIntentBits } = await import('discord.js')

  const userId = process.env.MY_DISCORD_USER_ID
  const token = process.env.DISCORD_BOT_TOKEN

  // 🔐 Type safety check
  if (!userId || !token) {
    console.error('❌ Missing Discord credentials in environment variables.')
    return
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
  })

  return new Promise((resolve) => {
    client.once('ready', async () => {
      try {
        const user = await client.users.fetch(userId)
        await user.send(`⚠️ Admin Alert: ${message}`)
        console.log('✅ Discord DM sent')
        client.destroy()
        resolve(true)
      } catch (err) {
        console.error('❌ Failed to send Discord DM', err)
        client.destroy()
        resolve(false)
      }
    })

    client.login(token)
  })
}

export async function handler(event): Promise<{
  statusCode: number
  body: string
  headers?: Record<string, string>
}> {
  try {
    const useCryptoRates =
      USE_CRYPTORATES || event?.queryStringParameters?.source === 'cryptorates'

    if (useCryptoRates) {
      console.log('[🔄] Using CryptoRates (param or fallback mode)')
      const res = await fetch('https://cryptorates.ai/v1/coins/100')
      const data = await res.json()
      const coins = mapCryptoRates(data)
      return successResponse(coins, 'cryptorates')
    }

    try {
      console.log('[🔄] Fetching from CoinCap...')
      const response = await fetch(`https://rest.coincap.io/v3/assets`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      })

      if (response.status === 403) {
        console.warn('[🚫] CoinCap 403: Access Denied — quota or key issue')
        await notifyAdmin('CoinCap API returned 403. Check API key or usage.')
        throw new Error('CoinCap 403 - Access denied')
      }

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`CoinCap error: ${response.status} - ${errorBody}`)
      }

      const { data } = await response.json()
      const coins = mapCoinCap(data)

      console.log('[✅] Successfully fetched from CoinCap')
      return successResponse(coins, 'coincap')
    } catch (error) {
      console.warn('[⚠️] CoinCap failed — Falling back to CryptoRates')
      const fallbackRes = await fetch('https://cryptorates.ai/v1/coins/100')
      const fallbackData = await fallbackRes.json()
      const coins = mapCryptoRates(fallbackData)
      return successResponse(coins, 'cryptorates (fallback)')
    }
  } catch (error) {
    console.error('[❌] Handler crashed:', error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

function successResponse(data: Coins[], source: string) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, source }),
  }
}
