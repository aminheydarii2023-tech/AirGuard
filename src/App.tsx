import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Activity, RefreshCw } from 'lucide-react'
import Header from './components/Header'
import AqiCard from './components/AqiCard'
import PollutantGrid from './components/PollutantGrid'
import TrendChart from './components/TrendChart'
import Forecast from './components/Forecast'
import HealthPanel from './components/HealthPanel'
import ExploreCards from './components/ExploreCards'
import AirQualityMap from './components/AirQualityMap'
import CityComparison from './components/CityComparison'
import { useAirQuality } from './hooks/useAirQuality'
import type { City } from './services/airQuality'

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const air = useAirQuality()
  const handleMapCitySelect = (city: City) => {
    void air.selectCity(city)
    window.requestAnimationFrame(() => {
      document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = isFa ? 'fa' : 'en'; document.documentElement.dir = isFa ? 'rtl' : 'ltr' }, [theme, isFa])
  return <div className="app-shell">
    <Header theme={theme} onThemeToggle={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} onCitySelect={air.selectCity} findCities={air.findCities} isCityLoading={air.loading} />
    <main className="dashboard">
      <div className="page-intro"><div><div className="breadcrumb"><span>AirGuard</span><span>/</span><strong>{t('nav.overview')}</strong></div><p>{t('subtitle')}</p></div><span className="demo-label"><span />{t('modelData')}</span></div>
      {air.error && <div className="demo-banner"><Info size={15}/><span>{t('loadError')}</span><button onClick={air.retry}><RefreshCw size={14}/>{t('retry')}</button></div>}
      <AqiCard data={air.data} loading={air.loading}/>
      <PollutantGrid data={air.data} loading={air.loading}/>
      <div className="content-grid"><TrendChart data={air.data}/><HealthPanel aqi={air.data?.aqi} loading={air.loading}/></div>
      <div className="demo-banner"><Info size={15}/><span>{t('modelDisclaimer')}</span></div>
      <Forecast data={air.data}/>
      <AirQualityMap onCitySelect={handleMapCitySelect} selectedCity={air.city} findCities={air.findCities}/>
      <CityComparison findCities={air.findCities}/>
      <ExploreCards/>
      <footer className="footer"><a className="footer-brand" href="#"><Activity size={16}/> AirGuard</a><span>{t('footer')}</span><span>© 2026 AirGuard</span></footer>
    </main>
  </div>
}
