export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getPageNumber(page?: string | string[]): number {
  const value = Array.isArray(page) ? page[0] : page
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

export function formatChapterTitle(chapter: { attributes: { chapter: string | null; title: string | null; volume: string | null } }): string {
  const ch = chapter.attributes.chapter
  const title = chapter.attributes.title
  const vol = chapter.attributes.volume
  let result = ''
  if (vol) result += `Vol.${vol} `
  if (ch) result += `Ch.${ch}`
  if (title && title !== ch) result += `: ${title}`
  return result.trim() || 'Oneshot'
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return '剛剛'
  if (hours < 24) return `${hours} 小時前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 個月前`
  return `${Math.floor(months / 12)} 年前`
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ongoing: '連載中',
    completed: '已完結',
    hiatus: '暫停',
    cancelled: '已取消',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'text-green-400',
    completed: 'text-blue-400',
    hiatus: 'text-yellow-400',
    cancelled: 'text-red-400',
  }
  return map[status] || 'text-gray-400'
}
