export type City = {
  id: number
  name: string
  country: string
  latitude: number
  longitude: number
  country_code?: string
  timezone?: string
}

export type AirQualityResult = {
  city: City
  aqi: number | null
  updatedAt: string
  pollutants: { key: 'pm25' | 'pm10' | 'ozone' | 'no2'; value: number | null; unit: string }[]
  trend: { labels: string[]; observed: (number | null)[]; forecast: (number | null)[] }
  source: string
}

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

// Open-Meteo's geocoding service does not provide Persian (fa) as a search
// language. Convert common Persian city names to the English names expected
// by the service, and use a transliteration fallback for other Persian input.
const PERSIAN_CITY_ALIASES: Record<string, string> = {
  'تهران': 'Tehran',
  'مشهد': 'Mashhad',
  'اصفهان': 'Isfahan',
  'شیراز': 'Shiraz',
  'تبریز': 'Tabriz',
  'کرج': 'Karaj',
  'اهواز': 'Ahvaz',
  'قم': 'Qom',
  'کرمانشاه': 'Kermanshah',
  'رشت': 'Rasht',
  'یزد': 'Yazd',
  'کرمان': 'Kerman',
  'ارومیه': 'Urmia',
  'اراک': 'Arak',
  'بندرعباس': 'Bandar Abbas',
  'ساری': 'Sari',
  'قزوین': 'Qazvin',
  'زنجان': 'Zanjan',
  'همدان': 'Hamadan',
  'سنندج': 'Sanandaj',
  'خرم‌آباد': 'Khorramabad',
  'خرم اباد': 'Khorramabad',
  'بوشهر': 'Bushehr',
  'بیرجند': 'Birjand',
  'بجنورد': 'Bojnurd',
  'گرگان': 'Gorgan',
  'زاهدان': 'Zahedan',
  'اردبیل': 'Ardabil',
  // Smaller Iranian cities and popular island destinations
  'قشم': 'Qeshm',
  'کیش': 'Kish',
  'لاهیجان': 'Lahijan',
  'لنگرود': 'Langarud',
  'بابل': 'Babol',
  'آمل': 'Amol',
  'قائمشهر': 'Qaem Shahr',
  'قائم شهر': 'Qaem Shahr',
  'بابلسر': 'Babolsar',
  'نوشهر': 'Nowshahr',
  'چالوس': 'Chalus',
  'رامسر': 'Ramsar',
  'تنکابن': 'Tonekabon',
  'گرمسار': 'Garmsar',
  'دامغان': 'Damghan',
  'شاهرود': 'Shahrud',
  'سمنان': 'Semnan',
  'کاشان': 'Kashan',
  'نطنز': 'Natanz',
  'نجف‌آباد': 'Najafabad',
  'نجف آباد': 'Najafabad',
  'خمینی‌شهر': 'Khomeynishahr',
  'خمینی شهر': 'Khomeynishahr',
  'فلاورجان': 'Falavarjan',
  'زرین‌شهر': 'Zarrinshahr',
  'زرین شهر': 'Zarrinshahr',
  'گلپایگان': 'Golpayegan',
  'خوانسار': 'Khansar',
  'آران و بیدگل': 'Aran va Bidgol',
  'اردکان': 'Ardakan',
  'میبد': 'Meybod',
  'طبس': 'Tabas',
  'رفسنجان': 'Rafsanjan',
  'سیرجان': 'Sirjan',
  'جیرفت': 'Jiroft',
  'بم': 'Bam',
  'کازرون': 'Kazerun',
  'جهرم': 'Jahrom',
  'فسا': 'Fasa',
  'مرودشت': 'Marvdasht',
  'لار': 'Lar',
  'گناوه': 'Genaveh',
  'بندر گناوه': 'Genaveh',
  'بندر لنگه': 'Bandar Lengeh',
  'میناب': 'Minab',
  'چابهار': 'Chabahar',
  'ایرانشهر': 'Iranshahr',
  'خاش': 'Khash',
  'سراوان': 'Saravan',
  'آبادان': 'Abadan',
  'خرمشهر': 'Khorramshahr',
  'دزفول': 'Dezful',
  'اندیمشک': 'Andimeshk',
  'شوشتر': 'Shushtar',
  'ماهشهر': 'Mahshahr',
  'بهبهان': 'Behbahan',
  'ایذه': 'Izeh',
  'مسجدسلیمان': 'Masjed Soleyman',
  'مسجد سلیمان': 'Masjed Soleyman',
  'بروجرد': 'Borujerd',
  'ملایر': 'Malayer',
  'تویسرکان': 'Tuyserkan',
  'کنگاور': 'Kangavar',
  'مریوان': 'Marivan',
  'بانه': 'Baneh',
  'سقز': 'Saqqez',
  'بوکان': 'Bukan',
  'مهاباد': 'Mahabad',
  'خوی': 'Khoy',
  'مراغه': 'Maragheh',
  'میانه': 'Mianeh',
  'اهر': 'Ahar',
  'سراب': 'Sarab',
  'خلخال': 'Khalkhal',
  'پارس‌آباد': 'Parsabad',
  'پارس آباد': 'Parsabad',
  'نیشابور': 'Neyshabur',
  'سبزوار': 'Sabzevar',
  'تربت حیدریه': 'Torbat Heydarieh',
  'کاشمر': 'Kashmar',
  'قوچان': 'Quchan',
  'تربت جام': 'Torbat-e-Jam',
  'گناباد': 'Gonabad',
  'فردوس': 'Ferdows',
  'تایباد': 'Taybad',
  'خواف': 'Khaf',
  'اسفراین': 'Esfarayen',
  'شیروان': 'Shirvan',
  'علی‌آباد کتول': 'Aliabad-e-Katul',
  'علی آباد کتول': 'Aliabad-e-Katul',
  'آق‌قلا': 'Aq Qala',
  'آق قلا': 'Aq Qala',
  'گنبد کاووس': 'Gonbad-e Kavus',
  'گنبدکاووس': 'Gonbad-e Kavus',
  'کردکوی': 'Kordkuy',
  'بندر ترکمن': 'Bandar Torkaman',
  'آستارا': 'Astara',
  'تالش': 'Talesh',
  'صومعه‌سرا': 'Someh Sara',
  'صومعه سرا': 'Someh Sara',
  'فومن': 'Fuman',
  'رودسر': 'Rudsar',
  'رودبار': 'Rudbar',
  'ماسال': 'Masal',
  'ایلام': 'Ilam',
  'شهرکرد': 'Shahrekord',
  'یاسوج': 'Yasuj',
  'لندن': 'London',
  'برلین': 'Berlin',
  'پاریس': 'Paris',
  'استانبول': 'Istanbul',
  'نیویورک': 'New York',
  'توکیو': 'Tokyo',
  'دبی': 'Dubai',
  'آمستردام': 'Amsterdam',
  'رم': 'Rome',
  'مادرید': 'Madrid',
  'مسکو': 'Moscow',
}

