'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import OptionWheel from '@/components/OptionWheel'
import { newsByLocale } from '@/data/news'
import EventCard from '@/features/news/components/event-card'
import type { Locale } from '@/i18n/config'

// OptionWheel 在滚动/拖拽过程中会高频触发 onChange，
// 这里对年份筛选做防抖：停止操作一段时间后才真正更新列表
const YEAR_FILTER_DEBOUNCE_MS = 500

export default function NewsPage() {
  const t = useTranslations('News')
  // 按当前语言取新闻数据（useLocale() 为运行时语言，切换语言后自动更新）
  const news = newsByLocale[useLocale() as Locale]
  const yearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 数据中实际存在的年份，从新到旧排列，作为滚轮与筛选的唯一依据。
  const years = useMemo(() => {
    const set = new Set(news.map((item) => item.date.slice(0, 4)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [news])

  // 默认选中当前年份；若数据里还没有今年则退回最新一年。
  const [selectedYear, setSelectedYear] = useState(() => {
    const current = String(new Date().getFullYear())
    return years.includes(current) ? current : (years[0] ?? current)
  })

  const visibleNews = useMemo(
    () =>
      news
        .filter((item) => item.date.startsWith(selectedYear))
        .sort((a, b) => {
          // 先按置顶排序：置顶的在前
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          // 如果置顶状态相同，按日期降序
          return b.date.localeCompare(a.date)
        }),
    [selectedYear, news],
  )

  // 防抖：滚轮/拖拽连续触发 onChange 时只保留最后一次，
  // 用户停止操作 YEAR_FILTER_DEBOUNCE_MS 后才真正更新 selectedYear
  const handleYearChange = (item: string) => {
    if (yearTimerRef.current) {
      clearTimeout(yearTimerRef.current)
    }
    yearTimerRef.current = setTimeout(() => {
      yearTimerRef.current = null
      setSelectedYear(item)
    }, YEAR_FILTER_DEBOUNCE_MS)
  }

  // 卸载时清理未决的防抖定时器
  useEffect(() => {
    return () => {
      if (yearTimerRef.current) {
        clearTimeout(yearTimerRef.current)
        yearTimerRef.current = null
      }
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      {years.length > 0 && (
        <div className="relative h-44 w-full">
          <OptionWheel
            items={years}
            defaultSelected={years.indexOf(selectedYear)}
            fontSize={3}
            spacing={1.4}
            curve={1}
            tilt={6}
            blur={2}
            fade={0.25}
            smoothing={200}
            loop={false}
            draggable
            onChange={(_, item) => handleYearChange(item)}
          />
        </div>
      )}

      {/*<div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{selectedYear}年动态</span>
        <span>共 {visibleNews.length} 条</span>
      </div>*/}

      {visibleNews.length > 0 ? (
        visibleNews.map((item, idx) => <EventCard key={`${item.date}-${idx}`} {...item} />)
      ) : (
        <p className="py-8 text-center text-muted-foreground">{t('empty')}</p>
      )}
    </div>
  )
}
