import { DEFAULT_LOCALE, getLocalizedTagName, getMangaDexLanguage, getMangaTitleLanguages, getMessages, type Locale } from '@/lib/i18n'

const BASE_URL = 'https://api.mangadex.org'
const CONTENT_RATINGS = ['safe', 'suggestive', 'erotica', 'pornographic']
export const MANGA_CHAPTER_PAGE_SIZE = 20
const MANGA_CHAPTER_API_LIMIT = 500
export type ChapterLanguageMode = 'site' | 'all'

export interface MangaAttributes {
  title: Record<string, string>
  altTitles: Record<string, string>[]
  description: Record<string, string>
  status: string
  year: number | null
  contentRating: string
  links?: Record<string, string>
  tags: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }>
  originalLanguage: string
  lastVolume: string | null
  lastChapter: string | null
  updatedAt: string
}

export interface Relationship {
  id: string
  type: string
  attributes?: Record<string, string | number | boolean | null>
}

export interface Manga {
  id: string
  type: 'manga'
  attributes: MangaAttributes
  relationships: Relationship[]
}

export interface ChapterAttributes {
  title: string | null
  volume: string | null
  chapter: string | null
  pages: number
  translatedLanguage: string
  publishAt: string
  readableAt: string
  updatedAt: string
  externalUrl: string | null
}

export interface Chapter {
  id: string
  type: 'chapter'
  attributes: ChapterAttributes
  relationships: Relationship[]
}

export interface MangaDexResponse<T> {
  result: string
  response: string
  data: T
  limit?: number
  offset?: number
  total?: number
}

export interface MangaStatistics {
  follows: number
  rating: {
    average: number | null
    bayesian: number | null
  }
}

export interface MangaExternalLink {
  label: string
  url: string
}

export function getCoverUrl(manga: Manga, size: '256' | '512' | null = null): string {
  const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
  if (!coverRel || !coverRel.attributes?.['fileName']) return '/placeholder-cover.svg'
  const fileName = coverRel.attributes['fileName'] as string
  const query = size ? `?size=${size}` : ''
  return `/api/covers/${manga.id}/${encodeURIComponent(fileName)}${query}`
}

export function getMangaTitle(manga: Manga, locale: Locale = DEFAULT_LOCALE): string {
  const title = manga.attributes.title
  const localizedTitle = getMangaTitleLanguages(locale)
    .map((lang) => title[lang] || manga.attributes.altTitles.find((altTitle) => altTitle[lang])?.[lang])
    .find(Boolean)
  return localizedTitle || Object.values(title)[0] || 'Unknown Title'
}

export function getMangaDescription(manga: Manga, locale: Locale = DEFAULT_LOCALE): string {
  const desc = manga.attributes.description
  if (!desc) return ''
  return getMangaTitleLanguages(locale).map((lang) => desc[lang]).find(Boolean)
    || desc[manga.attributes.originalLanguage]
    || desc['en']
    || ''
}

export function getMangaTagName(tag: MangaAttributes['tags'][number], locale: Locale): string {
  const localizedName = getMangaTitleLanguages(locale).map((lang) => tag.attributes.name[lang]).find(Boolean)
    || tag.attributes.name.en
    || Object.values(tag.attributes.name)[0]
    || ''
  return getLocalizedTagName(localizedName, locale)
}

export function getAuthorName(manga: Manga): string {
  const author = manga.relationships.find((r) => r.type === 'author')
  return (author?.attributes?.['name'] as string) || 'Unknown Author'
}

export function getSafeExternalUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function getMangaExternalLinks(manga: Manga, locale: Locale): MangaExternalLink[] {
  const links = manga.attributes.links ?? {}
  const messages = getMessages(locale)
  const externalLinks: MangaExternalLink[] = [
    { label: messages.mangaDex, url: `https://mangadex.org/title/${manga.id}` },
  ]
  const addUrl = (label: string, value: string | undefined, baseUrl?: string) => {
    if (!value) return
    const url = getSafeExternalUrl(baseUrl ? `${baseUrl}${encodeURIComponent(value)}` : value)
    if (url) externalLinks.push({ label, url })
  }

  addUrl(messages.officialSource, links['raw'])
  addUrl(messages.officialEnglish, links['engtl'])
  addUrl(messages.aniList, links['al'], 'https://anilist.co/manga/')
  addUrl(messages.animePlanet, links['ap'], 'https://www.anime-planet.com/manga/')
  addUrl(messages.kitsu, links['kt'], 'https://kitsu.io/manga/')
  addUrl(messages.mangaUpdates, links['mu'], 'https://www.mangaupdates.com/series/')
  addUrl(messages.myAnimeList, links['mal'], 'https://myanimelist.net/manga/')
  addUrl(messages.novelUpdates, links['nu'], 'https://www.novelupdates.com/series/')

  return externalLinks
}