function normalizeCityQuery(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function transliteratePersian(value: string): string {
  const chars: Record<string, string> = {
    'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j',
    'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
    'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': '', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'و': 'u', 'ه': 'h', 'ی': 'i', 'ء': '', 'ئ': 'y',
  }
  return [...value].map(char => chars[char] ?? char).join('').replace(/\s+/g, ' ').trim()
}

function getGeocodingQuery(query: string): string {
  const normalized = normalizeCityQuery(query)
  return PERSIAN_CITY_ALIASES[normalized] ?? transliteratePersian(normalized)
}

export async function searchCities(query: string, _language: 'fa' | 'en' = 'en'): Promise<City[]> {
  const normalizedQuery = normalizeCityQuery(query)
  if (normalizedQuery.length < 2) return []

  const geocodingQuery = getGeocodingQuery(normalizedQuery)
  if (geocodingQuery.length < 2) return []

  const params = new URLSearchParams({
    name: geocodingQuery,
    count: '15',
    language: 'en',
    format: 'json',
  })
  const response = await fetch(`${GEO_URL}?${params}`)
  if (!response.ok) throw new Error('CITY_SEARCH_FAILED')

  const data = await response.json()
  const results = Array.isArray(data.results) ? data.results : []

  return results
    .filter((item: any) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .map((item: any) => ({
      id: Number(item.id),
      name: String(item.name ?? geocodingQuery),
      country: String(item.country ?? ''),
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      country_code: item.country_code,
      timezone: item.timezone,
    }))
}

export async function fetchAirQuality(city: City): Promise<AirQualityResult> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide',
    hourly: 'us_aqi',
    forecast_hours: '24',
    timezone: 'auto',
  })
  const response = await fetch(`${AIR_URL}?${params}`)
  if (!response.ok) throw new Error('AIR_QUALITY_FAILED')
  const data = await response.json()
  const current = data.current ?? {}
  const times: string[] = data.hourly?.time ?? []
  const values: (number | null)[] = data.hourly?.us_aqi ?? []
  const currentTime = current.time as string | undefined
  const currentIndex = currentTime ? times.indexOf(currentTime) : -1
  const split = currentIndex >= 0 ? currentIndex : 0

  return {
    city,
    aqi: typeof current.us_aqi === 'number' ? current.us_aqi : null,
    updatedAt: current.time ?? new Date().toISOString(),
    pollutants: [
      { key: 'pm25', value: current.pm2_5 ?? null, unit: 'µg/m³' },
      { key: 'pm10', value: current.pm10 ?? null, unit: 'µg/m³' },
      { key: 'ozone', value: current.ozone ?? null, unit: 'µg/m³' },
      { key: 'no2', value: current.nitrogen_dioxide ?? null, unit: 'µg/m³' },
    ],
    trend: {
      labels: times.map((time: string) => time.slice(11, 16)),
      observed: values.map((value, index) => index <= split ? value : null),
      forecast: values.map((value, index) => index >= split ? value : null),
    },
    source: 'Open-Meteo · CAMS',
  }
}


