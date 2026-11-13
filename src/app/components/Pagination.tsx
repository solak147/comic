import Link from 'next/link'

type Props = {
  href: string
  page: number
  limit: number
  total: number
}

export default function Pagination({ href, page, limit, total }: Props) {
  if (total <= limit) return null

  const pageHref = (pageNumber: number) => `${href}?page=${pageNumber}`

  return (
    <nav aria-label="分頁" className="flex justify-center gap-2 mt-8">
      {page > 1 && (
        <Link href={pageHref(page - 1)} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
          上一頁
        </Link>
      )}
      <span className="px-4 py-2 text-gray-400 text-sm">第 {page} 頁</span>
      {page * limit < total && (
        <Link href={pageHref(page + 1)} className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
          下一頁
        </Link>
      )}
    </nav>
  )
}
