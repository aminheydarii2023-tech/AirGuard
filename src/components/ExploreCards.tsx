import { useTranslation } from 'react-i18next'
import { Map, GitCompareArrows, ArrowUpRight } from 'lucide-react'

export default function ExploreCards() {
  const { t } = useTranslation()
  return (
    <section className="explore-grid" id="explore">
      <a className="explore-card panel" href="#air-map">
        <span className="explore-icon map-icon"><Map size={19} /></span>
        <div><h3>{t('mapTitle')}</h3><p>{t('mapText')}</p></div>
        <ArrowUpRight className="explore-arrow" size={17} />
      </a>
      <a className="explore-card panel" href="#compare">
        <span className="explore-icon compare-icon"><GitCompareArrows size={19} /></span>
        <div><h3>{t('compareTitle')}</h3><p>{t('compareText')}</p></div>
        <ArrowUpRight className="explore-arrow" size={17} />
      </a>
    </section>
  )
}
