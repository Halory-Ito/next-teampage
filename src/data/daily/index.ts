import type { Locale } from '@/i18n/config'
import type { DailyBlock, DailyGallery } from '@/types/daily'

import * as en from './en'
import * as zhCn from './zh-cn'

/** 按语言聚合的每日板块数据，消费端用 useLocale() / getLocale() 选择对应语言 */
export const dailyByLocale = {
  en,
  'zh-cn': zhCn,
} as const

/** 按语言取板块列表 */
export function getBlocks(locale: Locale): DailyBlock[] {
  return dailyByLocale[locale].blocks
}

/** 按语言 + 板块 id 取相册列表 */
export function getBlockGalleries(locale: Locale, blockId: string): DailyGallery[] {
  return dailyByLocale[locale].getBlockGalleries(blockId)
}