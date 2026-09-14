import type { MetadataRoute } from 'next'

import { siteUrl } from '@/config/site'
import { getBlocks } from '@/data/daily'
import { allMembers } from '@/data/team'
import { defaultLocale } from '@/i18n/config'

/**
 * 站点地图 app/sitemap.ts
 *
 * 语言通过 cookie（NEXT_LOCALE）切换、不体现在 URL 上，因此每个路径只收录一条，
 * 无需为多语言生成 alternates。动态详情页的标识（daily block id / team role+id）
 * 跨语言一致，统一用默认语言的数据枚举，保证与 generateStaticParams 覆盖的路径对齐。
 */

/** 拼接部署地址（与 metadataBase 同源）得到绝对 URL */
function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString()
}

export default function sitemap(): MetadataRoute.Sitemap {
  // 站点地图在构建时生成，用同一时间戳作为静态页面的最后修改时间
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1, lastModified },
    { url: absoluteUrl('/team'), changeFrequency: 'weekly', priority: 0.9, lastModified },
    { url: absoluteUrl('/news'), changeFrequency: 'weekly', priority: 0.8, lastModified },
    { url: absoluteUrl('/daily'), changeFrequency: 'weekly', priority: 0.8, lastModified },
    { url: absoluteUrl('/join-us'), changeFrequency: 'monthly', priority: 0.6, lastModified },
  ]

  // 每日板块详情 /daily/[id]
  const dailyRoutes: MetadataRoute.Sitemap = getBlocks(defaultLocale).map((block) => ({
    url: absoluteUrl(`/daily/${block.id}`),
    changeFrequency: 'monthly',
    priority: 0.5,
    lastModified,
  }))

  // 成员详情 /team/[role]/[id]，id 含中文需转义后再拼进 URL
  const teamRoutes: MetadataRoute.Sitemap = allMembers.map((member) => ({
    url: absoluteUrl(`/team/${member.role}/${encodeURIComponent(member.id)}`),
    changeFrequency: 'monthly',
    priority: 0.4,
    lastModified,
  }))

  return [...staticRoutes, ...dailyRoutes, ...teamRoutes]
}
