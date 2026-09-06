'use client'
import { useLocale } from 'next-intl'

import ChromaGrid, { ChromaItem } from '@/components/ChromaGrid'
import { getBlocks } from '@/data/daily'
import type { Locale } from '@/i18n/config'

export default function DailyPage() {
  // 按当前语言取板块数据（useLocale() 为运行时语言，切换语言后自动更新）
  const blocks = getBlocks(useLocale() as Locale)

  const items: ChromaItem[] = blocks.map((block) => ({
    image: block.cover,
    title: block.name,
    borderColor: '',
    gradient: '',
    url: `/daily/${block.id}`,
    subtitle: block.description,
  }))
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl items-center justify-center">
      <ChromaGrid items={items} radius={300} damping={0.45} fadeOut={0.6} ease="power3.out" />
    </div>
  )
}
