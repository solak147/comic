import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getMangaByTagId, getMangaTags, getMangaTitle, getCoverUrl, getAuthorName } from '@/lib/mangadex'
import Pagination from '@/app/components/Pagination'
import { getPageNumber } from '@/lib/utils'
import { getLocale } from '@/lib/locale'
import { getMessages, getMangaTitleLanguages, getLocalizedTagName, translate } from '@/lib/i18n'
import { localePath, localizedMetadata } from '@/lib/locale-path'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string | string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const locale = await getLocale()
  const messages = getMessages(locale)
  let tagName = messages.genresPageTitle
  try {
    const tags = await getMangaTags()
    const tag = tags.find((item) => item.id === id)
    if (tag) {
      const localizedName = getMangaTitleLanguages(locale).map((lang) => tag.attributes.name[lang]).find(Boolean) || tag.attributes.name.en || tagName
      tagName = getLocalizedTagName(localizedName, locale)
    }
  } catch { /* Metadata can use the generic fallback if MangaDex is unavailable. */ }
  return {
    title: translate(locale, 'genreTitle', { name: tagName }),
    description: translate(locale, 'genreDescription', { name: tagName }),
    alternates: localizedMetadata(locale, `/genre/${id}`),
  }
}

export default async function GenrePage({ params, searchParams }: Props) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams])
  const locale = await getLocale()
  const messages = getMessages(locale)
  const page = getPageNumber(pageParam)
  const limit = 20
  const tags = await getMangaTags()
  const tag = tags.find((item) => item.id === id || item.attributes.name.en?.toLowerCase() === decodeURIComponent(id).toLowerCase())
  if (!tag) notFound()
  const results = await getMangaByTagId(tag.id, limit, (page - 1) * limit, locale)
  const tagHref = `/genre/${encodeURIComponent(id)}`
  const apiName = getMangaTitleLanguages(locale).map((lang) => tag.attributes.name[lang]).find(Boolean) || tag.attributes.name.en
  const name = getLocalizedTagName(apiName, locale)
  return <>
    <nav aria-label={messages.categoriesBreadcrumb} className="mb-4 text-sm text-gray-500"><Link href={localePath(locale, '/')}>{messages.homeBreadcrumb}</Link><span className="mx-2">/</span><Link href={localePath(locale, '/genres')}>{messages.categoriesBreadcrumb}</Link><span className="mx-2">/</span>{name}</nav>
    <h1 className="mb-6 text-2xl font-bold">{translate(locale, 'genreTitle', { name })}</h1>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {results.data.map((item) => <Link key={item.id} href={localePath(locale, `/manga/${item.id}`)} className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 hover:border-orange-400">
        <div className="relative aspect-[2/3] bg-gray-800"><Image src={getCoverUrl(item, '256')} alt={getMangaTitle(item, locale)} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover" unoptimized /></div>
        <div className="p-3"><h2 className="line-clamp-2 text-sm font-semibold group-hover:text-orange-400">{getMangaTitle(item, locale)}</h2><p className="mt-1 text-xs text-gray-500">{getAuthorName(item)}</p></div>
      </Link>)}
    </div>
    <Pagination href={tagHref} page={page} limit={limit} total={results.total ?? 0} locale={locale} />
  </>
}
