import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, X, LoaderCircle, RefreshCw, GitCompareArrows } from 'lucide-react'
import { fetchAirQuality, type AirQualityResult, type City } from '../services/airQuality'
import { getAqiCategory } from '../services/aqi'

type Props = { findCities: (query: string, language: 'fa' | 'en') => Promise<City[]> }

export default function CityComparison({ findCities }: Props) {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [items, setItems] = useState<AirQualityResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingCity, setLoadingCity] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const requestId = useRef(0)

  const cityKey = (city: City) => `${city.id}:${city.latitude}:${city.longitude}`
  const localizedName = (name: string) => {
    if (!isFa) return name
    const names: Record<string, string> = {
      Tehran: 'تهران', Mashhad: 'مشهد', Isfahan: 'اصفهان', Shiraz: 'شیراز', Tabriz: 'تبریز',
      Qeshm: 'قشم', Kish: 'کیش', Lahijan: 'لاهیجان', Rasht: 'رشت', London: 'لندن', Berlin: 'برلین',
      Istanbul: 'استانبول', 'New York': 'نیویورک', Paris: 'پاریس', Dubai: 'دبی',
    }
    return names[name] ?? name
  }

  const submitSearch = async (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (value.length < 2 || items.length >= 4) return
    const id = ++requestId.current
    setSearching(true); setMessage(''); setResults([])
    try {
      const found = await findCities(value, isFa ? 'fa' : 'en')
      if (id !== requestId.current) return
      const available = found.filter(city => !items.some(item => cityKey(item.city) === cityKey(city)))
      setResults(available)
      if (!available.length) setMessage(found.length ? t('compareDuplicate') : t('cityNotFound'))
    } catch {
      if (id === requestId.current) setMessage(t('searchFailed'))
    } finally {
      if (id === requestId.current) setSearching(false)
    }
  }

  const addCity = async (city: City) => {
    const key = cityKey(city)
    if (items.length >= 4 || items.some(item => cityKey(item.city) === key)) return
    setLoadingCity(key); setMessage(''); setResults([])
    try {
      const data = await fetchAirQuality(city)
      setItems(current => current.length >= 4 || current.some(item => cityKey(item.city) === key) ? current : [...current, data])
      setQuery('')
    } catch {
      setMessage(t('compareLoadError'))
    } finally { setLoadingCity(null) }
  }

  const refresh = async () => {
    if (!items.length || refreshing) return
    setRefreshing(true); setMessage('')
    const updated = await Promise.all(items.map(async item => {
      try { return await fetchAirQuality(item.city) } catch { return item }
    }))
    setItems(updated)
    setRefreshing(false)
  }

  return <section className="section-block compare-section" id="compare">
    <div className="section-heading">
      <div><h2>{t('compareTitle')}</h2><p>{t('compareDescription')}</p></div>
      <button type="button" className="compare-refresh" onClick={() => void refresh()} disabled={!items.length || refreshing}>
        {refreshing ? <LoaderCircle size={14} className="search-spinner"/> : <RefreshCw size={14}/>} {t('compareRefresh')}
      </button>
    </div>
    <div className="panel compare-panel">
      <form className="compare-search" onSubmit={submitSearch}>
        <Search size={17}/>
        <input value={query} onChange={event => { setQuery(event.target.value); setResults([]); setMessage('') }} placeholder={t('compareSearchPlaceholder')} aria-label={t('compareSearchPlaceholder')} autoComplete="off" disabled={items.length >= 4}/>
        <button type="submit" disabled={query.trim().length < 2 || searching || items.length >= 4}>
          {searching ? <LoaderCircle size={15} className="search-spinner"/> : <><Plus size={15}/>{t('compareAdd')}</>}
        </button>
      </form>
      <div className="compare-helper">{t('compareLimit', { count: items.length })}</div>
      {(results.length > 0 || message || loadingCity) && <div className="compare-results">
        {results.map(city => <button type="button" key={cityKey(city)} onClick={() => void addCity(city)} disabled={loadingCity !== null}>
          <span><strong>{localizedName(city.name)}</strong><small>{city.country}</small></span><Plus size={16}/>
        </button>)}
        {loadingCity && <p><LoaderCircle size={14} className="search-spinner"/> {t('compareLoadingCity')}</p>}
        {message && <p>{message}</p>}
      </div>}
      {items.length === 0 ? <div className="compare-empty"><span className="compare-empty-icon"><GitCompareArrows size={22}/></span><strong>{t('compareEmptyTitle')}</strong><p>{t('compareEmptyText')}</p></div> : <>
        <div className="compare-grid">
          {items.map(item => {
            const category = getAqiCategory(item.aqi)
            const pm25 = item.pollutants.find(p => p.key === 'pm25')?.value
            const pm10 = item.pollutants.find(p => p.key === 'pm10')?.value
            return <article className="compare-city-card" key={cityKey(item.city)}>
              <button type="button" className="compare-remove" onClick={() => setItems(current => current.filter(value => cityKey(value.city) !== cityKey(item.city)))} aria-label={t('compareRemove')} title={t('compareRemove')}><X size={15}/></button>
              <div className="compare-city-name"><strong>{localizedName(item.city.name)}</strong><small>{item.city.country}</small></div>
              <div className="compare-aqi-row"><span className="compare-aqi-value" style={{ color: category?.color ?? 'var(--muted)' }}>{item.aqi ?? '—'}</span><span className="compare-aqi-meta"><small>US AQI</small><b>{category ? t(category.level) : t('noData')}</b></span></div>
              <div className="compare-bar"><span style={{ width: `${Math.min(100, Math.max(0, (item.aqi ?? 0) / 300 * 100))}%`, background: category?.color ?? 'var(--muted-2)' }}/></div>
              <div className="compare-pollutants"><span>PM2.5 <b>{pm25 == null ? '—' : `${pm25} µg/m³`}</b></span><span>PM10 <b>{pm10 == null ? '—' : `${pm10} µg/m³`}</b></span></div>
            </article>
          })}
        </div>
        <div className="compare-chart-block">
          <div className="compare-chart-title"><strong>{t('compareChartTitle')}</strong><small>{t('compareChartSub')}</small></div>
          {items.map(item => {
            const category = getAqiCategory(item.aqi)
            return <div className="compare-chart-row" key={cityKey(item.city)}><span>{localizedName(item.city.name)}</span><div className="compare-chart-track"><i style={{ width: `${Math.min(100, Math.max(0, (item.aqi ?? 0) / 300 * 100))}%`, background: category?.color ?? 'var(--muted-2)' }}/></div><b>{item.aqi ?? '—'}</b></div>
          })}
        </div>
      </>}
      <p className="compare-disclaimer">{t('modelDisclaimer')} {t('compareDisclaimer')}</p>
    </div>
  </section>
}
