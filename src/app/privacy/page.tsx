import type { Metadata } from 'next'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale())
  return { title: messages.privacy, description: messages.privacyParagraph1 }
}

export default async function PrivacyPage() {
  const messages = getMessages(await getLocale())
  return <article className="prose prose-invert max-w-3xl"><h1>{messages.privacyTitle}</h1><p>{messages.privacyParagraph1}</p><h2>{messages.privacyServicesTitle}</h2><p>{messages.privacyParagraph2}</p><h2>{messages.privacyDataTitle}</h2><p>{messages.privacyParagraph3}</p><h2>{messages.privacyUpdatesTitle}</h2><p>{messages.privacyParagraph4}</p></article>
}
