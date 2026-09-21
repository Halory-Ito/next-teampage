'use client'
import { useLocale } from 'next-intl'

import AccordionGallery, { AccordionGalleryItem } from '@/components/AccordionGallery'
import { getBlocks } from '@/data/daily'
import type { Locale } from '@/i18n/config'

export default function DailyPage() {
  // 按当前语言取板块数据（useLocale() 为运行时语言，切换语言后自动更新）
  const blocks = getBlocks(useLocale() as Locale)

  const items: AccordionGalleryItem[] = blocks.map((block) => ({
    image: block.cover,
    label: block.name,
    link: `/daily/${block.id}`,
    alt: block.name,
  }))
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-6xl items-center justify-center px-4">
      <AccordionGallery
        items={items}
        defaultIndex={0}
        height={460}
        gap={10}
        radius={18}
        expandRatio={0.5}
        parallax={0.5}
        tilt={8}
        stagger={0.06}
        trigger="hover"
        showLabels
        grayscale
        mobileGrid
        className="max-w-6xl"
      />
    </div>
  )
}
