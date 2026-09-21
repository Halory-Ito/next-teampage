'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/** 图片未加载 / 加载失败时的兜底宽高比（w / h） */
const DEFAULT_ASPECT = 4 / 3

/** 主指针无法 hover（纯触摸设备） */
const NO_HOVER_QUERY = '(hover: none)'

/** 是否为无 hover 能力的设备；样式层面已由 [@media(hover:none)] 类接管，这里只用来跳过悬停动画 */
const useNoHover = () => {
  const [noHover, setNoHover] = useState(false)

  useEffect(() => {
    const mql = matchMedia(NO_HOVER_QUERY)
    const sync = () => setNoHover(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  return noHover
}

/** 外链判断：http(s) 开头则新窗口打开，其余交给 next/link 客户端路由 */
const isExternalLink = (href?: string) => /^https?:\/\//.test(href || '')

/**
 * 按容器实际宽度算列数：卡片宽度 = (容器宽 - 间隙) / 列数，保证每列不小于 minColumnWidth。
 * 用容器宽度（而不是视口断点）判断，页面被 max-w-* 限宽时列数才不会失控变多、卡片变小。
 */
const resolveColumns = (width: number, gap: number, minColumnWidth: number, maxColumns: number) => {
  if (width <= 0) return 1
  const fits = Math.floor((width + gap) / (Math.max(minColumnWidth, 1) + gap))
  return Math.min(Math.max(fits, 1), Math.max(1, maxColumns))
}

/** 只跟踪容器宽度：高度由组件自己写入，避免 ResizeObserver 与高度动画相互触发 */
const useMeasure = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width] as const
}

/** 预加载封面图并读取真实宽高比：瀑布流高度按图片比例算，避免不同横竖构图被裁成同一比例 */
const loadAspectRatios = async (urls: string[]): Promise<Map<string, number>> => {
  const pairs = await Promise.all(
    Array.from(new Set(urls)).map(
      (src) =>
        new Promise<[string, number]>((resolve) => {
          const img = new Image()
          img.onload = () =>
            resolve([
              src,
              img.naturalWidth && img.naturalHeight
                ? img.naturalWidth / img.naturalHeight
                : DEFAULT_ASPECT,
            ])
          img.onerror = () => resolve([src, DEFAULT_ASPECT])
          img.src = src
        }),
    ),
  )
  return new Map(pairs)
}

export interface MasonryItem {
  /** 稳定且唯一的 key */
  id: string
  /** 封面图地址，用 CSS background-image 渲染 */
  img: string
  /** 悬停 / 聚焦时显示在封面底部的标题（相册名） */
  title?: string
  /** 点击跳转地址；站内路径走 next/link 客户端路由，外链自动新窗口打开。缺省时用 "#" */
  href?: string
  /** 图片替代文本 / 无障碍名称兜底 */
  alt?: string
  /** 覆盖自动计算的宽高比（w / h） */
  aspectRatio?: number
}

interface GridItem extends MasonryItem {
  x: number
  y: number
  w: number
  h: number
}

export interface MasonryProps {
  items: MasonryItem[]
  ease?: string
  duration?: number
  stagger?: number
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random'
  scaleOnHover?: boolean
  hoverScale?: number
  blurToFocus?: boolean
  /** 卡片间距（px） */
  gap?: number
  /** 卡片圆角（px） */
  radius?: number
  /** 是否在悬停 / 聚焦时显示标题 */
  showTitles?: boolean
  /**
   * 无 hover 能力的设备（纯触摸）上标题常显。默认 true：
   * 触摸设备没有 hover 态，仅靠 hover 显示的标题将永远看不到。
   */
  showTitlesOnTouch?: boolean
  /** 卡片阴影：false 时改用极细描边，适合 minimal 风格 */
  shadow?: boolean
  /** 每列的最小宽度（px）：容器越宽列数越多，卡片越小；调大它即可放大卡片 */
  minColumnWidth?: number
  /** 列数上限 */
  maxColumns?: number
  /** 点击卡片（用于打开相册弹层）：提供后普通左键点击不再跳转；cmd/ctrl/shift/中键仍保留原生行为 */
  onItemClick?: (item: MasonryItem) => void
  /** 宽高比裁剪范围，避免出现极端长条 */
  minAspectRatio?: number
  maxAspectRatio?: number
  className?: string
}

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.96,
  blurToFocus = true,
  gap = 16,
  radius = 12,
  showTitles = true,
  showTitlesOnTouch = true,
  shadow = true,
  minColumnWidth = 320,
  maxColumns = 4,
  onItemClick,
  minAspectRatio = 0.5,
  maxAspectRatio = 1.8,
  className = '',
}) => {
  const [containerRef, width] = useMeasure()
  // 触摸设备上没有真正的 hover：跳过缩放 / 标题动画，避免点击后残留缩放态
  const noHover = useNoHover()
  const [aspects, setAspects] = useState<Map<string, number>>(() => new Map())
  const [imagesReady, setImagesReady] = useState(false)
  const tileRefs = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    let cancelled = false
    setImagesReady(false)
    loadAspectRatios(items.map((i) => i.img)).then((map) => {
      if (cancelled) return
      setAspects(map)
      setImagesReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [items])

  const resolveAspect = useCallback(
    (item: MasonryItem) => {
      const ratio = item.aspectRatio ?? aspects.get(item.img) ?? DEFAULT_ASPECT
      return Math.min(Math.max(ratio, minAspectRatio), maxAspectRatio)
    },
    [aspects, minAspectRatio, maxAspectRatio],
  )

  const columns = useMemo(
    () => resolveColumns(width, gap, minColumnWidth, maxColumns),
    [width, gap, minColumnWidth, maxColumns],
  )

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return []
    const colHeights = Array.from({ length: columns }, () => 0)
    const totalGaps = (columns - 1) * gap
    const columnWidth = (width - totalGaps) / columns

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = col * (columnWidth + gap)
      const height = columnWidth / resolveAspect(child)
      const y = colHeights[col]

      colHeights[col] += height + gap
      return { ...child, x, y, w: columnWidth, h: height }
    })
  }, [columns, items, width, gap, resolveAspect])

  /** 子项绝对定位，容器高度必须显式给出，否则整块塌陷 */
  const containerHeight = useMemo(
    () => grid.reduce((max, item) => Math.max(max, item.y + item.h), 0),
    [grid],
  )

  const hasMounted = useRef(false)

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return { x: item.x, y: item.y }

    let direction = animateFrom
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right']
      direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 }
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 }
      case 'left':
        return { x: -200, y: item.y }
      case 'right':
        return { x: window.innerWidth + 200, y: item.y }
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        }
      default:
        return { x: item.x, y: item.y + 100 }
    }
  }

  useLayoutEffect(() => {
    if (!imagesReady) return

    grid.forEach((item, index) => {
      const el = tileRefs.current.get(item.id)
      if (!el) return
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h }

      if (!hasMounted.current) {
        const start = getInitialPosition(item)
        gsap.fromTo(
          el,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger,
          },
        )
      } else {
        gsap.to(el, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto',
        })
      }
    })

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        height: containerHeight,
        duration: hasMounted.current ? duration : 0.8,
        ease,
        overwrite: 'auto',
      })
    }

    hasMounted.current = true
  }, [
    grid,
    containerHeight,
    imagesReady,
    stagger,
    animateFrom,
    blurToFocus,
    duration,
    ease,
    containerRef,
  ])

  const showTitle = (el: HTMLElement, visible: boolean) => {
    if (!showTitles) return
    // 触摸设备上标题由 CSS 常显，不再由 GSAP 控制透明度
    if (showTitlesOnTouch && noHover) return
    const title = el.querySelector<HTMLElement>('.masonry-title')
    if (!title) return
    gsap.to(title, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 12,
      duration: visible ? 0.35 : 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleMouseEnter = (el: HTMLElement) => {
    if (scaleOnHover && !noHover) {
      gsap.to(el, { scale: hoverScale, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
    }
    showTitle(el, true)
  }

  const handleMouseLeave = (el: HTMLElement) => {
    if (scaleOnHover && !noHover) {
      gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
    }
    showTitle(el, false)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible ${className}`}
      style={{ height: 0 }}
    >
      {grid.map((item) => {
        const external = isExternalLink(item.href)
        return (
          <Link
            key={item.id}
            ref={(el) => {
              if (el) tileRefs.current.set(item.id, el)
              else tileRefs.current.delete(item.id)
            }}
            href={item.href || '#'}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            aria-label={item.title || item.alt || undefined}
            className="group absolute box-content block cursor-pointer no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ willChange: 'transform, width, height, opacity' }}
            onClick={(e) => {
              if (!onItemClick) return
              // 保留 cmd/ctrl/shift/中键的“新标签页打开”原生行为
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              onItemClick(item)
            }}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            onFocus={(e) => handleMouseEnter(e.currentTarget)}
            onBlur={(e) => handleMouseLeave(e.currentTarget)}
          >
            <span
              className={`relative block h-full w-full overflow-hidden bg-muted bg-cover bg-center ${shadow ? 'shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]' : 'ring-1 ring-foreground/5'}`}
              style={{ backgroundImage: `url(${item.img})`, borderRadius: radius }}
            >
              {showTitles && item.title && (
                <span
                  aria-hidden="true"
                  className={`masonry-title pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-linear-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3 opacity-0 ${
                    // 触摸设备（@media (hover:none)）标题直接常显，并用 !important 顶掉 GSAP 写入的
                    // 内联 opacity / translateY（否则标题会被推出卡片下沿而截断）
                    showTitlesOnTouch
                      ? '[@media(hover:none)]:!opacity-100 [@media(hover:none)]:!transform-none'
                      : ''
                  }`}
                  style={{ borderRadius: `0 0 ${radius}px ${radius}px` }}
                >
                  <span className="line-clamp-2 text-sm font-medium text-white drop-shadow-sm">
                    {item.title}
                  </span>
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default Masonry
