import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'

export function proxy(request: NextRequest) {
  const [, firstSegment] = request.nextUrl.pathname.split('/')
  if (isLocale(firstSegment)) return NextResponse.next()

  const preferredLocale = request.cookies.get('site-locale')?.value
  const targetLocale = isLocale(preferredLocale) ? preferredLocale : DEFAULT_LOCALE
  const url = request.nextUrl.clone()
  url.pathname = `/${targetLocale}${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
}
