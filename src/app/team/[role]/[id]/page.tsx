import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { allMembers, findMember } from '@/data/team'
import MemberBiography from '@/features/team/components/member-biography'
import MemberEducation from '@/features/team/components/member-education'
import MemberProfile from '@/features/team/components/member-profile'
import MemberPublications from '@/features/team/components/member-publications'
import MemberResearch from '@/features/team/components/member-research'
import MemberWorkHistory from '@/features/team/components/member-work-history'

type PageProps = {
  params: Promise<{ role: string; id: string }>
}

/** 数据变更后请在 generateStaticParams 的返回中同步枚举 role + id */
export function generateStaticParams() {
  return allMembers.map((member) => ({ role: member.role, id: member.id }))
}

// 所有合法路径都已在构建期枚举，未枚举的路径直接返回 404，无需服务端动态渲染
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role, id } = await params
  const member = findMember(role, id)
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
  const member = findMember(role, id)
  if (!member) notFound()

  const t = await getTranslations('Team.Member')

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl">
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
