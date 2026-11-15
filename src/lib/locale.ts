import { notFound } from 'next/navigation'
import { locale } from 'next/root-params'
import { isLocale, type Locale } from '@/lib/i18n'

export async function getLocale(): Promise<Locale> {
  const value = await locale()
  if (!isLocale(value)) notFound()
  return value
}
