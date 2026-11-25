import { useTranslation } from 'react-i18next'
import { Wind, Cloud, Sun, Factory } from 'lucide-react'
import type { AirQualityResult } from '../services/airQuality'

const config = {
  pm25: { label: 'PM2.5', icon: Wind }, pm10: { label: 'PM10', icon: Cloud },
  ozone: { label: 'O₃', icon: Sun }, no2: { label: 'NO₂', icon: Factory },
} as const
export default function PollutantGrid({ data, loading }: { data: AirQualityResult | null; loading: boolean }) {
  const { t } = useTranslation()
  return <section className="section-block"><div className="section-heading"><div><h2>{t('pollutants')}</h2><p>{t('concentration')} · µg/m³</p></div><span className="section-kicker">{loading ? t('loading') : 'CAMS'}</span></div><div className="pollutant-grid">{(data?.pollutants ?? []).map(item => { const meta = config[item.key]; const Icon = meta.icon; return <article className="pollutant-card panel" key={item.key}><div className="pollutant-head"><span className={`pollutant-icon ${item.key}`}><Icon size={17} /></span><span className="pollutant-name">{meta.label}</span></div><div className="pollutant-value">{loading ? '…' : item.value == null ? '—' : Number(item.value.toFixed(1))}<span>{item.unit}</span></div><div className="pollutant-bottom"><span className="mini-status good">{t('modelEstimate')}</span><span className="pollutant-caption">{t('concentration')}</span></div><div className="pollutant-bar"><span style={{ width: `${Math.min((item.value ?? 0), 100)}%` }} /></div></article> })}</div></section>
}
