import Link from 'next/link'
import { getMessages, translate, type Locale } from '@/lib/i18n'

type Props = {
  href: string
  page: number
  limit: number
  total: number
  locale: Locale
  paramName?: string
  showLastPage?: boolean
  extraParams?: Record<string, string>
}

export default function Pagination({
  href,
  page,
  limit,
  total,
  locale,
  paramName = 'page',
  showLastPage = false,
  extraParams,
}: Props) {
  if (total <= limit) return null

  const messages = getMessages(locale)
  const pageCount = Math.ceil(total / limit)
  const pageHref = (pageNumber: number) => {
    const params = new URLSearchParams(extraParams)
    params.set(paramName, String(pageNumber))
    return `${href}?${params.toString()}`
  }

  return (
    <nav aria-label={messages.paginationLabel} className="flex justify-center gap-2 mt-8">
      {page > 1 && (
        <Link href={pageHref(page - 1)} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
          {messages.previousPage}
        </Link>
      )}
      <span className="px-4 py-2 text-gray-400 text-sm">{translate(locale, 'page', { page })}</span>
      {page * limit < total && (
        <Link href={pageHref(page + 1)} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
          {messages.nextPage}
        </Link>
      )}
      {showLastPage && page < pageCount && (
        <Link href={pageHref(pageCount)} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
          {messages.oldestChapters}
        </Link>
      )}
    </nav>
  )
}
