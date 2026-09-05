'use client'

import {
  Building2,
  FileText,
  FlaskConical,
  GraduationCap,
  Newspaper,
  School,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import CountUp from '@/components/CountUp'
import { Card, CardContent } from '@/components/ui/card'
import { getHomeStats, getNewsYearRange, type HomeStatKey } from '@/features/home/lib/home-stats'

import SectionHeading from './section-heading'

/**
 * 首页 · 数据展示
 *
 * 界面文案走 next-intl（messages/*.json），统计项由 getHomeStats() 从 src/data 现算
 * （详见 features/home/lib/home-stats.ts），组件不含任何写死的数字或文案；
 * 数值滚动由 CountUp 组件驱动，可自动适配深浅色主题。
 */

const STAT_ITEMS: { key: HomeStatKey; icon: LucideIcon }[] = [
  { key: 'students', icon: Users },
  { key: 'teachers', icon: GraduationCap },
  { key: 'furtherStudy', icon: School },
  { key: 'bigTech', icon: Building2 },
  { key: 'papers', icon: FileText },
  { key: 'reports', icon: Newspaper },
  { key: 'awards', icon: Trophy },
  { key: 'projects', icon: FlaskConical },
]

export default function HomeStats() {
  const t = useTranslations('Home.Stats')
  const stats = getHomeStats()
  const range = getNewsYearRange()

  return (
    <section aria-labelledby="stats-title" className="flex w-full flex-col gap-8">
      <SectionHeading
        id="stats"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {STAT_ITEMS.map((item, index) => {
          const label = t(`items.${item.key}.label`)
          const unit = t(`items.${item.key}.unit`)
          return (
            <Card key={item.key} className="h-full transition-shadow duration-300 hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-1 p-4 sm:p-5">
                <item.icon aria-hidden="true" className="size-5 text-muted-foreground" />
                <div className="mt-2 flex items-baseline gap-1">
                  <CountUp
                    to={stats[item.key]}
                    delay={index * 0.08}
                    duration={1.4}
                    separator=","
                    className="font-heading text-3xl font-semibold tracking-tight tabular-nums"
                  />
                  {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {range ? (
        <p className="text-center text-xs text-muted-foreground">
          {t('dataSource', { from: range.from, to: range.to })}
        </p>
      ) : null}
    </section>
  )
}
