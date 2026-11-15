import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n'

export function localePath(locale: Locale, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`
}

export function localeAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, path)])),
    'x-default': localePath(DEFAULT_LOCALE, path),
  }
}

export function localizedMetadata(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: localeAlternates(path),
  }
}
