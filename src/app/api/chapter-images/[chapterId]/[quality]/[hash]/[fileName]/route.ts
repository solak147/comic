type RouteContext = {
  params: Promise<{ chapterId: string; quality: string; hash: string; fileName: string }>
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const HASH_PATTERN = /^[a-z0-9]+$/i
const FILE_PATTERN = /^[a-z0-9._-]+\.(?:jpg|jpeg|png|webp|avif)$/i
const ALLOWED_HOST = /^(?:uploads\.mangadex\.org|[a-z0-9-]+\.mangadex\.network)$/i

export async function GET(request: Request, { params }: RouteContext) {
  const { chapterId, quality, hash, fileName } = await params
  const host = new URL(request.url).searchParams.get('host') || ''

  if (!UUID_PATTERN.test(chapterId) || !['data', 'data-saver'].includes(quality) || !HASH_PATTERN.test(hash) || !FILE_PATTERN.test(fileName) || !ALLOWED_HOST.test(host)) {
    return new Response('Invalid chapter image path', { status: 400 })
  }

  const imageUrl = `https://${host}/${quality}/${hash}/${encodeURIComponent(fileName)}`
  let upstream: Response
  try {
    upstream = await fetch(imageUrl, {
      headers: { 'User-Agent': 'MangaRead/1.0' },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 86400 },
    })
  } catch {
    return new Response('Chapter page unavailable', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Chapter page unavailable', { status: upstream.status || 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
