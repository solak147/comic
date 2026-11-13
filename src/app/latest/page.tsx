import type { Metadata } from 'next'
import { getLatestManga, getCoverUrl, getMangaTitle } from '@/lib/mangadex'
import { formatRelativeTime, getPageNumber } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/app/components/Pagination'

export const metadata: Metadata = {
  title: '最新更新漫畫',
  description: '查看最近更新的漫畫，不錯過任何新章節。',
}

type Props = { searchParams: Promise<{ page?: string | string[] }> }

export default async function LatestPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = getPageNumber(pageParam)
  const limit = 20
  const results = await getLatestManga(limit, (page - 1) * limit)
  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-400">首頁</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">最新更新</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">🆕 最新更新漫畫</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {results.data.map((manga) => {
          const title = getMangaTitle(manga)
          const coverUrl = getCoverUrl(manga, '256')
          return (
            <Link key={manga.id} href={`/manga/${manga.id}`}
              className="group flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-400 transition-all">
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                <Image src={coverUrl} alt={title} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-orange-400 transition-colors">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(manga.attributes.updatedAt)}</p>
              </div>
            </Link>
          )
        })}
      </div>
      <Pagination href="/latest" page={page} limit={limit} total={results.total ?? 0} />
    </div>
  )
}
