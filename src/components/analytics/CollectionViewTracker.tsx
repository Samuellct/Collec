'use client'

import { useEffect } from 'react'

export function CollectionViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    window.umami?.track('collection_view', { slug })
  }, [slug])
  return null
}