async function apiFetch<T>(path: string, params?: Record<string, string | string[] | number>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v))
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'MangaReader/1.0 (contact: configure NEXT_PUBLIC_SITE_URL)' },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(10000),
  })
  if (res.status === 404) throw new Error('MangaDex item not found')
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`)
  return res.json() as Promise<T>
}

const commonParams = (locale: Locale) => ({
  'includes[]': ['cover_art', 'author'],
  'contentRating[]': CONTENT_RATINGS,
  'availableTranslatedLanguage[]': [getMangaDexLanguage(locale)],
})

export async function getPopularManga(limit = 20, offset = 0, locale: Locale = DEFAULT_LOCALE): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    ...commonParams(locale),
    'order[followedCount]': 'desc',
  })
  return data
}

export async function getLatestManga(limit = 20, offset = 0, locale: Locale = DEFAULT_LOCALE): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    ...commonParams(locale),
    'order[updatedAt]': 'desc',
  })
  return data
}

export async function searchManga(query: string, limit = 20, offset = 0, locale: Locale = DEFAULT_LOCALE): Promise<MangaDexResponse<Manga[]>> {
  return apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    title: query,
    limit,
    offset,
    ...commonParams(locale),
  })
}

export async function getMangaById(id: string): Promise<Manga> {
  const data = await apiFetch<MangaDexResponse<Manga>>(`/manga/${id}`, {
    'includes[]': ['cover_art', 'author', 'artist'],
    'contentRating[]': CONTENT_RATINGS,
  })
  return data.data
}

export async function getMangaStatistics(id: string): Promise<MangaStatistics | null> {
  const data = await apiFetch<{ statistics: Record<string, MangaStatistics> }>(`/statistics/manga/${id}`)
  return data.statistics[id] ?? null
}

export async function getMangaChapters(
  mangaId: string,
  offset = 0,
  locale: Locale = DEFAULT_LOCALE,
  languageMode: ChapterLanguageMode = 'site'
): Promise<MangaDexResponse<Chapter[]>> {
  const params = {
    'order[chapter]': 'desc',
    'contentRating[]': CONTENT_RATINGS,
    'includes[]': ['scanlation_group'],
  }
  if (languageMode === 'site') {
    return apiFetch<MangaDexResponse<Chapter[]>>(`/manga/${mangaId}/feed`, {
      ...params,
      limit: MANGA_CHAPTER_PAGE_SIZE,
      offset,
      'translatedLanguage[]': [getMangaDexLanguage(locale)],
    })
  }

  const fetchPage = (pageOffset: number) =>
    apiFetch<MangaDexResponse<Chapter[]>>(`/manga/${mangaId}/feed`, {
      ...params,
      limit: MANGA_CHAPTER_API_LIMIT,
      offset: pageOffset,
    })
  const firstPage = await fetchPage(0)
  const total = firstPage.total ?? firstPage.data.length
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.ceil(total / MANGA_CHAPTER_API_LIMIT) - 1 },
      (_, index) => fetchPage((index + 1) * MANGA_CHAPTER_API_LIMIT)
    )
  )
  const languagePriority = new Map(getMangaTitleLanguages(locale).map((language, index) => [language, index]))
  const chaptersByNumber = new Map<string, Chapter>()

  for (const chapter of [...firstPage.data, ...remainingPages.flatMap((page) => page.data)]) {
    const number = chapter.attributes.chapter?.trim()
    const normalizedNumber = number && Number.isFinite(Number(number))
      ? String(Number(number))
      : number?.toLocaleLowerCase()
    const key = normalizedNumber ? `chapter:${normalizedNumber}` : `id:${chapter.id}`
    const existing = chaptersByNumber.get(key)
    if (
      !existing ||
      (languagePriority.get(chapter.attributes.translatedLanguage) ?? Infinity) <
        (languagePriority.get(existing.attributes.translatedLanguage) ?? Infinity)
    ) {
      chaptersByNumber.set(key, chapter)
    }
  }

  const chapters = [...chaptersByNumber.values()]
  return {
    ...firstPage,
    data: chapters.slice(offset, offset + MANGA_CHAPTER_PAGE_SIZE),
    limit: MANGA_CHAPTER_PAGE_SIZE,
    offset,
    total: chapters.length,
  }
}

export async function getMangaTags(): Promise<Array<{ id: string; attributes: { name: Record<string, string>; group: string } }>> {
  const data = await apiFetch<{ data: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }> }>('/manga/tag')
  return data.data
}

export async function getMangaByTagId(tagId: string, limit = 20, offset = 0, locale: Locale = DEFAULT_LOCALE): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    'includedTags[]': tagId,
    ...commonParams(locale),
    'order[followedCount]': 'desc',
  })
  return data
}

export async function getChapterPages(chapterId: string): Promise<{ baseUrl: string; chapter: { hash: string; data: string[]; dataSaver: string[] } }> {
  const data = await apiFetch<{ baseUrl: string; chapter: { hash: string; data: string[]; dataSaver: string[] } }>(`/at-home/server/${chapterId}`)
  return data
}

export async function getChapterById(chapterId: string): Promise<Chapter> {
  const data = await apiFetch<MangaDexResponse<Chapter>>(`/chapter/${chapterId}`)
  return data.data
}

export async function getMangaByTag(tagName: string, limit = 20, locale: Locale = DEFAULT_LOCALE): Promise<Manga[]> {
  // First get tag id
  const tagsData = await apiFetch<{ data: Array<{ id: string; attributes: { name: Record<string, string> } }> }>('/manga/tag')
  const tag = tagsData.data.find((t) => t.attributes.name['en']?.toLowerCase() === tagName.toLowerCase())
  if (!tag) return []
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    'includedTags[]': tag.id,
    'order[followedCount]': 'desc',
    ...commonParams(locale),
  })
  return data.data
}
