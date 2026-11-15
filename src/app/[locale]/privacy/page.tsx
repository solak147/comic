import type { Metadata } from 'next'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'
import { localizedMetadata } from '@/lib/locale-path'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return {
    title: messages.privacy,
    description: messages.privacyParagraph1,
    alternates: localizedMetadata(locale, '/privacy'),
  }
}

export default async function PrivacyPage() {
  const messages = getMessages(await getLocale())
  return (
    <article className="prose prose-invert max-w-3xl">
      <h1>{messages.privacyTitle}</h1>
      <p>{messages.privacyParagraph1}</p>
      <h2>{messages.privacyServicesTitle}</h2>
      <p>{messages.privacyParagraph2}</p>
      <p>
        {messages.privacyAdSettingsIntro}{' '}
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
          {messages.privacyAdSettingsLabel}
        </a>
        {messages.privacyAdSettingsOutro}
      </p>
      <p>
        {messages.privacyAdPartnersIntro}{' '}
        <a
          href="https://support.google.com/adsense/answer/9012903"
          target="_blank"
          rel="noopener noreferrer"
        >
          {messages.privacyAdPartnersLabel}
        </a>
        .
      </p>
      <h2>{messages.privacyDataTitle}</h2>
      <p>{messages.privacyParagraph3}</p>
      <h2>{messages.privacyUpdatesTitle}</h2>
      <p>{messages.privacyParagraph4}</p>
    </article>
  )
}
