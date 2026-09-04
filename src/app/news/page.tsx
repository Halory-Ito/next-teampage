'use client'
import { useMemo, useState } from 'react'

import OptionWheel from '@/components/OptionWheel'
import { news } from '@/data/news'
import EventCard from '@/features/news/components/event-card'

export default function NewsPage() {
  // 数据中实际存在的年份，从新到旧排列，作为滚轮与筛选的唯一依据。
  const years = useMemo(() => {
    const set = new Set(news.map((item) => item.date.slice(0, 4)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [])

  // 默认选中当前年份；若数据里还没有今年则退回最新一年。
  const [selectedYear, setSelectedYear] = useState(() => {
    const current = String(new Date().getFullYear())
    return years.includes(current) ? current : (years[0] ?? current)
  })

  // 按年份筛选，同年内日期从新到旧。
  const visibleNews = useMemo(
    () =>
      news
        .filter((item) => item.date.startsWith(selectedYear))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [selectedYear],
  )

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
            onChange={(_, item) => setSelectedYear(item)}
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
        <p className="py-8 text-center text-muted-foreground">该年份暂无动态</p>
      )}
    </div>
  )
}
