import Link from 'next/link'
import { getMangaTags } from '@/lib/mangadex'
import { getLocale } from '@/lib/locale'
import { getMessages, getMangaTitleLanguages, getLocalizedTagName } from '@/lib/i18n'
import { localePath, localizedMetadata } from '@/lib/locale-path'

export async function generateMetadata() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return {
    title: messages.genresPageTitle,
    description: messages.genresPageDescription,
    alternates: localizedMetadata(locale, '/genres'),
  }
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
  'Historical', 'Psychological', 'Mecha',
]

const GENRE_ICONS: Record<string, string> = {
  Action: '⚔️', Adventure: '🗺️', Comedy: '😂', Drama: '🎭',
  Fantasy: '🧙', Horror: '👻', Mystery: '🔍', Romance: '💕',
  'Sci-Fi': '🚀', 'Slice of Life': '☕', Sports: '⚽', Supernatural: '✨',
  Thriller: '😱', Historical: '📜', Psychological: '🧠', Mecha: '🤖',
}

export default async function GenresPage() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  let tags: Awaited<ReturnType<typeof getMangaTags>> = []
  try { tags = await getMangaTags() } catch { /* Keep the curated navigation available during API outages. */ }
  const genreTags = tags.filter((tag) => tag.attributes.group === 'genre')
  const tagLabel = (name: Record<string, string>) => {
    const localizedName = getMangaTitleLanguages(locale).map((lang) => name[lang]).find(Boolean) || name.en || Object.values(name)[0] || ''
    return getLocalizedTagName(localizedName, locale)
  }
  const toTagLink = (tag: (typeof tags)[number]) => ({
    id: tag.id,
    name: tag.attributes.name.en || Object.values(tag.attributes.name)[0] || tag.id,
    label: tagLabel(tag.attributes.name),
  })
  const sections = [
    {
      key: 'genre',
      title: messages.genresSectionTitle,
      tags: genreTags.length
        ? genreTags.map(toTagLink)
        : GENRES.map((name) => ({ id: '', name, label: getLocalizedTagName(name, locale) })),
    },
    {
      key: 'theme',
      title: messages.themesSectionTitle,
      tags: tags.filter((tag) => tag.attributes.group === 'theme').map(toTagLink),
    },
    {
      key: 'content',
      title: messages.contentTagsSectionTitle,
      tags: tags.filter((tag) => tag.attributes.group === 'content').map(toTagLink),
    },
  ]

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href={localePath(locale, '/')} className="hover:text-orange-400">{messages.homeBreadcrumb}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{messages.categoriesBreadcrumb}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-6">{messages.genresPageTitle}</h1>
      <div className="space-y-8">
        {sections.filter((section) => section.tags.length > 0).map((section) => (
          <section key={section.key}>
            <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {section.tags.map((tag) => (
                <Link
                  key={tag.id || tag.name}
                  href={localePath(locale, `/genre/${tag.id || encodeURIComponent(tag.name)}`)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-orange-400 hover:bg-gray-800 transition-all group"
                >
                  <span className="text-2xl">
                    {section.key === 'genre' ? GENRE_ICONS[tag.name] || '📚' : section.key === 'theme' ? '🎭' : '🏷️'}
                  </span>
                  <span className="font-medium text-gray-100 group-hover:text-orange-400 transition-colors">{tag.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
