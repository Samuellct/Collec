export type CacheState = 'fresh' | 'expired' | 'absent'

interface SyncFields {
  source_last_synced_at?: string | Date | null
  source_expires_at?: string | Date | null
}

export function resolveCacheState(item: SyncFields, now = new Date()): CacheState {
  if (!item.source_last_synced_at) return 'absent'

  const expiresAt = item.source_expires_at ? new Date(item.source_expires_at) : null
  if (!expiresAt) return 'absent'

  return now < expiresAt ? 'fresh' : 'expired'
}
