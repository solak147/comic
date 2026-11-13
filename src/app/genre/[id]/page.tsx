import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getMangaByTagId, getMangaTags, getMangaTitle, getCoverUrl, getAuthorName } from '@/lib/mangadex'
import Pagination from '@/app/components/Pagination'
import { getPageNumber } from '@/lib/utils'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string | string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let tagName = '漫畫分類'
  try {
    const tags = await getMangaTags()
    tagName = tags.find((tag) => tag.id === id)?.attributes.name['zh-hk'] || tags.find((tag) => tag.id === id)?.attributes.name.en || tagName
  } catch { /* Metadata can use the generic fallback if MangaDex is unavailable. */ }
  return { title: `${tagName}漫畫`, description: `瀏覽${tagName}題材漫畫，探索更多作品與最新更新。` }
}

export default async function GenrePage({ params, searchParams }: Props) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams])
  const page = getPageNumber(pageParam)
  const limit = 20
  const tags = await getMangaTags()
  const tag = tags.find((item) => item.id === id || item.attributes.name.en?.toLowerCase() === decodeURIComponent(id).toLowerCase())
  if (!tag) return <div className="py-20 text-center text-gray-400">找不到這個漫畫分類。</div>
  const results = await getMangaByTagId(tag.id, limit, (page - 1) * limit)
  const genreHref = `/genre/${encodeURIComponent(id)}`
  const name = tag.attributes.name['zh-hk'] || tag.attributes.name.zh || tag.attributes.name.en
  return <>
    <nav aria-label="麵包屑" className="mb-4 text-sm text-gray-500"><Link href="/">首頁</Link><span className="mx-2">/</span><Link href="/genres">分類</Link><span className="mx-2">/</span>{name}</nav>
    <h1 className="mb-6 text-2xl font-bold">{name}漫畫</h1>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {results.data.map((item) => <Link key={item.id} href={`/manga/${item.id}`} className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 hover:border-orange-400">
        <div className="relative aspect-[2/3] bg-gray-800"><Image src={getCoverUrl(item, '256')} alt={`${getMangaTitle(item)} 封面`} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover" unoptimized /></div>
        <div className="p-3"><h2 className="line-clamp-2 text-sm font-semibold group-hover:text-orange-400">{getMangaTitle(item)}</h2><p className="mt-1 text-xs text-gray-500">{getAuthorName(item)}</p></div>
      </Link>)}
    </div>
    <Pagination href={genreHref} page={page} limit={limit} total={results.total ?? 0} />
  </>
}
