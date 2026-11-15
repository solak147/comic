'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n'
import { localePath } from '@/lib/locale-path'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  const messages = getMessages(DEFAULT_LOCALE)
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl mb-6">⚠️</p>
      <h2 className="text-2xl font-bold text-white mb-4">{messages.errorTitle}</h2>
      <p className="text-gray-400 mb-6 max-w-md">{error.message || messages.tryAgain}</p>
      <div className="flex gap-4">
        <button onClick={reset} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
          {messages.retry}
        </button>
        <Link href={localePath(DEFAULT_LOCALE, '/')} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
          {messages.backHome}
        </Link>
      </div>
    </div>
  )
}
