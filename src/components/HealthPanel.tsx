import { useTranslation } from 'react-i18next'
import { HeartPulse, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { getAqiCategory } from '../services/aqi'

type Props = { aqi: number | null | undefined; loading: boolean }

export default function HealthPanel({ aqi, loading }: Props) {
  const { t } = useTranslation()
  const category = getAqiCategory(aqi)
  const advice = category ? `healthAdvice.${category.level}` : 'healthAdvice.unavailable'
  return (
    <section className="health-card panel">
      <div className="section-heading"><div><h2>{t('health')}</h2><p>{t('healthSub')}</p></div><span className="health-icon"><HeartPulse size={18} /></span></div>
      <div className="health-message">
        <span className="health-symbol"><ShieldCheck size={18} /></span>
        <div><h3>{loading ? t('loading') : t(`${advice}.title`)}</h3><p>{t(`${advice}.text`)}</p></div>
      </div>
      <div className="sensitive-message">
        <div className="sensitive-bar" />
        <div><span className="sensitive-label">{t('sensitiveTitle')}</span><p>{t(`${advice}.sensitive`)}</p></div>
      </div>
      <a className="health-more" href="#health">{t('health')} <ArrowUpRight size={14} /></a>
    </section>
  )
}
