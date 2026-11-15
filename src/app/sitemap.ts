import type { MetadataRoute } from 'next'
import { getLatestManga, getMangaTags, getPopularManga } from '@/lib/mangadex'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n'
import { localePath } from '@/lib/locale-path'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'

function localizedAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [
      locale,
      new URL(localePath(locale, path), SITE_URL).toString(),
    ])),
    'x-default': new URL(localePath(DEFAULT_LOCALE, path), SITE_URL).toString(),
  }
}

function localizedEntries(path: string, priority: number): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: new URL(localePath(locale, path), SITE_URL).toString(),
    alternates: { languages: localizedAlternates(path) },
    priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: Array<[string, number]> = [
    ['/', 1],
    ['/popular', 0.9],
    ['/latest', 0.9],
    ['/genres', 0.7],
    ['/about', 0.3],
    ['/privacy', 0.3],
  ]
  const localizedStaticPages = staticPaths.flatMap(([path, priority]) => localizedEntries(path, priority))
  const [mangaResults, tags] = await Promise.all([
    Promise.all(LOCALES.flatMap((locale) => [
      getPopularManga(100, 0, locale),
      getLatestManga(100, 0, locale),
    ])),
    getMangaTags(),
  ])
  const manga = new Map(mangaResults.flatMap((result) => result.data).map((item) => [item.id, item]))
  const mangaPages: MetadataRoute.Sitemap = Array.from(manga.values()).flatMap((item) =>
    LOCALES.map((locale) => ({
      url: new URL(localePath(locale, `/manga/${item.id}`), SITE_URL).toString(),
      lastModified: new Date(item.attributes.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: { languages: localizedAlternates(`/manga/${item.id}`) },
    }))
  )
  const tagPages = Array.from(
    new Set(tags.filter((tag) => ['genre', 'theme', 'content'].includes(tag.attributes.group)).map((tag) => tag.id)),
    (id) => localizedEntries(`/genre/${id}`, 0.5),
  ).flat()

  return [...localizedStaticPages, ...tagPages, ...mangaPages]
}
