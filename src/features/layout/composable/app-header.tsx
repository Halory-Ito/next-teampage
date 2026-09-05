'use client'

import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'

import LocaleToggle from '@/components/locale-toggle'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'

import AppLogo from '../components/app-logo'
import AppNav from '../components/app-nav'
import MobileNav from '../components/mobile-nav'

export default function AppHeader() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 15)
  })

  return (
    <header
      className={cn(
        'fixed top-0 z-50 flex items-center justify-between p-4 transition-all duration-300 ease-in-out',
        isScrolled
          ? 'top-4 left-4 right-4 mx-auto max-w-5xl rounded-2xl border border-border/50 bg-background/70 shadow-lg backdrop-blur-xl'
          : 'w-full dark:bg-transparent bg-white/70',
      )}
    >
      <AppLogo />
      <div className="hidden md:block">
        <AppNav />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <MobileNav />
        <LocaleToggle />
        <ModeToggle />
      </div>
    </header>
  )
}
