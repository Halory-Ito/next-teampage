import type { Locale } from '@/i18n/config'
import { defaultLocale } from '@/i18n/config'
import type { Member } from '@/types/member'

import * as en from './en'
import * as zhCn from './zh-cn'

export type TeamByRole = Record<Member['role'], Member[]>

/** 按语言聚合的成员数据，消费端用 useLocale() / getLocale() 选择对应语言 */
export const teamByRoleByLocale: Record<Locale, TeamByRole> = {
  en: en.teamByRole,
  'zh-cn': zhCn.teamByRole,
}

/** 展平全部成员（按语言） */
export const allMembersByLocale: Record<Locale, Member[]> = {
  en: Object.values(en.teamByRole).flat(),
  'zh-cn': Object.values(zhCn.teamByRole).flat(),
}

/**
 * 取默认语言的一份成员列表，仅供 generateStaticParams 预渲染枚举 role+id 使用：
 * role / id 与语言无关，各语言数据共享同一套标识。
 */
export const allMembers = allMembersByLocale[defaultLocale]

/** 按语言取全部角色 -> 成员列表 */
export function getTeamByRole(locale: Locale): TeamByRole {
  return teamByRoleByLocale[locale]
}

/**
 * 在指定语言下按 role + id 查找成员。
 * role 不在合法集合内时直接返回 undefined，避免 URL 注入任意角色。
 */
export function findMember(locale: Locale, role: string, id: string): Member | undefined {
  const members = (teamByRoleByLocale[locale] as Record<string, Member[] | undefined>)[role]
  return members?.find((member) => member.id === decodeURIComponent(id))
}
