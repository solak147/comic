import Link from 'next/link'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'
import LocaleSwitcher from './LocaleSwitcher'
import { localePath } from '@/lib/locale-path'

export async function SiteHeader() {
  const locale = await getLocale()
  const messages = getMessages(locale)

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 min-h-14 flex items-center justify-between gap-4">
        <Link href={localePath(locale, '/')} aria-label={messages.homeBreadcrumb} className="text-xl font-bold text-orange-400 shrink-0">📚 MangaRead</Link>
        <form action={localePath(locale, '/search')} method="GET" className="flex-1 max-w-md">
          <input
            name="q"
            type="search"
            placeholder={messages.searchPlaceholder}
            className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400"
          />
        </form>
        <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
          <Link href={localePath(locale, '/popular')} className="hover:text-orange-400 transition-colors">{messages.navPopular}</Link>
          <Link href={localePath(locale, '/latest')} className="hover:text-orange-400 transition-colors">{messages.navLatest}</Link>
          <Link href={localePath(locale, '/genres')} className="hover:text-orange-400 transition-colors">{messages.navGenres}</Link>
        </nav>
        <LocaleSwitcher label={messages.language} initialLocale={locale} />
      </div>
    </header>
  )
}

export async function SiteFooter() {
  const locale = await getLocale()
  const messages = getMessages(locale)

  return (
    <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-600">
      <p>© 2026 MangaRead. {messages.footerSource} <a href="https://mangadex.org" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">MangaDex</a></p>
      <p className="mt-1">{messages.footerNotice}</p>
      <nav aria-label={messages.about} className="mt-3 flex justify-center gap-4">
        <Link href={localePath(locale, '/about')} className="hover:text-orange-400">{messages.about}</Link>
        <Link href={localePath(locale, '/privacy')} className="hover:text-orange-400">{messages.privacy}</Link>
      </nav>
    </footer>
  )
}
