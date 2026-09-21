'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
} from 'react'

/** 外链判断：http(s) 开头则新窗口打开，其余交给 next/link 客户端路由 */
const isExternalLink = (link?: string) => /^https?:\/\//.test(link || '')

export interface AccordionGalleryItem {
  image: string
  label?: string
  link?: string
  alt?: string
}

/** 小屏幕断点（与下面所有 max-[640px]: 类保持一致） */
const MOBILE_BREAKPOINT = 640

/** 主指针无法 hover（纯触摸设备）时，手风琴无法预览，一律按移动端展开处理 */
const NO_HOVER_QUERY = '(hover: none)'

/**
 * 小屏或无 hover 设备共用的根节点布局类：两列网格平铺 + 高度自适应 + 关闭 3D 透视。
 * 必须保持完整类名字面量，Tailwind 靠源码文本扫描收集候选。
 */
const MOBILE_GRID_ROOT_CLASSES = [
  'max-[640px]:!grid',
  'max-[640px]:grid-cols-2',
  'max-[640px]:!h-auto',
  'max-[640px]:[perspective:none]',
  '[@media(hover:none)]:!grid',
  '[@media(hover:none)]:grid-cols-2',
  '[@media(hover:none)]:!h-auto',
  '[@media(hover:none)]:[perspective:none]',
].join(' ')

