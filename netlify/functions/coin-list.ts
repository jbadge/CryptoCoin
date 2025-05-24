// netlify/functions/coin-history.js (or create coin-list.js)

export async function handler(_event) {
  try {
    const response = await fetch('https://rest.coincap.io/v3/assets', {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    })

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch assets' }),
      }
    }

    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}
