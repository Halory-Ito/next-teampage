'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { News } from '@/types/news'

/** 就业去向列表字段（person 对象键与翻译键同名，顺序即表格列顺序） */
const CAREER_FIELDS = ['position', 'signed', 'intents', 'honors'] as const

type CareerPerson = Exclude<News['event'], string>[number]

function CareerRow({
  person,
  formatGrade,
  separator,
}: {
  person: CareerPerson
  formatGrade: (grade: number) => string
  separator: string
}) {
  const t = useTranslations('News')
  return (
    <li className="rounded-xl border border-foreground/10 p-3">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-base font-medium">
          <Link href={`/team/master/${person.id}`}>{person.name}</Link>
        </span>
        <span className="shrink-0 text-sm text-muted-foreground">{formatGrade(person.grade)}</span>
      </div>
      <dl className="grid gap-1 text-sm">
        {CAREER_FIELDS.map((key) => {
          const value = person[key]
          const text = Array.isArray(value) ? value.join(separator) : value
          return (
            <div key={key} className="grid grid-cols-[5em_minmax(0,1fr)] gap-x-3">
              <dt className="text-muted-foreground">{t(key)}</dt>
              <dd className="min-w-0 wrap-break-words">{text || '—'}</dd>
            </div>
          )
        })}
      </dl>
    </li>
  )
}

function NewsLinks({ links }: { links: NonNullable<News['links']> }) {
  return (
    <ul className="mt-2 flex flex-col gap-1 pl-4 text-sm">
      {links.map((link) => (
        <li key={link.url} className="flex gap-2">
          <Link
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {link.label || link.url}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function EventCard({ date, event, type, pinned, links }: News) {
  const t = useTranslations('News')
  const formatGrade = (grade: number) => t('gradeSuffix', { grade })
  const separator = t('listSeparator')

  // 就业去向（career）：event 是 Career[]。桌面端用表格，移动端折叠成卡片式列表，
  // 避免 6 列被挤在小屏幕上。
  if (type === 'career' && Array.isArray(event)) {
    return (
      <Card className="w-full">
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-muted-foreground">{date}</div>
            {/*<div className="text-xs text-muted-foreground">{t('careerTitle')}</div>*/}
          </div>

          {/* 移动端：每条记录一张小卡片 */}
          <ul className="grid gap-2.5 md:hidden">
            {event.map((person) => (
              <CareerRow
                key={person.id}
                person={person}
                formatGrade={formatGrade}
                separator={separator}
              />
            ))}
          </ul>

          {/* 桌面端：表格 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground">
                  <th className="w-24 pb-2 pr-4 font-normal">{t('name')}</th>
                  <th className="w-20 pb-2 pr-4 font-normal">{t('grade')}</th>
                  {CAREER_FIELDS.map((key) => (
                    <th key={key} className="pb-2 pr-4 font-normal">
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {event.map((person) => (
                  <tr key={person.id}>
                    <td className="w-24 py-2.5 pr-4 font-medium">
                      <Link href={`/team/master/${person.id}`}>{person.name}</Link>
                    </td>
                    <td className="w-20 py-2.5 pr-4">{formatGrade(person.grade)}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{person.position}</td>
                    <td className="py-2.5 pr-4">{person.signed}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {person.intents.join(separator)}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {person.honors.join(separator)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent>
        {typeof event === 'string' ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="shrink-0 text-muted-foreground">{pinned ? t('pinned') : date}</div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="wrap-break-words">{event}</div>
              {links && links.length > 0 && <NewsLinks links={links} />}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
