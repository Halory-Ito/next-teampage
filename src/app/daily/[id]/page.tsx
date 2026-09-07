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

export default async function DailyBlockPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('Daily')
  const locale = (await getLocale()) as Locale
  const block = getBlocks(locale).find((b) => b.id === id)
  if (!block) notFound()

  const galleries = getBlockGalleries(locale, id)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('backToAllBlocks')}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center">
            <h1 className="font-heading text-2xl font-medium">{block.name}</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('galleryCount', { count: galleries.length })}
          </span>
        </div>
        {block.description && block.description !== block.name && (
          <p className="text-sm text-muted-foreground">{block.description}</p>
        )}
      </header>

      <DailyGalleryGrid galleries={galleries} />
    </div>
  )
}
