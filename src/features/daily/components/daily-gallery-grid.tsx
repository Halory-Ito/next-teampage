'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import MorphSlider from '@/components/MorphSlider'
import { Button } from '@/components/ui/button'
import type { DailyGallery } from '@/types/daily'

type DailyGalleryGridProps = {
  galleries: DailyGallery[]
}

/**
 * 相册卡片网格：点击某张卡片后，用全屏 MorphSlider 展示该相册内的全部图片。
 * MorphSlider 依赖 WebGL / gsap，仅在打开时挂载，关闭即销毁，避免常驻开销。
 */
export default function DailyGalleryGrid({ galleries }: DailyGalleryGridProps) {
  const t = useTranslations('Daily')
  const [active, setActive] = useState<DailyGallery | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  const open = useCallback((gallery: DailyGallery) => {
    lastFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setActive(gallery)
  }, [])

  const close = useCallback(() => setActive(null), [])

  // 打开时锁定页面滚动并支持 Esc 关闭；关闭后恢复滚动
  useEffect(() => {
    if (!active) return undefined
    const { body, documentElement } = document
    const prevBody = body.style.overflow
    const prevRoot = documentElement.style.overflow
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      body.style.overflow = prevBody
      documentElement.style.overflow = prevRoot
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, close])

  // 打开后把焦点交给 MorphSlider（左右方向键可用），关闭后还给触发卡片
  useEffect(() => {
    if (active) {
      const el = overlayRef.current?.querySelector<HTMLElement>('[aria-roledescription="carousel"]')
      el?.focus({ preventScroll: true })
      return
    }
    lastFocused.current?.focus({ preventScroll: true })
    lastFocused.current = null
  }, [active])

  // 传入 slider 的 items 引用需稳定，避免父组件重渲染导致 MorphEngine 重建
  const sliderItems = useMemo(
    () => active?.gallery.map((p) => ({ image: p.url, caption: p.name })) ?? [],
    [active],
  )

  if (galleries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{t('emptyAlbums')}</p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {galleries.map((g) => (
          <article
            key={`${g.name}-${g.date}`}
            role="button"
            tabIndex={0}
            aria-label={t('openAlbum', { name: g.name })}
            onClick={() => open(g)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                open(g)
              }
            }}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={g.cover}
                alt={g.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-base font-medium">{g.name}</h2>
                <span className="shrink-0 text-xs text-muted-foreground">{g.date}</span>
              </div>
              {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
              <p className="text-xs text-muted-foreground">
                {t('photoCount', { count: g.gallery.length })}
              </p>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('albumTitle', { name: active.name })}
          className="fixed inset-0 z-[60] bg-[#0c0c0e]"
        >
          <MorphSlider
            items={sliderItems}
            radius={0}
            transition="melt"
            showCaptions
            showControls
            showIndicators
          />

          <header
            className="pointer-events-none absolute inset-x-0 top-0 z-[4] flex items-start justify-between gap-4 p-4 text-white sm:p-6"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-medium drop-shadow-sm">{active.name}</h2>
              <p className="text-sm text-white/75 drop-shadow-sm">
                {active.date} · {t('photoCount', { count: active.gallery.length })}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={t('closeAlbum')}
              className="pointer-events-auto size-10 border-border/40 bg-background/45 text-foreground shadow-sm backdrop-blur-md hover:scale-105 hover:bg-background/75 active:scale-95 dark:hover:bg-background/75"
            >
              <X aria-hidden="true" className="size-[18px]" />
            </Button>
          </header>
        </div>
      )}
    </>
  )
}
