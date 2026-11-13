import { getPopularManga, getLatestManga, getCoverUrl, getMangaTitle, getAuthorName } from '@/lib/mangadex'
import { getStatusLabel, getStatusColor } from '@/lib/utils'
import type { Manga } from '@/lib/mangadex'
import type { Metadata } from 'next'
import Link from 'next/link'
import AdUnit from './components/AdUnit'
import CoverImage from './components/CoverImage'

export const metadata: Metadata = {
  title: '免費線上漫畫閱讀 - 最新熱門漫畫',
  description: '免費線上閱讀最新熱門漫畫，包括日漫、港漫、韓漫，提供中文翻譯，極致閱讀體驗。',
}

function MangaCard({ manga }: { manga: Manga }) {
  const title = getMangaTitle(manga)
  const coverUrl = getCoverUrl(manga, '256')
  const author = getAuthorName(manga)
  const status = manga.attributes.status
  return (
    <Link href={`/manga/${manga.id}`} className="group flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-orange-400/10">
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        <CoverImage
          src={coverUrl}
          alt={title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-black/60 ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{author}</p>
      </div>
    </Link>
  )
}

// AdSense placeholder component
export default async function HomePage() {
  const [popular, latest] = await Promise.all([
    getPopularManga(20),
    getLatestManga(20),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MangaRead - 免費漫畫閱讀',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Hero Banner */}
      <section className="mb-8 rounded-xl bg-gradient-to-r from-orange-900/40 to-gray-900 border border-gray-800 p-6 sm:p-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">免費線上漫畫閱讀</h1>
        <p className="text-gray-400 text-sm sm:text-base">探索最新熱門漫畫，支持中文繁體・簡體・英文</p>
      </section>

      {/* Top Ad */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} />

      {/* Popular Manga */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">🔥 熱門漫畫</h2>
          <Link href="/popular" className="text-sm text-orange-400 hover:underline">查看全部</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {popular.data.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
        </div>
      </section>

      {/* Mid Ad */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MIDDLE} />

      {/* Latest Updates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">🆕 最新更新</h2>
          <Link href="/latest" className="text-sm text-orange-400 hover:underline">查看全部</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {latest.data.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
        </div>
      </section>

      {/* Bottom Ad */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BOTTOM} />
    </>
  )
}
