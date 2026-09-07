import type { Locale } from '@/i18n/config'
import type { Project } from '@/types/project'

import * as en from './en'
import * as zhCn from './zh-cn'

/** 按语言聚合的研发项目数据，消费端用 useLocale() / getLocale() 选择对应语言 */
export const projectsByLocale: Record<Locale, Project[]> = {
  en: en.projects,
  'zh-cn': zhCn.projects,
}

/** 按语言取研发项目列表 */
export function getProjects(locale: Locale): Project[] {
  return projectsByLocale[locale]
}
