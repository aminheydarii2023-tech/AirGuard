import { useTranslation } from 'react-i18next'
import { MapPin, Clock3, ExternalLink } from 'lucide-react'
import type { AirQualityResult } from '../services/airQuality'
import { getAqiCategory } from '../services/aqi'

type Props = { data: AirQualityResult | null; loading: boolean }
export default function AqiCard({ data, loading }: Props) {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const city = data?.city.name ?? (isFa ? 'تهران' : 'Tehran')
  const country = data?.city.country ?? (isFa ? 'ایران' : 'Iran')
  const aqi = data?.aqi
  const category = getAqiCategory(aqi)
  const status = category ? t(category.level) : '—'
  const date = data?.updatedAt ? new Date(data.updatedAt) : null

const timeOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
}

const cityTimezone = data?.city.timezone

if (cityTimezone && cityTimezone !== 'auto') {
  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: cityTimezone,
    })
    timeOptions.timeZone = cityTimezone
  } catch {
    // Use the device's local timezone if the city timezone is invalid.
  }
}

const time = date
  ? new Intl.DateTimeFormat(
      isFa ? 'fa-IR' : 'en-US',
      timeOptions
    ).format(date)
  : '—'
  return (
    <section className="aqi-card panel" id="overview">
      <div className="aqi-topline"><div className="location-block"><span className="eyebrow">{t('dashboard')}</span><h1>{city}<span className="location-divider">, </span>{country}</h1><div className="location-meta"><MapPin size={14} /><span>{t('city')}: {city}</span><span className="meta-dot">·</span><span>{country}</span></div></div><span className="live-pill"><span className="live-dot" />{loading ? t('loading') : t('modelData')}</span></div>
      <div className="aqi-main"><div className="aqi-score-wrap"><div className={`aqi-ring ${category ? `aqi-${category.level}` : ''}`}><div className="aqi-ring-inner"><span className="aqi-number">{loading ? '…' : aqi ?? '—'}</span><span className="aqi-unit">US AQI</span></div></div></div><div className="aqi-copy"><span className={`status-tag ${category ? `status-${category.level}` : ''}`}><span />{status}</span><h2>{t('aqiLabel')}</h2><p>{category ? t(category.descriptionKey) : t('noData')}</p><div className="aqi-scale"><div className="scale-track"><span className="scale-marker" style={{ left: `${Math.min((aqi ?? 0) / 500 * 100, 100)}%`, boxShadow: category ? `0 0 0 2px ${category.color}` : undefined }} /></div><div className="scale-labels"><span>{t('goodRange')}</span><span>{t('moderateRange')}</span></div></div></div></div>
      <div className="aqi-footer"><div className="data-meta"><Clock3 size={14} /><span>{t('updated')} · {time}</span></div><div className="data-meta"><span>{t('provider')}:</span><strong>Open-Meteo / CAMS</strong><ExternalLink size={12} /></div><span className="detail-link">{t('modelDisclaimer')}</span></div>
    </section>
  )
}