export type HistoryPeriod = '24h' | '7d' | '30d'
export type HistoryMetric = 'us_aqi' | 'pm2_5' | 'pm10'

export type HistoricalAirQuality = {
  city: City
  period: HistoryPeriod
  time: string[]
  us_aqi: (number | null)[]
  pm2_5: (number | null)[]
  pm10: (number | null)[]
  timezone: string
  source: string
}

export async function fetchHistoricalAirQuality(
  city: City,
  period: HistoryPeriod,
  signal?: AbortSignal,
): Promise<HistoricalAirQuality> {
  // The Air Quality API supports up to 92 past days. Fetch only the requested
  // window and disable forecast values so the chart contains historical data.
  const pastDays = period === '24h' ? 2 : period === '7d' ? 7 : 30
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    hourly: 'us_aqi,pm2_5,pm10',
    past_days: String(pastDays),
    forecast_days: '0',
    timezone: 'auto',
  })
  const response = await fetch(`${AIR_URL}?${params}`, { signal })
  if (!response.ok) throw new Error('AIR_QUALITY_HISTORY_FAILED')
  const data = await response.json()
  const hourly = data.hourly ?? {}
  const allTimes: string[] = Array.isArray(hourly.time) ? hourly.time : []
  const now = Date.now()
  const windowHours = period === '24h' ? 24 : period === '7d' ? 24 * 7 : 24 * 30
  const start = now - windowHours * 60 * 60 * 1000
  const indices = allTimes
    .map((time, index) => ({ time, index, timestamp: new Date(time).getTime() }))
    .filter(item => Number.isFinite(item.timestamp) && item.timestamp >= start && item.timestamp <= now)
  const pick = (key: HistoryMetric) => {
    const values: (number | null)[] = Array.isArray(hourly[key]) ? hourly[key] : []
    return indices.map(({ index }) => {
      const value = values[index]
      return typeof value === 'number' && Number.isFinite(value) ? value : null
    })
  }

  if (!indices.length) throw new Error('AIR_QUALITY_HISTORY_EMPTY')

  return {
    city,
    period,
    time: indices.map(item => item.time),
    us_aqi: pick('us_aqi'),
    pm2_5: pick('pm2_5'),
    pm10: pick('pm10'),
    timezone: String(data.timezone ?? city.timezone ?? 'auto'),
    source: 'Open-Meteo · CAMS',
  }
}


export type ForecastMetric = 'us_aqi' | 'pm2_5' | 'pm10'

export type AirQualityForecast = {
  city: City
  time: string[]
  us_aqi: (number | null)[]
  pm2_5: (number | null)[]
  pm10: (number | null)[]
  timezone: string
  source: string
}

export async function fetchAirQualityForecast(
  city: City,
  signal?: AbortSignal,
): Promise<AirQualityForecast> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    hourly: 'us_aqi,pm2_5,pm10',
    forecast_hours: '120',
    timezone: 'auto',
  })
  const response = await fetch(`${AIR_URL}?${params}`, { signal })
  if (!response.ok) throw new Error('AIR_QUALITY_FORECAST_FAILED')

  const data = await response.json()
  const hourly = data.hourly ?? {}
  const allTimes: string[] = Array.isArray(hourly.time) ? hourly.time : []
  // forecast_hours starts at the current hour, avoiding past hours from today's midnight.
  const indices = allTimes.map((time, index) => ({ time, index }))

  const pick = (key: ForecastMetric) => {
    const values: (number | null)[] = Array.isArray(hourly[key]) ? hourly[key] : []
    return indices.map(({ index }) => {
      const value = values[index]
      return typeof value === 'number' && Number.isFinite(value) ? value : null
    })
  }

  if (!indices.length) throw new Error('AIR_QUALITY_FORECAST_EMPTY')

  return {
    city,
    time: indices.map(item => item.time),
    us_aqi: pick('us_aqi'),
    pm2_5: pick('pm2_5'),
    pm10: pick('pm10'),
    timezone: String(data.timezone ?? city.timezone ?? 'auto'),
    source: 'Open-Meteo · CAMS',
  }
}
