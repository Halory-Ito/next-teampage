import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { allMembers, findMember } from '@/data/team'
import MemberPublications from '@/features/team/components/member-publications'
import type { Member } from '@/types/member'

type PageProps = {
  params: Promise<{ role: string; id: string }>
}

const roleLabel: Record<Member['role'], string> = {
  teacher: 'Teacher',
  phd: 'PhD',
  master: 'Master',
  undergrad: 'Undergraduate',
}

interface MemberLink {
  href: string
  label: string
  icon: LucideIcon
}

function buildMemberLinks(member: Member): MemberLink[] {
  const links: MemberLink[] = []
  if (member.homepage) links.push({ href: member.homepage, label: 'Homepage', icon: Globe })
  if (member.githubLink) links.push({ href: member.githubLink, label: 'GitHub', icon: Link2 })
  if (member.email) links.push({ href: `mailto:${member.email}`, label: member.email, icon: Mail })
  if (member.orcid)
    links.push({
      href: `https://orcid.org/${member.orcid}`,
      label: `ORCID · ${member.orcid}`,
      icon: BadgeCheck,
    })
  return links
}

const isExternal = (href: string) => href.startsWith('http')

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

  const links = buildMemberLinks(member)
  const research = member.research.trim()
  const introduction = member.introduction.trim()

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/team"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回团队成员
        </Link>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* 个人资料卡片 */}
          <aside className="lg:sticky lg:top-36">
            <Card className="overflow-hidden p-0">
              <div className="flex flex-col">
                {/* 头像 + 基本信息：小屏左右横排，lg+ 改为上下通栏 */}
                <div className="flex items-center gap-4 p-5 lg:block lg:p-0">
                <Image
                  src={member.avatarUrl}
                  alt={`${member.name} 的头像`}
                  width={640}
                  height={640}
                  sizes="(min-width: 1024px) 320px, 112px"
                  priority
                  className="size-24 shrink-0 rounded-xl object-cover lg:aspect-square lg:h-auto lg:w-full lg:rounded-none"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:w-full lg:gap-3 lg:px-6 lg:pt-6 lg:pb-6">
                  <header className="flex flex-col gap-1">
                    <h1 className="font-heading text-xl font-semibold tracking-tight text-pretty lg:text-2xl">
                      {member.name}
                    </h1>
                    {member.nameEn && (
                      <p className="truncate text-sm text-muted-foreground">
                        {member.nameEn}
                      </p>
                    )}
                  </header>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{roleLabel[member.role]}</Badge>
                    <Badge variant="secondary">@{member.grade}</Badge>
                    {member.career && (
                      <Badge variant="secondary">{member.career}</Badge>
                    )}
                  </div>
                </div>
              </div>

                {links.length > 0 && (
                  <>
                    <Separator className="mx-5 lg:mx-6" />
                    <ul
                      className="flex flex-col gap-0.5 px-5 pt-4 pb-5 lg:px-6 lg:pt-4 lg:pb-6"
                      aria-label="联系方式"
                    >
                      {links.map(({ href, label, icon: Icon }) => (
                        <li key={href}>
                          <a
                            href={href}
                            {...(isExternal(href)
                              ? { target: '_blank', rel: 'noreferrer' }
                              : {})}
                            className="group flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 truncate">{label}</span>
                            {isExternal(href) && (
                              <ExternalLink className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Card>
          </aside>

          {/* 详细内容 */}
          <div className="flex min-w-0 flex-col gap-6">
            <Card>
              <CardHeader>
                <h2 className="font-heading text-xl font-semibold tracking-tight">研究方向</h2>
                <CardDescription>Research Areas</CardDescription>
              </CardHeader>
              <CardContent>
                {research ? (
                  <p className="leading-relaxed whitespace-pre-line">{research}</p>
                ) : (
                  <p className="text-muted-foreground">暂无公开的研究方向介绍。</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-heading text-xl font-semibold tracking-tight">个人介绍</h2>
                <CardDescription>Biography</CardDescription>
              </CardHeader>
              <CardContent>
                {introduction ? (
                  <p className="leading-relaxed whitespace-pre-line">{introduction}</p>
                ) : (
                  <p className="text-muted-foreground">暂无公开的个人介绍。</p>
                )}
              </CardContent>
            </Card>

            {member.orcid ? (
              <MemberPublications orcid={member.orcid} />
            ) : (
              <Card>
                <CardHeader>
                  <h2 className="font-heading text-xl font-semibold tracking-tight">发表论文</h2>
                  <CardDescription>Publications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
                    <BookOpen className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">该成员暂未提供 ORCID 编号。</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
