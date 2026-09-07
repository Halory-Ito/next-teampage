import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

// 本路由的 page.tsx 是客户端组件，无法导出 metadata，
// 因此在这里用服务端 layout 统一设置该页面的 SEO metadata。
// 板块详情页 /daily/[id] 会通过自己的 generateMetadata 覆盖 title。
// 注意：title 必须以 { default, template } 形式提供，否则会把上层 title 模板覆盖为 null，
// 导致详情页标题丢失“· 雷大江团队”后缀。
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  const siteName = t('siteName')
  const template = `%s · ${siteName}`
  return {
    title: { default: t('daily.title'), template },
    description: t('daily.description'),
    openGraph: {
      title: t('daily.title'),
      description: t('daily.description'),
      type: 'website',
    },
  }
}

export default function DailyLayout({ children }: LayoutProps<'/daily'>) {
  return children
}
