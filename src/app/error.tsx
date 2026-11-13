'use client'
import { useEffect } from 'react'
import Link from 'next/link'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl mb-6">⚠️</p>
      <h2 className="text-2xl font-bold text-white mb-4">發生了一些錯誤</h2>
      <p className="text-gray-400 mb-6 max-w-md">{error.message || '請稍後再試'}</p>
      <div className="flex gap-4">
        <button onClick={reset} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
          重試
        </button>
        <Link href="/" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
          回到首頁
        </Link>
      </div>
    </div>
  )
}
