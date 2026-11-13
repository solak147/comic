'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src: string
  alt: string
  sizes: string
  className?: string
}

export default function CoverImage({ src, alt, sizes, className = 'object-cover' }: Props) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setImageSrc('/placeholder-cover.svg')}
    />
  )
}
