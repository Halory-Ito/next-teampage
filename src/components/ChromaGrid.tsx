import { gsap } from 'gsap'
import Link from 'next/link'
import React, { useRef, useEffect } from 'react'

export interface ChromaItem {
  image: string
  title: string
  subtitle: string
  handle?: string
  location?: string
  borderColor?: string
  gradient?: string
  url?: string
}

export interface ChromaGridProps {
  items?: ChromaItem[]
  className?: string
  radius?: number
  damping?: number
  fadeOut?: number
  ease?: string
}

type SetterFn = (v: number | string) => void

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const setX = useRef<SetterFn | null>(null)
  const setY = useRef<SetterFn | null>(null)
  const pos = useRef({ x: 0, y: 0 })

  const demo: ChromaItem[] = [
    {
      image: 'https://i.pravatar.cc/300?img=8',
      title: 'Alex Rivera',
      subtitle: 'Full Stack Developer',
      handle: '@alexrivera',
      borderColor: '#4F46E5',
      gradient: 'linear-gradient(145deg,#4F46E5,var(--card))',
      url: 'https://github.com/',
    },
    {
      image: 'https://i.pravatar.cc/300?img=11',
      title: 'Jordan Chen',
      subtitle: 'DevOps Engineer',
      handle: '@jordanchen',
      borderColor: '#10B981',
      gradient: 'linear-gradient(210deg,#10B981,var(--card))',
      url: 'https://linkedin.com/in/',
    },
    {
      image: 'https://i.pravatar.cc/300?img=3',
      title: 'Morgan Blake',
      subtitle: 'UI/UX Designer',
      handle: '@morganblake',
      borderColor: '#F59E0B',
      gradient: 'linear-gradient(165deg,#F59E0B,var(--card))',
      url: 'https://dribbble.com/',
    },
    {
      image: 'https://i.pravatar.cc/300?img=16',
      title: 'Casey Park',
      subtitle: 'Data Scientist',
      handle: '@caseypark',
      borderColor: '#EF4444',
      gradient: 'linear-gradient(195deg,#EF4444,var(--card))',
      url: 'https://kaggle.com/',
    },
    {
      image: 'https://i.pravatar.cc/300?img=25',
      title: 'Sam Kim',
      subtitle: 'Mobile Developer',
      handle: '@thesamkim',
      borderColor: '#8B5CF6',
      gradient: 'linear-gradient(225deg,#8B5CF6,var(--card))',
      url: 'https://github.com/',
    },
    {
      image: 'https://i.pravatar.cc/300?img=60',
      title: 'Tyler Rodriguez',
      subtitle: 'Cloud Architect',
      handle: '@tylerrod',
      borderColor: '#06B6D4',
      gradient: 'linear-gradient(135deg,#06B6D4,var(--card))',
      url: 'https://aws.amazon.com/',
    },
  ]

  const data = items?.length ? items : demo

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn
    const { width, height } = el.getBoundingClientRect()
    pos.current = { x: width / 2, y: height / 2 }
    setX.current(pos.current.x)
    setY.current(pos.current.y)
  }, [])

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x)
        setY.current?.(pos.current.y)
      },
      overwrite: true,
    })
  }

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect()
    moveTo(e.clientX - r.left, e.clientY - r.top)
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true })
  }

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    })
  }

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget as HTMLElement
    const rect = c.getBoundingClientRect()
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative w-full h-full grid grid-cols-1 sm:grid-cols-2 content-start gap-3 max-w-sm mx-auto sm:max-w-none ${className}`}
      style={
        {
          '--r': `${radius}px`,
          '--x': '50%',
          '--y': '50%',
        } as React.CSSProperties
      }
    >
      {data.map((c, i) => {
        const isExternal = /^https?:\/\//.test(c.url || '')
        const body = (
          <>
            <div className="relative z-10 flex-1">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <footer className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 p-3 font-sans text-foreground">
              {/* 左列：标题 + 副标题（纵向堆叠，长文本截断，避免挤压右侧元信息） */}
              <div className="flex min-w-0 flex-col gap-y-1">
                <h3 className="m-0 truncate text-[1.05rem] font-semibold">{c.title}</h3>
                {/*{c.subtitle && (
                  <p className="m-0 line-clamp-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                    {c.subtitle}
                  </p>
                )}*/}
              </div>
              {/* 右列：handle / location 元信息（右对齐，宽度受限后截断） */}
              <div className="flex max-w-[45%] shrink-0 flex-col items-end gap-y-1">
                {c.handle && (
                  <span className="block w-full truncate text-right text-[0.95rem] text-muted-foreground">
                    {c.handle}
                  </span>
                )}
                {c.location && (
                  <span className="block w-full truncate text-right text-[0.85rem] text-muted-foreground">
                    {c.location}
                  </span>
                )}
              </div>
            </footer>
          </>
        )
        return (
          <article
            key={i}
            onMouseMove={handleCardMove}
            className={`group relative flex flex-col w-full min-w-0 rounded-[20px] overflow-hidden border-transparent transition-colors duration-300 cursor-pointer ${c.gradient || c.borderColor ? '' : 'bg-card ring-1 ring-foreground/10'}`}
            style={
              {
                '--card-border': c.borderColor || 'transparent',
                background: c.gradient,
                '--spotlight-color': 'rgba(255,255,255,0.3)',
              } as React.CSSProperties
            }
          >
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)',
              }}
            />
            {c.url ? (
              <Link
                href={c.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="relative z-10 flex flex-1 flex-col"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </article>
        )
      })}
      <div
        className="absolute inset-0 pointer-events-none z-30 [-webkit-backdrop-filter:saturate(0.65)] [backdrop-filter:saturate(0.65)] dark:[-webkit-backdrop-filter:grayscale(1)_brightness(0.78)] dark:[backdrop-filter:grayscale(1)_brightness(0.78)]"
        style={{
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40 [-webkit-backdrop-filter:saturate(0.65)] [backdrop-filter:saturate(0.65)] dark:[-webkit-backdrop-filter:grayscale(1)_brightness(0.78)] dark:[backdrop-filter:grayscale(1)_brightness(0.78)]"
        style={{
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
          opacity: 1,
        }}
      />
    </div>
  )
}

export default ChromaGrid
