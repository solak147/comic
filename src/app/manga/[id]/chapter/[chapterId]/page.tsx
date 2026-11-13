import { getChapterPages, getChapterById, getMangaChapters, getSafeExternalUrl } from '@/lib/mangadex'
import type { Metadata } from 'next'
import ChapterReader from './ChapterReader'
import { notFound } from 'next/navigation'
import { getMangaById, getMangaTitle } from '@/lib/mangadex'

type Props = { params: Promise<{ id: string; chapterId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, chapterId } = await params
  let manga
  try { manga = await getMangaById(id) } catch { return { title: '找不到章節', robots: { index: false } } }
  const chaptersData = await getMangaChapters(id)
  const chapter = chaptersData.data.find((item) => item.id === chapterId)
  return {
    title: chapter ? `${getMangaTitle(manga)} ${chapter.attributes.chapter ? `第 ${chapter.attributes.chapter} 話` : '單行本'}閱讀` : `${getMangaTitle(manga)} 漫畫閱讀`,
    robots: { index: false },
  }
}

export default async function ChapterPage({ params }: Props) {
  const { id, chapterId } = await params
  let chapterPages
  let chapterInfo
  try {
    [chapterPages, chapterInfo] = await Promise.all([getChapterPages(chapterId), getChapterById(chapterId)])
  } catch { notFound() }
  const chaptersData = await getMangaChapters(id)

  const chapters = chaptersData.data
  const imageHost = new URL(chapterPages.baseUrl).host
  const currentIndex = chapters.findIndex((c) => c.id === chapterId)
  const prevChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const currentChapter = chapters[currentIndex] ?? chapterInfo

  const pageUrls = chapterPages.chapter.data.map((fileName) =>
    `/api/chapter-images/${chapterId}/data/${chapterPages.chapter.hash}/${encodeURIComponent(fileName)}?host=${encodeURIComponent(imageHost)}`
  )
  const saverUrls = chapterPages.chapter.dataSaver?.map(
    (fileName: string) => `/api/chapter-images/${chapterId}/data-saver/${chapterPages.chapter.hash}/${encodeURIComponent(fileName)}?host=${encodeURIComponent(imageHost)}`
  ) ?? pageUrls

  return (
    <ChapterReader
      mangaId={id}
      chapterId={chapterId}
      pageUrls={pageUrls}
      saverUrls={saverUrls}
      prevChapterId={prevChapter?.id ?? null}
      nextChapterId={nextChapter?.id ?? null}
      currentChapter={currentChapter}
      externalUrl={getSafeExternalUrl(chapterInfo.attributes.externalUrl)}
    />
  )
}
