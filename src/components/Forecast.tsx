import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, LoaderCircle, Wind } from 'lucide-react'
import {
  fetchAirQualityForecast,
  type AirQualityForecast,
  type AirQualityResult,
  type ForecastMetric,
} from '../services/airQuality'

type Props = { data: AirQualityResult | null }
const WIDTH = 720
const HEIGHT = 250
const PAD = { top: 18, right: 18, bottom: 28, left: 42 }

function dateLabel(value: string, locale: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, options).format(date)
}

function average(values: (number | null)[]) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null
}

function maximum(values: (number | null)[]) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  return valid.length ? Math.max(...valid) : null
}

export default function Forecast({ data }: Props) {
  const { t, i18n } = useTranslation()
  const [metric, setMetric] = useState<ForecastMetric>('us_aqi')
  const [forecast, setForecast] = useState<AirQualityForecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US'

  useEffect(() => {
    if (!data?.city) {
      setForecast(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    setForecast(null)
    fetchAirQualityForecast(data.city, controller.signal)
      .then(result => setForecast(result))
      .catch(reason => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
          setForecast(null)
          setError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [data?.city.id, data?.city.latitude, data?.city.longitude])

  const values = forecast?.[metric] ?? []
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  const chartMax = Math.max(metric === 'us_aqi' ? 50 : 5, Math.ceil(Math.max(0, ...valid) / (metric === 'us_aqi' ? 50 : 5)) * (metric === 'us_aqi' ? 50 : 5))
  const path = useMemo(() => {
    if (!forecast || !values.length) return ''
    const plotWidth = WIDTH - PAD.left - PAD.right
    const plotHeight = HEIGHT - PAD.top - PAD.bottom
    let result = ''
    let drawing = false
    values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        drawing = false
        return
      }
      const x = PAD.left + (index / Math.max(values.length - 1, 1)) * plotWidth
      const y = PAD.top + plotHeight - (value / chartMax) * plotHeight
      result += `${drawing ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `
      drawing = true
    })
    return result
  }, [forecast, values, chartMax])

  const days = useMemo(() => {
    if (!forecast) return []
    const grouped = new Map<string, number[]>()
    forecast.time.forEach((time, index) => {
      const key = time.slice(0, 10)
      const indices = grouped.get(key) ?? []
      indices.push(index)
      grouped.set(key, indices)
    })
    return [...grouped.entries()].map(([date, indices]) => ({
      date,
      aqi: average(indices.map(index => forecast.us_aqi[index])),
      pm25: maximum(indices.map(index => forecast.pm2_5[index])),
      pm10: maximum(indices.map(index => forecast.pm10[index])),
    }))
  }, [forecast])

  const unit = metric === 'us_aqi' ? 'US AQI' : 'µg/m³'
  const metricTitle = metric === 'us_aqi' ? t('historyAqi') : metric === 'pm2_5' ? 'PM2.5' : 'PM10'
  const latest = valid[0]
  const peak = valid.length ? Math.max(...valid) : null

  return <section className="section-block forecast-section" id="forecast">
    <div className="section-heading">
      <div><h2>{t('forecastTitle')}</h2><p>{t('forecastSubtitle')}</p></div>
      <span className="forecast-source"><Wind size={13}/>{t('forecastModelData')}</span>
    </div>
    <div className="panel forecast-panel">
      <div className="forecast-topline">
        <div className="forecast-metrics" role="group" aria-label={t('historyMetric')}>
          {(['us_aqi', 'pm2_5', 'pm10'] as ForecastMetric[]).map(value =>
            <button type="button" key={value} className={metric === value ? 'active' : ''} onClick={() => setMetric(value)}>
              {value === 'us_aqi' ? 'AQI' : value === 'pm2_5' ? 'PM2.5' : 'PM10'}
            </button>
          )}
        </div>
        <div className="forecast-stat"><span>{t('forecastNextValue')}</span><strong>{latest == null ? '—' : latest.toFixed(metric === 'us_aqi' ? 0 : 1)} <small>{unit}</small></strong></div>
        <div className="forecast-stat"><span>{t('forecastPeak')}</span><strong>{peak == null ? '—' : peak.toFixed(metric === 'us_aqi' ? 0 : 1)} <small>{unit}</small></strong></div>
      </div>

      <div className="forecast-chart-wrap" dir="ltr">
        {loading ? <div className="forecast-state"><LoaderCircle size={18} className="search-spinner"/>{t('forecastLoading')}</div>
          : error ? <div className="forecast-state forecast-error"><AlertCircle size={18}/>{t('forecastError')}</div>
          : !forecast || !valid.length ? <div className="forecast-state">{t('forecastNoData')}</div>
          : <>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${metricTitle} ${t('forecastChartLabel')}`}>
              {[0, 1, 2, 3].map(index => {
                const y = PAD.top + (index / 3) * (HEIGHT - PAD.top - PAD.bottom)
                const value = chartMax - (index / 3) * chartMax
                return <g key={index}>
                  <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 5"/>
                  <text x={PAD.left - 9} y={y + 4} textAnchor="end" className="history-axis-label">{value.toFixed(metric === 'us_aqi' ? 0 : 1)}</text>
                </g>
              })}
              <path d={path} className="forecast-line"/>
            </svg>
            <div className="forecast-xlabels">
              <span>{dateLabel(forecast.time[0], locale, { weekday: 'short', hour: '2-digit' })}</span>
              <span>{dateLabel(forecast.time[Math.floor(forecast.time.length / 2)], locale, { weekday: 'short', hour: '2-digit' })}</span>
              <span>{dateLabel(forecast.time[forecast.time.length - 1], locale, { weekday: 'short', hour: '2-digit' })}</span>
            </div>
          </>}
      </div>

      {!loading && !error && days.length > 0 && <div className="forecast-days">
        {days.map(day => <article className="forecast-day" key={day.date}>
          <strong>{dateLabel(`${day.date}T12:00:00`, locale, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
          <div><span>{t('forecastDailyAqi')}</span><b>{day.aqi == null ? '—' : Math.round(day.aqi)}</b></div>
          <div><span>PM2.5 {t('forecastPeakLabel')}</span><b>{day.pm25 == null ? '—' : day.pm25.toFixed(1)}</b></div>
          <div><span>PM10 {t('forecastPeakLabel')}</span><b>{day.pm10 == null ? '—' : day.pm10.toFixed(1)}</b></div>
        </article>)}
      </div>}
      <p className="forecast-disclaimer">{t('forecastDisclaimer')}</p>
    </div>
  </section>
}
