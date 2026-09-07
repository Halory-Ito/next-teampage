import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

// 本路由的 page.tsx 是客户端组件，无法导出 metadata，
// 因此在这里用服务端 layout 统一设置该页面的 SEO metadata。
// 成员详情页 /team/[role]/[id] 会通过自己的 generateMetadata 覆盖 title 与 description。
// 注意：title 必须以 { default, template } 形式提供，否则会把上层 title 模板覆盖为 null，
// 导致详情页标题丢失“· 雷大江团队”后缀。
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  const siteName = t('siteName')
  const template = `%s · ${siteName}`
  return {
    title: { default: t('team.title'), template },
    description: t('team.description'),
    openGraph: {
      title: t('team.title'),
      description: t('team.description'),
      type: 'website',
    },
  }
}

export default function TeamLayout({ children }: LayoutProps<'/team'>) {
  return children
}
