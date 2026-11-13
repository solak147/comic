import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-8xl mb-6">📚</p>
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-gray-400 mb-8">找不到您要的頁面</p>
      <Link href="/" className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
        回到首頁
      </Link>
    </div>
  )
}
