export async function handler() {
  const response = await fetch('https://cryptorates.ai/v1/coins/100')

  const { data } = await response.json()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
}
