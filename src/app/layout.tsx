import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

import './globals.css'
import { Noto_Serif, Noto_Sans } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { siteUrl } from '@/config/site'
import AppLayout from '@/features/layout/composable/app-layout'
import { cn } from '@/lib/utils'

const notoSansHeading = Noto_Sans({ subsets: ['latin'], variable: '--font-heading' })

const notoSerif = Noto_Serif({ subsets: ['latin'], variable: '--font-serif' })

/** 页面语言与 Open Graph locale 的映射 */
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  'zh-cn': 'zh_CN',
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  const locale = await getLocale()
  const siteName = t('siteName')

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s · ${siteName}`,
    },
    description: t('home.description'),
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale] ?? 'en_US',
      siteName,
      title: t('home.title'),
      description: t('home.description'),
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale()
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={cn(
        'h-full',
        'antialiased',
        'font-serif',
        notoSerif.variable,
        notoSansHeading.variable,
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <AppLayout>{children}</AppLayout>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
