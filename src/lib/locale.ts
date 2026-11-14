import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'

export async function getLocale() {
  const value = (await cookies()).get('site-locale')?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}
