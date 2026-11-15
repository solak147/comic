import { getPopularManga, getCoverUrl, getMangaTitle } from '@/lib/mangadex'
import { getPageNumber } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/app/components/Pagination'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'
import { localePath, localizedMetadata } from '@/lib/locale-path'

export async function generateMetadata() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return {
    title: messages.popularPageTitle,
    description: messages.popularPageDescription,
    alternates: localizedMetadata(locale, '/popular'),
  }
}

type Props = { searchParams: Promise<{ page?: string | string[] }> }

export default async function PopularPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const locale = await getLocale()
  const messages = getMessages(locale)
  const page = getPageNumber(pageParam)
  const limit = 20
  const results = await getPopularManga(limit, (page - 1) * limit, locale)
  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href={localePath(locale, '/')} className="hover:text-orange-400">{messages.homeBreadcrumb}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{messages.navPopular}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">{messages.popularPageTitle}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {results.data.map((manga, i) => {
          const title = getMangaTitle(manga, locale)
          const coverUrl = getCoverUrl(manga, '256')
          return (
            <Link key={manga.id} href={localePath(locale, `/manga/${manga.id}`)}
              className="group relative flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-400 transition-all">
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                <Image src={coverUrl} alt={title} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">#{(page - 1) * limit + i + 1}</span>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-orange-400 transition-colors">{title}</h3>
              </div>
            </Link>
          )
        })}
      </div>
      <Pagination href="/popular" page={page} limit={limit} total={results.total ?? 0} locale={locale} />
    </div>
  )
}
