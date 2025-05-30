// export async function handler() {
//   try {
//     const response = await fetch('https://cryptorates.ai/v1/coins/all')

//     if (!response.ok) {
//       return {
//         statusCode: response.status,
//         body: JSON.stringify({ error: 'Failed to fetch from CryptoRates' }),
//       }
//     }

//     const data = await response.json()

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ data }),
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     }
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Internal Server Error' }),
//     }
//   }
// }

// export async function handler(_event) {
//   try {
//     // const response = await fetch('https://cryptorates.ai/v1/coins/500')
//     const url = `https://rest.coincap.io/v3/assets?apiKey=${process.env.REACT_APP_API_KEY}`
//     const response = await fetch(url)

//     const rawText = await response.text()

//     let parsed
//     try {
//       parsed = JSON.parse(rawText)
//     } catch (err) {
//       return {
//         statusCode: 500,
//         body: JSON.stringify({
//           error: 'Failed to parse JSON',
//           message: rawText.slice(0, 500),
//         }),
//       }
//     }
exports.handler = async (event) => {
  const apiKey = process.env.COINCAP_API_KEY
  const { offset = '0', limit = '100' } = event.queryStringParameters

  const url = `https://rest.coincap.io/v3/assets?limit=${limit}&offset=${offset}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const data = await res.json()

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ data: parsed }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     }
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         error: 'Internal Server Error',
//         detail: error.message,
//       }),
//     }
//   }
// }
