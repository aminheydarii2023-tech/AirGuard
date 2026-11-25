import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { LoaderCircle, MapPin, Search, LocateFixed } from 'lucide-react'
import { fetchAirQuality, type AirQualityResult, type City } from '../services/airQuality'
import 'leaflet/dist/leaflet.css'

type Props = {
  onCitySelect: (city: City) => void
  selectedCity: City
  findCities: (query: string, language: 'fa' | 'en') => Promise<City[]>
}
const CITIES: City[] = [
  { id: 112931, name: 'Tehran', country: 'Iran', latitude: 35.6944, longitude: 51.4215 },
  { id: 118743, name: 'Mashhad', country: 'Iran', latitude: 36.2972, longitude: 59.6067 },
  { id: 117571, name: 'Isfahan', country: 'Iran', latitude: 32.6546, longitude: 51.668 },
  { id: 115019, name: 'Shiraz', country: 'Iran', latitude: 29.5918, longitude: 52.5837 },
  { id: 116401, name: 'Tabriz', country: 'Iran', latitude: 38.08, longitude: 46.2919 },
  { id: 745044, name: 'Istanbul', country: 'Türkiye', latitude: 41.0082, longitude: 28.9784 },
  { id: 2643743, name: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  { id: 2950159, name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { id: 5128581, name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
]
const colorFor = (v: number | null) => v === null ? '#94a3b8' : v <= 50 ? '#16a36a' : v <= 100 ? '#d6a321' : v <= 150 ? '#e47b32' : v <= 200 ? '#dc4545' : v <= 300 ? '#8b5bc2' : '#7e2638'
function ResizeMap() {
  const map = useMap()
  useEffect(() => { const timer = window.setTimeout(() => map.invalidateSize(), 120); return () => window.clearTimeout(timer) }, [map])
  return null
}
function FlyToSelected({ city, focusToken }: { city: City; focusToken: number }) {
  const map = useMap()
  const previousKey = useRef<string>('')
  const previousFocusToken = useRef(focusToken)
  useEffect(() => {
    const key = `${city.id}:${city.latitude}:${city.longitude}`
    const cityChanged = previousKey.current !== key
    const recenterRequested = previousFocusToken.current !== focusToken
    if (!cityChanged && !recenterRequested) return

    previousKey.current = key
    previousFocusToken.current = focusToken

    // Use a fixed city-level zoom so every selected city gets the same framing,
    // regardless of the map's previous zoom or pan position.
    map.flyTo([city.latitude, city.longitude], 8, { duration: 1.15 })
  }, [city, focusToken, map])
  return null
}
function MapDoubleClick({ onDoubleClick }: { onDoubleClick: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    dblclick(event) {
      onDoubleClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

async function reverseGeocodeCity(latitude: number, longitude: number, language: 'fa' | 'en'): Promise<City> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '10',
    addressdetails: '1',
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { 'Accept-Language': language === 'fa' ? 'fa,en' : 'en' },
  })
  if (!response.ok) throw new Error('REVERSE_GEOCODING_FAILED')
  const data = await response.json()
  const address = data.address ?? {}
  const name = address.city || address.town || address.village || address.municipality || address.county || address.state
  if (!name || !address.country) throw new Error('CITY_NOT_FOUND')

  const resultLatitude = Number(data.lat)
  const resultLongitude = Number(data.lon)
  if (!Number.isFinite(resultLatitude) || !Number.isFinite(resultLongitude)) throw new Error('INVALID_LOCATION')

  // Keep reverse-geocoded IDs negative to avoid collisions with Open-Meteo city IDs.
  const osmId = Number(data.osm_id)
  const fallbackId = Math.round(Math.abs(resultLatitude * 100000) + Math.abs(resultLongitude * 1000))
  return {
    id: -(Number.isFinite(osmId) && osmId > 0 ? osmId : fallbackId),
    name: String(name),
    country: String(address.country),
    latitude: resultLatitude,
    longitude: resultLongitude,
    country_code: typeof address.country_code === 'string' ? address.country_code.toUpperCase() : undefined,
  }
}

export default function AirQualityMap({ onCitySelect, selectedCity, findCities }: Props) {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<AirQualityResult[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [mapActionMessage, setMapActionMessage] = useState('')
  const [mapActionLoading, setMapActionLoading] = useState(false)
  const mapActionInFlight = useRef(false)
  const lastReverseRequestAt = useRef(0)
  const requestId = useRef(0)
  const isFa = i18n.language === 'fa'

  useEffect(() => {
    let active = true
    Promise.allSettled(CITIES.map(city => fetchAirQuality(city))).then(outcomes => {
      if (!active) return
      const good = outcomes.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
      setItems(good)
      setFailed(good.length === 0)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const localizedName = (city: City) => {
    if (!isFa) return city.name
    const names: Record<string, string> = { Tehran: 'تهران', Mashhad: 'مشهد', Isfahan: 'اصفهان', Shiraz: 'شیراز', Tabriz: 'تبریز', Istanbul: 'استانبول', London: 'لندن', Berlin: 'برلین', 'New York': 'نیویورک' }
    return names[city.name] ?? city.name
  }
  const submitSearch = async (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (value.length < 2) return
    const id = ++requestId.current
    setSearching(true); setSearchMessage(''); setResults([])
    try {
      const found = await findCities(value, isFa ? 'fa' : 'en')
      if (id !== requestId.current) return
      setResults(found)
      if (!found.length) setSearchMessage(t('mapSearchEmpty'))
    } catch {
      if (id === requestId.current) setSearchMessage(t('mapSearchError'))
    } finally {
      if (id === requestId.current) setSearching(false)
    }
  }
  const chooseSearchResult = async (city: City) => {
    setAddingId(city.id); setSearchMessage(''); setResults([]); setQuery(`${localizedName(city)}, ${city.country}`)
    try {
      const data = await fetchAirQuality(city)
      setItems(current => [data, ...current.filter(item => item.city.id !== city.id)])
      onCitySelect(city)
    } catch {
      setSearchMessage(t('mapCityLoadError'))
    } finally { setAddingId(null) }
  }

  const handleMapDoubleClick = async (latitude: number, longitude: number) => {
    if (mapActionInFlight.current || addingId !== null) return
    const now = Date.now()
    if (now - lastReverseRequestAt.current < 1100) {
      setMapActionMessage(t('mapWaitBeforeNextClick'))
      return
    }
    mapActionInFlight.current = true
    lastReverseRequestAt.current = now
    setMapActionLoading(true)
    setMapActionMessage(t('mapIdentifyingCity'))
    try {
      const city = await reverseGeocodeCity(latitude, longitude, isFa ? 'fa' : 'en')
      setMapActionMessage(t('mapLoadingCity'))
      const data = await fetchAirQuality(city)
      setItems(current => [data, ...current.filter(item => item.city.id !== city.id)])
      setQuery(`${localizedName(city)}, ${city.country}`)
      setResults([])
      setSearchMessage('')
      onCitySelect(city)
      setMapActionMessage(t('mapCitySelected', { city: localizedName(city) }))
    } catch (error) {
      setMapActionMessage(error instanceof Error && error.message === 'CITY_NOT_FOUND' ? t('mapNoCityAtPoint') : t('mapReverseError'))
    } finally {
      mapActionInFlight.current = false
      setMapActionLoading(false)
    }
  }

  return <section className="section-block map-section" id="air-map">
    <div className="section-heading"><div><h2>{t('mapTitle')}</h2><p>{t('mapDescription')}</p></div><span className="section-kicker">{loading ? t('loading') : `${items.length} ${t('mapCitiesShown')}`}</span></div>
    <div className="panel map-panel map-panel-light">
      <div className="map-toolbar">
        <form className="map-search" onSubmit={submitSearch} role="search">
          <Search size={17}/>
          <input value={query} onChange={event => { setQuery(event.target.value); setResults([]); setSearchMessage('') }} placeholder={t('mapSearchPlaceholder')} aria-label={t('mapSearchPlaceholder')} autoComplete="off" />
          <button type="submit" disabled={query.trim().length < 2 || searching || addingId !== null} aria-label={t('searchAction')}>{searching ? <LoaderCircle size={16} className="search-spinner"/> : t('searchAction')}</button>
        </form>
        <button type="button" className="map-current-city" onClick={() => setFocusToken(value => value + 1)} title={t('mapCurrentCity')}><LocateFixed size={15}/><span>{localizedName(selectedCity)}</span></button>
        {(searching || results.length > 0 || searchMessage) && <div className="map-search-results">
          {searching && <p><LoaderCircle size={14} className="search-spinner"/> {t('searching')}</p>}
          {searchMessage && <p>{searchMessage}</p>}
          {results.map(city => <button type="button" key={`${city.id}-${city.latitude}`} onClick={() => void chooseSearchResult(city)} disabled={addingId !== null}>
            <MapPin size={15}/><span>{localizedName(city)}</span><small>{city.country}</small>
          </button>)}
          {addingId !== null && <p><LoaderCircle size={14} className="search-spinner"/> {t('mapLoadingCity')}</p>}
        </div>}
      </div>
      <div className="map-legend map-legend-light"><span><i style={{background:'#16a36a'}}/>0–50</span><span><i style={{background:'#d6a321'}}/>51–100</span><span><i style={{background:'#e47b32'}}/>101–150</span><span><i style={{background:'#dc4545'}}/>151–200</span><span><i style={{background:'#8b5bc2'}}/>201+</span></div>
      <MapContainer center={[35, 38]} zoom={3} minZoom={2} scrollWheelZoom doubleClickZoom={false} className="air-leaflet-map air-leaflet-map-light">
        <ResizeMap/><FlyToSelected city={selectedCity} focusToken={focusToken}/><MapDoubleClick onDoubleClick={(latitude, longitude) => void handleMapDoubleClick(latitude, longitude)}/>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {items.map(item => <CircleMarker key={`${item.city.id}-${item.city.latitude}`} center={[item.city.latitude,item.city.longitude]} radius={Math.max(8,Math.min(15,7+(item.aqi??0)/45))} pathOptions={{color:'#ffffff',fillColor:colorFor(item.aqi),fillOpacity:.9,weight:2.5}}>
          <Popup><div className="map-popup"><strong>{localizedName(item.city)}, {item.city.country}</strong><span>{t('aqiLabel')}: <b>{item.aqi ?? '—'}</b></span><small>{t('modelEstimate')} · Open-Meteo / CAMS</small><button type="button" onClick={() => onCitySelect(item.city)}>{t('viewCity')}</button></div></Popup>
        </CircleMarker>)}
      </MapContainer>
      {mapActionMessage && <div className={`map-action-status${mapActionLoading ? ' is-loading' : ''}`} role="status">{mapActionLoading && <LoaderCircle size={14} className="search-spinner"/>}{mapActionMessage}</div>}
      {loading && <div className="map-status map-status-light">{t('mapLoading')}</div>}
      {!loading && failed && <div className="map-status map-status-light">{t('mapError')}</div>}
      {!loading && !failed && items.length < CITIES.length && <div className="map-note">{t('mapPartial')}</div>}
    </div>
    <p className="map-disclaimer">{t('modelDisclaimer')} {t('mapClickHint')}</p>
  </section>
}
