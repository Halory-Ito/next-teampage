'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

export const navItems = [
  {
    title: 'home',
    href: '/',
  },
  {
    title: 'news',
    href: '/news',
  },
  {
    title: 'team',
    href: '/team',
  },
  {
    title: 'daily',
    href: '/daily',
  },
  {
    title: 'join',
    href: '/join-us',
  },
]

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== '/' && pathname.startsWith(href))

export default function AppNav() {
  const t = useTranslations('Layout.Navigation')
  const pathname = usePathname()
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {navItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink
              active={isActive(pathname, item.href)}
              className={navigationMenuTriggerStyle()}
              render={<Link href={item.href}>{t(item.title)}</Link>}
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
