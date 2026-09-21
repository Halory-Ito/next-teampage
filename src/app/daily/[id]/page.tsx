import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getBlockGalleries, getBlocks } from '@/data/daily'
import DailyGalleryGrid from '@/features/daily/components/daily-gallery-grid'
import type { Locale } from '@/i18n/config'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const t = await getTranslations('Daily')
  const locale = (await getLocale()) as Locale
  const block = getBlocks(locale).find((b) => b.id === id)
  return {
    title: block ? block.name : t('titleFallback'),
  }
}

/** 相册日期跨度：最早 – 最晚；只有一个日期时不显示区间 */
function formatDateRange(dates: string[]): string {
  const sorted = dates.filter(Boolean).sort()
  if (sorted.length === 0) return ''
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return first === last ? first : `${first} – ${last}`
}

export default async function DailyBlockPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('Daily')
  const locale = (await getLocale()) as Locale
  const block = getBlocks(locale).find((b) => b.id === id)
  if (!block) notFound()

  const galleries = getBlockGalleries(locale, id)

  // 极简元信息行：日期跨度 · 相册数量
  const meta = [
    formatDateRange(galleries.map((g) => g.date)),
    t('galleryCount', { count: galleries.length }),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:gap-12">
      <header className="flex flex-col gap-6 border-b border-border/60 pb-6">
        <Link
          href="/daily"
          className="group inline-flex w-fit items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          {t('backToAllBlocks')}
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {block.name}
          </h1>
          {block.description && block.description !== block.name && (
            <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
              {block.description}
            </p>
          )}
        </div>

        {meta && (
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
            {meta}
          </p>
        )}
      </header>

      <DailyGalleryGrid galleries={galleries} />
    </div>
  )
}
