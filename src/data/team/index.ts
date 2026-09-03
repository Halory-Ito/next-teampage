import type { Member } from '@/types/member'

import { masters } from './master'
import { phds } from './phd'
import { teachers } from './teachers'
import { undergrads } from './undergrad'

/** 所有角色对应的成员列表（成员详情页 / generateStaticParams 的唯一数据入口） */
export const teamByRole = {
  teacher: teachers,
  phd: phds,
  master: masters,
  undergrad: undergrads,
} satisfies Record<Member['role'], Member[]>

/** 展平全部成员，供 generateStaticParams 预渲染使用 */
export const allMembers = Object.values(teamByRole).flat()

/**
 * 按 role + id 查找成员。
 * role 不在合法集合内时直接返回 undefined，避免 URL 注入任意角色。
 */
export function findMember(role: string, id: string): Member | undefined {
  const members = (teamByRole as Record<string, Member[] | undefined>)[role]
  return members?.find((member) => member.id === id)
}
