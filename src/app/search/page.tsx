import type { Metadata } from 'next'
import { searchManga, getCoverUrl, getMangaTitle, getAuthorName } from '@/lib/mangadex'
import { getStatusLabel, getStatusColor } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `搜尋「${q}」的結果` : '搜尋漫畫',
    description: q ? `搜尋「${q}」相關漫畫的結果` : '搜尋您喜歡的漫畫',
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical: '/search' },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const pageNum = Number(page) || 1
  const limit = 20
  const offset = (pageNum - 1) * limit

  let results = null
  if (q && q.trim()) {
    results = await searchManga(q.trim(), limit, offset)
  }

  return (
    <div>
      {/* Search bar */}
      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="搜尋漫畫名稱..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400"
          />
          <button type="submit" className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
            搜尋
          </button>
        </div>
      </form>

      {!q && (
        <div className="text-center text-gray-500 py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p>輸入漫畫名稱開始搜尋</p>
        </div>
      )}

      {q && results && (
        <>
          <h1 className="text-lg font-bold text-white mb-4">
            搜尋「{q}」共找到 {results.total} 個結果
          </h1>
          {results.data.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p className="text-4xl mb-4">😢</p>
              <p>找不到相關漫畫，試試其他關鍵字</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {results.data.map((manga) => {
                const title = getMangaTitle(manga)
                const coverUrl = getCoverUrl(manga, '256')
                const author = getAuthorName(manga)
                return (
                  <Link key={manga.id} href={`/manga/${manga.id}`}
                    className="group flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-400 transition-all">
                    <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                      <Image src={coverUrl} alt={title} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-orange-400 transition-colors">{title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{author}</p>
                      <span className={`text-xs ${getStatusColor(manga.attributes.status)}`}>{getStatusLabel(manga.attributes.status)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {(results.total ?? 0) > limit && (
            <div className="flex justify-center gap-2 mt-8">
              {pageNum > 1 && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${pageNum - 1}`}
                  className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                  上一頁
                </Link>
              )}
              <span className="px-4 py-2 text-gray-400 text-sm">第 {pageNum} 頁</span>
              {offset + limit < (results.total ?? 0) && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${pageNum + 1}`}
                  className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                  下一頁
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
