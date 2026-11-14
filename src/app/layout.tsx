import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'
import { SiteFooter, SiteHeader } from './components/SiteChrome'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = getMessages(locale)
  const localeTag = locale === 'en' ? 'en_US' : locale === 'zh-CN' ? 'zh_CN' : 'zh_TW'
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: messages.siteName, template: `%s | ${messages.siteName}` },
    description: messages.siteDescription,
    keywords: locale === 'en'
      ? ['manga', 'free manga', 'online manga', 'comic', 'manga reader']
      : locale === 'zh-CN'
        ? ['漫画', '免费漫画', '在线漫画', '漫画阅读']
        : ['漫畫', '免費漫畫', '線上漫畫', '漫畫閱讀'],
    authors: [{ name: 'MangaRead' }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: 'website',
      locale: localeTag,
      alternateLocale: ['zh_TW', 'zh_CN', 'en_US'].filter((tag) => tag !== localeTag),
      url: SITE_URL,
      siteName: messages.siteName,
      title: messages.siteName,
      description: messages.siteDescription,
    },
    twitter: { card: 'summary_large_image', title: messages.siteName, description: messages.siteDescription },
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '' },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {ADSENSE_CLIENT ? (
          <Script
            id="adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <Suspense fallback={<div className="h-14 bg-gray-900" />}>
          <SiteHeader />
        </Suspense>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Suspense fallback={<div className="min-h-96" />}>{children}</Suspense>
        </main>
        <Suspense fallback={null}><SiteFooter /></Suspense>
      </body>
    </html>
  )
}
