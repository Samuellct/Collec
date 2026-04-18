'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('Mot de passe mis a jour. Tu peux te connecter.')
      } else {
        const data = (await res.json()) as { errors?: { message: string }[] }
        setStatus('error')
        setMessage(data.errors?.[0]?.message ?? 'Lien invalide ou expire.')
      }
    } catch {
      setStatus('error')
      setMessage('Une erreur est survenue.')
    }
  }

  if (!token) {
    return <p>Lien invalide.</p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Nouveau mot de passe</h1>
      <p style={{ fontSize: 12, color: '#888' }}>
        Page temporaire (etape 03) — UI complete a l&apos;etape 04.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nouveau mot de passe (8 caracteres min)"
        minLength={8}
        required
        style={{ display: 'block', marginBottom: 12, padding: 8, width: 300 }}
      />
      <button type="submit">Valider</button>
      {status !== 'idle' && (
        <p style={{ color: status === 'success' ? 'green' : 'red' }}>{message}</p>
      )}
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
