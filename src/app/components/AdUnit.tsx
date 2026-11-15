'use client'

import { useEffect } from 'react'

export default function AdUnit({ slot, label = 'Advertisement' }: { slot?: string; label?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  useEffect(() => {
    if (!client || !slot) return
    try {
      const win = window as Window & { adsbygoogle?: unknown[] }
      win.adsbygoogle = win.adsbygoogle || []
      win.adsbygoogle.push({})
    } catch { /* Ignore blocked ad scripts. */ }
  }, [client, slot])
  if (!client || !slot) return null
  return (
    <div className="my-6 min-h-[90px] w-full overflow-hidden text-center" aria-label={label}>
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
