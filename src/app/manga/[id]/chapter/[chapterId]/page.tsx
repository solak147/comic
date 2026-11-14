import { getChapterPages, getChapterById, getMangaChapters, MANGA_CHAPTER_PAGE_SIZE, getSafeExternalUrl } from '@/lib/mangadex'
import type { ChapterLanguageMode } from '@/lib/mangadex'
import type { Metadata } from 'next'
import ChapterReader from './ChapterReader'
import { notFound } from 'next/navigation'
import { getMangaById, getMangaTitle } from '@/lib/mangadex'
import { getLocale } from '@/lib/locale'
import { getMessages, translate } from '@/lib/i18n'
import { getPageNumber } from '@/lib/utils'

type Props = {
  params: Promise<{ id: string; chapterId: string }>
  searchParams: Promise<{ chapterPage?: string | string[]; chapterLanguage?: string | string[] }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ id, chapterId }, { chapterPage: chapterPageParam, chapterLanguage: chapterLanguageParam }] = await Promise.all([params, searchParams])
  const locale = await getLocale()
  const chapterPage = getPageNumber(chapterPageParam)
  const languageMode: ChapterLanguageMode = chapterLanguageParam === 'all' ? 'all' : 'site'
  const messages = getMessages(locale)
  let manga
  try { manga = await getMangaById(id) } catch { return { title: messages.chapterNotFound, robots: { index: false } } }
  const chaptersData = await getMangaChapters(id, (chapterPage - 1) * MANGA_CHAPTER_PAGE_SIZE, locale, languageMode)
  const chapter = chaptersData.data.find((item) => item.id === chapterId)
  return {
    title: chapter
      ? `${getMangaTitle(manga, locale)} ${chapter.attributes.chapter ? translate(locale, 'chapterNumber', { chapter: chapter.attributes.chapter }) : messages.oneShot} ${messages.chapterReading}`
      : `${getMangaTitle(manga, locale)} ${messages.chapterReading}`,
    robots: { index: false },
  }
}

export default async function ChapterPage({ params, searchParams }: Props) {
  const [{ id, chapterId }, { chapterPage: chapterPageParam, chapterLanguage: chapterLanguageParam }] = await Promise.all([params, searchParams])
  const locale = await getLocale()
  const chapterPage = getPageNumber(chapterPageParam)
  const languageMode: ChapterLanguageMode = chapterLanguageParam === 'all' ? 'all' : 'site'
  let chapterPages
  let chapterInfo
  try {
    [chapterPages, chapterInfo] = await Promise.all([getChapterPages(chapterId), getChapterById(chapterId)])
  } catch { notFound() }
  const chaptersData = await getMangaChapters(id, (chapterPage - 1) * MANGA_CHAPTER_PAGE_SIZE, locale, languageMode)

  const chapters = chaptersData.data
  const imageHost = new URL(chapterPages.baseUrl).host
  const currentIndex = chapters.findIndex((c) => c.id === chapterId)
  const [newerPage, olderPage] = await Promise.all([
    currentIndex === 0 && chapterPage > 1
      ? getMangaChapters(id, (chapterPage - 2) * MANGA_CHAPTER_PAGE_SIZE, locale, languageMode)
      : Promise.resolve(null),
    currentIndex === chapters.length - 1 && chapterPage * MANGA_CHAPTER_PAGE_SIZE < (chaptersData.total ?? 0)
      ? getMangaChapters(id, chapterPage * MANGA_CHAPTER_PAGE_SIZE, locale, languageMode)
      : Promise.resolve(null),
  ])
  const previousInPage = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null
  const nextInPage = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const prevChapter = previousInPage ?? olderPage?.data[0] ?? null
  const nextChapter = nextInPage ?? newerPage?.data.at(-1) ?? null
  const prevChapterPage = previousInPage ? chapterPage : chapterPage + 1
  const nextChapterPage = nextInPage ? chapterPage : chapterPage - 1
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
      languageMode={languageMode}
      pageUrls={pageUrls}
      saverUrls={saverUrls}
      prevChapterId={prevChapter?.id ?? null}
      nextChapterId={nextChapter?.id ?? null}
      chapterPage={chapterPage}
      prevChapterPage={prevChapterPage}
      nextChapterPage={nextChapterPage}
      currentChapter={currentChapter}
      externalUrl={getSafeExternalUrl(chapterInfo.attributes.externalUrl)}
      locale={locale}
    />
  )
}
