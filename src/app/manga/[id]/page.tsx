import type { Metadata } from 'next'
import { getMangaById, getMangaByTagId, getMangaChapters, getMangaStatistics, MANGA_CHAPTER_PAGE_SIZE, getCoverUrl, getMangaTitle, getMangaDescription, getMangaTagName, getMangaExternalLinks, getAuthorName, getSafeExternalUrl } from '@/lib/mangadex'
import { formatChapterTitle, formatRelativeTime, getPageNumber, getStatusLabel, getStatusColor } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import AdUnit from '@/app/components/AdUnit'
import Pagination from '@/app/components/Pagination'
import { notFound } from 'next/navigation'
import { getLocale } from '@/lib/locale'
import { getMessages, translate } from '@/lib/i18n'
import type { ChapterLanguageMode } from '@/lib/mangadex'
import ChapterLanguageSwitcher from '@/app/components/ChapterLanguageSwitcher'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ chapterPage?: string | string[]; chapterLanguage?: string | string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const locale = await getLocale()
  const messages = getMessages(locale)
  let manga
  try { manga = await getMangaById(id) } catch { return { title: messages.chapterNotFound, robots: { index: false } } }
  const title = getMangaTitle(manga, locale)
  const description = getMangaDescription(manga, locale).slice(0, 160)
  const coverUrl = getCoverUrl(manga, '512')
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: coverUrl, width: 512, alt: title }],
      type: 'book',
    },
    twitter: { card: 'summary', title, description, images: [coverUrl] },
  }
}

export default async function MangaPage({ params, searchParams }: Props) {
  const [{ id }, { chapterPage: chapterPageParam, chapterLanguage: chapterLanguageParam }] = await Promise.all([params, searchParams])
  const locale = await getLocale()
  const messages = getMessages(locale)
  const chapterPage = getPageNumber(chapterPageParam)
  const languageMode: ChapterLanguageMode = chapterLanguageParam === 'all' ? 'all' : 'site'
  let manga
  try { manga = await getMangaById(id) } catch { notFound() }
  const relatedTag = manga.attributes.tags.find((tag) => tag.attributes.group === 'genre')
  const [chaptersData, relatedData, statistics] = await Promise.all([
    getMangaChapters(id, (chapterPage - 1) * MANGA_CHAPTER_PAGE_SIZE, locale, languageMode),
    relatedTag ? getMangaByTagId(relatedTag.id, 8, 0, locale) : Promise.resolve(null),
    getMangaStatistics(id),
  ])
  const relatedManga = relatedData?.data.filter((item) => item.id !== manga.id).slice(0, 6) ?? []
  const title = getMangaTitle(manga, locale)
  const description = getMangaDescription(manga, locale)
  const externalLinks = getMangaExternalLinks(manga, locale)
  const coverUrl = getCoverUrl(manga, '512')
  const author = getAuthorName(manga)
  const chapters = chaptersData.data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title,
    author: { '@type': 'Person', name: author },
    description: description.slice(0, 300),
    image: coverUrl,
    inLanguage: locale,
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: messages.homeBreadcrumb, item: process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app' },
      { '@type': 'ListItem', position: 2, name: title },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-400">{messages.homeBreadcrumb}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{title}</span>
      </nav>

      <div className={`grid gap-8 ${relatedManga.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_18rem]' : 'grid-cols-1'}`}>
        <div className="min-w-0">
          {/* Manga Info */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="shrink-0 w-full sm:w-48">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  sizes="192px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-sm px-2 py-0.5 rounded bg-gray-800 ${getStatusColor(manga.attributes.status)}`}>
                  {getStatusLabel(manga.attributes.status, locale)}
                </span>
                {manga.attributes.year && (
                  <span className="text-sm px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    {manga.attributes.year}
                  </span>
                )}
                {statistics && (
                  <>
                    {statistics.rating.average !== null && (
                      <span className="text-sm px-2 py-0.5 rounded bg-gray-800 text-amber-300">
                        ★ {messages.ratingLabel}: {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(statistics.rating.average)}
                      </span>
                    )}
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {messages.popularityLabel}: {new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(statistics.follows)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">
                {messages.mangaAuthor}: <span className="text-gray-300">{author}</span>
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {manga.attributes.tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block text-xs bg-gray-800 text-orange-300 rounded px-2 py-0.5 border border-gray-700"
                  >
                    {getMangaTagName(tag, locale)}
                  </span>
                ))}
              </div>
              {description && (
                <p className="text-sm text-gray-400 mt-3 line-clamp-5 leading-relaxed">{description}</p>
              )}
              {externalLinks.length > 0 && (
                <section className="mt-4">
                  <h2 className="text-sm font-semibold text-gray-300 mb-2">{messages.externalLinksTitle}</h2>
                  <div className="flex flex-wrap gap-2">
                    {externalLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-orange-300 hover:border-orange-400 hover:text-orange-200"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Ad */}
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MANGA} label={messages.advertisement} />

          {/* Chapters */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              {translate(locale, 'chapterCount', { count: chaptersData.total ?? 0 })}
            </h2>
            <ChapterLanguageSwitcher mangaId={id} locale={locale} languageMode={languageMode} />
            <Pagination
              href={`/manga/${id}`}
              page={chapterPage}
              limit={MANGA_CHAPTER_PAGE_SIZE}
              total={chaptersData.total ?? 0}
              locale={locale}
              paramName="chapterPage"
              showLastPage
              extraParams={{ chapterLanguage: languageMode }}
            />
            {chapters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{messages.noChapters}</p>
            ) : (
              <div className="grid gap-1">
                {chapters.map((chapter) => {
                  const externalUrl = getSafeExternalUrl(chapter.attributes.externalUrl)
                  return (
                    <Link
                      key={chapter.id}
                      href={`/manga/${id}/chapter/${chapter.id}?chapterPage=${chapterPage}&chapterLanguage=${languageMode}`}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-orange-400/50 transition-all group"
                    >
                      <span className="text-sm text-gray-200 group-hover:text-orange-400 transition-colors">
                        {formatChapterTitle(chapter, locale)}
                      </span>
                      <span className="ml-4 shrink-0 text-xs text-gray-500">
                        {chapter.attributes.translatedLanguage} · {externalUrl ? messages.externalRead : formatRelativeTime(chapter.attributes.publishAt, locale)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
            <Pagination
              href={`/manga/${id}`}
              page={chapterPage}
              limit={MANGA_CHAPTER_PAGE_SIZE}
              total={chaptersData.total ?? 0}
              locale={locale}
              paramName="chapterPage"
              showLastPage
              extraParams={{ chapterLanguage: languageMode }}
            />
          </div>
        </div>

        {relatedManga.length > 0 && (
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="text-lg font-bold text-white mb-4">{messages.relatedManga}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {relatedManga.map((item) => {
                const relatedTitle = getMangaTitle(item, locale)
                return (
                  <Link
                    key={item.id}
                    href={`/manga/${item.id}`}
                    className="group flex gap-3 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-2 hover:border-orange-400 transition-colors"
                  >
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-gray-800">
                      <Image src={getCoverUrl(item, '256')} alt={relatedTitle} fill sizes="64px" className="object-cover" unoptimized />
                    </div>
                    <span className="line-clamp-3 text-sm text-gray-200 group-hover:text-orange-400">{relatedTitle}</span>
                  </Link>
                )
              })}
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
