'use client'

import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState, type MouseEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { type OrcidWork } from '@/features/team/lib/orcid'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

function WorkRow({ work, typeLabel }: { work: OrcidWork; typeLabel: string }) {
  const href = work.url ?? (work.doi ? `https://doi.org/${work.doi}` : undefined)

  const body = (
    <>
      {/* 年份栏：窄屏隐藏，移动端年份显示在底部 meta 中 */}
      <div className="hidden shrink-0 justify-end pt-1 sm:flex" aria-hidden="true">
        <span className="text-sm font-semibold tabular-nums text-muted-foreground/70">
          {work.year ?? '—'}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* 标题 + 外链指示 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-base leading-snug font-medium text-pretty">{work.title}</div>
          {/*{href && (
            <ExternalLink
              className="mt-1 size-4 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          )}*/}
        </div>

        {/* 出处（期刊/会议等），最多两行 */}
        {work.journal && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {work.journal}
          </p>
        )}

        {/* 类型 / 年份(移动端) / DOI */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-xs text-muted-foreground">
          {work.year && <span className="tabular-nums sm:hidden">{work.year}</span>}
          <Badge variant="secondary">{typeLabel}</Badge>
          {work.doi && (
            <Badge variant="secondary">
              <span className="truncate">DOI: {work.doi}</span>
            </Badge>
          )}
        </div>
      </div>
    </>
  )

  const rowClassName =
    'flex items-start gap-4 rounded-xl px-3 py-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40'

  if (href) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`group ${rowClassName} hover:bg-muted/60`}
        >
          {body}
        </a>
      </li>
    )
  }

  return <li className={rowClassName}>{body}</li>
}

/** 生成页码列表：当前页前后 2 页 + 首尾页，其余位置用省略号占位 */
function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  const wanted = new Set<number>([1, 2, total - 1, total])
  for (let i = -2; i <= 2; i++) wanted.add(current + i)

  const items: (number | 'ellipsis')[] = []
  let previous = 0
  for (let page = 1; page <= total; page++) {
    if (!wanted.has(page)) continue
    if (page - previous > 1) items.push('ellipsis')
    items.push(page)
    previous = page
  }
  return items
}

export default function PublicationsList({ works }: { works: OrcidWork[] }) {
  const t = useTranslations('Team.Member')
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const pageCount = Math.max(1, Math.ceil(works.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageWorks = works.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const pageItems = getPageItems(safePage, pageCount)

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), pageCount)
    setPage(next)
    // 翻页后将列表顶部平滑带回视野（预留固定头部高度）
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  // Pagination* 系列是 <a>，拦截默认跳转，改为本地切页
  const handlePageClick = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    goTo(target)
  }

  const disabledClasses = 'pointer-events-none opacity-50'

  return (
    <div ref={topRef} className="flex scroll-mt-36 flex-col">
      <div className="flex items-center justify-between gap-2 mb-2 text-xs text-muted-foreground">
        <span>{t('paperSummary', { total: works.length, pageSize: PAGE_SIZE })}</span>
        {pageCount > 1 && (
          <span className="tabular-nums">
            {t('paperPage', { current: safePage, total: pageCount })}
          </span>
        )}
      </div>

      <ol className="flex flex-col">
        {pageWorks.map((work) => {
          const typeKey = `paperTypes.${work.type}`
          return (
            <WorkRow
              key={work.putCode}
              work={work}
              typeLabel={t.has(typeKey) ? t(typeKey) : work.type}
            />
          )
        })}
      </ol>

      {pageCount > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text={t('prevPage')}
                aria-label={t('prevPage')}
                aria-disabled={safePage === 1}
                className={cn(safePage === 1 && disabledClasses)}
                onClick={handlePageClick(safePage - 1)}
              />
            </PaginationItem>

            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === safePage}
                    aria-label={t('goToPage', { page: item })}
                    onClick={handlePageClick(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                text={t('nextPage')}
                aria-label={t('nextPage')}
                aria-disabled={safePage === pageCount}
                className={cn(safePage === pageCount && disabledClasses)}
                onClick={handlePageClick(safePage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
