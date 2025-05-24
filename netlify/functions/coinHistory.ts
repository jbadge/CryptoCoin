export async function handler(event: any, _context: any) {
  const id = event.queryStringParameters.id
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing id parameter' }),
    }
  }

  try {
    const response = await fetch(
      `https://rest.coincap.io/v3/assets/${id}/history?interval=m15`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`, // Your secret env var here
        },
      }
    )

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch from CoinCap' }),
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
