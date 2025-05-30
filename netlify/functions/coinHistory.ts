export async function handler(event) {
  const id = event.queryStringParameters?.id
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing id parameter' }),
    }
  }

  try {
    console.log(id)
    // const response = await fetch(
    //   `https://rest.coincap.io/v3/assets/${id}/history?interval=m15`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.API_KEY}`,
    //     },
    //   }
    // )
    const response = await fetch(
      `https://rest.coincap.io/v3/assets?apiKey=${process.env.REACT_APP_API_KEY}`
    )

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch from Crypto Rates' }),
      }
    }

    const apiResponse = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ data: apiResponse.data }),
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
