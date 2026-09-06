import type { Locale } from '@/i18n/config'
import type { News } from '@/types/news'

import * as en from './en'
import * as zhCn from './zh-cn'

/** 按语言聚合的新闻数据，消费端用 useLocale() / getLocale() 选择对应语言 */
export const newsByLocale: Record<Locale, News[]> = {
  en: en.news,
  'zh-cn': zhCn.news,
}