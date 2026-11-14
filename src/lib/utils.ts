import { getMessages, translate, type Locale } from '@/lib/i18n'

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getPageNumber(page?: string | string[]): number {
  const value = Array.isArray(page) ? page[0] : page
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

export function formatChapterTitle(chapter: { attributes: { chapter: string | null; title: string | null; volume: string | null } }, locale: Locale = 'zh-TW'): string {
  const ch = chapter.attributes.chapter
  const title = chapter.attributes.title
  const vol = chapter.attributes.volume
  let result = ''
  if (vol) result += `${translate(locale, 'volumeNumber', { volume: vol })} `
  if (ch) result += locale === 'en' ? `Chapter ${ch}` : `第 ${ch} 話`
  if (title && title !== ch) result += `: ${title}`
  return result.trim() || getMessages(locale).oneShot
}

export function formatDate(dateStr: string, locale: Locale = 'zh-TW'): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeTime(dateStr: string, locale: Locale = 'zh-TW'): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (hours < 1) return rtf.format(0, 'minute')
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 30) return rtf.format(-days, 'day')
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.floor(months / 12), 'year')
}

export function getStatusLabel(status: string, locale: Locale = 'zh-TW'): string {
  const labels = getMessages(locale)
  const map: Record<string, string> = {
    ongoing: labels.statusOngoing,
    completed: labels.statusCompleted,
    hiatus: labels.statusHiatus,
    cancelled: labels.statusCancelled,
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
