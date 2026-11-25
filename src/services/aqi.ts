export type AqiLevel = 'good' | 'moderate' | 'unhealthySensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous'

export type AqiCategory = {
  level: AqiLevel
  color: string
  descriptionKey: string
}

/** US EPA AQI breakpoints. */
export function getAqiCategory(aqi: number | null | undefined): AqiCategory | null {
  if (aqi == null || !Number.isFinite(aqi) || aqi < 0) return null
  if (aqi <= 50) return { level: 'good', color: '#43d6a0', descriptionKey: 'aqiDescriptions.good' }
  if (aqi <= 100) return { level: 'moderate', color: '#e8b75d', descriptionKey: 'aqiDescriptions.moderate' }
  if (aqi <= 150) return { level: 'unhealthySensitive', color: '#f28b45', descriptionKey: 'aqiDescriptions.unhealthySensitive' }
  if (aqi <= 200) return { level: 'unhealthy', color: '#ef6475', descriptionKey: 'aqiDescriptions.unhealthy' }
  if (aqi <= 300) return { level: 'veryUnhealthy', color: '#a98be8', descriptionKey: 'aqiDescriptions.veryUnhealthy' }
  return { level: 'hazardous', color: '#b45a70', descriptionKey: 'aqiDescriptions.hazardous' }
}
