import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { allMembers, findMember } from '@/data/team'
import {
  MemberBiography,
  MemberEducation,
  MemberProfile,
  MemberPublications,
  MemberResearch,
  MemberWorkHistory,
} from '@/features/team'
import type { Locale } from '@/i18n/config'

type PageProps = {
  params: Promise<{ role: string; id: string }>
}

/** 数据变更后请在 generateStaticParams 的返回中同步枚举 role + id */
export function generateStaticParams() {
  return allMembers.map((member) => ({ role: member.role, id: member.id }))
}

// 注意：页面因读取 locale（cookie/accept-language）而必须动态渲染，
// 因此不能使用 dynamicParams = false（否则构建期未预渲染的路径会全部 404）。
// 非法 role + id 由 findMember() 返回 undefined 并触发 notFound() 兜底 404。
export const dynamicParams = true

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role, id } = await params
  const locale = (await getLocale()) as Locale
  const member = findMember(locale, role, id)
  if (!member) return {}

  const displayName = member.nameEn ? `${member.name} · ${member.nameEn}` : member.name
  const description = member.introduction || member.research

  return {
    title: displayName,
    description,
    openGraph: {
      title: displayName,
      description,
      type: 'profile',
    },
  }
}

export default async function MemberPage({ params }: PageProps) {
  const { role, id } = await params
  const locale = (await getLocale()) as Locale
  const member = findMember(locale, role, id)
  if (!member) notFound()

  const t = await getTranslations('Team.Member')

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl w-full">
        <Link
          href="/team"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('backToTeam')}
        </Link>

        <div className="mt-6 grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* 个人资料卡片 */}
          <MemberProfile member={member} />

          {/* 详细内容 */}
          <div className="flex min-w-0 flex-col gap-4">
            <MemberResearch research={member.research} />
            <MemberBiography biography={member.introduction} />
            <MemberEducation items={member.education} />
            <MemberWorkHistory items={member.workHistory} />
            <MemberPublications orcid={member.orcid} />
          </div>
        </div>
      </div>
    </div>
  )
}
