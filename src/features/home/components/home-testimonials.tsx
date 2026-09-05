import { Quote } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { homeTestimonials } from '@/data/home/testimonials'

import SectionHeading from './section-heading'

/**
 * 首页 · 学生评价
 *
 * 界面文案走 next-intl（messages/*.json）；评价正文读取自
 * src/data/home/testimonials.ts（示例占位数据），头像为按姓名末字生成的
 * 圆形缩写，避免依赖额外图片资源。
 */

/** “陈立” → “立”，用作圆形头像里的缩写 */
function avatarInitial(name: string): string {
  return name.trim().at(-1) ?? name.trim().charAt(0)
}

export default async function HomeTestimonials() {
  const t = await getTranslations('Home.Testimonials')

  if (homeTestimonials.length === 0) {
    return (
      <section className="w-full">
        <SectionHeading
          id="testimonials"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <p className="py-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="testimonials-title" className="flex w-full flex-col gap-8">
      <SectionHeading
        id="testimonials"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {homeTestimonials.map((item) => (
          <figure
            key={item.id}
            className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-card p-6 ring-1 ring-foreground/10"
          >
            <div>
              <Quote aria-hidden="true" className="mb-4 size-6 text-primary/70" />
              <blockquote className="text-[15px] leading-7 text-card-foreground">
                {item.quote}
              </blockquote>
            </div>
            <figcaption className="flex items-center gap-3 border-t border-foreground/10 pt-4">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-semibold text-primary"
              >
                {avatarInitial(item.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
