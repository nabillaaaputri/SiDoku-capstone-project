const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`
}

const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID').format(number)
}

export { formatCurrency, formatDate, formatPercentage, formatNumber }
