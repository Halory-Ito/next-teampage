'use client'

import {
  Braces,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  FileText,
  Mail,
  MessageCircle,
  Microscope,
  Rocket,
  Route,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getJoinUs, type JoinUsContact, type JoinUsContent } from '@/data/join-us'
import type { Locale } from '@/i18n/config'

/** “复制完成”提示的展示时长 */
const COPIED_RESET_MS = 1600

/** 小节标题统一样式 */
function SectionTitle({
  id,
  icon: Icon,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight sm:text-xl"
    >
      <Icon aria-hidden="true" className="size-5 text-primary" />
      {children}
    </h2>
  )
}

/**
 * 加入我们 · 课题组介绍 / 招生要求 / 加入流程 / 联系方式
 *
 * 页面文案走 next-intl（messages/*.json），招生内容读取自 src/data/join-us.ts，
 * 换届 / 招生季只改数据文件即可。板块各司其职、信息不重复：
 * 页首（招生对象）→ 关于课题组 → 招生要求（面试 + 算法 + 加分）→ 加入流程 → 联系方式。
 */
export default function JoinUsPage() {
  const t = useTranslations('JoinUs')
  const data: JoinUsContent = getJoinUs(useLocale() as Locale)
  // 记录刚被复制的联系渠道：其按钮短暂显示“已复制”
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const handleCopy = async (contact: JoinUsContact) => {
    try {
      await navigator.clipboard.writeText(contact.value)
      setCopiedLabel(contact.label)
      setTimeout(() => setCopiedLabel(null), COPIED_RESET_MS)
    } catch {
      // 剪贴板不可用时静默失败，值本身已可见
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 pb-16 sm:gap-12 lg:px-0">
      {/* 页首：招生对象入口 */}
      <header className="flex flex-col items-center gap-2.5 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('recruitLine', { target: data.recruitTarget })}
        </p>
      </header>

      {/* 关于课题组 */}
      <section aria-labelledby="join-about-title" className="flex flex-col gap-3">
        <SectionTitle id="join-about-title" icon={Users}>
          {t('aboutTitle')}
        </SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 研究方向 */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope aria-hidden="true" className="size-4 text-primary" />
                {t('researchTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between gap-4">
              <p className="text-sm leading-6 text-muted-foreground">{data.intro}</p>
              <ul className="flex flex-wrap gap-2">
                {data.researchAreas.map((area) => (
                  <li key={area}>
                    <Badge variant="outline" className="px-3 py-1 text-xs font-normal">
                      {area}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 培养模式 */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket aria-hidden="true" className="size-4 text-primary" />
                {t('trainingTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {data.trainingHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-6">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 招生要求：面试内容 + 算法范围 + 加分项，一卡三段 */}
      <section aria-labelledby="join-requirements-title" className="flex flex-col gap-3">
        <SectionTitle id="join-requirements-title" icon={FileText}>
          {t('requirementsTitle')}
        </SectionTitle>
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
            {/* 面试内容 */}
            <div>
              <h3 className="flex items-center gap-2 font-heading text-base font-medium">
                <Code2 aria-hidden="true" className="size-4 text-primary" />
                {t('interviewTitle')}
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {data.interviewSubjects.map((subject) => (
                  <li
                    key={subject.name}
                    className="rounded-xl border border-foreground/10 px-3 py-2.5"
                  >
                    <div className="text-sm font-medium">{subject.name}</div>
                    {subject.note ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{subject.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {/* 算法考核范围 */}
            <div>
              <h3 className="flex items-center gap-2 font-heading text-base font-medium">
                <Braces aria-hidden="true" className="size-4 text-primary" />
                {t('algorithmTitle')}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {data.algorithmTopics.map((topic) => (
                  <li key={topic}>
                    <Badge variant="outline" className="px-3 py-1 text-xs font-normal">
                      {topic}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 加分项 */}
          <div className="flex items-center gap-2 border-t border-foreground/10 px-5 py-3 text-sm sm:px-6">
            <Sparkles aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <span className="font-medium">{t('bonusLabel')}</span>
            {data.bonuses.join('、')}
          </div>
        </div>
      </section>

      {/* 加入流程 */}
      <section aria-labelledby="join-process-title" className="flex flex-col gap-3">
        <SectionTitle id="join-process-title" icon={Route}>
          {t('processTitle')}
        </SectionTitle>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.steps.map((step, index) => (
            <li key={step.title} className="h-full">
              <Card className="h-full">
                <CardContent className="flex h-full flex-col justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <h3 className="font-heading text-sm font-medium">{step.title}</h3>
                  </div>
                  {step.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* 联系方式 */}
      <section aria-labelledby="join-contact-title" className="flex flex-col gap-3">
        <SectionTitle id="join-contact-title" icon={Send}>
          {t('contactTitle')}
        </SectionTitle>
        <ul className="grid gap-3 md:grid-cols-2">
          {data.contacts.map((contact) => {
            const Icon = contact.copyable ? MessageCircle : Mail
            const isCopied = copiedLabel === contact.label
            return (
              <li key={contact.label} className="h-full">
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      <Icon aria-hidden="true" className="size-4" />
                      {contact.label}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {contact.href ? (
                        <a
                          href={contact.href}
                          className="min-w-0 truncate font-mono text-sm font-medium underline-offset-4 hover:underline"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <span className="min-w-0 truncate font-mono text-sm font-semibold tracking-widest">
                          {contact.value}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isCopied}
                        onClick={() => handleCopy(contact)}
                        className="shrink-0"
                      >
                        {isCopied ? (
                          <Check aria-hidden="true" className="size-3.5" />
                        ) : (
                          <Copy aria-hidden="true" className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
