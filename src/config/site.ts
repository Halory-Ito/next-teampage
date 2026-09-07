/**
 * 站点级配置
 *
 * 部署地址通过 NEXT_PUBLIC_SITE_URL 注入（用于 metadataBase 与 OG 图片的绝对 URL），
 * 未配置时回退到本地开发地址。
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
