// 系统支持的语言列表
const locales = ['en', 'zh-cn'] as const

type Locale = (typeof locales)[number]

export { locales }
export type { Locale }

export const defaultLocale: Locale = 'en'
