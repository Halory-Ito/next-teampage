import { BadgeCheck, ExternalLink, Globe, Link2, Mail, type LucideIcon } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Member } from '@/types/member'

interface MemberLink {
  href: string
  label: string
  icon: LucideIcon
}

const isExternal = (href: string) => href.startsWith('http')

function buildMemberLinks(member: Member, homepageLabel: string): MemberLink[] {
  const links: MemberLink[] = []
  if (member.homepage) links.push({ href: member.homepage, label: homepageLabel, icon: Globe })
  if (member.githubLink) links.push({ href: member.githubLink, label: 'GitHub', icon: Link2 })
  if (member.email) links.push({ href: `mailto:${member.email}`, label: member.email, icon: Mail })
  if (member.orcid)
    links.push({
      href: `https://orcid.org/${member.orcid}`,
      label: `ORCID`,
      icon: BadgeCheck,
    })
  return links
}

/** 个人资料卡片：头像、基本信息、角色徽章与联系方式 */
export default async function MemberProfile({ member }: { member: Member }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Team.Member')])
  const links = buildMemberLinks(member, t('homepage'))

  // 主名跟随当前语言：中文界面中文名在上、英文名在下；英文界面反之
  const isChinese = locale.startsWith('zh')
  const primaryName = !isChinese && member.nameEn ? member.nameEn : member.name
  const secondaryName = primaryName === member.name ? member.nameEn : member.name

  return (
    <aside className="lg:sticky lg:top-36">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col">
          {/* 头像 + 基本信息：小屏左右横排，lg+ 改为上下通栏 */}
          <div className="flex items-center gap-4 p-4 lg:block lg:p-0">
            <Image
              src={member.avatarUrl}
              alt={t('avatarAlt', { name: primaryName })}
              width={640}
              height={640}
              sizes="(min-width: 1024px) 320px, 112px"
              priority
              className="size-24 shrink-0 rounded-xl object-cover lg:aspect-square lg:h-auto lg:w-full lg:rounded-none"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:w-full lg:gap-3 lg:px-6 lg:pt-6 lg:pb-6">
              <header className="flex flex-col gap-1">
                <h1 className="font-heading text-xl font-semibold tracking-tight text-pretty lg:text-2xl">
                  {primaryName}
                </h1>
                {secondaryName && (
                  <p className="truncate text-sm text-muted-foreground">{secondaryName}</p>
                )}
              </header>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{t(`role.${member.role}`)}</Badge>
                <Badge variant="secondary">@{member.grade}</Badge>
                {member.career && <Badge variant="secondary">{member.career}</Badge>}
              </div>
            </div>
          </div>

          {links.length > 0 && (
            <>
              <Separator />
              <ul className="flex flex-col gap-0.5 p-2" aria-label={t('contactLinks')}>
                {links.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      {...(isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
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
  )
}
