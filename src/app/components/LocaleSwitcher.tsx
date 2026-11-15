'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { localePath } from '@/lib/locale-path'

const LABELS: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  en: 'English',
}

export default function LocaleSwitcher({ label, initialLocale }: { label: string; initialLocale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = initialLocale
  }, [initialLocale])

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale)
    document.documentElement.lang = nextLocale
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `site-locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
    const routePath = pathname.replace(new RegExp(`^/(?:${LOCALES.join('|')})(?=/|$)`), '') || '/'
    router.replace(`${localePath(nextLocale, routePath)}${window.location.search}${window.location.hash}`)
  }

  function handleChange(value: string) {
    if (isLocale(value)) changeLocale(value)
  }

  return (
    <label className="flex items-center gap-2 text-xs text-gray-400">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        className="max-w-28 rounded bg-gray-800 px-2 py-1 text-gray-200 outline-none focus:ring-1 focus:ring-orange-400"
      >
        {LOCALES.map((option) => <option key={option} value={option}>{LABELS[option]}</option>)}
      </select>
    </label>
  )
}
