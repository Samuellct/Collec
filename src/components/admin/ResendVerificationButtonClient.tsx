'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function ResendVerificationButtonClient() {
  const { id, initialData } = useDocumentInfo()
  const verified = Boolean((initialData as { _verified?: boolean } | null)?._verified)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  if (verified) return null

  async function handleClick() {
    if (!id) return
    setStatus('loading')
    try {
      const res = await fetch(`/api/admin/customers/${id}/resend-verification`, {
        method: 'POST',
        credentials: 'include',
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading' || status === 'success'}
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          cursor: status === 'loading' || status === 'success' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' || status === 'success' ? 0.6 : 1,
          border: '1px solid currentColor',
          borderRadius: '4px',
          background: 'transparent',
        }}
      >
        {status === 'loading' ? 'Envoi...' : 'Renvoyer la vérification'}
      </button>
      {status === 'success' && (
        <span style={{ fontSize: '13px', color: 'green' }}>Email envoyé.</span>
      )}
      {status === 'error' && (
        <span style={{ fontSize: '13px', color: 'red' }}>Erreur lors de l&apos;envoi.</span>
      )}
    </div>
  )
}
