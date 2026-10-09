const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const numberFormatter = new Intl.NumberFormat('en-GB')

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

/** Budget is an integer string, e.g. "12500" → "12,500". */
export const formatBudget = (budget: string) => numberFormatter.format(Number(budget))

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
