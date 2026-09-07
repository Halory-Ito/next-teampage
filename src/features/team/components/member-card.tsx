'use client'

import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import BorderGlow from '@/components/border-glow'
import { Member } from '@/types/member'

export default function MemberCard({
  avatarUrl,
  name,
  nameEn,
  career,
  id,
  grade,
  role,
}: Partial<Member>) {
  const locale = useLocale()
  // 主名跟随当前语言（与成员详情页一致）：中文界面显示中文名，英文界面显示英文名
  const displayName = !locale.startsWith('zh') && nameEn ? nameEn : name
  const { resolvedTheme } = useTheme()
  // next-themes resolves the theme from localStorage during the first client
  // render, but it is undefined during SSR. Branching on it before mount makes
  // the hydrated DOM differ from the server HTML (theme colors/glow), which
  // React reports as a style hydration mismatch. Only flip props after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === 'dark'

  return (
    <BorderGlow
      backgroundColor="var(--background)"
      lightSurface={!dark}
      borderRadius={10}
      glowRadius={16}
      edgeSensitivity={30}
      coneSpread={25}
      animated={false}
      colors={dark ? ['#c084fc', '#f472b6', '#38bdf8'] : ['#9333ea', '#ec4899', '#0ea5e9']}
      glowColor={dark ? '280 85 70' : '265 90 58'}
    >
      <Link href={`/team/${role!}/${id!}`}>
        <div className="flex items-center justify-between gap-4 h-full w-full">
          <div className="flex flex-col justify-evenly h-full p-4 min-w-0">
            <div className="truncate">{displayName}</div>
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-muted-foreground truncate">{career}</div>
              <div className="text-sm text-muted-foreground truncate">@{grade}</div>
            </div>
          </div>
          <Image
            src={avatarUrl!}
            alt={displayName!}
            width={128}
            height={128}
            className="rounded-r-lg shrink-0 h-32 w-auto"
          />
        </div>
      </Link>
    </BorderGlow>
  )
}
