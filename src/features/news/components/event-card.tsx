import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { News } from '@/types/news'

const CAREER_LABELS = [
  { key: 'position', label: '岗位' },
  { key: 'signed', label: '签约单位' },
  { key: 'intents', label: '意向单位' },
  { key: 'honors', label: '荣誉' },
] as const

function CareerRow({ person }: { person: Exclude<News['event'], string>[number] }) {
  return (
    <li className="rounded-xl border border-foreground/10 p-3">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-base font-medium">
          <Link href={`/team/master/${person.id}`}>{person.name}</Link>
        </span>
        <span className="shrink-0 text-sm text-muted-foreground">{person.grade}级</span>
      </div>
      <dl className="grid gap-1 text-sm">
        {CAREER_LABELS.map(({ key, label }) => {
          const value = person[key]
          const text = Array.isArray(value) ? value.join('、') : value
          return (
            <div key={key} className="grid grid-cols-[5em_minmax(0,1fr)] gap-x-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 warp-break-words">{text || '—'}</dd>
            </div>
          )
        })}
      </dl>
    </li>
  )
}

export default function EventCard({ date, event, type }: News) {
  // 就业去向（career）：event 是 Career[]。桌面端用表格，移动端折叠成卡片式列表，
  // 避免 6 列被挤在小屏幕上。
  if (type === 'career' && Array.isArray(event)) {
    return (
      <Card className="w-full">
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-muted-foreground">{date}</div>
            <div className="text-xs text-muted-foreground">就业去向</div>
          </div>

          {/* 移动端：每条记录一张小卡片 */}
          <ul className="grid gap-2.5 md:hidden">
            {event.map((person) => (
              <CareerRow key={person.id} person={person} />
            ))}
          </ul>

          {/* 桌面端：表格 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground">
                  <th className="w-24 pb-2 pr-4 font-normal">姓名</th>
                  <th className="w-20 pb-2 pr-4 font-normal">年级</th>
                  <th className="pb-2 pr-4 font-normal">岗位</th>
                  <th className="pb-2 pr-4 font-normal">签约单位</th>
                  <th className="pb-2 pr-4 font-normal">意向单位</th>
                  <th className="pb-2 font-normal">荣誉</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {event.map((person) => (
                  <tr key={person.id}>
                    <td className="w-24 py-2.5 pr-4 font-medium">
                      <Link href={`/team/master/${person.id}`}>{person.name}</Link>
                    </td>
                    <td className="w-20 py-2.5 pr-4">{person.grade}级</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{person.position}</td>
                    <td className="py-2.5 pr-4">{person.signed}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {person.intents.join('、')}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{person.honors.join('、')}</td>
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
            <div className="shrink-0 text-muted-foreground">{date}</div>
            <div className="min-w-0 wrap-break-words">{event}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
