import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAirQuality, searchCities, type AirQualityResult, type City } from '../services/airQuality'

const TEHRAN: City = { id: 112931, name: 'Tehran', country: 'Iran', latitude: 35.6944, longitude: 51.4215, timezone: 'Asia/Tehran' }

function getInitialCity(): City {
  try {
    const saved = localStorage.getItem('airguard-city')
    if (!saved) return TEHRAN
    const parsed = JSON.parse(saved) as City
    if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number' && parsed.name) return parsed
  } catch {
    // Storage may be unavailable or contain invalid data; use the default city.
  }
  return TEHRAN
}

export function useAirQuality() {
  const [city, setCity] = useState<City>(getInitialCity)
  const [data, setData] = useState<AirQualityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const load = useCallback(async (selected: City) => {
    const requestId = ++requestSequence.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAirQuality(selected)
      if (requestId !== requestSequence.current) return
      setData(result)
      setCity(selected)
      try { localStorage.setItem('airguard-city', JSON.stringify(selected)) } catch {
        // The live data should still work when browser storage is disabled.
      }
    } catch {
      if (requestId === requestSequence.current) setError('LOAD_FAILED')
    } finally {
      if (requestId === requestSequence.current) setLoading(false)
    }
  }, [])

  useEffect(() => { void load(city) }, [load])

  const findCities = useCallback((query: string, language: 'fa' | 'en') => searchCities(query, language), [])
  return { city, data, loading, error, selectCity: load, findCities, retry: () => load(city) }
}
