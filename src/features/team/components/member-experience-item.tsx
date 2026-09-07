/** 归一化 "2020-09" 这类月份为 "2020.09"，便于展示；无法识别的原样返回 */
function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{1,2})$/.exec(value.trim())
  if (!match) return value.trim()
  return `${match[1]}.${match[2].padStart(2, '0')}`
}

/** 将起止日期格式化为 "2020.09 – 2023.06"；endDate 为空时展示传入的「至今」类文案 */
function formatMemberPeriod(
  startDate: string,
  endDate: string | undefined,
  presentLabel: string,
): string {
  const start = formatMonth(startDate)
  const end = endDate?.trim()
  if (!end) return `${start} – ${presentLabel}`
  return `${start} – ${formatMonth(end)}`
}

type MemberExperienceItemProps = {
  startDate: string
  endDate?: string
  title: string
  subtitle?: string
  /** endDate 缺省时展示的「至今 / Present」文案（已按当前语言本地化） */
  presentLabel: string
}

/** 教育 / 工作经历共用的一行：左侧日期区间，右侧标题与补充说明 */
export default function MemberExperienceItem({
  startDate,
  endDate,
  title,
  subtitle,
  presentLabel,
}: MemberExperienceItemProps) {
  const period = formatMemberPeriod(startDate, endDate, presentLabel)

  return (
    <li className="flex items-start gap-4 py-4">
      <p className="flex-1 hidden shrink-0 justify-start text-sm tabular-nums text-muted-foreground/70 sm:flex">
        {period}
      </p>
      <div className="flex-4 flex min-w-0 flex-col gap-1">
        <p className="text-xs font-medium tabular-nums text-muted-foreground/70 sm:hidden">
          {period}
        </p>
        <h3 className="text-base leading-snug font-medium text-pretty">{title}</h3>
        {subtitle && <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
    </li>
  )
}
