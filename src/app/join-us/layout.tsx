import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

// 本路由的 page.tsx 是客户端组件，无法导出 metadata，
// 因此在这里用服务端 layout 统一设置该页面的 SEO metadata。
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  return {
    title: t('join.title'),
    description: t('join.description'),
    openGraph: {
      title: t('join.title'),
      description: t('join.description'),
      type: 'website',
    },
  }
}

export default function JoinUsLayout({ children }: LayoutProps<'/join-us'>) {
  return children
}
