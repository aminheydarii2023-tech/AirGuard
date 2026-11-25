export type Pollutant = {
  key: 'pm25' | 'pm10' | 'ozone' | 'no2'
  value: number
  unit: string
  status: 'good' | 'moderate'
  change: string
}

export const dashboardData = {
  city: { en: 'Tehran', fa: 'تهران', countryEn: 'Iran', countryFa: 'ایران' },
  aqi: 42,
  updatedAt: '2026-11-21T18:40:00+03:30',
  provider: 'AirGuard Demo Feed',
  pollutants: [
    { key: 'pm25', value: 8.4, unit: 'µg/m³', status: 'good', change: '−12%' },
    { key: 'pm10', value: 19, unit: 'µg/m³', status: 'good', change: '−6%' },
    { key: 'ozone', value: 61, unit: 'µg/m³', status: 'moderate', change: '+4%' },
    { key: 'no2', value: 14, unit: 'µg/m³', status: 'good', change: '−3%' }
  ] satisfies Pollutant[],
  trend: {
    labels: ['00', '03', '06', '09', '12', '15', '18', '21', '00', '03', '06', '09', '12'],
    observed: [56, 51, 48, 43, 39, 42, 42, null, null, null, null, null, null],
    forecast: [null, null, null, null, null, null, 42, 39, 37, 41, 45, 48, 46]
  }
}
