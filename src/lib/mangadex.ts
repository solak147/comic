const BASE_URL = 'https://api.mangadex.org'

export interface MangaAttributes {
  title: Record<string, string>
  altTitles: Record<string, string>[]
  description: Record<string, string>
  status: string
  year: number | null
  contentRating: string
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

export function getCoverUrl(manga: Manga, size: '256' | '512' | null = null): string {
  const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
  if (!coverRel || !coverRel.attributes?.['fileName']) return '/placeholder-cover.svg'
  const fileName = coverRel.attributes['fileName'] as string
  const query = size ? `?size=${size}` : ''
  return `/api/covers/${manga.id}/${encodeURIComponent(fileName)}${query}`
}

export function getMangaTitle(manga: Manga, lang = 'zh-hk'): string {
  const title = manga.attributes.title
  return title[lang] || title['zh'] || title['en'] || title['ja-ro'] || Object.values(title)[0] || 'Unknown Title'
}

export function getMangaDescription(manga: Manga, lang = 'zh-hk'): string {
  const desc = manga.attributes.description
  if (!desc) return ''
  return desc[lang] || desc['zh'] || desc['en'] || Object.values(desc)[0] || ''
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

const COMMON_PARAMS = {
  'includes[]': ['cover_art', 'author'],
  'contentRating[]': ['safe', 'suggestive'],
  'availableTranslatedLanguage[]': ['zh', 'zh-hk', 'en'],
}

export async function getPopularManga(limit = 20, offset = 0): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    ...COMMON_PARAMS,
    'order[followedCount]': 'desc',
    'contentRating[]': ['safe', 'suggestive'],
  })
  return data
}

export async function getLatestManga(limit = 20, offset = 0): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    ...COMMON_PARAMS,
    'order[updatedAt]': 'desc',
    'contentRating[]': ['safe', 'suggestive'],
  })
  return data
}

export async function searchManga(query: string, limit = 20, offset = 0): Promise<MangaDexResponse<Manga[]>> {
  return apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    title: query,
    limit,
    offset,
    ...COMMON_PARAMS,
    'contentRating[]': ['safe', 'suggestive'],
  })
}

export async function getMangaById(id: string): Promise<Manga> {
  const data = await apiFetch<MangaDexResponse<Manga>>(`/manga/${id}`, {
    'includes[]': ['cover_art', 'author', 'artist'],
    'contentRating[]': ['safe', 'suggestive'],
  })
  return data.data
}

export async function getMangaChapters(mangaId: string, offset = 0): Promise<MangaDexResponse<Chapter[]>> {
  return apiFetch<MangaDexResponse<Chapter[]>>(`/manga/${mangaId}/feed`, {
    limit: 96,
    offset,
    'translatedLanguage[]': ['zh', 'zh-hk', 'en'],
    'order[chapter]': 'desc',
    'contentRating[]': ['safe', 'suggestive'],
    'includes[]': ['scanlation_group'],
  })
}

export async function getMangaTags(): Promise<Array<{ id: string; attributes: { name: Record<string, string>; group: string } }>> {
  const data = await apiFetch<{ data: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }> }>('/manga/tag')
  return data.data
}

export async function getMangaByTagId(tagId: string, limit = 20, offset = 0): Promise<MangaDexResponse<Manga[]>> {
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    offset,
    'includedTags[]': tagId,
    ...COMMON_PARAMS,
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

export async function getMangaByTag(tagName: string, limit = 20): Promise<Manga[]> {
  // First get tag id
  const tagsData = await apiFetch<{ data: Array<{ id: string; attributes: { name: Record<string, string> } }> }>('/manga/tag')
  const tag = tagsData.data.find((t) => t.attributes.name['en']?.toLowerCase() === tagName.toLowerCase())
  if (!tag) return []
  const data = await apiFetch<MangaDexResponse<Manga[]>>('/manga', {
    limit,
    'includedTags[]': tag.id,
    'includes[]': ['cover_art', 'author'],
    'order[followedCount]': 'desc',
    'contentRating[]': ['safe', 'suggestive'],
  })
  return data.data
}
