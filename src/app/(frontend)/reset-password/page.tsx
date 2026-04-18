'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/ui/AuthCard'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (!token) {
    return (
      <AuthCard title="Lien invalide">
        <p className="font-serif text-[1rem] leading-[1.65] text-slate">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <div className="mt-8">
          <Link href="/forgot-password">
            <Button variant="secondary">Demander un nouveau lien</Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        router.push('/login?reset=success')
      } else {
        const data = (await res.json()) as { errors?: { message: string }[] }
        setError(data.errors?.[0]?.message ?? 'Lien invalide ou expiré.')
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title="Nouveau mot de passe">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirme le mot de passe</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Même mot de passe"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <FieldError message={error} />
        <Button type="submit" pending={pending}>
          Valider
        </Button>
      </form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
