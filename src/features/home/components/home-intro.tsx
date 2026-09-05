import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { teachers } from '@/data/team/teachers'

/**
 * 首页 · 基本介绍
 *
 * 界面文案走 next-intl（messages/*.json），负责人信息（姓名 / 职称 / 头像）
 * 读取自 src/data/team/teachers。
 */
const PARAGRAPH_KEYS = ['p1', 'p2'] as const

export default async function HomeIntro() {
  const t = await getTranslations('Home.Intro')
  const leader = teachers[0]
  if (!leader) return null

  const highlights = t.raw('highlights') as string[]

  return (
    <section aria-labelledby="intro-title" className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 ring-1 ring-foreground/10 sm:p-10">
        {/* 装饰光斑：跟随主题色，深浅色模式均自然融合 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-center">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {t('badge')}
            </Badge>

            <h1
              id="intro-title"
              className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {t('title')}
            </h1>

            <div className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
              {PARAGRAPH_KEYS.map((key) => (
                <p key={key}>
                  {t(`paragraphs.${key}`, { name: leader.name, career: leader.career ?? '' })}
                </p>
              ))}
            </div>

            <ul className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                nativeButton={false}
                render={
                  <Link href="/team">
                    {t('ctaTeam')}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                }
              />
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href="/news">{t('ctaNews')}</Link>}
              />
            </div>
          </div>

          {/* 负责人卡片 */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted ring-1 ring-foreground/10">
              <Image
                src={leader.avatarUrl}
                alt={leader.name}
                fill
                sizes="(max-width: 1024px) 50vw, 300px"
                className="object-cover object-top transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative z-10 mx-4 -mt-10 rounded-2xl bg-card/90 p-4 shadow-lg ring-1 ring-foreground/10 backdrop-blur-md">
              <p className="font-heading text-lg font-semibold tracking-tight">
                {leader.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {leader.nameEn}
                </span>
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {leader.career}
                </Badge>
                <span>{t('leaderLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
