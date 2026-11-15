const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export function GET() {
  if (!ADSENSE_CLIENT) {
    return new Response('AdSense publisher ID is not configured.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const match = /^ca-pub-(\d+)$/.exec(ADSENSE_CLIENT)
  if (!match) {
    throw new Error('NEXT_PUBLIC_ADSENSE_CLIENT must use the format ca-pub-<publisher-id>')
  }

  return new Response(`google.com, pub-${match[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
