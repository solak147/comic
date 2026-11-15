import type { Metadata } from 'next'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'
import { localizedMetadata } from '@/lib/locale-path'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return {
    title: messages.about,
    description: messages.aboutParagraph1,
    alternates: localizedMetadata(locale, '/about'),
  }
}

export default async function AboutPage() {
  const messages = getMessages(await getLocale())
  return <article className="prose prose-invert max-w-3xl"><h1>{messages.aboutTitle}</h1><p>{messages.aboutParagraph1}</p><p>{messages.aboutParagraph2}</p><p>{messages.aboutParagraph3}</p></article>
}
