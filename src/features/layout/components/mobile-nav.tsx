'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

import { navItems } from './app-nav'

/**
 * 移动端抽屉导航（仅 < md 显示）。
 * 桌面端由 AppNav 展示横向导航，这里负责汉堡按钮 + 右侧滑入 Drawer。
 */
export default function MobileNav() {
  const t = useTranslations('Layout')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // 路由变化后自动收起
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 视口 ≥ md 时自动收起（此时桌面导航 AppNav 接管）
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t('menu')} className="md:hidden">
            <Menu aria-hidden="true" />
          </Button>
        }
      />
      <DrawerContent
        className="md:hidden"
        style={{
          borderRadius: 0,
          borderTopLeftRadius: '1.5rem',
          borderBottomLeftRadius: '1.5rem',
        }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <DrawerTitle className="text-lg">{t('title')}</DrawerTitle>
          <DrawerClose
            render={
              <Button variant="ghost" size="icon" aria-label={t('menu')}>
                <X aria-hidden="true" />
              </Button>
            }
          />
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.title}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-base transition-colors',
                  active
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-foreground/80 hover:bg-accent/60 hover:text-foreground',
                )}
              >
                {t(`Navigation.${item.title}`)}
              </Link>
            )
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