/** 小屏或无 hover 设备共用的面板类：固定比例、清掉 GSAP 写入的 3D 变换 */
const MOBILE_GRID_PANEL_CLASSES = [
  'max-[640px]:aspect-[4/5]',
  'max-[640px]:!transform-none',
  '[@media(hover:none)]:aspect-[4/5]',
  '[@media(hover:none)]:!transform-none',
].join(' ')

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[]
  defaultIndex?: number
  accentColor?: string
  overlayColor?: string
  textColor?: string
  height?: number
  gap?: number
  radius?: number
  expandRatio?: number
  orientation?: 'horizontal' | 'vertical'
  duration?: number
  ease?: string
  parallax?: number
  tilt?: number
  stagger?: number
  trigger?: 'hover' | 'click'
  showLabels?: boolean
  grayscale?: boolean
  /** 小屏（<= 640px）或无 hover 能力（纯触摸）时改为两列网格：全部平铺展开、取消灰度与变暗、标签常显 */
  mobileGrid?: boolean
  className?: string
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' },
]

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  mobileGrid = false,
  className = '',
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLElement | null)[]>([])
  const mediaRefs = useRef<(HTMLElement | null)[]>([])
  const barRefs = useRef<(HTMLElement | null)[]>([])
  const textRefs = useRef<(HTMLElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const firstRunRef = useRef(true)
  const mediaSizeRef = useRef(320)

  const vertical = orientation === 'vertical'
  const count = items.length
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1))
  // 小屏 / 无 hover 设备标记：仅用于停掉手风琴动画、让全部面板保持展开且彩色；布局本身由 CSS 媒体查询接管（避免 SSR 水合不一致）
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    if (!mobileGrid) {
      setCompact(false)
      return
    }
    const widthMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const hoverMql = window.matchMedia(NO_HOVER_QUERY)
    const sync = () => setCompact(widthMql.matches || hoverMql.matches)
    sync()
    widthMql.addEventListener('change', sync)
    hoverMql.addEventListener('change', sync)
    return () => {
      widthMql.removeEventListener('change', sync)
      hoverMql.removeEventListener('change', sync)
    }
  }, [mobileGrid])

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const overlayBg = `linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current
      if (!panels.length) return

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9)
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1
      const mediaSize = mediaSizeRef.current

      tlRef.current?.kill()
      const tl = gsap.timeline()

      // 小屏幕：放弃手风琴状态，所有面板统一“展开态”：等宽、无旋转、无灰度、无变暗、标签常显
      if (compact) {
        panels.forEach((panel, i) => {
          if (!panel) return
          tl.to(panel, { flexGrow: 1, rotateX: 0, rotateY: 0, '--ag-dim': 0, duration: 0 }, 0)

          const media = mediaRefs.current[i]
          if (media) {
            tl.to(
              media,
              { xPercent: -50, yPercent: -50, x: 0, y: 0, '--ag-gray': 0, duration: 0 },
              0,
            )
          }

          const bar = barRefs.current[i]
          const text = textRefs.current[i]
          if (showLabels && bar && text) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: 0, stagger: 0 }, 0)
          }
        })
        tlRef.current = tl
        return
      }

      const dur = animate && !prefersReduced ? duration : 0

      panels.forEach((panel, i) => {
        if (!panel) return
        const isActive = i === active
        const media = mediaRefs.current[i]
        const bar = barRefs.current[i]
        const text = textRefs.current[i]

        const rot = isActive ? 0 : i < active ? tilt : -tilt
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot }

        tl.to(
          panel,
          {
            flexGrow: isActive ? grow : 1,
            ...rotProp,
            // --ag-dim 必须落在 panel 上：遮罩层是 media 的兄弟节点，只能继承 panel 的变量
            '--ag-dim': isActive ? 0 : 0.35,
            duration: dur,
            ease,
          },
          0,
        )

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i))
          const shift = drift * parallax * mediaSize * 0.06
          const gray = grayscale ? (isActive ? 0 : 1) : 0
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              duration: dur,
              ease,
            },
            0,
          )
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to(
              [bar, text],
              { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger },
              0,
            )
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0)
          }
        }
      })

      tlRef.current = tl
    },
    [
      active,
      compact,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced,
    ],
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const total = vertical ? rect.height : rect.width
      const usable = Math.max(total - gap * (count - 1), 120)
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22)
      mediaSizeRef.current = size
      el.style.setProperty('--ag-media-size', `${size}px`)
      applyLayout(!firstRunRef.current)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [applyLayout, gap, count, expandRatio, vertical])

  useEffect(() => {
    applyLayout(!firstRunRef.current)
    firstRunRef.current = false
  }, [applyLayout])

  useEffect(
    () => () => {
      tlRef.current?.kill()
    },
    [],
  )

  const handleEnter = (i: number) => {
    if (trigger === 'hover' && !compact) setActive(i)
  }

  const handleClick = (i: number, e: MouseEvent) => {
    // 小屏幕上所有面板本就展开，点击应直接跳转，不要拦下第一次点击
    if (compact) return
    if (i !== active) {
      e.preventDefault()
      setActive(i)
    }
  }

  const handleFocus = (i: number) => {
    if (!compact) setActive(i)
  }

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i + 1) % count)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i - 1 + count) % count)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [perspective:1400px] ${
        mobileGrid
          ? MOBILE_GRID_ROOT_CLASSES
          : 'max-[520px]:!flex-col max-[520px]:[perspective:none]'
      } ${className}`}
      style={{
        gap: `${gap}px`,
        height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
      }}
      role="list"
      aria-label="Image accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active
        const external = isExternalLink(item.link)
        const assignPanel = (el: HTMLElement | null) => {
          panelRefs.current[i] = el
        }
        const panelClass =
          'group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#0a0713] no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)] ' +
          (mobileGrid
            ? MOBILE_GRID_PANEL_CLASSES
            : 'max-[520px]:min-h-[84px] max-[520px]:!transform-none')
        const panelStyle = {
          borderRadius: `${radius}px`,
          '--ag-accent': accentColor,
          willChange: 'flex-grow, transform',
        } as CSSProperties
        const shared = {
          className: panelClass,
          style: panelStyle,
          onClick: (e: MouseEvent) => handleClick(i, e),
          onMouseEnter: () => handleEnter(i),
          onFocus: () => handleFocus(i),
          onKeyDown: (e: KeyboardEvent) => handleKeyDown(i, e),
          role: 'listitem' as const,
          tabIndex: 0,
          'aria-current': isActive ? ('true' as const) : undefined,
          'aria-label': item.label,
        }
        const content = (
          <>
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el
                }}
                className="absolute top-1/2 left-1/2 [filter:grayscale(var(--ag-gray,1))]"
                style={
                  {
                    width: vertical ? '100%' : 'var(--ag-media-size, 320px)',
                    height: vertical ? 'var(--ag-media-size, 320px)' : '100%',
                    // 初始值必须显式声明，GSAP 才能从正确的起点补间 CSS 变量
                    '--ag-gray': grayscale ? 1 : 0,
                    willChange: 'transform, filter',
                  } as CSSProperties
                }
              >
                <img
                  src={item.image}
                  alt={item.alt || item.label || ''}
                  draggable={false}
                  className="block h-full w-full select-none object-cover [-webkit-user-drag:none]"
                />
              </span>
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: overlayBg }}
                aria-hidden="true"
              />
            </span>
            {showLabels && (
              <span
                className="pointer-events-none absolute bottom-5 left-5 right-5 z-[2] flex items-center gap-3"
                aria-hidden="true"
              >
                <span
                  ref={(el: HTMLElement | null) => {
                    barRefs.current[i] = el
                  }}
                  className="h-[26px] w-[3px] flex-none rounded-[3px] opacity-0"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)`,
                  }}
                />
                <span
                  ref={(el: HTMLElement | null) => {
                    textRefs.current[i] = el
                  }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1rem,1.4vw,1.4rem)] font-semibold tracking-[0.01em] opacity-0 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]"
                  style={{ color: textColor }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </>
        )

        if (!item.link) {
          return (
            <div key={i} ref={assignPanel} {...shared}>
              {content}
            </div>
          )
        }

        return (
          <Link
            key={i}
            ref={assignPanel}
            href={item.link}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            {...shared}
          >
            {content}
          </Link>
        )
      })}
    </div>
  )
}

export default AccordionGallery
