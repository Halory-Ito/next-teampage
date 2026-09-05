import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

/** 首页各板块统一的标题区（数据展示 / 学生评价等） */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div
      id={id}
      className={cn('flex scroll-mt-32 flex-col items-center gap-3 text-center', className)}
    >
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
