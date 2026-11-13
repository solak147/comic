import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_NAME = 'MangaRead - 免費漫畫閱讀'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: '免費線上閱讀最新漫畫，提供豐富的中文漫畫資源，包括日漫、港漫、韓漫等，極致閱讀體驗。',
  keywords: ['漫畫', '免費漫畫', '線上漫畫', '日漫', '中文漫畫', '漫畫閱讀', 'manga', 'comic', 'free manga'],
  authors: [{ name: 'MangaRead' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    alternateLocale: ['en_US', 'zh_CN'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: '免費線上閱讀最新漫畫，提供豐富的中文漫畫資源。',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: '免費線上閱讀最新漫畫，提供豐富的中文漫畫資源。',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
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
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <a href="/" aria-label="MangaRead 首頁" className="text-xl font-bold text-orange-400 shrink-0">📚 MangaRead</a>
            <form action="/search" method="GET" className="flex-1 max-w-md">
              <input
                name="q"
                type="search"
                placeholder="搜尋漫畫..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400"
              />
            </form>
            <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
              <a href="/popular" className="hover:text-orange-400 transition-colors">熱門</a>
              <a href="/latest" className="hover:text-orange-400 transition-colors">最新更新</a>
              <a href="/genres" className="hover:text-orange-400 transition-colors">分類</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-600">
          <p>© 2026 MangaRead. 本站資料來源為 <a href="https://mangadex.org" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">MangaDex</a></p>
          <p className="mt-1">本站僅供學習與個人娛樂，漫畫版權歸原作者所有</p>
          <nav aria-label="網站資訊" className="mt-3 flex justify-center gap-4"><a href="/about" className="hover:text-orange-400">關於本站</a><a href="/privacy" className="hover:text-orange-400">隱私權政策</a></nav>
        </footer>
      </body>
    </html>
  )
}
