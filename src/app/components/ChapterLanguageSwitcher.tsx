import Link from 'next/link'
import { getMessages, type Locale } from '@/lib/i18n'
import type { ChapterLanguageMode } from '@/lib/mangadex'
import { localePath } from '@/lib/locale-path'

type Props = {
  mangaId: string
  locale: Locale
  languageMode: ChapterLanguageMode
}

export default function ChapterLanguageSwitcher({ mangaId, locale, languageMode }: Props) {
  const messages = getMessages(locale)

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {(['site', 'all'] as const).map((mode) => (
        <Link
          key={mode}
          href={localePath(locale, `/manga/${mangaId}?chapterLanguage=${mode}&chapterPage=1`)}
          aria-current={languageMode === mode ? 'page' : undefined}
          className={`rounded border px-3 py-2 text-sm transition-colors ${
            languageMode === mode
              ? 'border-orange-500 bg-orange-600 text-white'
              : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-orange-400'
          }`}
        >
          {mode === 'site' ? messages.siteLanguageChapters : messages.allLanguageChapters}
        </Link>
      ))}
    </div>
  )
}
