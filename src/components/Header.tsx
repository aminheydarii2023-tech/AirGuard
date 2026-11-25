import { useTranslation } from 'react-i18next'
import { Activity, Search, Sun, Moon, Languages, ChevronDown, LoaderCircle } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import type { City } from '../services/airQuality'

type Props = {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onCitySelect: (city: City) => void
  findCities: (query: string, language: 'fa' | 'en') => Promise<City[]>
  isCityLoading: boolean
}

type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error'

export default function Header({ theme, onThemeToggle, onCitySelect, findCities, isCityLoading }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const requestId = useRef(0)
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'

  const submitSearch = async (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (value.length < 2) return

    const currentRequest = ++requestId.current
    setSearchState('loading')
    setResults([])
    try {
      const found = await findCities(value, isFa ? 'fa' : 'en')
      if (currentRequest !== requestId.current) return
      setResults(found)
      setSearchState(found.length ? 'results' : 'empty')
    } catch {
      if (currentRequest !== requestId.current) return
      setResults([])
      setSearchState('error')
    }
  }

  const chooseCity = (city: City) => {
    requestId.current += 1
    onCitySelect(city)
    setQuery(`${city.name}, ${city.country}`.replace(/,\s*$/, ''))
    setResults([])
    setSearchState('idle')
  }

  const changeLanguage = () => {
    const next = isFa ? 'en' : 'fa'
    void i18n.changeLanguage(next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
  }

  const showDropdown = searchState !== 'idle'

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#overview" aria-label="AirGuard home">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.5} /></span>
          <span className="brand-name">AirGuard</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview">{t('nav.overview')}</a>
          <a className="nav-link" href="#air-map">{t('nav.map')}</a>
          <a className="nav-link" href="#compare">{t('nav.compare')}</a>
          <a className="nav-link" href="#forecast">{t('nav.forecast')}</a>
        </nav>

        <div className="header-actions">
          <div className="city-search-wrap">
            <form className="search-box" onSubmit={submitSearch} role="search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label={t('search')}
                placeholder={t('search')}
                value={query}
                onChange={event => { setQuery(event.target.value); setSearchState('idle'); setResults([]) }}
                onFocus={() => { if (searchState === 'empty' || searchState === 'error') setSearchState('idle') }}
                autoComplete="off"
              />
              <button type="submit" className="search-submit" disabled={query.trim().length < 2 || searchState === 'loading'} aria-label={t('searchAction')}>
                {searchState === 'loading' ? <LoaderCircle size={15} className="search-spinner" /> : '↵'}
              </button>
            </form>
            {showDropdown && <div className="city-results" role="status" aria-live="polite">
              {searchState === 'loading' && <p>{t('searching')}</p>}
              {searchState === 'empty' && <p>{t('cityNotFound')}</p>}
              {searchState === 'error' && <p>{t('searchFailed')}</p>}
              {searchState === 'results' && results.map(city => (
                <button type="button" key={`${city.id}-${city.latitude}-${city.longitude}`} onClick={() => chooseCity(city)} disabled={isCityLoading}>
                  <span>{city.name}</span><small>{city.country}{city.country_code ? ` · ${city.country_code}` : ''}</small>
                </button>
              ))}
            </div>}
          </div>
          <button className="icon-button language-button" onClick={changeLanguage} aria-label="Change language" title="Change language">
            <Languages size={17} /><span>{isFa ? 'FA' : 'EN'}</span><ChevronDown size={13} />
          </button>
          <button className="icon-button theme-button" onClick={onThemeToggle} aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')} title={theme === 'dark' ? t('themeLight') : t('themeDark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
