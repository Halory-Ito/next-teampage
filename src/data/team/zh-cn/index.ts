import type { Member } from '@/types/member'

import { masters } from './master'
import { phds } from './phd'
import { teachers } from './teachers'
import { undergrads } from './undergrad'

/** 本语言下所有角色对应的成员列表 */
export const teamByRole = {
  teacher: teachers,
  phd: phds,
  master: masters,
  undergrad: undergrads,
} satisfies Record<Member['role'], Member[]>