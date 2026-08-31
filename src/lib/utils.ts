export function formatCurrency(
  amount: number,
  currency: 'USD' | 'EUR' | 'INR' | 'GBP' = 'USD'
): string {
  const currencySymbols: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    INR: 'en-IN',
    GBP: 'en-GB',
  }
  
  return new Intl.NumberFormat(currencySymbols[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
