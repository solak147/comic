import type { Metadata } from 'next'
import { getMangaById, getMangaChapters, getCoverUrl, getMangaTitle, getMangaDescription, getAuthorName, getSafeExternalUrl } from '@/lib/mangadex'
import { formatChapterTitle, formatRelativeTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import AdUnit from '@/app/components/AdUnit'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let manga
  try { manga = await getMangaById(id) } catch { return { title: '找不到漫畫', robots: { index: false } } }
  const title = getMangaTitle(manga)
  const description = getMangaDescription(manga).slice(0, 160)
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

export default async function MangaPage({ params }: Props) {
  const { id } = await params
  let manga
  try { manga = await getMangaById(id) } catch { notFound() }
  const chaptersData = await getMangaChapters(id)
  const title = getMangaTitle(manga)
  const description = getMangaDescription(manga)
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
    inLanguage: ['zh-TW', 'zh-CN', 'en'],
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app' },
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
        <Link href="/" className="hover:text-orange-400">首頁</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{title}</span>
      </nav>

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
              {getStatusLabel(manga.attributes.status)}
            </span>
            {manga.attributes.year && (
              <span className="text-sm px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                {manga.attributes.year}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">
            作者: <span className="text-gray-300">{author}</span>
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {manga.attributes.tags.slice(0, 8).map((tag) => (
              <span
                key={tag.id}
                className="inline-block text-xs bg-gray-800 text-orange-300 rounded px-2 py-0.5 border border-gray-700"
              >
                {tag.attributes.name['en'] || tag.attributes.name['ja'] || ''}
              </span>
            ))}
          </div>
          {description && (
            <p className="text-sm text-gray-400 mt-3 line-clamp-5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Ad */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MANGA} />

      {/* Chapters */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          章節列表 ({chaptersData.total} 章)
        </h2>
        {chapters.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暫無章節</p>
        ) : (
          <div className="grid gap-1">
            {chapters.map((chapter) => {
              const externalUrl = getSafeExternalUrl(chapter.attributes.externalUrl)
              return (
                <Link
                  key={chapter.id}
                  href={`/manga/${id}/chapter/${chapter.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-orange-400/50 transition-all group"
                >
                  <span className="text-sm text-gray-200 group-hover:text-orange-400 transition-colors">
                    {formatChapterTitle(chapter)}
                  </span>
                  <span className="ml-4 shrink-0 text-xs text-gray-500">
                    {externalUrl ? '前往外部閱讀 ↗' : formatRelativeTime(chapter.attributes.publishAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
