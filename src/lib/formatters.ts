export function currencyFormatter(price: number | string, digits: number = 2) {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  })
  if (typeof price === 'string') return formattedNumber.format(Number(price))
  return formattedNumber.format(price)
}

export function isValidNumber(...values: any[]): boolean {
  return values.every((val) => typeof val === 'number' && !isNaN(val))
}
