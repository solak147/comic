import type { MetadataRoute } from 'next'
import { getPopularManga, getLatestManga } from '@/lib/mangadex'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/latest`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/genres`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
  try {
    const manga = await Promise.all([getPopularManga(40), getLatestManga(40)])
    const unique = new Map(manga.flatMap((result) => result.data).map((item) => [item.id, item]))
    return [...staticPages, ...Array.from(unique.values(), (item) => ({
      url: `${SITE_URL}/manga/${item.id}`,
      lastModified: new Date(item.attributes.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))]
  } catch {
    return staticPages
  }
}
