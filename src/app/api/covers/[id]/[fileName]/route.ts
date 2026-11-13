type RouteContext = { params: Promise<{ id: string; fileName: string }> }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FILE_PATTERN = /^[a-z0-9._-]+\.(?:jpg|jpeg|png|webp)$/i

export async function GET(request: Request, { params }: RouteContext) {
  const { id, fileName } = await params
  if (!UUID_PATTERN.test(id) || !FILE_PATTERN.test(fileName)) {
    return new Response('Invalid cover path', { status: 400 })
  }

  const size = new URL(request.url).searchParams.get('size')
  if (size && size !== '256' && size !== '512') {
    return new Response('Invalid cover size', { status: 400 })
  }

  const suffix = size ? `.${size}.jpg` : ''
  const imageUrl = `https://uploads.mangadex.org/covers/${id}/${fileName}${suffix}`
  let upstream: Response
  try {
    upstream = await fetch(imageUrl, {
      headers: { 'User-Agent': 'MangaRead/1.0' },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 86400 },
    })
  } catch {
    return new Response('Cover unavailable', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Cover unavailable', { status: upstream.status || 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
