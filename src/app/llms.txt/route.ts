import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n'
import { localePath } from '@/lib/locale-path'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manga-read.vercel.app'

export function GET() {
  const urls = (path: string) => LOCALES.map((locale) =>
    `- ${locale}: ${new URL(localePath(locale, path), SITE_URL).toString()}`
  ).join('\n')

  const content = `# MangaRead

> A multilingual manga catalog and reading guide. Manga titles, cover art, chapter availability, and related metadata are sourced from the MangaDex API.

MangaRead is an independent site and is not affiliated with MangaDex. Manga availability, translation languages, and rights are determined by MangaDex and the respective rights holders.

## Localized pages

### Home
${urls('/')}

### Popular manga
${urls('/popular')}

### Latest updates
${urls('/latest')}

### Genres and tags
${urls('/genres')}

### About
${urls('/about')}

### Privacy policy
${urls('/privacy')}

## Site maps

- XML sitemap: ${new URL('/sitemap.xml', SITE_URL).toString()}
- Crawler rules: ${new URL('/robots.txt', SITE_URL).toString()}
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
