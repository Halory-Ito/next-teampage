import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  FlaskConical,
  GraduationCap,
  Newspaper,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { newsByLocale } from '@/data/news'
import type { Locale } from '@/i18n/config'
import type { News } from '@/types/news'

import SectionHeading from './section-heading'

/**
 * 首页 · 最新动态
 *
 * 界面文案走 next-intl（messages/*.json）；动态内容读取自 src/data/news，
 * 排序规则与新闻页一致（置顶优先，其余按日期降序），仅取前 LATEST_COUNT 条。
 * 就业去向（career）类动态在首页折叠为一行摘要，完整表格见 /news。
 */

const TYPE_ICONS: Record<News['type'], LucideIcon> = {
  career: Briefcase,
  education: GraduationCap,
  paper: FileText,
  award: Award,
  report: Newspaper,
  course: BookOpen,
  recruit: UserPlus,
  project: FlaskConical,
}

const LATEST_COUNT = 4
/** 就业摘要里最多列出的签约单位数，超出部分用“等 / etc.”收尾 */
const MAX_COMPANIES = 3

export default async function HomeNews() {
  const t = await getTranslations('Home.News')
  const locale = (await getLocale()) as Locale
  const news = newsByLocale[locale]

  const latest = [...news]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.date.localeCompare(a.date)
    })
    .slice(0, LATEST_COUNT)

  if (latest.length === 0) return null

  const summarizeCareers = (careers: Exclude<News['event'], string>) => {
    const companies = [...new Set(careers.map((p) => p.signed).filter(Boolean))]
    const sep = locale === 'en' ? ', ' : '、'
    const names = companies.slice(0, MAX_COMPANIES).join(sep)
    return t('careerSummary', {
      count: careers.length,
      companies: names + (companies.length > MAX_COMPANIES ? t('careerMore') : ''),
    })
  }

  return (
    <section aria-labelledby="home-news-title" className="flex w-full flex-col gap-8">
      <SectionHeading
        id="news"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="flex flex-col gap-3">
        {latest.map((item, index) => {
          const Icon = TYPE_ICONS[item.type]
          const text =
            typeof item.event === 'string' ? item.event : summarizeCareers(item.event)
          return (
            <Card
              key={`${item.date}-${index}`}
              className="transition-shadow duration-300 hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                    {item.pinned ? t('pinned') : item.date}
                  </span>
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Icon aria-hidden="true" className="size-3.5" />
                    {t(`types.${item.type}`)}
                  </Badge>
                </div>
                <p className="min-w-0 text-sm leading-6 wrap-break-words">{text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          nativeButton={false}
          variant="outline"
          render={
            <Link href="/news">
              {t('viewAll')}
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        />
      </div>
    </section>
  )
}
