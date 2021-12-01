import dayjs from 'dayjs'
import 'dayjs/locale/id'
import numeral from 'numeral'

// register locale ID
dayjs.locale('id')

if (numeral.locales.id === undefined) {
  numeral.register('locale', 'id', {
    delimiters: {
      thousands: '.',
      decimal: ','
    },
    abbreviations: {
      thousand: 'ribu',
      million: 'juta',
      billion: 'miliar',
      trillion: 'triliun'
    },
    currency: {
      symbol: 'Rp'
    }
  })
}

if (numeral.locale() !== 'id') {
  numeral.locale('id')
}

export function formatNumber(number, format, allowZero = false) {
  if (!allowZero) {
    if (format.includes('$') && !number) {
      return '-'
    }
  } else if (format.includes('$') && typeof number !== 'number') {
    return '-'
  }

  return numeral(number).format(format)
}

export function formatDate(date, format = 'MM/DD/YYYY HH:mm:ss', addDays) {
  if (!date) {
    return '-'
  }

  const TIMEZONE_NAMES = {
    'UTC+0': 'GMT',
    'UTC+1': 'CET',
    'UTC+2': 'EET',
    'UTC+3': 'EEDT',
    'UTC+3.5': 'IRST',
    'UTC+4': 'MSD',
    'UTC+4.5': 'AFT',
    'UTC+5': 'PKT',
    'UTC+5.5': 'IST',
    'UTC+6': 'BST',
    'UTC+6.5': 'MST',
    'UTC+7': 'WIB',
    'UTC+8': 'WITA',
    'UTC+9': 'WIT',
    'UTC+9.5': 'ACST',
    'UTC+10': 'AEST',
    'UTC+10.5': 'ACDT',
    'UTC+11': 'AEDT',
    'UTC+11.5': 'NFT',
    'UTC+12': 'NZST',
    'UTC-1': 'AZOST',
    'UTC-2': 'GST',
    'UTC-3': 'BRT',
    'UTC-3.5': 'NST',
    'UTC-4': 'CLT',
    'UTC-4.5': 'VET',
    'UTC-5': 'EST',
    'UTC-6': 'CST',
    'UTC-7': 'MST',
    'UTC-8': 'PST',
    'UTC-9': 'AKST',
    'UTC-9.5': 'MIT',
    'UTC-10': 'HST',
    'UTC-11': 'SST',
    'UTC-12': 'BIT'
  }

  if (format.includes('TZ')) {
    let offset = -1 * new Date(date).getTimezoneOffset() / 60
    offset = `UTC${offset >= 0 ? `+${offset}` : offset}`
    format = format.replace('TZ', `[${TIMEZONE_NAMES[offset]}]`)
  }

  if (addDays) {
    return dayjs(date).add(addDays, 'days').format(format)
  }

  return dayjs(date).format(format)
}
