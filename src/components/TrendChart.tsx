import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoaderCircle, AlertCircle } from 'lucide-react'
import {
  fetchHistoricalAirQuality,
  type AirQualityResult,
  type HistoricalAirQuality,
  type HistoryMetric,
  type HistoryPeriod,
} from '../services/airQuality'

type Props = { data: AirQualityResult | null }
const WIDTH = 720
const HEIGHT = 250
const PAD = { top: 16, right: 18, bottom: 30, left: 42 }

function formatTime(value: string, locale: string, period: HistoryPeriod) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, period === '24h'
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric' }).format(date)
}

export default function TrendChart({ data }: Props) {
  const { t, i18n } = useTranslation()
  const [period, setPeriod] = useState<HistoryPeriod>('24h')
  const [metric, setMetric] = useState<HistoryMetric>('us_aqi')
  const [history, setHistory] = useState<HistoricalAirQuality | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!data?.city) {
      setHistory(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    setHistory(null)
    fetchHistoricalAirQuality(data.city, period, controller.signal)
      .then(result => setHistory(result))
      .catch(reason => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
          setHistory(null)
          setError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [data?.city.id, data?.city.latitude, data?.city.longitude, period])

  const values = history?.[metric] ?? []
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  const maxValue = Math.max(10, ...valid)
  const chartMax = Math.ceil(maxValue / (metric === 'us_aqi' ? 50 : 5)) * (metric === 'us_aqi' ? 50 : 5)
  const points = useMemo(() => {
    if (!history || !values.length) return ''
    const plotWidth = WIDTH - PAD.left - PAD.right
    const plotHeight = HEIGHT - PAD.top - PAD.bottom
    let path = ''
    let drawing = false
    values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        drawing = false
        return
      }
      const x = PAD.left + (index / Math.max(values.length - 1, 1)) * plotWidth
      const y = PAD.top + plotHeight - (value / chartMax) * plotHeight
      path += `${drawing ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `
      drawing = true
    })
    return path
  }, [history, values, chartMax])

  const labels = history?.time ?? []
  const latest = [...values].reverse().find((value): value is number => value !== null && Number.isFinite(value))
  const average = valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null
  const unit = metric === 'us_aqi' ? 'US AQI' : 'µg/m³'
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US'
  const metricName = metric === 'us_aqi' ? t('historyAqi') : metric === 'pm2_5' ? 'PM2.5' : 'PM10'

  return <section className="trend-card panel history-card">
    <div className="section-heading trend-heading">
      <div><h2>{t('trend')}</h2><p>{t('historySubtitle')}</p></div>
      <span className="period-select">{t('historyModelData')}</span>
    </div>
    <div className="history-controls">
      <div className="history-periods" role="group" aria-label={t('historyPeriod')}>
        {(['24h', '7d', '30d'] as HistoryPeriod[]).map(value =>
          <button type="button" key={value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>
            {t(value === '24h' ? 'history24h' : value === '7d' ? 'history7d' : 'history30d')}
          </button>
        )}
      </div>
      <div className="history-metrics" role="group" aria-label={t('historyMetric')}>
        {(['us_aqi', 'pm2_5', 'pm10'] as HistoryMetric[]).map(value =>
          <button type="button" key={value} className={metric === value ? 'active' : ''} onClick={() => setMetric(value)}>
            {value === 'us_aqi' ? 'AQI' : value === 'pm2_5' ? 'PM2.5' : 'PM10'}
          </button>
        )}
      </div>
    </div>
    <div className="history-summary">
      <div><span>{t('historyLatest')}</span><strong>{latest == null ? '—' : latest.toFixed(metric === 'us_aqi' ? 0 : 1)} <small>{unit}</small></strong></div>
      <div><span>{t('historyAverage')}</span><strong>{average == null ? '—' : average.toFixed(metric === 'us_aqi' ? 0 : 1)} <small>{unit}</small></strong></div>
      <div><span>{t('historySamples')}</span><strong>{valid.length.toLocaleString(locale)}</strong></div>
    </div>
    <div className="history-chart-wrap" dir="ltr">
      {loading ? <div className="history-state"><LoaderCircle size={19} className="search-spinner"/>{t('historyLoading')}</div>
        : error ? <div className="history-state history-error"><AlertCircle size={18}/>{t('historyError')}</div>
        : !valid.length ? <div className="history-state">{t('historyNoData')}</div>
        : <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${metricName} ${t('historyChartLabel')}`}>
          {[0, .25, .5, .75, 1].map((fraction, index) => {
            const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * fraction
            return <g key={index}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className="grid-line"/>
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" className="history-axis-label">{Math.round(chartMax * (1 - fraction))}</text>
            </g>
          })}
          <path d={points} className="history-line"/>
        </svg>}
    </div>
    {labels.length > 1 && <div className="history-xlabels" dir="ltr">
      <span>{formatTime(labels[0], locale, period)}</span>
      <span>{formatTime(labels[Math.floor(labels.length / 2)], locale, period)}</span>
      <span>{formatTime(labels[labels.length - 1], locale, period)}</span>
    </div>}
    <div className="chart-footnote"><span>{t('historyDisclaimer')}</span></div>
  </section>
}
