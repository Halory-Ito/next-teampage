'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Masonry, { type MasonryItem } from '@/components/Masonry'
import MorphSlider from '@/components/MorphSlider'
import { Button } from '@/components/ui/button'
import type { DailyGallery } from '@/types/daily'

type DailyGalleryGridProps = {
  galleries: DailyGallery[]
}

/**
 * 相册瀑布流：用 Masonry 展示相册封面（悬停显示相册标题），
 * 点击卡片后用全屏 MorphSlider 展示该相册内的全部图片。
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

  // Masonry 的 items 引用需稳定，否则内部会在每次渲染重新预加载图片
  const masonryItems = useMemo<MasonryItem[]>(
    () =>
      galleries.map((g, i) => ({
        id: `${i}-${g.date}-${g.name}`,
        img: g.cover,
        title: g.name,
        alt: g.description || g.name,
      })),
    [galleries],
  )

  // 点击卡片时按 id 反查相册，避免依赖数组下标
  const galleryById = useMemo(
    () => new Map(masonryItems.map((item, i) => [item.id, galleries[i]])),
    [masonryItems, galleries],
  )

  if (galleries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
        {t('emptyAlbums')}
      </p>
    )
  }

  return (
    <>
      <Masonry
        items={masonryItems}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.98}
        blurToFocus
        radius={8}
        shadow={false}
        minColumnWidth={340}
        maxColumns={4}
        onItemClick={(item) => {
          const gallery = galleryById.get(item.id)
          if (gallery) open(gallery)
        }}
      />

      {active && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('albumTitle', { name: active.name })}
          className="fixed inset-0 z-60"
        >
          <MorphSlider
            items={sliderItems}
            radius={0}
            transition="melt"
            showCaptions
            showControls
            showIndicators
          />

          <header className="pointer-events-none bg-linear-to-b from-primary-foreground/80 to-transparent absolute inset-x-0 top-0 z-4 flex items-start justify-between gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <div className="font-heading text-lg font-medium drop-shadow-sm">{active.name}</div>
              <p className="text-sm drop-shadow-sm">
                {active.date} · {t('photoCount', { count: active.gallery.length })}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={t('closeAlbum')}
              className="pointer-events-auto bg-background/45 text-foreground hover:bg-background/75 dark:hover:bg-background/75"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </header>
        </div>
      )}
    </>
  )
}
