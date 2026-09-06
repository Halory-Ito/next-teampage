import type { Locale } from '@/i18n/config'
import type { Testimonial } from '@/types/testimonial'

import * as en from './en'
import * as zhCn from './zh-cn'

/** 按语言聚合的学生评价，消费端用 useLocale() / getLocale() 选择对应语言 */
export const testimonialsByLocale: Record<Locale, Testimonial[]> = {
  en: en.homeTestimonials,
  'zh-cn': zhCn.homeTestimonials,
}