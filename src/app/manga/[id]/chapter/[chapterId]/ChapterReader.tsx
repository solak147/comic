'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Zap } from 'lucide-react'
import AdUnit from '@/app/components/AdUnit'

interface Props {
  mangaId: string
  chapterId: string
  pageUrls: string[]
  saverUrls: string[]
  prevChapterId: string | null
  nextChapterId: string | null
  externalUrl: string | null
  currentChapter: {
    id: string
    attributes: {
      chapter: string | null
      title: string | null
      volume: string | null
    }
  } | null
}

export default function ChapterReader({
  mangaId,
  chapterId,
  pageUrls,
  saverUrls,
  prevChapterId,
  nextChapterId,
  currentChapter,
  externalUrl,
}: Props) {
  const [quality, setQuality] = useState<'high' | 'saver'>('saver')
  const [failedPages, setFailedPages] = useState<Record<number, boolean>>({})
  const urls = quality === 'high' ? pageUrls : saverUrls

  const chapterLabel = currentChapter
    ? currentChapter.attributes.chapter
      ? `第 ${currentChapter.attributes.chapter} 話`
      : '單行本'
    : '閱讀中'

  return (
    <div className="min-h-screen bg-black">
      {/* Top Nav */}
      <div className="sticky top-14 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-2 flex items-center justify-between gap-2">
        <Link
          href={`/manga/${mangaId}`}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-400 transition-colors shrink-0"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">返回漫畫</span>
        </Link>
        <span className="text-sm text-gray-300 font-medium truncate">{chapterLabel}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuality((q) => (q === 'high' ? 'saver' : 'high'))}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            {quality === 'high' ? <ImageIcon size={14} /> : <Zap size={14} />}
            {quality === 'high' ? '高畫質' : '省流量'}
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="reader-container max-w-3xl mx-auto px-0 sm:px-4">
        {urls.length === 0 && (
          <div className="px-6 py-20 text-center">
            <h1 className="text-lg font-semibold text-gray-100">此章節沒有站內圖片</h1>
            <p className="mt-2 text-sm text-gray-400">MangaDex 沒有提供這一話的圖片，請前往作品來源閱讀。</p>
            {externalUrl ? (
              <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white hover:bg-orange-500">
                前往外部閱讀 ↗
              </a>
            ) : (
              <p className="mt-4 text-xs text-gray-500">目前沒有可用的外部閱讀連結。</p>
            )}
          </div>
        )}
        {urls.map((url, i) => (
          <div key={i} className="relative w-full">
            {failedPages[i] ? (
              <div className="flex min-h-64 items-center justify-center bg-gray-900 px-6 text-center text-sm text-gray-400">
                第 {i + 1} 頁載入失敗，請稍後重試。
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={`${chapterLabel} 第 ${i + 1} 頁`}
                loading={i < 3 ? 'eager' : 'lazy'}
                className="block h-auto w-full"
                onError={() => setFailedPages((failed) => ({ ...failed, [i]: true }))}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Ad */}
      <div className="max-w-3xl mx-auto px-4"><AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_READER} /></div>

      {/* Chapter Navigation */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between gap-4">
          {prevChapterId ? (
            <Link
              href={`/manga/${mangaId}/chapter/${prevChapterId}`}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 hover:bg-orange-500 text-gray-300 hover:text-white transition-all flex-1 justify-center"
            >
              <ChevronLeft size={18} />
              <span>上一話</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <Link
            href={`/manga/${mangaId}`}
            className="px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-all shrink-0"
          >
            章節列表
          </Link>

          {nextChapterId ? (
            <Link
              href={`/manga/${mangaId}/chapter/${nextChapterId}`}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 hover:bg-orange-500 text-gray-300 hover:text-white transition-all flex-1 justify-center"
            >
              <span>下一話</span>
              <ChevronRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/manga/${mangaId}`}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all flex-1 justify-center"
            >
              <span>已讀完，返回漫畫</span>
            </Link>
          )}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">共 {urls.length} 頁</p>
      </div>
    </div>
  )
}
