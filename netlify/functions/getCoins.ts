const API_KEY =
  process.env.API_KEY ||
  process.env.REACT_APP_API_KEY ||
  process.env.VITE_API_KEY
const USE_CRYPTORATES = process.env.USE_CRYPTORATES === 'true'

//  Map CoinCap API response to expected shape
function mapCoinCap(data) {
  return data.map((item) => {
    const price = parseFloat(item.priceUsd)
    const change = parseFloat(item.changePercent24Hr)

    return {
      rank: item.rank,
      symbol: item.symbol,
      name: item.name,
      marketcap: parseFloat(item.marketCapUsd),
      volume24h: parseFloat(item.volumeUsd24Hr),
      price,
      transformedPriceUsd: Number(price.toFixed(2)),
      change24h: change / 100,
      transformed24Hr: Number((change * 100).toFixed(2)),
    }
  })
}

// Map CryptoRates API response to expected shape
function mapCryptoRates(data) {
  return data.map((item) => {
    const price = item.price
    const change = item.change24h

    return {
      rank: String(item.rank),
      symbol: item.symbol,
      name: item.name,
      marketcap: item.marketcap,
      volume24h: item.volume24h,
      price,
      transformedPriceUsd: Number(price.toFixed(2)),
      change24h: change,
      transformed24Hr: Number((change * 100).toFixed(2)),
    }
  })
}

export async function handler(event) {
  try {
    const useCryptoRates =
      USE_CRYPTORATES || event?.queryStringParameters?.source === 'cryptorates'

    if (useCryptoRates) {
      const res = await fetch('https://cryptorates.ai/v1/coins/100')
      const data = await res.json()
      const coins = mapCryptoRates(data)
      return successResponse(coins, 'cryptorates')
    }

    try {
      const response = await fetch(`https://rest.coincap.io/v3/assets`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`CoinCap error: ${response.status} - ${errorBody}`)
      }

      const { data } = await response.json()
      const coins = mapCoinCap(data)
      return successResponse(coins, 'coincap')
    } catch (error) {
      const fallbackRes = await fetch('https://cryptorates.ai/v1/coins/100')
      const fallbackData = await fallbackRes.json()
      const coins = mapCryptoRates(fallbackData)
      return successResponse(coins, 'cryptorates (fallback)')
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

function successResponse(data, source: string) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, source }),
  }
}
