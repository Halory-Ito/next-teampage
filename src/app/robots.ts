import type { MetadataRoute } from 'next'

import { siteUrl } from '@/config/site'

/**
 * 爬虫规则 app/robots.ts
 *
 * 与 app/sitemap.ts 成对出现：站点地图地址必须与 sitemap 生成的实际路径一致，
 * 因此这里同样基于 siteUrl 拼接，避免部署域名变更后 robots.txt 指向失效地址。
 */
export default function robots(): MetadataRoute.Robots {
  const origin = new URL(siteUrl).origin

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 构建产物与静态资源无需被搜索引擎收录
      disallow: ['/_next/'],
    },
    sitemap: new URL('/sitemap.xml', origin).toString(),
    host: origin,
  }
}
