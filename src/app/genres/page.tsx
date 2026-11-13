import type { Metadata } from 'next'
import Link from 'next/link'
import { getMangaTags } from '@/lib/mangadex'

export const metadata: Metadata = {
  title: '漫畫分類',
  description: '依分類瀏覽漫畫，包括動作、戀愛、奇幻、恐怖等各種類型。',
}

const GENRES = [
  { name: 'Action', label: '動作' },
  { name: 'Adventure', label: '冒險' },
  { name: 'Comedy', label: '喜劇' },
  { name: 'Drama', label: '劇情' },
  { name: 'Fantasy', label: '奇幻' },
  { name: 'Horror', label: '恐怖' },
  { name: 'Mystery', label: '推理' },
  { name: 'Romance', label: '戀愛' },
  { name: 'Sci-Fi', label: '科幻' },
  { name: 'Slice of Life', label: '日常' },
  { name: 'Sports', label: '運動' },
  { name: 'Supernatural', label: '超自然' },
  { name: 'Thriller', label: '驚悚' },
  { name: 'Historical', label: '歷史' },
  { name: 'Psychological', label: '心理' },
  { name: 'Mecha', label: '機甲' },
]

const GENRE_ICONS: Record<string, string> = {
  Action: '⚔️', Adventure: '🗺️', Comedy: '😂', Drama: '🎭',
  Fantasy: '🧙', Horror: '👻', Mystery: '🔍', Romance: '💕',
  'Sci-Fi': '🚀', 'Slice of Life': '☕', Sports: '⚽', Supernatural: '✨',
  Thriller: '😱', Historical: '📜', Psychological: '🧠', Mecha: '🤖',
}

export default async function GenresPage() {
  let tags: Awaited<ReturnType<typeof getMangaTags>> = []
  try { tags = await getMangaTags() } catch { /* Keep the curated navigation available during API outages. */ }
  const genreTags = tags.filter((tag) => tag.attributes.group === 'genre')
  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-400">首頁</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">分類</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-6">漫畫分類</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {(genreTags.length ? genreTags.map((tag) => ({ name: tag.attributes.name.en, id: tag.id, label: tag.attributes.name['zh-hk'] || tag.attributes.name.zh || tag.attributes.name.en })) : GENRES.map((genre) => ({ name: genre.name, id: '', label: genre.label }))).map((genre) => (
          <Link
            key={genre.id || genre.name}
            href={`/genre/${genre.id || encodeURIComponent(genre.name)}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-orange-400 hover:bg-gray-800 transition-all group"
          >
            <span className="text-2xl">{GENRE_ICONS[genre.name] || '📚'}</span>
            <div>
              <p className="font-medium text-gray-100 group-hover:text-orange-400 transition-colors">{genre.label}</p>
              <p className="text-xs text-gray-500">{genre.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
