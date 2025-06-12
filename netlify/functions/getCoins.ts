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

async function notifyAdmin(message: string) {
  await fetch('https://hooks.slack.com/services/your/slack/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  })
}

// async function notifyAdmin(message: string) {
//   const promises = []

//   // ✅ Slack
//   const slackWebhook = process.env.SLACK_WEBHOOK_URL
//   if (slackWebhook) {
//     promises.push(
//       fetch(slackWebhook, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: message }),
//       })
//     )
//   }

//   // ✅ Discord
//   const discordWebhook = process.env.DISCORD_WEBHOOK_URL
//   if (discordWebhook) {
//     promises.push(
//       fetch(discordWebhook, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content: message }),
//       })
//     )
//   }

//   // ✅ Email via SendGrid
//   const sendgridApiKey = process.env.SENDGRID_API_KEY
//   const emailTo = process.env.ALERT_EMAIL_TO
//   const emailFrom = process.env.ALERT_EMAIL_FROM
//   if (sendgridApiKey && emailTo && emailFrom) {
//     promises.push(
//       fetch('https://api.sendgrid.com/v3/mail/send', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${sendgridApiKey}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           personalizations: [{ to: [{ email: emailTo }] }],
//           from: { email: emailFrom },
//           subject: 'CoinCap API Warning',
//           content: [{ type: 'text/plain', value: message }],
//         }),
//       })
//     )
//   }

//   // ✅ SMS via Twilio
//   const twilioSID = process.env.TWILIO_SID
//   const twilioAuth = process.env.TWILIO_AUTH_TOKEN
//   const twilioFrom = process.env.TWILIO_FROM_NUMBER
//   const smsTo = process.env.ALERT_SMS_TO
//   if (twilioSID && twilioAuth && twilioFrom && smsTo) {
//     const twilioURL = `https://api.twilio.com/2010-04-01/Accounts/${twilioSID}/Messages.json`
//     const smsBody = new URLSearchParams({
//       From: twilioFrom,
//       To: smsTo,
//       Body: message,
//     })

//     promises.push(
//       fetch(twilioURL, {
//         method: 'POST',
//         headers: {
//           Authorization:
//             'Basic ' + Buffer.from(`${twilioSID}:${twilioAuth}`).toString('base64'),
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: smsBody.toString(),
//       })
//     )
//   }

//   // Wait for all notifications to complete
//   await Promise.all(promises)
// }

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

      if (response.status === 403) {
        console.warn(
          'CoinCap API returned 403: Possible quota exhaustion or invalid API key.'
        )

        // Optionally send notification
        await notifyAdmin(
          'CoinCap API returned 403. Check your API key or credit usage.'
        )

        throw new Error('CoinCap 403 - Access denied')
      }

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
