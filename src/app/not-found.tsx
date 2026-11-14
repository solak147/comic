import Link from 'next/link'
import { getLocale } from '@/lib/locale'
import { getMessages } from '@/lib/i18n'

export default async function NotFound() {
  const messages = getMessages(await getLocale())
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-8xl mb-6">📚</p>
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-gray-400 mb-8">{messages.notFound}</p>
      <Link href="/" className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
        {messages.backHome}
      </Link>
    </div>
  )
}
