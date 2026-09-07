import { ArrowRight, Megaphone } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { joinUsByLocale } from '@/data/join-us'
import type { Locale } from '@/i18n/config'

/**
 * 首页 · 招生 CTA
 *
 * 界面文案走 next-intl（messages/*.json）；招生对象与研究方向读取自
 * src/data/join-us，与 /join-us 页面保持同一份数据源。
 * 视觉风格与 HomeIntro 呼应：圆角卡片 + 主题色装饰光斑。
 */
export default async function HomeCta() {
  const t = await getTranslations('Home.Cta')
  const locale = (await getLocale()) as Locale
  const joinUs = joinUsByLocale[locale]

  return (
    <section aria-labelledby="cta-title" className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 text-center ring-1 ring-foreground/10 sm:p-10">
        {/* 装饰光斑：跟随主题色，深浅色模式均自然融合 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 -bottom-24 size-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium">
            <Megaphone aria-hidden="true" className="size-3.5" />
            {t('badge')}
          </Badge>

          <h2
            id="cta-title"
            className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
          >
            {t('title')}
          </h2>

          <p className="text-sm leading-7 text-muted-foreground sm:text-[15px]">
            {t('description')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {t('recruitLine', { target: joinUs.recruitTarget })}
            </Badge>
            {joinUs.researchAreas.map((area) => (
              <Badge key={area} variant="secondary" className="font-normal">
                {area}
              </Badge>
            ))}
          </div>

          <Button
            nativeButton={false}
            className="mt-1"
            render={
              <Link href="/join-us">
                {t('cta')}
                <ArrowRight aria-hidden="true" />
              </Link>
            }
          />
        </div>
      </div>
    </section>
  )
}
